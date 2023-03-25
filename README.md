# esp8266-r3-ledstrip
A firmware and web interface for a ws2812b led strip controlled by an esp8266. This was mainly developed for the realraum 0x10 birthday party.

## Hardware
Just an ordinary ledstrip with an esp8266 on one end. Because of the length of the strip, we had to use multiple power supplies. This meant cutting the +5V cables and soldering 5VDC / 2A power supplies to the strip. Make sure to not put the power supplies in parallel!

## Firmware
The firmware is written with PlatformIO to quickly build the software, as ESP-IDF is quite complicated to setup / is a bit overhead for such a little project.

### Building
I recommend importing the project into PlatformIO and compile it from the IDE

### Webinterface
The webinterface is plain HTMl with CSS and JavaScript for the WebSocket connection.

#### Starting the Webinterface
The webinterface is started by default on port 3000. You can change the port via the environment variable `PORT`.

First, install all dependencies with `npm install`. Then, start the webinterface with `npm start`.

