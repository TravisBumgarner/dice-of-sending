#include <ArduinoBLE.h>

// Define a custom service and characteristic
BLEService simpleService("deadbeef-1234-5678-1234-56789abcdef0");
BLEStringCharacteristic simpleChar("deadbeef-1234-5678-1234-56789abcdef1",
                                   BLERead | BLEWrite | BLENotify, 20);
void setup()
{
  Serial.begin(115200);
  while (!Serial)
    ;

  if (!BLE.begin())
  {
    Serial.println("Starting BLE failed!");
    while (1)
      ;
  }

  BLE.setLocalName("Arduino");
  BLE.setAdvertisedService(simpleService);

  simpleService.addCharacteristic(simpleChar);
  BLE.addService(simpleService);

  simpleChar.writeValue("Hello Mac!");

  BLE.advertise();

  Serial.println("BLE peripheral is now advertising as 'Arduino'");
}

void loop()
{
  BLEDevice central = BLE.central();

  if (central)
  {
    Serial.print("Connected to central: ");
    Serial.println(central.address());

    while (central.connected())
    {
      if (simpleChar.written())
      {
        Serial.print("Got from Mac: ");
        Serial.println(simpleChar.value());
      }
    }

    Serial.print("Disconnected from: ");
    Serial.println(central.address());
  }
}
