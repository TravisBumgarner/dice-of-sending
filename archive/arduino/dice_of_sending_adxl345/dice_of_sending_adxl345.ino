#include <Wire.h>
#include <Adafruit_ADXL345_U.h>
#include <ArduinoBLE.h>

// ---------------------- Calibration ----------------------

// Use calibration sketch to calculate these values. 

// How "close" a reading must be to a stored face vector to count as valid
// (lower = stricter). Usually 1.5–2.5 works well for ±1g noise.
float MATCH_THRESHOLD = 2.0;

// Each row: {x, y, z} average when that face is UP
// Use calibration.ino sketch to tweak these values.
float faceCalibrations[6][3] = {
  {-0.16, -0.27, 11.77},  // Face 1
  {-0.27, 9.41, 1.06},  // Face 2
  {-9.85, -0.16, 1.02},  // Face 3
  {0.08, -10.00, 1.73},  // Face 4
  {9.85, 1.26, 1.92},  // Face 5
  {-0.35, -0.35, -8.04}   // Face 6
};

// ---------------------- Accelerometer ----------------------
Adafruit_ADXL345_Unified accel = Adafruit_ADXL345_Unified(12345);
bool rolling = false;

// ---------------------- BLE ----------------------
BLEService simpleService("deadbeef-1234-5678-1234-56789abcdef0");
BLEStringCharacteristic simpleChar("deadbeef-1234-5678-1234-56789abcdef1",
                                   BLERead | BLEWrite | BLENotify, 20);

// ---------------------- Stability Tracking ----------------------
unsigned long stableStart = 0;
const unsigned long STABLE_TIME_MS = 1000;  // must rest this long before confirming result
int lastFace = 0;

// ---------------------- Setup ----------------------
void setup() {
  Serial.begin(115200);
  while (!Serial);

  Serial.println("Starting BLE + ADXL345 Dice...");

  // --- Accelerometer setup ---
  if (!accel.begin()) {
    Serial.println("No ADXL345 detected ... check wiring!");
    while (1);
  }
  accel.setRange(ADXL345_RANGE_16_G);
  Serial.println("ADXL345 detected at 0x53");

  // --- BLE setup ---
  if (!BLE.begin()) {
    Serial.println("Starting BLE failed!");
    while (1);
  }

  BLE.setLocalName("ArduinoDice");
  BLE.setAdvertisedService(simpleService);

  simpleService.addCharacteristic(simpleChar);
  BLE.addService(simpleService);

  simpleChar.writeValue("Ready to roll!");
  BLE.advertise();

  Serial.println("BLE peripheral is now advertising as 'ArduinoDice'");
}

// ---------------------- Main Loop ----------------------
void loop() {
  BLEDevice central = BLE.central();

  if (central) {
    Serial.print("Connected to central: ");
    Serial.println(central.address());

    while (central.connected()) {
      // --- Handle BLE writes ---
      if (simpleChar.written()) {
        Serial.print("Got from Mac: ");
        Serial.println(simpleChar.value());
      }

      // --- Handle dice motion ---
      sensors_event_t event;
      accel.getEvent(&event);

      float x = event.acceleration.x;
      float y = event.acceleration.y;
      float z = event.acceleration.z;

      float mag = sqrt(x * x + y * y + z * z);
      static float prevMag = 0;
      float delta = fabs(mag - prevMag);
      prevMag = mag;

      bool isMoving = delta > 0.25;  // sensitivity threshold

      if (isMoving) {
        if (!rolling) {
          Serial.println("Rolling...");
          rolling = true;
          lastFace = 0;
        }
      } else {
        int face = mapToDieFace(x, y, z);

        if (rolling) {
          // just stopped moving
          rolling = false;
          stableStart = millis();
          lastFace = face;
        } else {
          // still stable — check if it stayed on same side long enough
          if (face != 0 && face == lastFace && (millis() - stableStart) > STABLE_TIME_MS) {
            Serial.print("Result: ");
            Serial.println(face);

            char msg[10];
            sprintf(msg, "Face %d", face);
            simpleChar.writeValue(msg);

            lastFace = 0;  // prevent repeat sends
          }
        }
      }

      delay(100);
    }

    Serial.print("Disconnected from: ");
    Serial.println(central.address());
  }
}

// ---------------------- Dice Face Mapping ----------------------
int mapToDieFace(float x, float y, float z) {
 int bestFace = 0;
  float bestDist = 9999;

  for (int i = 0; i < 6; i++) {
    float dx = x - faceCalibrations[i][0];
    float dy = y - faceCalibrations[i][1];
    float dz = z - faceCalibrations[i][2];
    float dist = sqrt(dx * dx + dy * dy + dz * dz);

    if (dist < bestDist) {
      bestDist = dist;
      bestFace = i + 1;
    }
  }

  // Only count as valid if we're clearly close to a known face
  if (bestDist < MATCH_THRESHOLD) {
    return bestFace;
  } else {
    // Too tilted or in between sides
    return 0;
  }
}
