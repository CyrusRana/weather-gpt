# =========================================================
# WEATHER GPT — DECISION / RISK ENGINE
# =========================================================


def calculate_weather_risk(
    current_weather,
    timeline,
    alerts
):

    # =====================================================
    # DEFAULT VALUES
    # =====================================================

    score = 0

    factors = []

    severe_alert = False


    # =====================================================
    # OFFICIAL WEATHER ALERT CHECK
    # =====================================================

    if alerts:

        for alert in alerts:

            alert_text = (
                str(alert).lower()
            )

            severe_words = [
                "severe",
                "extreme",
                "warning",
                "thunderstorm",
                "cyclone",
                "tornado",
                "flood",
                "storm",
                "heavy rain",
                "danger",
            ]

            if any(
                word in alert_text
                for word in severe_words
            ):

                severe_alert = True

                factors.append({
                    "name": "Official Alert",
                    "value": "Active",
                    "risk": "SEVERE",
                    "reason":
                        "An official weather warning is active."
                })

                break


    # =====================================================
    # CURRENT WEATHER
    # =====================================================

    temperature = float(
        current_weather.get(
            "temperatureC",
            0
        ) or 0
    )

    humidity = float(
        current_weather.get(
            "humidity",
            0
        ) or 0
    )

    wind = float(
        current_weather.get(
            "wind",
            0
        ) or 0
    )

    uv = float(
        current_weather.get(
            "uv",
            0
        ) or 0
    )

    visibility = float(
        current_weather.get(
            "visibility",
            0
        ) or 0
    )


    # =====================================================
    # TEMPERATURE RISK
    # =====================================================

    if temperature >= 40:

        score += 30

        factors.append({
            "name": "Temperature",
            "value": f"{round(temperature)}°C",
            "risk": "HIGH",
            "reason":
                "Extreme heat can make outdoor activity unsafe."
        })

    elif temperature >= 35:

        score += 20

        factors.append({
            "name": "Temperature",
            "value": f"{round(temperature)}°C",
            "risk": "MODERATE",
            "reason":
                "High temperatures may cause heat stress."
        })

    elif temperature >= 32:

        score += 10

        factors.append({
            "name": "Temperature",
            "value": f"{round(temperature)}°C",
            "risk": "WATCH",
            "reason":
                "Warm conditions may reduce outdoor comfort."
        })

    else:

        factors.append({
            "name": "Temperature",
            "value": f"{round(temperature)}°C",
            "risk": "LOW",
            "reason":
                "Temperature is within a generally comfortable range."
        })


    # =====================================================
    # RAIN RISK
    # =====================================================

    rain_values = [

        float(
            item.get(
                "chance_of_rain",
                0
            ) or 0
        )

        for item in timeline

    ]


    maximum_rain = (
        max(rain_values)
        if rain_values
        else 0
    )


    if maximum_rain >= 80:

        score += 30

        factors.append({
            "name": "Rain",
            "value":
                f"{round(maximum_rain)}%",
            "risk": "HIGH",
            "reason":
                "Very high rain probability may disrupt outdoor plans."
        })

    elif maximum_rain >= 60:

        score += 20

        factors.append({
            "name": "Rain",
            "value":
                f"{round(maximum_rain)}%",
            "risk": "MODERATE",
            "reason":
                "Rain is reasonably likely during the forecast period."
        })

    elif maximum_rain >= 40:

        score += 10

        factors.append({
            "name": "Rain",
            "value":
                f"{round(maximum_rain)}%",
            "risk": "WATCH",
            "reason":
                "There is a meaningful chance of rain."
        })

    else:

        factors.append({
            "name": "Rain",
            "value":
                f"{round(maximum_rain)}%",
            "risk": "LOW",
            "reason":
                "Rain probability is relatively low."
        })


    # =====================================================
    # WIND RISK
    # =====================================================

    timeline_winds = [

        float(
            item.get(
                "wind_kph",
                0
            ) or 0
        )

        for item in timeline

    ]


    maximum_wind = (

        max(timeline_winds)
        if timeline_winds
        else wind

    )


    if maximum_wind >= 50:

        score += 30

        factors.append({
            "name": "Wind",
            "value":
                f"{round(maximum_wind)} km/h",
            "risk": "HIGH",
            "reason":
                "Strong winds can make outdoor activity hazardous."
        })

    elif maximum_wind >= 30:

        score += 20

        factors.append({
            "name": "Wind",
            "value":
                f"{round(maximum_wind)} km/h",
            "risk": "MODERATE",
            "reason":
                "Strong winds may affect outdoor plans."
        })

    elif maximum_wind >= 20:

        score += 10

        factors.append({
            "name": "Wind",
            "value":
                f"{round(maximum_wind)} km/h",
            "risk": "WATCH",
            "reason":
                "Moderate winds may affect some outdoor activities."
        })

    else:

        factors.append({
            "name": "Wind",
            "value":
                f"{round(maximum_wind)} km/h",
            "risk": "LOW",
            "reason":
                "Wind conditions are relatively calm."
        })


    # =====================================================
    # HUMIDITY RISK
    # =====================================================

    if humidity >= 85:

        score += 15

        factors.append({
            "name": "Humidity",
            "value":
                f"{round(humidity)}%",
            "risk": "MODERATE",
            "reason":
                "Very high humidity can make warm conditions uncomfortable."
        })

    elif humidity >= 70:

        score += 5

        factors.append({
            "name": "Humidity",
            "value":
                f"{round(humidity)}%",
            "risk": "WATCH",
            "reason":
                "Higher humidity may reduce outdoor comfort."
        })

    else:

        factors.append({
            "name": "Humidity",
            "value":
                f"{round(humidity)}%",
            "risk": "LOW",
            "reason":
                "Humidity is within a generally manageable range."
        })


    # =====================================================
    # UV RISK
    # =====================================================

    if uv >= 11:

        score += 20

        factors.append({
            "name": "UV Index",
            "value":
                str(round(uv)),
            "risk": "HIGH",
            "reason":
                "Extreme UV exposure requires strong sun protection."
        })

    elif uv >= 8:

        score += 15

        factors.append({
            "name": "UV Index",
            "value":
                str(round(uv)),
            "risk": "MODERATE",
            "reason":
                "High UV exposure requires sun protection."
        })

    elif uv >= 6:

        score += 8

        factors.append({
            "name": "UV Index",
            "value":
                str(round(uv)),
            "risk": "WATCH",
            "reason":
                "Sun protection is recommended."
        })

    else:

        factors.append({
            "name": "UV Index",
            "value":
                str(round(uv)),
            "risk": "LOW",
            "reason":
                "UV exposure is relatively low."
        })


    # =====================================================
    # VISIBILITY RISK
    # =====================================================

    if visibility > 0 and visibility < 2:

        score += 20

        factors.append({
            "name": "Visibility",
            "value":
                f"{visibility:.1f} km",
            "risk": "HIGH",
            "reason":
                "Low visibility can affect travel safety."
        })

    elif visibility > 0 and visibility < 5:

        score += 10

        factors.append({
            "name": "Visibility",
            "value":
                f"{visibility:.1f} km",
            "risk": "WATCH",
            "reason":
                "Reduced visibility may affect travel."
        })

    else:

        factors.append({
            "name": "Visibility",
            "value":
                f"{visibility:.1f} km",
            "risk": "LOW",
            "reason":
                "Visibility is generally good."
        })


    # =====================================================
    # DETERMINE OVERALL RISK
    # =====================================================

    if severe_alert:

        level = "SEVERE"

        action = (
            "Avoid unnecessary outdoor activity "
            "and follow official weather guidance."
        )

        explanation = (
            "An official weather warning is active. "
            "Official guidance takes priority over routine recommendations."
        )

    elif score >= 70:

        level = "HIGH"

        action = (
            "Avoid or postpone outdoor activities "
            "until conditions improve."
        )

        explanation = (
            "Multiple weather factors indicate elevated outdoor risk."
        )

    elif score >= 40:

        level = "MODERATE"

        action = (
            "Outdoor activity is possible with caution. "
            "Check conditions before going out."
        )

        explanation = (
            "Some weather factors may affect outdoor comfort or safety."
        )

    else:

        level = "LOW"

        action = (
            "Conditions are generally suitable "
            "for normal outdoor activities."
        )

        explanation = (
            "Current weather conditions show relatively low overall risk."
        )


    # =====================================================
    # RETURN DECISION
    # =====================================================

    return {

        "score": min(
            score,
            100
        ),

        "level": level,

        "action": action,

        "explanation": explanation,

        "factors": factors,

        "officialAlert": severe_alert,

    }