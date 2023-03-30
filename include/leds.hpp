#pragma once

// system includes
#include <array>

// 3rdparty lib includes
#include <FastLED.h>

// local includes
#include "utils.hpp"

#define LEDS_PER_STRIP 144
#define NUM_STRIPS 3

#define LED_PIN D5
#define LED_TYPE WS2812B
#define COLOR_ORDER GRB

#define LED_COUNT (LEDS_PER_STRIP * NUM_STRIPS)

#define ANIMATION_VALUES(x) \
    x(Off) \
    x(TotallyOff) \
    x(RainbowFade) \
    x(SinusRainbow) \
    x(PingPong_May_Crash) \
    x(SolidColor) \
    x(BetterRainbow)
DECLARE_TYPESAFE_ENUM(Animation, uint8_t, ANIMATION_VALUES)

namespace leds
{

    extern std::array<CRGB, LED_COUNT> leds;

    extern Animation animation;

    extern CRGB solidColor;

    void begin();

    void handle();

    void activateFancyStrobo(uint16_t duration);

    void activateStrobo(uint16_t duration);

    void pause(bool pause);

} // namespace leds
