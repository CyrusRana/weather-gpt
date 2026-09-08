import requests
import time

from datetime import datetime
from zoneinfo import ZoneInfo

from risk_engine import calculate_weather_risk


# =========================================================
# OPEN-METEO API
# =========================================================

OPEN_METEO_FORECAST_URL = (
    "https://api.open-meteo.com/v1/forecast"
)

OPEN_METEO_GEOCODING_URL = (
    "https://geocoding-api.open-meteo.com/v1/search"
)

NOMINATIM_REVERSE_URL = (
    "https://nominatim.openstreetmap.org/reverse"
)


# =========================================================
# WEATHER CACHE
# =========================================================

WEATHER_CACHE = {}

# Keep weather for 10 minutes.
# This prevents repeated frontend refreshes from
# repeatedly hitting the weather service.
WEATHER_CACHE_TTL = 600


# =========================================================
# BASIC HELPERS
# =========================================================

def safe_float(value, default=0):
    try:
        if value is None:
            return default

        return float(value)

    except Exception:
        return default


def safe_int(value, default=0):
    try:
        if value is None:
            return default

        return int(value)

    except Exception:
        return default


# =========================================================
# WIND DIRECTION
# =========================================================

def get_wind_direction(degrees):

    if degrees is None:
        return "Unknown"

    try:
        degrees = float(degrees)

    except Exception:
        return "Unknown"

    directions = [
        "N",
        "NE",
        "E",
        "SE",
        "S",
        "SW",
        "W",
        "NW",
    ]

    index = round(degrees / 45) % 8

    return directions[index]


# =========================================================
# WEATHER CODE → HUMAN READABLE CONDITION
# =========================================================

def weather_code_to_text(code):

    code = safe_int(code, -1)

    weather_codes = {

        0: "Clear",

        1: "Mainly Clear",
        2: "Partly Cloudy",
        3: "Overcast",

        45: "Fog",
        48: "Rime Fog",

        51: "Light Drizzle",
        53: "Moderate Drizzle",
        55: "Dense Drizzle",

        56: "Light Freezing Drizzle",
        57: "Dense Freezing Drizzle",

        61: "Light Rain",
        63: "Moderate Rain",
        65: "Heavy Rain",

        66: "Light Freezing Rain",
        67: "Heavy Freezing Rain",

        71: "Light Snow",
        73: "Moderate Snow",
        75: "Heavy Snow",

        77: "Snow Grains",

        80: "Light Rain Showers",
        81: "Moderate Rain Showers",
        82: "Heavy Rain Showers",

        85: "Light Snow Showers",
        86: "Heavy Snow Showers",

        95: "Thunderstorm",
        96: "Thunderstorm with Hail",
        99: "Thunderstorm with Heavy Hail",
    }

    return weather_codes.get(
        code,
        "Unknown"
    )


# =========================================================
# WEATHER CODE → ICON CATEGORY
# =========================================================

def weather_code_to_icon(code):

    code = safe_int(code, -1)

    if code == 0:
        return "sunny"

    if code in [1, 2]:
        return "partly-cloudy"

    if code == 3:
        return "cloudy"

    if code in [45, 48]:
        return "fog"

    if code in [
        51, 53, 55,
        56, 57,
        61, 63, 65,
        66, 67,
        80, 81, 82
    ]:
        return "rain"

    if code in [
        71, 73, 75,
        77, 85, 86
    ]:
        return "snow"

    if code in [95, 96, 99]:
        return "thunderstorm"

    return "unknown"


# =========================================================
# TIMEZONE HELPERS
# =========================================================

def get_timezone(timezone_name):

    if not timezone_name:
        return ZoneInfo("UTC")

    try:
        return ZoneInfo(timezone_name)

    except Exception:
        return ZoneInfo("UTC")


def local_iso_from_api_time(
    api_time,
    timezone_name
):
    """
    Open-Meteo returns local timestamps when
    timezone=auto is used.

    Convert that local timestamp into a proper
    ISO-8601 timestamp containing the timezone offset.

    Example:

    2026-09-08T17:42:00+05:30
    """

    if not api_time:
        return ""

    try:

        timezone = get_timezone(
            timezone_name
        )

        # Remove Z if present.
        clean_time = str(api_time).replace(
            "Z",
            ""
        )

        # Handle timestamps that already contain
        # timezone information.
        try:

            dt = datetime.fromisoformat(
                clean_time
            )

        except Exception:

            dt = datetime.strptime(
                clean_time[:16],
                "%Y-%m-%dT%H:%M"
            )

        # If timestamp is naive, treat it as
        # local time from Open-Meteo.
        if dt.tzinfo is None:

            dt = dt.replace(
                tzinfo=timezone
            )

        else:

            dt = dt.astimezone(
                timezone
            )

        return dt.isoformat(
            timespec="minutes"
        )

    except Exception:

        return str(api_time)


def format_display_time(
    api_time,
    timezone_name
):
    """
    Convert local ISO time into:
    6:05 AM
    """

    if not api_time:
        return ""

    try:

        timezone = get_timezone(
            timezone_name
        )

        clean_time = str(api_time).replace(
            "Z",
            ""
        )

        try:

            dt = datetime.fromisoformat(
                clean_time
            )

        except Exception:

            dt = datetime.strptime(
                clean_time[:16],
                "%Y-%m-%dT%H:%M"
            )

        if dt.tzinfo is None:

            dt = dt.replace(
                tzinfo=timezone
            )

        else:

            dt = dt.astimezone(
                timezone
            )

        return dt.strftime(
            "%I:%M %p"
        ).lstrip("0")

    except Exception:

        return str(api_time)


def format_date(
    api_date
):
    """
    Convert YYYY-MM-DD into
    a frontend-friendly date.
    """

    if not api_date:
        return ""

    try:

        dt = datetime.strptime(
            api_date,
            "%Y-%m-%d"
        )

        return dt.strftime(
            "%Y-%m-%d"
        )

    except Exception:

        return str(api_date)


# =========================================================
# REVERSE GEOCODING
# GPS → CITY / REGION / COUNTRY
# =========================================================

def reverse_geocode(
    latitude,
    longitude
):

    headers = {
        "User-Agent": (
            "WeatherGPT/1.0 "
            "(weather decision assistant)"
        )
    }

    params = {
        "lat": latitude,
        "lon": longitude,
        "format": "json",
        "zoom": 10,
        "addressdetails": 1,
    }

    response = requests.get(
        NOMINATIM_REVERSE_URL,
        params=params,
        headers=headers,
        timeout=10
    )

    if response.status_code != 200:

        raise Exception(
            "Reverse geocoding failed: "
            f"{response.status_code} - "
            f"{response.text}"
        )

    data = response.json()

    address = data.get(
        "address",
        {}
    )

    city = (
        address.get("city")
        or address.get("town")
        or address.get("village")
        or address.get("municipality")
        or address.get("county")
        or "Current Location"
    )

    region = (
        address.get("state")
        or address.get("state_district")
        or ""
    )

    country = (
        address.get("country")
        or ""
    )

    return {
        "name": city,
        "country": country,
        "region": region,
        "latitude": float(latitude),
        "longitude": float(longitude),
        "timezone": "",
    }


# =========================================================
# CITY → LATITUDE / LONGITUDE
# =========================================================

def resolve_location(city):

    city = str(city).strip()

    # =====================================================
    # GPS COORDINATES
    #
    # Example:
    # 28.35,77.60
    # =====================================================

    if "," in city:

        parts = city.split(",")

        if len(parts) == 2:

            try:

                latitude = float(
                    parts[0].strip()
                )

                longitude = float(
                    parts[1].strip()
                )

                return reverse_geocode(
                    latitude,
                    longitude
                )

            except ValueError:

                pass

    # =====================================================
    # CITY NAME → COORDINATES
    # =====================================================

    params = {
        "name": city,
        "count": 1,
        "language": "en",
        "format": "json",
    }

    response = requests.get(
        OPEN_METEO_GEOCODING_URL,
        params=params,
        timeout=10
    )

    if response.status_code != 200:

        raise Exception(
            "Location lookup failed: "
            f"{response.status_code} - "
            f"{response.text}"
        )

    data = response.json()

    results = data.get(
        "results",
        []
    )

    if not results:

        raise Exception(
            f"Location not found: {city}"
        )

    result = results[0]

    return {
        "name": (
            result.get("name")
            or city
        ),

        "country": (
            result.get("country")
            or ""
        ),

        "region": (
            result.get("admin1")
            or ""
        ),

        "latitude": safe_float(
            result.get("latitude")
        ),

        "longitude": safe_float(
            result.get("longitude")
        ),

        "timezone": (
            result.get("timezone")
            or ""
        ),
    }


# =========================================================
# OPEN-METEO WEATHER REQUEST
# =========================================================

def get_open_meteo_weather(
    latitude,
    longitude
):

    params = {

        "latitude": latitude,

        "longitude": longitude,

        # Automatically determine local timezone.
        "timezone": "auto",

        # =================================================
        # CURRENT
        # =================================================

        "current": (
            "temperature_2m,"
            "apparent_temperature,"
            "relative_humidity_2m,"
            "wind_speed_10m,"
            "wind_direction_10m,"
            "uv_index,"
            "visibility,"
            "surface_pressure,"
            "weather_code"
        ),

        # =================================================
        # HOURLY
        # =================================================

        "hourly": (
            "temperature_2m,"
            "apparent_temperature,"
            "relative_humidity_2m,"
            "precipitation_probability,"
            "wind_speed_10m,"
            "wind_direction_10m,"
            "uv_index,"
            "visibility,"
            "surface_pressure,"
            "weather_code"
        ),

        # =================================================
        # DAILY
        # =================================================

        "daily": (
            "weather_code,"
            "temperature_2m_max,"
            "temperature_2m_min,"
            "apparent_temperature_max,"
            "apparent_temperature_min,"
            "precipitation_probability_max,"
            "wind_speed_10m_max,"
            "relative_humidity_2m_mean,"
            "surface_pressure_mean,"
            "sunrise,"
            "sunset"
        ),

        # 10 days, matching the previous backend.
        "forecast_days": 10,

        # Wind in km/h.
        "wind_speed_unit": "kmh",

        # Temperature in Celsius.
        "temperature_unit": "celsius",

        # Precipitation in mm.
        "precipitation_unit": "mm",
    }

    response = requests.get(
        OPEN_METEO_FORECAST_URL,
        params=params,
        timeout=20
    )

    if response.status_code != 200:

        raise Exception(
            "Open-Meteo Weather API failed: "
            f"{response.status_code} - "
            f"{response.text}"
        )

    return response.json()


# =========================================================
# NORMALIZE CURRENT WEATHER
# =========================================================

def normalize_current_weather(
    data,
    location
):

    current = data.get(
        "current",
        {}
    )

    timezone_name = (
        data.get("timezone")
        or location.get("timezone")
        or "UTC"
    )

    temperature = safe_float(
        current.get(
            "temperature_2m"
        )
    )

    feels_like = safe_float(
        current.get(
            "apparent_temperature"
        ),
        temperature
    )

    humidity = safe_int(
        current.get(
            "relative_humidity_2m"
        )
    )

    wind = safe_float(
        current.get(
            "wind_speed_10m"
        )
    )

    wind_direction_degrees = (
        safe_float(
            current.get(
                "wind_direction_10m"
            )
        )
    )

    wind_direction = get_wind_direction(
        wind_direction_degrees
    )

    uv = safe_float(
        current.get(
            "uv_index"
        )
    )

    visibility_m = safe_float(
        current.get(
            "visibility"
        )
    )

    visibility_km = (
        visibility_m / 1000
        if visibility_m
        else 0
    )

    pressure = safe_float(
        current.get(
            "surface_pressure"
        )
    )

    weather_code = safe_int(
        current.get(
            "weather_code"
        ),
        0
    )

    condition = weather_code_to_text(
        weather_code
    )

    api_current_time = current.get(
        "time",
        ""
    )

    local_time = local_iso_from_api_time(
        api_current_time,
        timezone_name
    )

    return {

        "city": location["name"],

        "country": location["country"],

        "region": location["region"],

        "latitude": location["latitude"],

        "longitude": location["longitude"],

        # IMPORTANT:
        # Keep only ONE localtime field.
        # This avoids PowerShell JSON duplicate-key issues.
        "localtime": local_time,

        "timezone": timezone_name,

        "temperatureC": round(
            temperature,
            1
        ),

        "temperatureF": round(
            temperature * 9 / 5 + 32,
            1
        ),

        "feelsLikeC": round(
            feels_like,
            1
        ),

        "feelsLikeF": round(
            feels_like * 9 / 5 + 32,
            1
        ),

        "condition": condition,

        "humidity": humidity,

        "wind": round(
            wind,
            1
        ),

        "windDirection": wind_direction,

        "uv": round(
            uv,
            1
        ),

        "visibility": round(
            visibility_km,
            1
        ),

        "pressure": round(
            pressure,
            1
        ),

        "lastUpdated": local_time,

        "weatherCode": weather_code,

        "weatherIcon": weather_code_to_icon(
            weather_code
        ),
    }


# =========================================================
# NORMALIZE HOURLY WEATHER
# =========================================================

def normalize_hourly_weather(
    data
):

    hourly = data.get(
        "hourly",
        {}
    )

    times = hourly.get(
        "time",
        []
    )

    temperatures = hourly.get(
        "temperature_2m",
        []
    )

    apparent_temperatures = (
        hourly.get(
            "apparent_temperature",
            []
        )
    )

    humidities = hourly.get(
        "relative_humidity_2m",
        []
    )

    rain_probabilities = (
        hourly.get(
            "precipitation_probability",
            []
        )
    )

    wind_speeds = hourly.get(
        "wind_speed_10m",
        []
    )

    wind_directions = (
        hourly.get(
            "wind_direction_10m",
            []
        )
    )

    uv_values = hourly.get(
        "uv_index",
        []
    )

    visibilities = hourly.get(
        "visibility",
        []
    )

    pressures = hourly.get(
        "surface_pressure",
        []
    )

    weather_codes = hourly.get(
        "weather_code",
        []
    )

    normalized = []

    for i, raw_time in enumerate(times):

        temperature = safe_float(
            temperatures[i]
            if i < len(temperatures)
            else 0
        )

        feels_like = safe_float(
            apparent_temperatures[i]
            if i < len(apparent_temperatures)
            else temperature,
            temperature
        )

        humidity = safe_int(
            humidities[i]
            if i < len(humidities)
            else 0
        )

        chance_of_rain = safe_float(
            rain_probabilities[i]
            if i < len(rain_probabilities)
            else 0
        )

        wind_speed = safe_float(
            wind_speeds[i]
            if i < len(wind_speeds)
            else 0
        )

        wind_direction_degrees = (
            wind_directions[i]
            if i < len(wind_directions)
            else None
        )

        wind_direction = get_wind_direction(
            wind_direction_degrees
        )

        uv = safe_float(
            uv_values[i]
            if i < len(uv_values)
            else 0
        )

        visibility_m = safe_float(
            visibilities[i]
            if i < len(visibilities)
            else 0
        )

        visibility_km = (
            visibility_m / 1000
            if visibility_m
            else 0
        )

        pressure = safe_float(
            pressures[i]
            if i < len(pressures)
            else 0
        )

        weather_code = safe_int(
            weather_codes[i]
            if i < len(weather_codes)
            else 0
        )

        condition = weather_code_to_text(
            weather_code
        )

        # Open-Meteo already returns local time
        # because timezone=auto was requested.
        local_time = str(
            raw_time
        ).replace(
            "T",
            " "
        )

        normalized.append({

            "time": local_time,

            "temp_c": round(
                temperature,
                1
            ),

            "feelslike_c": round(
                feels_like,
                1
            ),

            "chance_of_rain": round(
                chance_of_rain,
                1
            ),

            "wind_kph": round(
                wind_speed,
                1
            ),

            "wind_direction": wind_direction,

            "humidity": humidity,

            "uv": round(
                uv,
                1
            ),

            "pressure": round(
                pressure,
                1
            ),

            "visibility_km": round(
                visibility_km,
                1
            ),

            "condition": {
                "text": condition
            },

            "weatherCode": weather_code,

            "weatherIcon": weather_code_to_icon(
                weather_code
            ),
        })

    return normalized


# =========================================================
# NORMALIZE DAILY FORECAST
# =========================================================

def normalize_daily_weather(
    data,
    timezone_name=""
):

    daily = data.get(
        "daily",
        {}
    )

    dates = daily.get(
        "time",
        []
    )

    weather_codes = daily.get(
        "weather_code",
        []
    )

    max_temperatures = daily.get(
        "temperature_2m_max",
        []
    )

    min_temperatures = daily.get(
        "temperature_2m_min",
        []
    )

    apparent_max = daily.get(
        "apparent_temperature_max",
        []
    )

    apparent_min = daily.get(
        "apparent_temperature_min",
        []
    )

    rain_probabilities = daily.get(
        "precipitation_probability_max",
        []
    )

    max_winds = daily.get(
        "wind_speed_10m_max",
        []
    )

    humidities = daily.get(
        "relative_humidity_2m_mean",
        []
    )

    pressures = daily.get(
        "surface_pressure_mean",
        []
    )

    sunrises = daily.get(
        "sunrise",
        []
    )

    sunsets = daily.get(
        "sunset",
        []
    )

    normalized = []

    for i, date_value in enumerate(
        dates
    ):

        weather_code = safe_int(
            weather_codes[i]
            if i < len(weather_codes)
            else 0
        )

        condition = weather_code_to_text(
            weather_code
        )

        max_temperature = safe_float(
            max_temperatures[i]
            if i < len(max_temperatures)
            else 0
        )

        min_temperature = safe_float(
            min_temperatures[i]
            if i < len(min_temperatures)
            else 0
        )

        apparent_max_temperature = (
            safe_float(
                apparent_max[i]
                if i < len(apparent_max)
                else max_temperature
            )
        )

        apparent_min_temperature = (
            safe_float(
                apparent_min[i]
                if i < len(apparent_min)
                else min_temperature
            )
        )

        chance_of_rain = safe_float(
            rain_probabilities[i]
            if i < len(rain_probabilities)
            else 0
        )

        wind_kph = safe_float(
            max_winds[i]
            if i < len(max_winds)
            else 0
        )

        humidity = safe_int(
            humidities[i]
            if i < len(humidities)
            else 0
        )

        pressure = safe_float(
            pressures[i]
            if i < len(pressures)
            else 0
        )

        sunrise_raw = (
            sunrises[i]
            if i < len(sunrises)
            else ""
        )

        sunset_raw = (
            sunsets[i]
            if i < len(sunsets)
            else ""
        )

        # IMPORTANT:
        # Open-Meteo gives sunrise/sunset in the
        # requested local timezone.
        #
        # We convert them only for display.
        sunrise = format_display_time(
            sunrise_raw,
            timezone_name
        )

        sunset = format_display_time(
            sunset_raw,
            timezone_name
        )

        normalized.append({

            "date": format_date(
                date_value
            ),

            "astro": {

                "sunrise": sunrise,

                "sunset": sunset,
            },

            "day": {

                "maxtemp_c": round(
                    max_temperature,
                    1
                ),

                "mintemp_c": round(
                    min_temperature,
                    1
                ),

                "condition": {
                    "text": condition
                },

                "daily_chance_of_rain": round(
                    chance_of_rain,
                    1
                ),

                "maxwind_kph": round(
                    wind_kph,
                    1
                ),

                "avghumidity": humidity,

                "pressure_mb": round(
                    pressure,
                    1
                ),

                "feelslike_max_c": round(
                    apparent_max_temperature,
                    1
                ),

                "feelslike_min_c": round(
                    apparent_min_temperature,
                    1
                ),
            },

            "maxTempC": round(
                max_temperature,
                1
            ),

            "minTempC": round(
                min_temperature,
                1
            ),

            "chanceOfRain": round(
                chance_of_rain,
                1
            ),

            "windKph": round(
                wind_kph,
                1
            ),

            "humidity": humidity,

            "pressure": round(
                pressure,
                1
            ),

            "feelsLikeMaxC": round(
                apparent_max_temperature,
                1
            ),

            "feelsLikeMinC": round(
                apparent_min_temperature,
                1
            ),

            "weatherCode": weather_code,

            "weatherIcon": weather_code_to_icon(
                weather_code
            ),
        })

    return normalized


# =========================================================
# BUILD PLAN TIMELINE
# =========================================================

def build_timeline(
    hourly
):

    timeline = []

    for item in hourly[:24]:

        temperature = safe_float(
            item.get(
                "temp_c"
            )
        )

        rain = safe_float(
            item.get(
                "chance_of_rain"
            )
        )

        wind = safe_float(
            item.get(
                "wind_kph"
            )
        )

        humidity = safe_float(
            item.get(
                "humidity"
            )
        )

        uv = safe_float(
            item.get(
                "uv"
            )
        )

        condition = (
            item.get(
                "condition",
                {}
            )
            .get(
                "text",
                "Unknown"
            )
        )

        condition_lower = condition.lower()

        status = "FAVOURABLE"

        type_name = "good"

        text = (
            f"Good conditions around "
            f"{round(temperature)}°C with "
            f"{round(rain)}% rain probability."
        )

        # =================================================
        # THUNDERSTORM
        # =================================================

        if (
            "thunder" in condition_lower
            or "storm" in condition_lower
        ):

            status = "AVOID"

            type_name = "avoid"

            text = (
                "Thunderstorm conditions. "
                "Avoid exposed outdoor activities."
            )

        # =================================================
        # HEAVY RAIN
        # =================================================

        elif rain >= 70:

            status = "AVOID"

            type_name = "avoid"

            text = (
                f"High rain probability "
                f"({round(rain)}%). "
                "Consider indoor activities."
            )

        # =================================================
        # MODERATE RAIN
        # =================================================

        elif rain >= 40:

            status = "CAUTION"

            type_name = "caution"

            text = (
                f"Rain probability is "
                f"{round(rain)}%. "
                "Keep rain protection available."
            )

        # =================================================
        # EXTREME HEAT
        # =================================================

        elif temperature >= 35:

            status = "AVOID"

            type_name = "avoid"

            text = (
                f"Very high temperature "
                f"({round(temperature)}°C). "
                "Avoid prolonged outdoor exposure."
            )

        # =================================================
        # HIGH HEAT
        # =================================================

        elif temperature >= 32:

            status = "WATCH"

            type_name = "watch"

            text = (
                f"Temperature is "
                f"{round(temperature)}°C. "
                "Stay hydrated and limit prolonged exposure."
            )

        # =================================================
        # STRONG WIND
        # =================================================

        elif wind >= 30:

            status = "WATCH"

            type_name = "watch"

            text = (
                f"Wind speed is "
                f"{round(wind)} km/h. "
                "Use caution during outdoor activities."
            )

        # =================================================
        # HIGH UV
        # =================================================

        elif uv >= 8:

            status = "WATCH"

            type_name = "watch"

            text = (
                f"UV index is "
                f"{round(uv)}. "
                "Use sun protection."
            )

        # =================================================
        # HIGH HUMIDITY
        # =================================================

        elif (
            humidity >= 80
            and temperature >= 28
        ):

            status = "WATCH"

            type_name = "watch"

            text = (
                f"High humidity "
                f"({round(humidity)}%). "
                "Outdoor activity may feel uncomfortable."
            )

        # =================================================
        # EXTRACT HOUR
        # =================================================

        hour_of_day = None

        try:

            time_part = (
                item["time"]
                .split(" ")[1]
            )

            hour_of_day = int(
                time_part.split(":")[0]
            )

        except Exception:

            pass

        timeline.append({

            "time": item["time"],

            "text": text,

            "status": status,

            "type": type_name,

            "chance_of_rain": rain,

            "temp_c": temperature,

            "wind_kph": wind,

            "humidity": humidity,

            "uv": uv,

            "condition": condition,

            "hour_of_day": hour_of_day,
        })

    return timeline


# =========================================================
# FIND BEST WINDOW
# =========================================================

def find_best_window(
    timeline
):

    suitable = [

        item

        for item in timeline

        if item.get("type") == "good"

    ]

    if not suitable:

        return "No suitable window"

    suitable = sorted(

        suitable,

        key=lambda item: (

            item.get(
                "chance_of_rain",
                0
            )

            +

            item.get(
                "wind_kph",
                0
            )

            +

            max(
                0,

                item.get(
                    "temp_c",
                    0
                ) - 28
            ) * 2

            +

            item.get(
                "uv",
                0
            )
        )
    )

    best = suitable[0]

    try:

        raw_time = best["time"]

        time_part = (
            raw_time
            .split(" ")[1]
        )

        time_part = time_part[:5]

        return datetime.strptime(
            time_part,
            "%H:%M"
        ).strftime(
            "%I:%M %p"
        ).lstrip("0")

    except Exception:

        return best.get(
            "time",
            "No suitable window"
        )


# =========================================================
# MAIN WEATHER FUNCTION
# =========================================================

def get_weather(
    city: str = "Bengaluru"
):

    # =====================================================
    # 1. RESOLVE LOCATION
    # =====================================================

    location = resolve_location(
        city
    )

    latitude = location[
        "latitude"
    ]

    longitude = location[
        "longitude"
    ]

    # =====================================================
    # 2. CACHE CHECK
    # =====================================================

    cache_key = (
        round(
            float(latitude),
            4
        ),
        round(
            float(longitude),
            4
        )
    )

    cached = WEATHER_CACHE.get(
        cache_key
    )

    if cached:

        cached_weather, cached_at = cached

        if (
            time.time()
            - cached_at
            < WEATHER_CACHE_TTL
        ):

            return cached_weather

    # =====================================================
    # 3. GET WEATHER
    # =====================================================

    weather_data = get_open_meteo_weather(
        latitude,
        longitude
    )

    # =====================================================
    # 4. NORMALIZE CURRENT
    # =====================================================

    current_weather = (
        normalize_current_weather(
            weather_data,
            location
        )
    )

    # =====================================================
    # 5. NORMALIZE HOURLY
    # =====================================================

    hourly = normalize_hourly_weather(
        weather_data
    )

    # =====================================================
    # 6. NORMALIZE DAILY
    # =====================================================

    timezone_name = (
        weather_data.get(
            "timezone"
        )
        or current_weather.get(
            "timezone"
        )
        or "UTC"
    )

    forecast = normalize_daily_weather(
        weather_data,
        timezone_name
    )

    # =====================================================
    # 7. DASHBOARD HOURLY
    # =====================================================

    dashboard_hourly = hourly[:8]

    # =====================================================
    # 8. TIMELINE
    # =====================================================

    timeline = build_timeline(
        hourly
    )

    # =====================================================
    # 9. BEST WINDOW
    # =====================================================

    best_window = find_best_window(
        timeline
    )

    # =====================================================
    # 10. RISK ENGINE
    #
    # Risk engine receives normalized weather data.
    # =====================================================

    risk = calculate_weather_risk(

        current_weather,

        timeline,

        []
    )

    # =====================================================
    # 11. FINAL RESPONSE
    # =====================================================

    result = {

        # -------------------------------------------------
        # Location
        # -------------------------------------------------

        "city": current_weather[
            "city"
        ],

        "country": current_weather[
            "country"
        ],

        "region": current_weather[
            "region"
        ],

        "latitude": current_weather[
            "latitude"
        ],

        "longitude": current_weather[
            "longitude"
        ],

        # -------------------------------------------------
        # Current Weather
        # -------------------------------------------------

        "temperatureC": current_weather[
            "temperatureC"
        ],

        "temperatureF": current_weather[
            "temperatureF"
        ],

        "feelsLikeC": current_weather[
            "feelsLikeC"
        ],

        "feelsLikeF": current_weather[
            "feelsLikeF"
        ],

        "condition": current_weather[
            "condition"
        ],

        "humidity": current_weather[
            "humidity"
        ],

        "wind": current_weather[
            "wind"
        ],

        "windDirection": current_weather[
            "windDirection"
        ],

        "uv": current_weather[
            "uv"
        ],

        "visibility": current_weather[
            "visibility"
        ],

        "pressure": current_weather[
            "pressure"
        ],

        # -------------------------------------------------
        # LOCAL TIME
        # -------------------------------------------------

        "localtime": current_weather[
            "localtime"
        ],

        "timezone": current_weather[
            "timezone"
        ],

        "lastUpdated": current_weather[
            "lastUpdated"
        ],

        # -------------------------------------------------
        # Forecast
        # -------------------------------------------------

        "forecast": forecast,

        # -------------------------------------------------
        # Hourly
        # -------------------------------------------------

        "hourly": dashboard_hourly,

        "analyticsHourly": hourly,

        # -------------------------------------------------
        # Decision Intelligence
        # -------------------------------------------------

        "timeline": timeline,

        "best_window": best_window,

        # -------------------------------------------------
        # Alerts
        # -------------------------------------------------

        "alerts": [],

        # -------------------------------------------------
        # Risk
        # -------------------------------------------------

        "risk": risk,
    }

    # =====================================================
    # 12. SAVE TO CACHE
    # =====================================================

    WEATHER_CACHE[cache_key] = (
        result,
        time.time()
    )

    return result