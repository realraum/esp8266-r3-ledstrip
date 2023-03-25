// Author: 0xFEEDC0DE64 (https://github.com/0xFEEDC0DE64/cpputils)
#pragma once

// system includes
#include <string>

#define CPP_STRINGIFY2(x) #x
#define CPP_STRINGIFY(x) CPP_STRINGIFY2(x)

#define DECLARE_TYPESAFE_ENUM_HELPER1(name, ...) name __VA_ARGS__ ,
#define DECLARE_TYPESAFE_ENUM_HELPER2(name, ...) case TheEnum::name: return #name;
#define DECLARE_TYPESAFE_ENUM_HELPER3(name, ...) else if (str == CPP_STRINGIFY(name)) return TheEnum::name;
#define DECLARE_TYPESAFE_ENUM_HELPER4(name, ...) cb(TheEnum::name, CPP_STRINGIFY(name));

#define DECLARE_TYPESAFE_ENUM(Name, UnderlayingType, Values) \
    using Name##Type = UnderlayingType; \
    enum class Name : UnderlayingType \
    { \
        Values(DECLARE_TYPESAFE_ENUM_HELPER1) \
        __NONEXISTENT__, \
    }; \
    inline std::string toString(Name value) \
    { \
        switch (value) \
        { \
        using TheEnum = Name; \
        Values(DECLARE_TYPESAFE_ENUM_HELPER2) \
        } \
        return std::string("Unknown " #Name); \
    } \
    inline Name parse##Name(const std::string& str) \
    { \
        using TheEnum = Name; \
        if (false) {} \
        Values(DECLARE_TYPESAFE_ENUM_HELPER3) \
        return TheEnum::__NONEXISTENT__; \
    } \
    template<typename T> \
    void iterate##Name(T &&cb) \
    { \
        using TheEnum = Name; \
        Values(DECLARE_TYPESAFE_ENUM_HELPER4) \
    }
