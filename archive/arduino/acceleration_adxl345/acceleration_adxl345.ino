#include <Wire.h>
#include <Adafruit_ADXL345_U.h>

Adafruit_ADXL345_Unified accel = Adafruit_ADXL345_Unified(12345);

bool rolling = false;

void setup() {
  Serial.begin(115200);
  while (!Serial)
    ;

  Serial.println("ADXL345 test starting...");
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


  Serial.print("X: ");
  Serial.print(x);
  Serial.print("  ");
  Serial.print("Y: ");
  Serial.print(y);
  Serial.print("  ");
  Serial.print("Z: ");
  Serial.print(z);
  Serial.print("  ");
  Serial.println("  ");
  delay(200);
}