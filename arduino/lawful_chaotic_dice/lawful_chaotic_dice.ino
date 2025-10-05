#include <Wire.h>
#include <Adafruit_ADXL345_U.h>
#include <ArduinoBLE.h>

// ---------------------- Accelerometer ----------------------
Adafruit_ADXL345_Unified accel = Adafruit_ADXL345_Unified(12345);
bool rolling = false;

// ---------------------- BLE ----------------------
BLEService simpleService("deadbeef-1234-5678-1234-56789abcdef0");
BLEStringCharacteristic simpleChar("deadbeef-1234-5678-1234-56789abcdef1",
                                   BLERead | BLEWrite | BLENotify, 20);

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

      bool isMoving = delta > 0.25;  // sensitivity

      if (isMoving) {
        if (!rolling) {
          Serial.println("Rolling...");
          rolling = true;
        }
      } else {
        if (rolling) {
          int face = mapToDieFace(x, y, z);
          if (face != 0) {
            Serial.print("Result: ");
            Serial.println(face);

            // Send dice face over BLE
            char msg[10];
            sprintf(msg, "Face %d", face);
            simpleChar.writeValue(msg);
          }
          rolling = false;
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
  float ax = fabs(x);
  float ay = fabs(y);
  float az = fabs(z);

  if (ax > ay && ax > az) {
    return (x > 0) ? 1 : 2;
  } else if (ay > ax && ay > az) {
    return (y > 0) ? 3 : 4;
  } else if (az > ax && az > ay) {
    return (z > 0) ? 5 : 6;
  }
  return 0;  // ambiguous
}
