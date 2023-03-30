#include "websocket.hpp"

// system includes
#include <string>

// arduino includes
#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266mDNS.h>

// 3rdparty lib includes
#include <ESPAsyncWebServer.h>
#include <AsyncWebSocket.h>
#include <ArduinoJson.h>

// local includes
#include "leds.hpp"

#define DEBUG 1

AsyncWebServer server(80);
AsyncWebSocket ws("/ws");

namespace wifi
{

    namespace
    {

        std::string crgbToString(CRGB color)
        {
            char buffer[8];
            sprintf(buffer, "#%02X%02X%02X", color.r, color.g, color.b);
            return buffer;
        }

        std::string getStatus()
        {
            StaticJsonDocument<200> doc;
            doc["c"] = "s";
            doc["animation"] = toString(leds::animation);
            doc["solidColor"] = crgbToString(leds::solidColor);

            std::string response;
            serializeJson(doc, response);
            return response;
        }

        void handleWebSocketMessage(void *arg, uint8_t *data, size_t len, AsyncWebSocketClient *client)
        {
            AwsFrameInfo *info = (AwsFrameInfo *)arg;
            if (info->final && info->index == 0 && info->len == len && info->opcode == WS_TEXT)
            {
                // parse the message
                StaticJsonDocument<200> doc;
                DeserializationError error = deserializeJson(doc, data);
                if (error)
                {
                    if (DEBUG)
                        Serial.printf("deserializeJson() failed: %s\n", error.c_str());
                    return;
                }

                if (!doc.containsKey("c"))
                {
                    if (DEBUG)
                        Serial.println("No command found");
                    return;
                }

                std::string command = doc["c"].as<std::string>();

                // handle the command
                if (command == "l")
                {
                    // create response with string concat
                    std::string response = "{\"c\":\"l\",\"a\":[";
                    iterateAnimation([&response](auto enum_value, const std::string &string_value)
                                     {
                        if (enum_value != Animation::__NONEXISTENT__)
                        response += "\"";
                        response += string_value;
                        response += "\","; });

                    // remove last comma
                    response.pop_back();
                    response += "]}";

                    // send response
                    client->text(response.c_str());
                }
                else if (command == "a")
                {
                    if (!doc.containsKey("a") || !doc["a"].is<std::string>())
                    {
                        if (DEBUG)
                            Serial.println("No animation found");
                        return;
                    }

                    leds::animation = parseAnimation(doc["a"].as<std::string>());
                    Serial.printf("Set animation to %s\n", doc["a"].as<std::string>().c_str());
                    ws.textAll(getStatus().c_str());
                }
                else if (command == "s")
                {
                    if (!doc.containsKey("d") || !doc["d"].is<uint16_t>())
                    {
                        if (DEBUG)
                            Serial.println("No time found");
                        return;
                    }

                    if (doc.containsKey("f") && doc["f"].is<bool>() && doc["f"].as<bool>())
                    {
                        leds::activateFancyStrobo(doc["d"].as<uint16_t>());
                    }
                    else
                    {
                        leds::activateStrobo(doc["d"].as<uint16_t>());
                    }
                }
                else if (command == "c")
                {
                    // solid color
                    if (!doc.containsKey("r") || !doc["r"].is<uint8_t>() ||
                        !doc.containsKey("g") || !doc["g"].is<uint8_t>() ||
                        !doc.containsKey("b") || !doc["b"].is<uint8_t>())
                    {
                        if (DEBUG)
                            Serial.println("No color found");
                        return;
                    }

                    leds::solidColor = CRGB(doc["r"].as<uint8_t>(), doc["g"].as<uint8_t>(), doc["b"].as<uint8_t>());
                    ws.textAll(getStatus().c_str());
                }
                else if (command == "p")
                {
                    if (!doc.containsKey("p") || !doc["p"].is<bool>())
                    {
                        if (DEBUG)
                            Serial.println("No pause found");
                        return;
                    }
                    const bool pause = doc["p"].as<bool>();
                    leds::pause(pause);
                }
                else if (command == "_")
                {
                    ws.textAll(getStatus().c_str());
                }
            }
        }

        void onEvent(AsyncWebSocket *server, AsyncWebSocketClient *client, AwsEventType type, void *arg, uint8_t *data, size_t len)
        {
            switch (type)
            {
            case WS_EVT_CONNECT:
                Serial.printf("WebSocket client #%u connected from %s\n", client->id(), client->remoteIP().toString().c_str());
                break;
            case WS_EVT_DISCONNECT:
                Serial.printf("WebSocket client #%u disconnected\n", client->id());
                break;
            case WS_EVT_DATA:
                handleWebSocketMessage(arg, data, len, client);
                break;
            case WS_EVT_PONG:
            case WS_EVT_ERROR:
                break;
            }
        }
    } // namespace

    void begin()
    {
        enableWiFiAtBootTime();

        String fqdn = "party-lights-";
        fqdn += String(ESP.getChipId(), HEX);
        WiFi.hostname(fqdn);

        Serial.printf("Connecting to %s (%s)\n", ssid, password);
        WiFi.begin(ssid, password);
        while (WiFi.status() != WL_CONNECTED)
        {
            delay(10);
        }

        Serial.printf("Connected to %s with IP %s\n", ssid, WiFi.localIP().toString().c_str());
        Serial.printf("Starting webserver on http://%s/\n", WiFi.localIP().toString().c_str());

        ws.onEvent(onEvent);
        server.addHandler(&ws);

        server.begin();

        if (MDNS.begin(fqdn))
        {
            Serial.printf("mDNS responder started: %s.local\n", fqdn.c_str());
        }
        else
        {
            Serial.println("Error setting up mDNS responder!");
        }

        MDNS.addService("partylightws", "tcp", 80);
        MDNS.addServiceTxt("partylightws", "tcp", "version", GIT_VERSION);
        MDNS.addServiceTxt("partylightws", "tcp", "git_branch", GIT_BRANCH);
        MDNS.addServiceTxt("partylightws", "tcp", "git_commit", GIT_COMMIT);
    }

    void handle()
    {
        static uint32_t last = 0;
        ws.cleanupClients();

        if (millis() - last > 1000)
        {
            last = millis();
            ws.textAll(F("{\"ping\":true}"));
        }

        MDNS.update();
    }

} // namespace wifi
