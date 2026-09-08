import os
import requests
from dotenv import load_dotenv
from datetime import datetime

from risk_engine import calculate_weather_risk


load_dotenv()


WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")
VISUAL_CROSSING_API_KEY = os.getenv("VISUAL_CROSSING_API_KEY")

BASE_URL = "https://api.weatherapi.com/v1/forecast.json"


# =========================================================
# VISUAL CROSSING — 14 DAY FORECAST
# =========================================================

def get_long_forecast(latitude, longitude):

    if not VISUAL_CROSSING_API_KEY:
        raise Exception(
            "VISUAL_CROSSING_API_KEY is missing. "
            "Add it to the .env file."
        )

    url = (
        "https://weather.visualcrossing.com/"
        "VisualCrossingWebServices/rest/services/timeline/"
        f"{latitude},{longitude}"
    )

    params = {
        "unitGroup": "metric",
        "include": "days",
        "elements": (
            "datetime,"
            "tempmax,"
            "tempmin,"
            "precipprob,"
            "windspeed,"
            "humidity,"
            "pressure,"
            "sunrise,"
            "sunset,"
            "conditions"
        ),
        "key": VISUAL_CROSSING_API_KEY,
        "contentType": "json",
    }

    response = requests.get(
        url,
        params=params,
        timeout=15
    )

    if response.status_code != 200:
        raise Exception(
            f"Visual Crossing request failed: "
            f"{response.status_code} - {response.text}"
        )

    data = response.json()

    days = data.get("days", [])

    forecast_days = []

    for day in days[:14]:

        max_temp = day.get("tempmax") or 0
        min_temp = day.get("tempmin") or 0
        rain = day.get("precipprob") or 0
        wind = day.get("windspeed") or 0
        humidity = day.get("humidity") or 0
        pressure = day.get("pressure") or 0
        condition = day.get("conditions") or "Unknown"

        forecast_days.append({

            # Date
            "date": day.get("datetime"),

            # Sunrise / Sunset
            "astro": {
                "sunrise": day.get("sunrise"),
                "sunset": day.get("sunset"),
            },

            # WeatherAPI-compatible structure
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
            },

            # =================================================
            # FLAT VALUES FOR ANALYTICS
            # =================================================

            "maxTempC": max_temp,

            "minTempC": min_temp,

            "chanceOfRain": rain,

            "windKph": wind,

            "humidity": humidity,

            "pressure": pressure,
        })

    if not forecast_days:
        raise Exception(
            "Visual Crossing returned no forecast data."
        )

    print(
        f"Fetched {len(forecast_days)} day "
        "Visual Crossing forecast"
    )

    return forecast_days


# =========================================================
# MAIN WEATHER FUNCTION
# =========================================================

def get_weather(city: str):

    # =====================================================
    # CHECK WEATHER API KEY
    # =====================================================

    if not WEATHER_API_KEY:

        raise Exception(
            "WEATHER_API_KEY is missing. "
            "Add it to the .env file."
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


    # =====================================================
    # WEATHERAPI ERROR HANDLING
    # =====================================================

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


    # =====================================================
    # LOCATION + CURRENT WEATHER
    # =====================================================

    location = data["location"]

    current = data["current"]


    latitude = location["lat"]

    longitude = location["lon"]


    # =====================================================
    # KEEP WEATHERAPI FORECAST
    # =====================================================
    #
    # We still need WeatherAPI forecast for:
    # - Hourly forecast
    # - Plan My Day
    # - Other existing features
    #
    # WeatherAPI provides 3 days here.
    # Visual Crossing provides the long forecast.
    # =====================================================

    weatherapi_forecast_days = (
        data["forecast"]["forecastday"]
    )


    # =====================================================
    # 14-DAY FORECAST
    # =====================================================

    try:

        forecast_days = get_long_forecast(
            latitude,
            longitude
        )


    except Exception as error:

        print(
            "Long forecast error:",
            error
        )


        # Safe fallback
        #
        # If Visual Crossing fails,
        # the application will still work
        # using WeatherAPI's available forecast.

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


    # =====================================================
    # TODAY'S WEATHERAPI HOURS
    # =====================================================

    if len(weatherapi_forecast_days) > 0:

        all_hours.extend(

            weatherapi_forecast_days[0].get(

                "hour",

                []
            )
        )


    # =====================================================
    # TOMORROW'S WEATHERAPI HOURS
    # =====================================================

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
            )

            or 0
        )


        temperature = float(

            hour.get(

                "temp_c",

                0
            )

            or 0
        )


        wind = float(

            hour.get(

                "wind_kph",

                0
            )

            or 0
        )


        humidity = float(

            hour.get(

                "humidity",

                0
            )

            or 0
        )


        uv = float(

            hour.get(

                "uv",

                0
            )

            or 0
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

    # Only consider sensible
    # outdoor/activity hours:
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


    # =====================================================
    # CHECK FINAL WINDOW
    # =====================================================

    if len(current_window) > len(best_window):

        best_window = [

            *current_window
        ]


    # =====================================================
    # FALLBACK
    # =====================================================

    # If every period has some
    # caution/watch condition,
    # choose the lowest-risk hour.

    if (

        not best_window

        and activity_items

    ):

        sorted_items = sorted(

            activity_items,

            key=lambda item: (

                item["chance_of_rain"]

                + item["wind_kph"]

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


        # 14-DAY FORECAST

        "forecast": forecast_days,


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


        # BEST WINDOW

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