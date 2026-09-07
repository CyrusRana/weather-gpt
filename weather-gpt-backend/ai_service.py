import os
import requests
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

MODEL = "openrouter/free"


# ==========================================================
# DASHBOARD - PLAN MY DAY
# ==========================================================

def generate_day_plan(weather):

    if not OPENROUTER_API_KEY:
        raise Exception("OPENROUTER_API_KEY is missing in .env")

    # --------------------------------------------------
    # REAL WEATHER DATA FROM BACKEND
    # --------------------------------------------------

    city = weather.get("city", "Unknown")
    country = weather.get("country", "")

    temperature = weather.get("temperatureC")
    feels_like = weather.get("feelsLikeC")
    condition = weather.get("condition", "Unknown")
    humidity = weather.get("humidity")
    wind = weather.get("wind")
    uv = weather.get("uv")

    # --------------------------------------------------
    # DECISION ENGINE RESULT
    # This is calculated by our backend from live
    # hourly weather data.
    # --------------------------------------------------

    best_window = weather.get(
        "best_window",
        "No suitable outdoor window found."
    )

    # --------------------------------------------------
    # HOURLY LIVE FORECAST
    # --------------------------------------------------

    timeline = weather.get("timeline", [])

    timeline_text = []

    for hour in timeline:

        timeline_text.append(
            f"""
Time: {hour.get('time')}
Temperature: {hour.get('temp_c')}°C
Condition: {hour.get('condition')}
Rain probability: {hour.get('chance_of_rain')}%
Humidity: {hour.get('humidity')}%
Wind: {hour.get('wind_kph')} km/h
UV index: {hour.get('uv')}
Status: {hour.get('status')}
"""
        )

    forecast_text = "\n".join(timeline_text)

    # --------------------------------------------------
    # WEATHER ALERTS
    # --------------------------------------------------

    alerts = weather.get("alerts", [])

    alert_text = "No active weather alerts."

    if alerts:

        alert_parts = []

        for alert in alerts:

            alert_parts.append(
                f"""
Alert: {alert.get('headline', 'Weather Alert')}
Severity: {alert.get('severity', 'Unknown')}
Description: {alert.get('desc', '')}
"""
            )

        alert_text = "\n".join(alert_parts)

    # --------------------------------------------------
    # AI PROMPT
    # --------------------------------------------------

    prompt = f"""
You are Weather GPT, a weather decision assistant.

You are given REAL weather forecast data retrieved from the
weather service.

Your job is to explain the weather and give practical advice.

IMPORTANT:

1. Use ONLY the weather data provided below.
2. NEVER invent weather values.
3. NEVER invent a different best outdoor window.
4. NEVER change the provided BEST WINDOW.
5. The BEST WINDOW below was calculated by the backend
   decision engine using the hourly weather data.
6. Your job is to EXPLAIN why that window is suitable.
7. If the weather conditions are poor, clearly say so.
8. Respect active weather alerts.
9. Do not claim conditions are safe if an active severe
   weather alert indicates otherwise.
10. Recommendations must be based on the actual hourly data.
11. Do not use generic pre-written weather statements.
12. Do not mention that you are an AI model.

LOCATION:
{city}, {country}

CURRENT WEATHER:
Temperature: {temperature}°C
Feels like: {feels_like}°C
Condition: {condition}
Humidity: {humidity}%
Wind: {wind} km/h
UV: {uv}

BACKEND DECISION ENGINE:
BEST WINDOW:
{best_window}

HOURLY WEATHER DATA:
{forecast_text}

WEATHER ALERTS:
{alert_text}

Now explain the actual weather situation.

Return the answer using this structure:

BEST WINDOW:
Use EXACTLY this value:
{best_window}

AVOID:
Identify the actual hours that should be avoided based on
rain, high temperature, high UV, strong wind, storms or alerts.

PLAN:
Give a practical recommendation based on the actual weather.

WHY:
Explain briefly which actual weather conditions support
the recommendation.

Do not create or calculate a different BEST WINDOW.
"""

    # --------------------------------------------------
    # OPENROUTER REQUEST
    # --------------------------------------------------

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": MODEL,
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are Weather GPT. "
                    "Give factual weather-based recommendations "
                    "using only the supplied live forecast data."
                )
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "temperature": 0.1,
        "max_tokens": 1000
    }

    response = requests.post(
        OPENROUTER_URL,
        headers=headers,
        json=payload,
        timeout=60
    )

    print("========== OPENROUTER DEBUG ==========")
    print("Status Code:", response.status_code)
    print("Response:", response.text)
    print("======================================")

    if response.status_code != 200:
        raise Exception(
            f"OpenRouter error {response.status_code}: "
            f"{response.text}"
        )

    data = response.json()

    if "choices" not in data or not data["choices"]:
        raise Exception(
            f"OpenRouter returned no choices: {data}"
        )

    return data["choices"][0]["message"]["content"]cd 


# ==========================================================
# AI ASSISTANT - ANSWER USER WEATHER QUESTIONS
# ==========================================================

def answer_weather_question(weather, question, language="English"):

    if not OPENROUTER_API_KEY:
        raise Exception("OPENROUTER_API_KEY is missing in .env")

    # --------------------------------------------------
    # CURRENT WEATHER
    # --------------------------------------------------

    city = weather.get("city", "Unknown")
    country = weather.get("country", "")

    temperature = weather.get("temperatureC")
    feels_like = weather.get("feelsLikeC")
    condition = weather.get("condition", "Unknown")
    humidity = weather.get("humidity")
    wind = weather.get("wind")
    wind_direction = weather.get("windDirection")
    pressure = weather.get("pressure")
    visibility = weather.get("visibility")
    uv = weather.get("uv")

    # --------------------------------------------------
    # BACKEND DECISION ENGINE
    # --------------------------------------------------

    best_window = weather.get(
        "best_window",
        "No suitable outdoor window found."
    )

    # --------------------------------------------------
    # WEATHER RISK / DECISION RESULT
    # ADDED - USES EXISTING BACKEND RISK ENGINE
    # --------------------------------------------------

    risk = weather.get("risk", {})

    risk_score = risk.get(
        "score",
        0
    )

    risk_level = risk.get(
        "level",
        "LOW"
    )

    risk_action = risk.get(
        "action",
        "No specific risk action available."
    )

    risk_explanation = risk.get(
        "explanation",
        ""
    )

    risk_factors = risk.get(
        "factors",
        []
    )

    official_alert = risk.get(
        "officialAlert",
        False
    )

    risk_factors_text = []

    for factor in risk_factors:

        risk_factors_text.append(
            f"""
Factor: {factor.get('name')}
Value: {factor.get('value')}
Risk: {factor.get('risk')}
Reason: {factor.get('reason')}
"""
        )

    risk_factors_text = "\n".join(
        risk_factors_text
    )

    # --------------------------------------------------
    # HOURLY FORECAST
    # --------------------------------------------------

    timeline = weather.get("timeline", [])

    timeline_text = []

    for hour in timeline:

        timeline_text.append(
            f"""
Time: {hour.get('time')}
Temperature: {hour.get('temp_c')}°C
Condition: {hour.get('condition')}
Rain probability: {hour.get('chance_of_rain')}%
Humidity: {hour.get('humidity')}%
Wind: {hour.get('wind_kph')} km/h
UV index: {hour.get('uv')}
Status: {hour.get('status')}
"""
        )

    forecast_text = "\n".join(timeline_text)

    # --------------------------------------------------
    # WEATHER ALERTS
    # --------------------------------------------------

    alerts = weather.get("alerts", [])

    alert_text = "No active weather alerts."

    if alerts:

        alert_parts = []

        for alert in alerts:

            alert_parts.append(
                f"""
Alert: {alert.get('headline', 'Weather Alert')}
Severity: {alert.get('severity', 'Unknown')}
Description: {alert.get('desc', '')}
"""
            )

        alert_text = "\n".join(alert_parts)

    # --------------------------------------------------
    # AI PROMPT
    # --------------------------------------------------

    prompt = f"""
You are Weather GPT, a practical weather decision assistant.

The user asked:

{question}

RESPONSE LANGUAGE:
{language}

IMPORTANT:
Answer the user in the selected language.
If the selected language is English, answer in English.
If the selected language is Hindi, answer in Hindi.
If the selected language is Bengali, answer in Bengali.
If the selected language is Tamil, answer in Tamil.
If the selected language is Telugu, answer in Telugu.
If the selected language is Marathi, answer in Marathi.
If the selected language is Kannada, answer in Kannada.
If the selected language is Gujarati, answer in Gujarati.
If the selected language is Punjabi, answer in Punjabi.
If the selected language is Malayalam, answer in Malayalam.
If the selected language is Odia, answer in Odia.

LOCATION:
{city}, {country}

CURRENT WEATHER:
Temperature: {temperature}°C
Feels like: {feels_like}°C
Condition: {condition}
Humidity: {humidity}%
Wind: {wind} km/h {wind_direction}
Pressure: {pressure} hPa
Visibility: {visibility} km
UV Index: {uv}

BACKEND DECISION ENGINE:
Best outdoor window: {best_window}

WEATHER RISK ASSESSMENT:

Overall risk level:
{risk_level}

Decision score:
{risk_score} / 100

Recommended action:
{risk_action}

Risk explanation:
{risk_explanation}

Risk factors:
{risk_factors_text}

Official severe weather alert active:
{official_alert}

HOURLY WEATHER:
{forecast_text}

WEATHER ALERTS:
{alert_text}

IMPORTANT RULES:

1. Use ONLY the weather information supplied above.
2. NEVER invent weather values.
3. NEVER invent rain probabilities.
4. NEVER invent temperatures.
5. NEVER invent weather conditions.
6. NEVER create a different best outdoor window.
7. If the question involves the best time for an activity,
   use the backend BEST WINDOW exactly.
8. The BACKEND WEATHER RISK ASSESSMENT is the source of truth
   for the overall weather risk.
9. NEVER calculate or create a competing risk score.
10. If the backend risk level is HIGH or SEVERE,
    clearly consider that when answering activity or travel questions.
11. If an active severe weather alert exists,
    prioritize the official warning over normal recommendations.
12. Do not say an activity is safe when an active severe
    weather warning indicates otherwise.
13. Use the provided risk factors to explain why the
    recommendation was made.
14. Answer the user's actual question directly.
15. Give practical advice.
16. Do not show your reasoning process.
17. Do not mention prompts, APIs, models, or backend systems.
18. Do not give generic weather advice unrelated to the
    supplied weather data.

Keep the answer concise and conversational.

Use this format when appropriate:

DECISION:
<direct answer>

WHY:
<short explanation using actual weather data>

ACTION:
<practical recommendation>
"""

    # --------------------------------------------------
    # OPENROUTER REQUEST
    # --------------------------------------------------

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": MODEL,
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are Weather GPT. "
                    "Give factual, weather-grounded answers. "
                    "Use only the supplied weather data."
                )
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "temperature": 0.1,
        "max_tokens": 700
    }

    response = requests.post(
        OPENROUTER_URL,
        headers=headers,
        json=payload,
        timeout=60
    )

    if response.status_code != 200:

        raise Exception(
            f"OpenRouter error {response.status_code}: "
            f"{response.text}"
        )

    data = response.json()

    return data["choices"][0]["message"]["content"]