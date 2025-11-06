#include <Wire.h>
#include <BMI160Gen.h>

const int i2c_addr = 0x68;
const int NUM_FACES = 6;
float readings[NUM_FACES][3];

void setup() {
  Serial.begin(115200);
  while (!Serial)
    ;
  Wire.begin();

  if (!BMI160.begin(BMI160GenClass::I2C_MODE, i2c_addr)) {
    Serial.println("BMI160 initialization failed!");
    while (1)
      ;
  }

  Serial.println("\n--- BMI160 Dice Calibration ---");
  Serial.println("Instructions:");
  Serial.println("  1. Place the die so the specified face is UP.");
  Serial.println("  2. Press ENTER in Serial Monitor to record.");
  Serial.println("  3. Repeat for all 6 faces.");
  Serial.println("----------------------------------\n");

  for (int face = 0; face < NUM_FACES; face++) {
    waitForUser(face + 1);
    recordFace(face);
  }

  Serial.println("\n✅ Calibration complete!");
  printResults();
}

void loop() {
  // nothing
}

void waitForUser(int faceNumber) {
  Serial.print("Place FACE ");
  Serial.print(faceNumber);
  Serial.println(" UP, then press ENTER...");
  while (!Serial.available())
    ;
  while (Serial.available()) Serial.read();  // clear buffer
}

void recordFace(int face) {
  long axSum = 0, aySum = 0, azSum = 0;
  const int samples = 20;

  for (int i = 0; i < samples; i++) {
    int ax, ay, az;
    BMI160.readAccelerometer(ax, ay, az);
    axSum += ax;
    aySum += ay;
    azSum += az;
    delay(100);
  }

  float avgX = axSum / (float)samples;
  float avgY = aySum / (float)samples;
  float avgZ = azSum / (float)samples;

  // Normalize to "g" (divide by 16384.0 for BMI160 16g range)
  readings[face][0] = avgX / 16384.0;
  readings[face][1] = avgY / 16384.0;
  readings[face][2] = avgZ / 16384.0;

  Serial.print("Recorded Face ");
  Serial.print(face + 1);
  Serial.print(": ");
  Serial.print(readings[face][0], 3);
  Serial.print(", ");
  Serial.print(readings[face][1], 3);
  Serial.print(", ");
  Serial.println(readings[face][2], 3);
}

void printResults() {
  Serial.println("\nCopy this into your dice sketch:\n");
  Serial.println("float faceCalibrations[6][3] = {");
  for (int i = 0; i < NUM_FACES; i++) {
    Serial.print("  {");
    Serial.print(readings[i][0], 3);
    Serial.print(", ");
    Serial.print(readings[i][1], 3);
    Serial.print(", ");
    Serial.print(readings[i][2], 3);
    Serial.print("}");
    if (i < NUM_FACES - 1) Serial.print(",");
    Serial.println();
  }
  Serial.println("};");
  Serial.println("\nUse MATCH_THRESHOLD ≈ 0.15–0.25 for normalized readings.");
}
