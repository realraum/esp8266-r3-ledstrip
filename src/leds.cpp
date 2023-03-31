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
        uint32_t fancyStroboDuration{0};
        uint32_t stroboDuration{0};
        uint16_t paused{0};

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

        void showPingPong()
        {
            // ping pong with fade to black, avoid complicated math so its really fast. (Only CRGB, not CHSV)
            static bool direction{true};
            // only single color
            static int16_t pos{0};
            static uint8_t fillWidth = 5;
            static uint8_t speed = 17;

            if (direction)
            {
                pos += speed;
                if (pos >= LED_COUNT)
                {
                    pos = LED_COUNT - 1;
                    direction = false;
                }
            }
            else
            {
                pos -= speed;
                if (pos < 0)
                {
                    direction = true;
                }
            }

            for (int i = 0; i < LED_COUNT; i++)
            {
                if (i >= pos - fillWidth && i <= pos + fillWidth)
                {
                    leds[i] = solidColor;
                }
                else
                {
                    leds[i].nscale8(75);
                }
            }
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
        if (animation == Animation::TotallyOff)
        {
            std::fill(std::begin(leds), std::end(leds), CRGB::Black);
            FastLED.show();
            return;
        }

        if (paused > 0)
        {
            paused--;
            fadeToBlackBy(&*std::begin(leds), leds.size(), 20);
            FastLED.show();
            return;
        }

        if (stroboDuration > millis())
        {
            static uint32_t lastStroboChange{0};
            static uint8_t stroboDelay{0};
            static bool on{false};

            if (lastStroboChange + stroboDelay < millis())
            {
                lastStroboChange = millis();
                stroboDelay = random(60, 90);
                on = !on;
            }

            std::fill(std::begin(leds), std::end(leds), on ? CRGB::White : CRGB::Black);
            FastLED.show();
            return;
        }

        if (fancyStroboDuration > millis())
        {
            static uint32_t lastStroboChange{0};
            static uint8_t stroboDelay{0};
            const auto segmentSize = leds.size() / 16;
            // std::fill(std::begin(leds), std::end(leds), random() % 2 == 0 ? CRGB::White : CRGB::Black);
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
            fadeToBlackBy(&*std::begin(leds), leds.size(), 40);
            break;
        case Animation::SolidColor:
            std::fill(std::begin(leds), std::end(leds), solidColor);
            break;
        case Animation::PingPong_May_Crash:
            showPingPong();
            break;
        case Animation::BetterRainbow:
            static uint8_t gHue = 0;
            EVERY_N_MILLISECONDS(20) gHue++;
            fill_rainbow(&*std::begin(leds), leds.size(), gHue);
            break;
        }

        FastLED.show();
    }

    void activateFancyStrobo(uint16_t duration)
    {
        fancyStroboDuration = duration + millis();
    }

    void activateStrobo(uint16_t duration)
    {
        stroboDuration = duration + millis();
    }

    void pause(bool pause)
    {
        if (pause)
        {
            if (paused < 10000)
                paused += 10000;
        }
        else
        {
            paused = 0;
        }

        Serial.printf("Pause: %d\n", paused);
    }

} // namespace leds
