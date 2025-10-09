# Dice of Sending

Wondrous Item, uncommon

When a Dungeon Master insists you roll in plain sight, the Dice of Sending offer a clever loophole. These enchanted dice are linked by invisible arcane currents (or Bluetooth, depending on your realm’s tech level), allowing a roll in both the physical and digital planes simultaneously.

Those attuned to the Dice of Sending may appear obedient while still indulging their chaotic good nature - rolling fairly, yet unpredictably.

![Finished D6 dice](./readme/final.jpg)

# Setup

## Tools

1. Hot glue gun
1. Soldering Iron
1. [Arduino IDE](https://www.arduino.cc/en/software/)

## Parts

1. 1x USB-C Cable
1. 1x seeed studio XIAO-nRF52840
1. 1x ADXL345 Accelerometer
1. 1x 3.7V 60mAH 0.22Wh Battery
1. 2x 10K Resistors
1. PCB Wire
1. Eplzon PCB board 89mm x 52mm (Can use a smaller board but will need to do a custom CAD design)

## CAD

CAD Models - [Dice V1 Top](https://cad.onshape.com/documents/4b5c1bf9194b23f57db470b0/w/0611180dab1b4d42950964e7/e/09704a1026edf3dbcc83c50e), [Dice V1 Bottom](https://cad.onshape.com/documents/03b58467c8208d0aa1c9cc45/w/e2a0e9205aa77901d6f0e7f7/e/e3529496a038e29d77a46fd0)

1. STLs can be found in `cad/`

## Circuit

### Code & Breadboard Testing

There are three arduino directories

![Breadboard setup](./readme/breadboard.jpg)

- `bluetooth/` - For testing just the Bluetooth communication in isolation. There is an included `bluetooth.html` for visual help with this. Open the html file in the browser, connect, and then you should see messages like `Notify: Hello Browser` and `Wrote 'Hello Browser'`.
- `dice_rolling/` - For testing the orientation of the circuit for figuring out which side of the dice is facing up.
- `dice_of_sending/` - Full code with bluetooth and dice rolling.

Use the [adxl345-hookup-guide](https://learn.sparkfun.com/tutorials/adxl345-hookup-guide) (with the I2C wiring diagram, not SPI) and [Seeed Studio XIAO nRF52840](https://wiki.seeedstudio.com/XIAO_BLE/) as references.

### Soldering

Don't be like me in the following photo. Solder the battery to the Seeed Studio before soldering it to the protoboard. (Photo taken just before I used wire cutters to completely remove the Seeed Studio from the board)

![Soldering Setup](./readme/protoboard.jpg)

Solder the battery to the pads on the bottom of the micro-controller.

For best results with the accelerometer, ensure that it is parallel to the protoboard.

## Website

Site may or may not still be hosted at [here](https://dice.pointlessprojects.com/)

1. `cd website`
1. [Install Node and NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
1. Install dependencies - `npm bootstrap`
1. Start website `npm run dev`
