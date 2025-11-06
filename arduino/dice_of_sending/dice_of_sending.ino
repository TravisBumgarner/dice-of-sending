#include <Wire.h>
#include <ArduinoBLE.h>
#include <BMI160Gen.h>

// ---------------------- Calibration ----------------------

float MATCH_THRESHOLD = 0.2;

float faceCalibrations[6][3] = {
  { 0.040, -0.085, 1.048 },
  { 1.014, -0.044, -0.006 },
  { -0.044, 0.008, -0.965 },
  { -0.986, -0.033, 0.029 },
  { 0.007, -1.035, -0.027 },
  { 0.080, 0.967, 0.136 }
};

// ---------------------- BLE ----------------------

BLEService diceService("deadbeef-1234-5678-1234-56789abcdef0");
BLEStringCharacteristic faceCharacteristic(
  "deadbeef-1234-5678-1234-56789abcdef1",
  BLERead | BLENotify | BLEWrite,
  50);

// ---------------------- State ----------------------

int currentFace = -1;
int lastDetectedFace = -1;
int stableCount = 0;
const int STABLE_THRESHOLD = 5;

// ---------------------- Blink Helpers ----------------------

void blinkError(int count) {
  for (;;) {
    for (int i = 0; i < count; i++) {
      digitalWrite(LED_BUILTIN, LOW);
      delay(150);
      digitalWrite(LED_BUILTIN, HIGH);
      delay(150);
    }
    delay(600);
  }
}

void blinkSlow() {
  digitalWrite(LED_BUILTIN, LOW);
  delay(300);
  digitalWrite(LED_BUILTIN, HIGH);
  delay(1200);
}

// ---------------------- BLE/Debug Helpers ----------------------

void sendDebug(const char* msg) {
  char buf[60];
  snprintf(buf, sizeof(buf), "Debug: %s", msg);
  faceCharacteristic.writeValue(buf);
}

void sendRoll(int face) {
  char buf[32];
  snprintf(buf, sizeof(buf), "Roll: %d", face);
  faceCharacteristic.writeValue(buf);
}

// ---------------------- Setup ----------------------

void setup() {
  delay(300);
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, HIGH);  // off

  if (!BMI160.begin(BMI160GenClass::I2C_MODE, 0x68)) {
    sendDebug("BMI160 init failed!");
    blinkError(2);
  }
  sendDebug("BMI160 ready");

  if (!BLE.begin()) {
    sendDebug("BLE init failed!");
    blinkError(3);
  }

  BLE.setLocalName("Dice of Sending");
  BLE.setDeviceName("Dice of Sending");
  BLE.setAdvertisedService(diceService);
  diceService.addCharacteristic(faceCharacteristic);
  BLE.addService(diceService);

  // -------- Ping/Pong handler (fixed) --------
  // -------- Ping/Pong handler --------
  faceCharacteristic.setEventHandler(BLEWritten, [](BLEDevice central, BLECharacteristic characteristic) {
    int len = characteristic.valueLength();
    const uint8_t* data = characteristic.value();

    String msg;
    for (int i = 0; i < len; i++) msg += (char)data[i];

    if (msg == "Ping") {
      characteristic.writeValue("Pong");
    }
  });

  BLE.advertise();
  sendDebug("BLE Dice advertising");
}  // ✅ this was missing — closes setup()


// ---------------------- Loop ----------------------

void loop() {
  BLEDevice central = BLE.central();

  if (central) {
    sendDebug("BLE connected");
    digitalWrite(LED_BUILTIN, LOW);  // solid ON

    while (central.connected()) {
      int ax, ay, az;
      BMI160.readAccelerometer(ax, ay, az);
      float fx = ax / 16384.0;
      float fy = ay / 16384.0;
      float fz = az / 16384.0;

      int detectedFace = detectFace(fx, fy, fz);

      if (detectedFace == -1) {
        currentFace = -1;
        stableCount = 0;
      } else if (detectedFace == lastDetectedFace) {
        stableCount++;
        if (stableCount >= STABLE_THRESHOLD && detectedFace != currentFace) {
          currentFace = detectedFace;
          sendRoll(currentFace + 1);
        }
      } else {
        stableCount = 0;
        lastDetectedFace = detectedFace;
      }

      delay(100);
    }
  } else {
    blinkSlow();
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
