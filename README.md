# Setup

## CAD Models

TODO

## Circuit

### Tools Needed

1. Soldering Iron
1. [Arduino IDE](https://www.arduino.cc/en/software/)

### Components

1. 1x USB-C Cable
1. 1x seeed studio XIAO-nRF52840
1. 1x ADXL345 Accelerometer
1. 1x 3.7V 60mAH 0.22Wh Battery
1. 2x 10K Resistors
1. PCB Wire
1. Eplzon PCB board 89mm x 52mm (Can use a smaller board but will need to do a custom CAD design)

### Code & Breadboard Testing

There are three arduino directories

- `bluetooth/` - For testing just the Bluetooth communication in isolation. There is an included `bluetooth.html` for visual help with this. Open the html file in the browser, connect, and then you should see messages like `Notify: Hello Browser` and `Wrote 'Hello Browser'`.
- `dice_rolling/` - For testing the orientation of the circuit for figuring out which side of the dice is facing up.
- `lawful_chaotic_dice/` - Full code with bluetooth and dice rolling.

### Soldering

Use the [adxl345-hookup-guide](https://learn.sparkfun.com/tutorials/adxl345-hookup-guide) (with the I2C wiring diagram, not SPI) and [Seeed Studio XIAO nRF52840](https://wiki.seeedstudio.com/XIAO_BLE/) as references.

Solder the battery to the pads on the bottom of the micro-controller.

For best results with the accelerometer, ensure that it is parallel to the protoboard.

## Website

1. `cd website`
1. [Install Node and NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
1. Install dependencies - `npm bootstrap`
1. Start website `npm run dev`

# Learning Resources

# lawful-chaotic-dice
