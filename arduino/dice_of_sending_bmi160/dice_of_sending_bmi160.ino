#include <Wire.h>
#include <ArduinoBLE.h>
#include <BMI160Gen.h>

// ---------------------- Calibration ----------------------

float MATCH_THRESHOLD = 0.2;

float faceCalibrations[6][3] = {
  {0.040, -0.085, 1.048},
  {1.014, -0.044, -0.006},
  {-0.044, 0.008, -0.965},
  {-0.986, -0.033, 0.029},
  {0.007, -1.035, -0.027},
  {0.080, 0.967, 0.136}
};

// ---------------------- BLE ----------------------

BLEService diceService("deadbeef-1234-5678-1234-56789abcdef0");
BLEUnsignedCharCharacteristic faceCharacteristic(
  "deadbeef-1234-5678-1234-56789abcdef1",
  BLERead | BLENotify
);

// ---------------------- State ----------------------

int currentFace = -1;
int lastDetectedFace = -1;
int stableCount = 0;
const int STABLE_THRESHOLD = 5;

void setup() {
  Serial.begin(9600);
  while (!Serial);

  if (!BMI160.begin(BMI160GenClass::I2C_MODE, 0x68)) {
    Serial.println("BMI160 init failed!");
    while (1);
  }
  Serial.println("BMI160 ready.");

  if (!BLE.begin()) {
    Serial.println("Starting BLE failed!");
    while (1);
  }

  BLE.setLocalName("Dice of Sending");
  BLE.setDeviceName("Dice of Sending");
  BLE.setAdvertisedService(diceService);
  diceService.addCharacteristic(faceCharacteristic);
  BLE.addService(diceService);
  BLE.advertise();

  Serial.println("BLE Dice advertising...");
}

void loop() {
  BLEDevice central = BLE.central();

  if (central) {
    Serial.println("Bluetooth connection established.");
    while (central.connected()) {
      int ax, ay, az;
      BMI160.readAccelerometer(ax, ay, az);
      float fx = ax / 16384.0;
      float fy = ay / 16384.0;
      float fz = az / 16384.0;

      int detectedFace = detectFace(fx, fy, fz);

      if (detectedFace == -1) {
        // Die is moving or between faces — reset currentFace
        currentFace = -1;
        stableCount = 0;
      } else if (detectedFace == lastDetectedFace) {
        stableCount++;
        if (stableCount >= STABLE_THRESHOLD && detectedFace != currentFace) {
          currentFace = detectedFace;
          Serial.print("Stable face: ");
          Serial.println(currentFace + 1);
          faceCharacteristic.writeValue((uint8_t)(currentFace + 1));
        }
      } else {
        stableCount = 0;
        lastDetectedFace = detectedFace;
      }

      delay(100);
    }
  }
}

// ---------------------- Face Detection ----------------------

int detectFace(float x, float y, float z) {
  float minDist = 9999;
  int best = -1;
  for (int i = 0; i < 6; i++) {
    float dx = x - faceCalibrations[i][0];
    float dy = y - faceCalibrations[i][1];
    float dz = z - faceCalibrations[i][2];
    float dist = sqrt(dx * dx + dy * dy + dz * dz);
    if (dist < minDist) {
      minDist = dist;
      best = i;
    }
  }
  return (minDist < MATCH_THRESHOLD) ? best : -1;
}
