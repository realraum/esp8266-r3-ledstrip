#include "ESPOta.hpp"

// arduino includes
#include <Arduino.h>
#include <ESP8266HTTPClient.h>
#include <ESP8266httpUpdate.h>
#include <WiFiClient.h>

namespace ESPOta {
bool updateAvailable{false};
bool updating{false};

namespace {
HTTPClient ota_http;
WiFiClient ota_wifi_client;
} // namespace
} // namespace ESPOta

bool updateFromUrl(std::string url)
{
    using namespace ESPOta;
    if (!ESPOta::updateAvailable)
    {
        return false;
    }
    ESPOta::updateAvailable = false;
    ESPOta::updating = true;
    Serial.printf("Updating from %s\n", url.c_str());

    ota_http.begin(ota_wifi_client, url.c_str());
    int httpCode = ota_http.GET();

    if (httpCode == HTTP_CODE_OK)
    {
        const auto total_size = ota_http.getSize();

        if (total_size == 0)
        {
            Serial.println("Invalid binary size");
            ESPOta::updating = false;
            return false;
        }

        Update.begin(total_size);
        Serial.printf("Downloading %d bytes\n", total_size);
        uint8_t buff[128] = {0};

        WiFiClient* stream = ota_http.getStreamPtr();

        Serial.println("Starting update");
        while(ota_http.connected() && !Update.isFinished())
        {
            size_t len = stream->readBytes(buff, sizeof(buff));
            Update.write(buff, len);

            Serial.printf("Downloaded %d bytes\n", len);

            delay(1);
        }

        if (Update.end())
        {
            Serial.println("Update finished successfully");
            ESP.restart();
        }
        else
        {
            Serial.println("Update failed");
        }
    }
    else
    {
        Serial.printf("HTTP error %d\n", httpCode);
        ESPOta::updating = false;
        return false;
    }
    
    ota_http.end();
    return true;
}

void checkForUpdates()
{
    using namespace ESPOta;

    char url[128];
    snprintf(url, sizeof(url), "http://firmwares.commander.red/check/%s?project=esp8266-r3-ledstrip", GIT_COMMIT);
    Serial.printf("Checking for updates from %s\n", url);

    ota_http.begin(ota_wifi_client, url);
    int httpCode = ota_http.GET();

    if (httpCode == HTTP_CODE_OK) {
        Serial.println("Update available");
        ESPOta::updateAvailable = true;
    } else {
        //Serial.println(fmt::format("Update not available (http code {})", httpCode).c_str());
        Serial.printf("Update not available (http code %d)\n", httpCode);
    }

    ota_http.end();

    if (ESPOta::updateAvailable)
    {
        Serial.println("Downloading update");
        updateFromUrl("http://firmwares.commander.red/latest.bin?project=esp8266-r3-ledstrip");
    }
}