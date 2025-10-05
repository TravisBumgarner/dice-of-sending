#include <Wire.h>
#include <Adafruit_ADXL345_U.h>

Adafruit_ADXL345_Unified accel = Adafruit_ADXL345_Unified(12345);

bool rolling = false;

void setup() {
  Serial.begin(115200);
  while (!Serial)
    ;

  Serial.println("ADXL345 dice test starting...");
  if (!accel.begin()) {
    Serial.println("No ADXL345 detected ... check wiring!");
    while (1)
      ;
  }

  accel.setRange(ADXL345_RANGE_16_G);
  Serial.println("ADXL345 detected at 0x53");
}

void loop() {
  sensors_event_t event;
  accel.getEvent(&event);

  float x = event.acceleration.x;
  float y = event.acceleration.y;
  float z = event.acceleration.z;

  // Magnitude of acceleration vector
  float mag = sqrt(x * x + y * y + z * z);

  // Rolling detection: check if values are changing
  static float prevMag = 0;
  float delta = fabs(mag - prevMag);
  prevMag = mag;

  bool isMoving = delta > 0.25;  // tune sensitivity
  Serial.println("delta");
  Serial.println(delta);

  if (isMoving) {
    if (!rolling) {
      Serial.println("Rolling...");
      rolling = true;
    }
  } else {
    if (rolling) {
      // Just stopped, compute dice face
      int face = mapToDieFace(x, y, z);
      if (face != 0) {
        Serial.print("Result: ");
        Serial.println(face);
      }
      rolling = false;
    }
  }

  delay(200);
}

// Map orientation to dice face
int mapToDieFace(float x, float y, float z) {
  // Find the dominant axis
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
