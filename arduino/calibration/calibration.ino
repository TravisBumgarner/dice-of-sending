#include <Wire.h>
#include <Adafruit_ADXL345_U.h>

Adafruit_ADXL345_Unified accel = Adafruit_ADXL345_Unified(12345);

// ---------------------- CALIBRATION MODE ----------------------
// Set to true to log XYZ readings for calibration.
// Set to false to use stored calibration values.
bool CALIBRATION_MODE = false;

// How "close" a reading must be to a stored face vector to count as valid
// (lower = stricter). Usually 1.5–2.5 works well for ±1g noise.
float MATCH_THRESHOLD = 2.0;

// Each row: {x, y, z} average when that face is UP
float faceCalibrations[6][3] = {
  {-0.16, -0.27, 11.77},  // Face 1
  {-0.27, 9.41, 1.06},  // Face 2
  {-9.85, -0.16, 1.02},  // Face 3
  {0.08, -10.00, 1.73},  // Face 4
  {9.85, 1.26, 1.92},  // Face 5
  {-0.35, -0.35, -8.04}   // Face 6
};

void setup() {
  Serial.begin(115200);
  while (!Serial);

  Serial.println("ADXL345 Calibration / Detection Mode");
  if (!accel.begin()) {
    Serial.println("No ADXL345 detected ... check wiring!");
    while (1);
  }

  accel.setRange(ADXL345_RANGE_16_G);
  Serial.println("ADXL345 detected at 0x53");
  delay(500);
}

void loop() {
  sensors_event_t event;
  accel.getEvent(&event);
  float x = event.acceleration.x;
  float y = event.acceleration.y;
  float z = event.acceleration.z;

  if (CALIBRATION_MODE) {
    // ---------------- CALIBRATION ----------------
    Serial.print("Current XYZ = ");
    Serial.print(x, 2); Serial.print(", ");
    Serial.print(y, 2); Serial.print(", ");
    Serial.println(z, 2);
    delay(3000);

  } else {
    // ---------------- DETECTION ----------------
    int face = getClosestFace(x, y, z);
    Serial.print("X,Y,Z = ");
    Serial.print(x, 2); Serial.print(", ");
    Serial.print(y, 2); Serial.print(", ");
    Serial.print(z, 2);
    Serial.print(" -> Side ");
    Serial.println(face);
    delay(500);
  }
}

// Compute which calibration vector is closest
int getClosestFace(float x, float y, float z) {
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