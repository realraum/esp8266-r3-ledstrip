// system includes
#include <algorithm>

// arduino includes
#include <Arduino.h>

// local includes
#include "leds.hpp"
#include "websocket.hpp"

void setup()
{
    Serial.begin(9600);

    delay(1000);

    Serial.println("Starting up...");

    leds::begin();
    wifi::begin();
}

void loop()
{
    leds::handle();
    wifi::handle();
}