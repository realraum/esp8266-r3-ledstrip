#pragma once

// 72 65 61 6c 72 61 75 6d 32 2e 34 6e 65 77 47 57
const char ssid[17] = {0x72, 0x65, 0x61, 0x6c, 0x72, 0x61, 0x75, 0x6d, 0x32, 0x2e, 0x34, 0x6e, 0x65, 0x77, 0x47, 0x57, 0x00, };
const char password[9] = {0x72, 0x33, 0x61, 0x6c, 0x72, 0x61, 0x75, 0x6d, 0x00, };

namespace wifi
{

    void begin();

    void handle();

} // namespace wifi
