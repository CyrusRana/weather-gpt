import os
import requests
from dotenv import load_dotenv
from datetime import datetime

from risk_engine import calculate_weather_risk

load_dotenv()

WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")

BASE_URL = "https://api.weatherapi.com/v1/forecast.json"


# =========================================================
# OPEN-METEO — 7 DAY FORECAST
# =========================================================

def get_7_day_forecast(latitude, longitude):

    url = "https://api.open-meteo.com/v1/forecast"

    params = {
        "latitude": latitude,
        "longitude": longitude,
       "daily": (
    "weather_code,"
    "temperature_2m_max,"
    "temperature_2m_min,"
    "precipitation_probability_max,"
    "wind_speed_10m_max,"
    "relative_humidity_2m_mean,"
    "surface_pressure_mean,"
    "sunrise,"
    "sunset"
),
        "forecast_days": 14,
        "timezone": "auto",
        "wind_speed_unit": "kmh",
    }

    response = requests.get(
        url,
        params=params,
        timeout=10
    )

    response.raise_for_status()

    return response.json()["daily"]


# =========================================================
# OPEN-METEO WEATHER CODE
# =========================================================

def weather_code_to_condition(code):

    if code == 0:
        return "Clear"

    if code in [1, 2]:
        return "Partly Cloudy"

    if code == 3:
        return "Cloudy"

    if code in [45, 48]:
        return "Fog"

    if code in [51, 53, 55, 56, 57]:
        return "Drizzle"

    if code in [61, 63, 65, 66, 67, 80, 81, 82]:
        return "Rain"

    if code in [71, 73, 75, 77, 85, 86]:
        return "Snow"

    if code in [95, 96, 99]:
        return "Thunderstorm"

    return "Cloudy"


# =========================================================
# MAIN WEATHER FUNCTION
# =========================================================

def get_weather(city: str):

    if not WEATHER_API_KEY:

        raise Exception(
            "WEATHER_API_KEY is missing. Add it to the .env file."
        )

    # =====================================================
    # WEATHERAPI REQUEST
    # =====================================================

    params = {
        "key": WEATHER_API_KEY,
        "q": city,
        "days": 3,
        "aqi": "no",
        "alerts": "yes",
    }

    response = requests.get(
        BASE_URL,
        params=params,
        timeout=10
    )

    if response.status_code != 200:

        try:
            error_data = response.json()
        except Exception:
            error_data = {}

        raise Exception(
            error_data.get(
                "error",
                {}
            ).get(
                "message",
                "Weather API request failed"
            )
        )

    data = response.json()

    location = data["location"]
    current = data["current"]

    latitude = location["lat"]
    longitude = location["lon"]

    # Keep WeatherAPI forecast separately.
    # We need this for hourly forecast and Plan My Day.
    weatherapi_forecast_days = data["forecast"]["forecastday"]


    # =====================================================
    # 7-DAY FORECAST
    # =====================================================

    try:

        daily_data = get_7_day_forecast(
            latitude,
            longitude
        )

        forecast_days = []

        for i in range(
            len(daily_data["time"])
        ):

            forecast_days.append({

    "date": daily_data["time"][i],

    "astro": {
        "sunrise": daily_data["sunrise"][i],
        "sunset": daily_data["sunset"][i],
    },

    "day": {

        "maxtemp_c": (
            daily_data[
                "temperature_2m_max"
            ][i]
        ),

        "mintemp_c": (
            daily_data[
                "temperature_2m_min"
            ][i]
        ),

        "condition": {
            "text":
                weather_code_to_condition(
                    daily_data[
                        "weather_code"
                    ][i]
                )
        },

        "daily_chance_of_rain": (
            daily_data[
                "precipitation_probability_max"
            ][i] or 0
        ),

        "maxwind_kph": (
            daily_data[
                "wind_speed_10m_max"
            ][i] or 0
        ),

        "avghumidity": (
            daily_data[
                "relative_humidity_2m_mean"
            ][i] or 0
        ),

        "pressure_mb": (
            daily_data[
                "surface_pressure_mean"
            ][i] or 0
        ),
    },

    # Flat values for Analytics
    "maxTempC": (
        daily_data[
            "temperature_2m_max"
        ][i]
    ),

    "minTempC": (
        daily_data[
            "temperature_2m_min"
        ][i]
    ),

    "chanceOfRain": (
        daily_data[
            "precipitation_probability_max"
        ][i] or 0
    ),

    "windKph": (
        daily_data[
            "wind_speed_10m_max"
        ][i] or 0
    ),

    "humidity": (
        daily_data[
            "relative_humidity_2m_mean"
        ][i] or 0
    ),

    "pressure": (
        daily_data[
            "surface_pressure_mean"
        ][i] or 0
    ),

})

    except Exception as error:

        print(
            "7-day forecast error:",
            error
        )

        # Safe fallback.
        # Dashboard will still work with WeatherAPI data.
        forecast_days = weatherapi_forecast_days


    # =====================================================
    # CURRENT WEATHER
    # =====================================================

    current_weather = {

        "city": location["name"],

        "country": location["country"],

        "region": location["region"],

        "latitude": location["lat"],

        "longitude": location["lon"],

        "localtime": location["localtime"],

        "temperatureC": current["temp_c"],

        "temperatureF": current["temp_f"],

        "feelsLikeC": current["feelslike_c"],

        "feelsLikeF": current["feelslike_f"],

        "condition": current["condition"]["text"],

        "humidity": current["humidity"],

        "wind": current["wind_kph"],

        "windDirection": current["wind_dir"],

        "pressure": current["pressure_mb"],

        "visibility": current["vis_km"],

        "uv": current["uv"],

        "lastUpdated": current["last_updated"],
    }


    # =====================================================
    # COLLECT HOURLY FORECAST
    # =====================================================

    all_hours = []


    # Today's WeatherAPI hours

    if len(weatherapi_forecast_days) > 0:

        all_hours.extend(
            weatherapi_forecast_days[0].get(
                "hour",
                []
            )
        )


    # Tomorrow's WeatherAPI hours

    if len(weatherapi_forecast_days) > 1:

        all_hours.extend(
            weatherapi_forecast_days[1].get(
                "hour",
                []
            )
        )


    # =====================================================
    # FIND FUTURE HOURS
    # =====================================================

    current_epoch = int(
        current.get(
            "last_updated_epoch",
            0
        )
    )

    future_hours = [

        hour

        for hour in all_hours

        if int(
            hour.get(
                "time_epoch",
                0
            )
        ) >= current_epoch
    ]


    # =====================================================
    # HOURLY DATA FOR DASHBOARD
    # =====================================================

    dashboard_hours = future_hours[:8]

    if (
        not dashboard_hours
        and len(weatherapi_forecast_days) > 1
    ):

        dashboard_hours = (
            weatherapi_forecast_days[1]
            .get(
                "hour",
                []
            )[:8]
        )


    # =====================================================
    # NEXT 12 HOURS FOR PLAN MY DAY
    # =====================================================

    next_hours = future_hours[:12]

    if (
        not next_hours
        and len(weatherapi_forecast_days) > 1
    ):

        next_hours = (
            weatherapi_forecast_days[1]
            .get(
                "hour",
                []
            )[:12]
        )


    # =====================================================
    # PLAN MY DAY TIMELINE
    # =====================================================

    timeline = []


    for hour in next_hours:

        rain = float(
            hour.get(
                "chance_of_rain",
                0
            ) or 0
        )

        temperature = float(
            hour.get(
                "temp_c",
                0
            ) or 0
        )

        wind = float(
            hour.get(
                "wind_kph",
                0
            ) or 0
        )

        humidity = float(
            hour.get(
                "humidity",
                0
            ) or 0
        )

        uv = float(
            hour.get(
                "uv",
                0
            ) or 0
        )

        condition = (
            hour.get(
                "condition",
                {}
            ).get(
                "text",
                ""
            )
        )

        condition_lower = condition.lower()


        # =================================================
        # DEFAULT
        # =================================================

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
                "Thunderstorm risk. "
                "Avoid exposed outdoor areas."
            )


        # =================================================
        # HIGH RAIN
        # =================================================

        elif rain >= 70:

            status = "AVOID"

            type_name = "avoid"

            text = (
                f"High rain probability "
                f"({round(rain)}%). "
                "Move outdoor plans indoors "
                "if possible."
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
                "Keep an umbrella or rain "
                "protection available."
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
                "Stay hydrated and limit "
                "prolonged outdoor activity."
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
                "Be cautious with outdoor activities."
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
                "Use sun protection and avoid "
                "prolonged exposure."
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
        # TIME OF DAY
        # =================================================

        time_value = hour.get(
            "time",
            ""
        )

        hour_of_day = None

        try:

            if " " in time_value:

                time_part = (
                    time_value.split(" ")[1]
                )

                hour_of_day = int(
                    time_part.split(":")[0]
                )

        except Exception:

            hour_of_day = None


        # =================================================
        # ADD TIMELINE ITEM
        # =================================================

        timeline.append({

            "time": time_value,

            "time_epoch": hour.get(
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


    # =====================================================
    # FIND BEST WINDOW
    # =====================================================

    # Only consider sensible outdoor/activity hours:
    # 6 AM to 9 PM.

    activity_items = [

        item

        for item in timeline

        if (
            item.get("hour_of_day") is None
            or (
                item.get("hour_of_day") >= 6
                and item.get("hour_of_day") <= 21
            )
        )
    ]


    best_window = []

    current_window = []


    for item in activity_items:

        if item["type"] == "good":

            current_window.append(item)

        else:

            if len(current_window) > len(best_window):

                best_window = [
                    *current_window
                ]

            current_window = []


    # Check final window

    if len(current_window) > len(best_window):

        best_window = [
            *current_window
        ]


    # =====================================================
    # FALLBACK
    # =====================================================

    # If every period has some caution/watch condition,
    # choose the lowest-risk hour.

    if (
        not best_window
        and activity_items
    ):

        sorted_items = sorted(

            activity_items,

            key=lambda item: (

                item["chance_of_rain"]

                + item["wind"]

                + max(
                    0,
                    item["temp_c"] - 28
                ) * 3

                + item["uv"] * 2
            )
        )

        best_window = [
            sorted_items[0]
        ]


    # =====================================================
    # FORMAT BEST WINDOW
    # =====================================================

    best_window_text = "No suitable window"


    if len(best_window) == 1:

        raw_time = (
            best_window[0]["time"]
            .split(" ")[-1]
        )

        try:

            best_window_text = datetime.strptime(
                raw_time,
                "%H:%M"
            ).strftime(
                "%I:%M %p"
            ).lstrip("0")

        except Exception:

            best_window_text = raw_time


    elif len(best_window) >= 2:

        start_time = (
            best_window[0]["time"]
            .split(" ")[-1]
        )

        end_time = (
            best_window[-1]["time"]
            .split(" ")[-1]
        )

        try:

            start_time = datetime.strptime(
                start_time,
                "%H:%M"
            ).strftime(
                "%I:%M %p"
            ).lstrip("0")

            end_time = datetime.strptime(
                end_time,
                "%H:%M"
            ).strftime(
                "%I:%M %p"
            ).lstrip("0")

        except Exception:

            pass


        best_window_text = (
            f"{start_time} – {end_time}"
        )

            # =====================================================
    # WEATHER DECISION / RISK ENGINE
    # =====================================================

    risk = calculate_weather_risk(
        current_weather,
        timeline,
        data.get(
            "alerts",
            {}
        ).get(
            "alert",
            []
        )
    )


    # =====================================================
    # RETURN WEATHER DATA
    # =====================================================

    return {

        # Current weather

        **current_weather,


        # REAL 7-DAY FORECAST

        "forecast": forecast_days,


        # HOURLY WEATHER
        # HOURLY WEATHER

"hourly": dashboard_hours,

# FULL TODAY HOURLY DATA FOR ANALYTICS

"analyticsHourly": (
    weatherapi_forecast_days[0].get(
        "hour",
        []
    )
    if len(weatherapi_forecast_days) > 0
    else []
),


        # PLAN MY DAY

        "timeline": timeline,


        # SINGLE SOURCE OF TRUTH

        "best_window": best_window_text,


        # WEATHER ALERTS

        "alerts": (
            data.get(
                "alerts",
                {}
            ).get(
                "alert",
                []
            )
        ),

        # WEATHER DECISION ENGINE

        "risk": risk,
    }