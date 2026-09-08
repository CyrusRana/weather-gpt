import os
import time
import requests

from datetime import datetime

from dotenv import load_dotenv

from risk_engine import calculate_weather_risk


# =========================================================
# ENVIRONMENT
# =========================================================

load_dotenv()

VISUAL_CROSSING_API_KEY = os.getenv(
    "VISUAL_CROSSING_API_KEY"
)


# =========================================================
# VISUAL CROSSING TIMELINE API
# =========================================================

VISUAL_CROSSING_URL = (
    "https://weather.visualcrossing.com/"
    "VisualCrossingWebServices/rest/services/timeline/"
)


# =========================================================
# CACHE
# =========================================================

WEATHER_CACHE = {}

WEATHER_CACHE_TTL = 600  # 10 minutes


# =========================================================
# NOMINATIM REVERSE GEOCODING
# =========================================================

NOMINATIM_REVERSE_URL = (
    "https://nominatim.openstreetmap.org/reverse"
)


# =========================================================
# HELPERS
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

    index = round(
        degrees / 45
    ) % 8

    return directions[index]


# =========================================================
# REVERSE GEOCODING
#
# LATITUDE/LONGITUDE → CITY / REGION / COUNTRY
# =========================================================

def reverse_geocode(
    latitude,
    longitude
):

    try:

        params = {

            "lat": latitude,

            "lon": longitude,

            "format": "json",

            "zoom": 10,

            "addressdetails": 1,
        }

        headers = {

            "User-Agent": (
                "WeatherGPT/1.0 "
                "(weather decision assistant)"
            )
        }

        response = requests.get(

            NOMINATIM_REVERSE_URL,

            params=params,

            headers=headers,

            timeout=10
        )

        if response.status_code != 200:

            print(
                "Reverse geocoding failed:",
                response.status_code
            )

            return {

                "city": "",

                "region": "",

                "country": "",
            }

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

            or ""
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

            "city": city,

            "region": region,

            "country": country,
        }

    except Exception as error:

        print(
            "Reverse geocoding error:",
            error
        )

        return {

            "city": "",

            "region": "",

            "country": "",
        }


# =========================================================
# FORMAT TIME
# =========================================================

def format_display_time(value):

    if not value:
        return "--"

    value = str(value)

    # Already HH:MM
    if (
        len(value) == 5
        and value[2] == ":"
    ):

        try:

            return datetime.strptime(
                value,
                "%H:%M"
            ).strftime(
                "%I:%M %p"
            ).lstrip("0")

        except Exception:

            return value


    # HH:MM:SS
    try:

        return datetime.strptime(
            value[:8],
            "%H:%M:%S"
        ).strftime(
            "%I:%M %p"
        ).lstrip("0")

    except Exception:

        pass


    # Full datetime
    try:

        dt = datetime.fromisoformat(
            value.replace(
                "Z",
                ""
            )
        )

        return dt.strftime(
            "%I:%M %p"
        ).lstrip("0")

    except Exception:

        return value


# =========================================================
# VISUAL CROSSING REQUEST
# =========================================================

def get_visual_crossing_weather(
    location
):

    if not VISUAL_CROSSING_API_KEY:

        raise Exception(
            "VISUAL_CROSSING_API_KEY is missing "
            "in the backend .env file."
        )

    params = {

        "unitGroup": "metric",

        "include": (
            "current,"
            "hours,"
            "days,"
            "alerts"
        ),

        "key": VISUAL_CROSSING_API_KEY,

        "contentType": "json",
    }

    response = requests.get(

        f"{VISUAL_CROSSING_URL}{location}",

        params=params,

        timeout=30
    )

    if response.status_code != 200:

        raise Exception(
            "Visual Crossing API failed: "
            f"{response.status_code} - "
            f"{response.text}"
        )

    return response.json()


# =========================================================
# NORMALIZE ALERTS
# =========================================================

def normalize_alerts(
    data
):

    alerts = data.get(
        "alerts",
        []
    )

    normalized = []

    if not isinstance(
        alerts,
        list
    ):

        return normalized

    for alert in alerts:

        if not isinstance(
            alert,
            dict
        ):

            continue

        normalized.append({

            "headline": (
                alert.get("headline")
                or alert.get("event")
                or "Weather Alert"
            ),

            "severity": (
                alert.get("severity")
                or "Unknown"
            ),

            "desc": (
                alert.get("description")
                or alert.get("desc")
                or alert.get("event")
                or ""
            ),

            "instruction": (
                alert.get("instruction")
                or ""
            ),

            "onset": (
                alert.get("onset")
                or ""
            ),

            "ends": (
                alert.get("ends")
                or ""
            ),
        })

    return normalized


# =========================================================
# NORMALIZE DAILY FORECAST
# =========================================================

def normalize_daily(
    data
):

    days = data.get(
        "days",
        []
    )

    forecast = []

    for day in days[:14]:

        max_temp = safe_float(
            day.get("tempmax")
        )

        min_temp = safe_float(
            day.get("tempmin")
        )

        feels_like_max = safe_float(
            day.get("feelslikemax")
        )

        feels_like_min = safe_float(
            day.get("feelslikemin")
        )

        rain = safe_float(
            day.get("precipprob")
        )

        wind = safe_float(
            day.get("windspeed")
        )

        humidity = safe_float(
            day.get("humidity")
        )

        pressure = safe_float(
            day.get("pressure")
        )

        condition = (
            day.get("conditions")
            or "Unknown"
        )

        sunrise = format_display_time(
            day.get("sunrise")
        )

        sunset = format_display_time(
            day.get("sunset")
        )

        forecast.append({

            "date": day.get(
                "datetime",
                ""
            ),

            "astro": {

                "sunrise": sunrise,

                "sunset": sunset,
            },

            "day": {

                "maxtemp_c": max_temp,

                "mintemp_c": min_temp,

                "condition": {

                    "text": condition
                },

                "daily_chance_of_rain": rain,

                "maxwind_kph": wind,

                "avghumidity": humidity,

                "pressure_mb": pressure,

                "feelslike_max_c": feels_like_max,

                "feelslike_min_c": feels_like_min,
            },

            # Flat values for Analytics

            "maxTempC": max_temp,

            "minTempC": min_temp,

            "chanceOfRain": rain,

            "windKph": wind,

            "humidity": humidity,

            "pressure": pressure,

            "feelsLikeMaxC": feels_like_max,

            "feelsLikeMinC": feels_like_min,
        })

    return forecast


# =========================================================
# NORMALIZE HOURLY FORECAST
# =========================================================

def normalize_hourly(
    data
):

    days = data.get(
        "days",
        []
    )

    all_hours = []

    for day in days:

        hours = day.get(
            "hours",
            []
        )

        if isinstance(
            hours,
            list
        ):

            all_hours.extend(
                hours
            )

    normalized = []

    for hour in all_hours:

        time_value = (
            hour.get("datetime")
            or ""
        )

        date_value = (
            hour.get("datetimeEpoch")
            or 0
        )

        temperature = safe_float(
            hour.get("temp")
        )

        feels_like = safe_float(
            hour.get("feelslike"),
            temperature
        )

        humidity = safe_float(
            hour.get("humidity")
        )

        rain = safe_float(
            hour.get("precipprob")
        )

        wind = safe_float(
            hour.get("windspeed")
        )

        wind_direction = get_wind_direction(
            hour.get("winddir")
        )

        pressure = safe_float(
            hour.get("pressure")
        )

        visibility = safe_float(
            hour.get("visibility")
        )

        uv = safe_float(
            hour.get("uvindex")
        )

        condition = (
            hour.get("conditions")
            or "Unknown"
        )

        normalized.append({

            "time": time_value,

            "time_epoch": date_value,

            "temp_c": temperature,

            "feelslike_c": feels_like,

            "chance_of_rain": rain,

            "wind_kph": wind,

            "wind_direction": wind_direction,

            "humidity": humidity,

            "uv": uv,

            "pressure_mb": pressure,

            "visibility_km": visibility,

            "condition": {

                "text": condition
            },

            "icon": (
                hour.get("icon")
                or ""
            ),
        })

    return normalized


# =========================================================
# BUILD DECISION TIMELINE
# =========================================================

def build_timeline(
    hourly
):

    timeline = []

    for item in hourly[:24]:

        temperature = safe_float(
            item.get("temp_c")
        )

        rain = safe_float(
            item.get("chance_of_rain")
        )

        wind = safe_float(
            item.get("wind_kph")
        )

        humidity = safe_float(
            item.get("humidity")
        )

        uv = safe_float(
            item.get("uv")
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

        condition_lower = (
            condition.lower()
        )

        status = "FAVOURABLE"

        type_name = "good"

        text = (

            f"Good conditions around "
            f"{round(temperature)}°C with "
            f"{round(rain)}% rain probability."
        )


        # -------------------------------------------------
        # STORM
        # -------------------------------------------------

        if (

            "thunder" in condition_lower

            or

            "storm" in condition_lower

        ):

            status = "AVOID"

            type_name = "avoid"

            text = (

                "Thunderstorm risk. "
                "Avoid exposed outdoor areas."
            )


        # -------------------------------------------------
        # HIGH RAIN
        # -------------------------------------------------

        elif rain >= 70:

            status = "AVOID"

            type_name = "avoid"

            text = (

                f"High rain probability "
                f"({round(rain)}%). "
                "Move outdoor plans indoors "
                "if possible."
            )


        # -------------------------------------------------
        # MODERATE RAIN
        # -------------------------------------------------

        elif rain >= 40:

            status = "CAUTION"

            type_name = "caution"

            text = (

                f"Rain probability is "
                f"{round(rain)}%. "
                "Keep rain protection available."
            )


        # -------------------------------------------------
        # EXTREME HEAT
        # -------------------------------------------------

        elif temperature >= 35:

            status = "AVOID"

            type_name = "avoid"

            text = (

                f"Very high temperature "
                f"({round(temperature)}°C). "
                "Avoid prolonged outdoor exposure."
            )


        # -------------------------------------------------
        # HIGH HEAT
        # -------------------------------------------------

        elif temperature >= 32:

            status = "WATCH"

            type_name = "watch"

            text = (

                f"Temperature is "
                f"{round(temperature)}°C. "
                "Stay hydrated and limit "
                "prolonged outdoor activity."
            )


        # -------------------------------------------------
        # STRONG WIND
        # -------------------------------------------------

        elif wind >= 30:

            status = "WATCH"

            type_name = "watch"

            text = (

                f"Wind speed is "
                f"{round(wind)} km/h. "
                "Use caution during outdoor activities."
            )


        # -------------------------------------------------
        # HIGH UV
        # -------------------------------------------------

        elif uv >= 8:

            status = "WATCH"

            type_name = "watch"

            text = (

                f"UV index is "
                f"{round(uv)}. "
                "Use sun protection."
            )


        # -------------------------------------------------
        # HIGH HUMIDITY
        # -------------------------------------------------

        elif (

            humidity >= 80

            and

            temperature >= 28

        ):

            status = "WATCH"

            type_name = "watch"

            text = (

                f"High humidity "
                f"({round(humidity)}%). "
                "Outdoor activity may feel uncomfortable."
            )


        # -------------------------------------------------
        # HOUR
        # -------------------------------------------------

        hour_of_day = None

        try:

            hour_of_day = int(

                time_value_from_datetime(

                    item.get("time")

                ).split(":")[0]

            )

        except Exception:

            pass


        timeline.append({

            "time": item.get(
                "time",
                ""
            ),

            "time_epoch": item.get(
                "time_epoch"
            ),

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
# TIME VALUE HELPER
# =========================================================

def time_value_from_datetime(
    value
):

    if not value:

        return "00:00"

    value = str(value)

    if "T" in value:

        return value.split("T")[-1]

    if " " in value:

        return value.split(" ")[-1]

    return value


# =========================================================
# BEST WINDOW
# =========================================================

def find_best_window(
    timeline
):

    activity_items = [

        item

        for item in timeline

        if (

            item.get(
                "hour_of_day"
            ) is None

            or

            (

                item.get(
                    "hour_of_day"
                ) >= 6

                and

                item.get(
                    "hour_of_day"
                ) <= 21
            )
        )
    ]


    if not activity_items:

        return "No suitable window"


    good_items = [

        item

        for item in activity_items

        if item.get(
            "type"
        ) == "good"
    ]


    if not good_items:

        # Choose lowest-risk hour

        good_items = sorted(

            activity_items,

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


        if not good_items:

            return "No suitable window"


    # Find longest continuous good block.

    best_block = []

    current_block = []

    previous_epoch = None


    for item in good_items:

        epoch = item.get(
            "time_epoch"
        )


        if (

            current_block

            and

            previous_epoch is not None

            and

            epoch is not None

            and

            epoch - previous_epoch > 3600

        ):

            if len(current_block) > len(
                best_block
            ):

                best_block = current_block

            current_block = []


        current_block.append(
            item
        )

        previous_epoch = epoch


    if len(current_block) > len(
        best_block
    ):

        best_block = current_block


    if not best_block:

        best_block = [
            good_items[0]
        ]


    if len(best_block) == 1:

        return datetime.strptime(

            time_value_from_datetime(

                best_block[0]["time"]

            )[:5],

            "%H:%M"

        ).strftime(

            "%I:%M %p"

        ).lstrip("0")


    start_time = datetime.strptime(

        time_value_from_datetime(

            best_block[0]["time"]

        )[:5],

        "%H:%M"

    ).strftime(

        "%I:%M %p"

    ).lstrip("0")


    # End boundary = one hour after
    # the last favourable record.

    last_time = datetime.strptime(

        time_value_from_datetime(

            best_block[-1]["time"]

        )[:5],

        "%H:%M"
    )


    from datetime import timedelta


    end_time_dt = (

        last_time

        + timedelta(hours=1)
    )


    end_time = end_time_dt.strftime(

        "%I:%M %p"

    ).lstrip("0")


    return (

        f"{start_time} – {end_time}"
    )


# =========================================================
# MAIN WEATHER FUNCTION
# =========================================================

def get_weather(
    city: str = "Bengaluru"
):

    city = str(
        city
    ).strip()


    if not city:

        city = "Bengaluru"


    # =====================================================
    # CACHE
    # =====================================================

    cache_key = city.lower()


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
    # VISUAL CROSSING
    # =====================================================

    data = get_visual_crossing_weather(
        city
    )


    # =====================================================
    # LOCATION
    # =====================================================

    resolved_address = (

        data.get(
            "resolvedAddress"
        )

        or city
    )


    timezone_name = (

        data.get(
            "timezone"
        )

        or "UTC"
    )


    latitude = safe_float(

        data.get(
            "latitude"
        )
    )


    longitude = safe_float(

        data.get(
            "longitude"
        )
    )


    # =====================================================
    # REVERSE GEOCODE
    #
    # IMPORTANT:
    # Convert GPS coordinates into a readable
    # city name for the dashboard.
    # =====================================================

    location_info = reverse_geocode(

        latitude,

        longitude
    )


    location_city = (

        location_info.get(
            "city"
        )

        or ""

    )


    location_region = (

        location_info.get(
            "region"
        )

        or ""
    )


    location_country = (

        location_info.get(
            "country"
        )

        or ""
    )


    # =====================================================
    # FALLBACK LOCATION
    # =====================================================

    if not location_city:

        fallback_city = (

            data.get(
                "address"
            )

            or resolved_address.split(",")[0]

            or city
        )

        location_city = fallback_city


    if not location_country:

        location_country = "India"


    # =====================================================
    # CURRENT CONDITIONS
    # =====================================================

    current = data.get(

        "currentConditions",

        {}
    )


    temperature = safe_float(

        current.get(
            "temp"
        )
    )


    feels_like = safe_float(

        current.get(
            "feelslike"
        ),

        temperature
    )


    humidity = safe_float(

        current.get(
            "humidity"
        )
    )


    wind = safe_float(

        current.get(
            "windspeed"
        )
    )


    wind_direction_degrees = (

        current.get(
            "winddir"
        )
    )


    wind_direction = get_wind_direction(

        wind_direction_degrees
    )


    pressure = safe_float(

        current.get(
            "pressure"
        )
    )


    visibility = safe_float(

        current.get(
            "visibility"
        )
    )


    uv = safe_float(

        current.get(
            "uvindex"
        )
    )


    condition = (

        current.get(
            "conditions"
        )

        or "Unknown"
    )


    current_datetime = (

        current.get(
            "datetime"
        )

        or ""
    )


    current_epoch = safe_int(

        current.get(
            "datetimeEpoch"
        )
    )


    # =====================================================
    # LOCAL TIME
    # =====================================================

    localtime = (

        current_datetime

        if current_datetime

        else ""
    )


    if localtime:

        localtime = (

            localtime

            .replace(
                "T",
                " "
            )
        )


        if len(localtime) >= 5:

            localtime = localtime[:16]


    # =====================================================
    # DAILY FORECAST
    # =====================================================

    forecast = normalize_daily(
        data
    )


    # =====================================================
    # HOURLY FORECAST
    # =====================================================

    hourly_all = normalize_hourly(
        data
    )


    # =====================================================
    # FUTURE HOURS
    # =====================================================

    future_hours = [

        hour

        for hour in hourly_all

        if (

            current_epoch == 0

            or

            safe_int(

                hour.get(
                    "time_epoch"
                )

            ) >= current_epoch
        )
    ]


    # =====================================================
    # DASHBOARD HOURLY
    # =====================================================

    dashboard_hourly = future_hours[:8]


    # =====================================================
    # ANALYTICS HOURLY
    # =====================================================

    analytics_hourly = future_hours[:48]


    # =====================================================
    # DECISION TIMELINE
    # =====================================================

    timeline = build_timeline(
        future_hours
    )


    # =====================================================
    # BEST WINDOW
    # =====================================================

    best_window = find_best_window(
        timeline
    )


    # =====================================================
    # ALERTS
    # =====================================================

    alerts = normalize_alerts(
        data
    )


    # =====================================================
    # CURRENT WEATHER OBJECT
    # =====================================================

    current_weather = {

        "city": location_city,

        "country": location_country,

        "region": location_region,

        "latitude": latitude,

        "longitude": longitude,

        "localtime": localtime,

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

        "humidity": round(
            humidity
        ),

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
            visibility,
            1
        ),

        "pressure": round(
            pressure,
            1
        ),

        "lastUpdated": localtime,

        "weatherSource": (
            "Visual Crossing"
        ),
    }


    # =====================================================
    # RISK ENGINE
    # =====================================================

    risk = calculate_weather_risk(

        current_weather,

        timeline,

        alerts
    )


    # =====================================================
    # FINAL NORMALIZED RESPONSE
    # =====================================================

    result = {

        # -------------------------------------------------
        # LOCATION
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
        # CURRENT WEATHER
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
        # TIME
        # -------------------------------------------------

        "localtime": current_weather[
            "localtime"
        ],

        "lastUpdated": current_weather[
            "lastUpdated"
        ],

        "timezone": current_weather[
            "timezone"
        ],


        # -------------------------------------------------
        # WEATHER SOURCE
        # -------------------------------------------------

        "weatherSource": (
            "Visual Crossing"
        ),


        # -------------------------------------------------
        # FORECAST
        # -------------------------------------------------

        "forecast": forecast,


        # -------------------------------------------------
        # HOURLY
        # -------------------------------------------------

        "hourly": dashboard_hourly,

        "analyticsHourly": analytics_hourly,


        # -------------------------------------------------
        # DECISION INTELLIGENCE
        # -------------------------------------------------

        "timeline": timeline,

        "best_window": best_window,


        # -------------------------------------------------
        # ALERTS
        # -------------------------------------------------

        "alerts": alerts,


        # -------------------------------------------------
        # RISK
        # -------------------------------------------------

        "risk": risk,
    }


    # =====================================================
    # SAVE CACHE
    # =====================================================

    WEATHER_CACHE[cache_key] = (

        result,

        time.time()
    )


    return result