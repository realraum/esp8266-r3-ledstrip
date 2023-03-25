#include "leds.hpp"

// 3rdparty lib includes
#include <FastLED.h>

namespace leds
{

    Animation animation{Animation::SinusRainbow};

    CRGB solidColor{CRGB::White};

    std::array<CRGB, LED_COUNT> leds;

    namespace
    {
        uint32_t stroboDuration{0};

        void sinusRainbow()
        {
            fadeToBlackBy(&*std::begin(leds), leds.size(), 20);

            uint8_t dothue = 0;
            for (int i = 0; i < 8; i++)
            {
                leds[beatsin16(i + 7, 0, leds.size())] |= CHSV(dothue, 200, 255);
                dothue += 32;
            }
        }

        void rainbowFade()
        {
            static uint8_t hue = 0;
            for (int i = 0; i < LED_COUNT; i++)
            {
                leds[i] = CHSV(hue, 255, 255);
            }
            hue += 1;
        }
    } // namespace

    void begin()
    {
        FastLED.addLeds<LED_TYPE, LED_PIN, COLOR_ORDER>(&*std::begin(leds), leds.size()).setCorrection(TypicalLEDStrip);
        FastLED.setBrightness(255);
        FastLED.setMaxPowerInVoltsAndMilliamps(5, 4000);
        FastLED.clear();
        FastLED.show();
    }

    void handle()
    {
        if (stroboDuration > millis())
        {
            static uint32_t lastStroboChange{0};
            static uint8_t stroboDelay{0};
            const auto segmentSize = leds.size() / 16;
            //std::fill(std::begin(leds), std::end(leds), random() % 2 == 0 ? CRGB::White : CRGB::Black);
            for (auto i = 0; i < segmentSize; i++)
            {
                // fill segment with color
                const bool on = random() % 2 == 0;
                for (auto j = i * segmentSize; j < std::min((i + 1) * segmentSize, static_cast<uint>(leds.size())); j++)
                {
                    leds[j] = on ? CRGB::White : CRGB::Black;
                }
            }

            if (lastStroboChange + stroboDelay < millis())
            {
                lastStroboChange = millis() - random(0, 75);
                stroboDelay = random(50, 100);
            }

            FastLED.show();
            return;
        }

        switch (animation)
        {
        case Animation::SinusRainbow:
            sinusRainbow();
            break;
        case Animation::RainbowFade:
            rainbowFade();
            break;
        case Animation::Off:
            std::fill(std::begin(leds), std::end(leds), CRGB::Black);
            break;
        case Animation::SolidColor:
            std::fill(std::begin(leds), std::end(leds), solidColor);
            break;
        }

        FastLED.show();
    }

    void activateStrobo(uint16_t duration)
    {
        stroboDuration = duration + millis();
    }

} // namespace leds
