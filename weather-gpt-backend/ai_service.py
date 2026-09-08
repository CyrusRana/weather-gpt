import os
import requests

from dotenv import load_dotenv


# ==========================================================
# ENVIRONMENT
# ==========================================================

load_dotenv()

OPENROUTER_API_KEY = os.getenv(
    "OPENROUTER_API_KEY"
)

OPENROUTER_URL = (
    "https://openrouter.ai/api/v1/chat/completions"
)

MODEL = "openrouter/free"


# ==========================================================
# COMMON HELPERS
# ==========================================================

def get_risk_context(weather):

    risk = weather.get(
        "risk",
        {}
    )

    risk_level = risk.get(
        "level",
        "LOW"
    )

    risk_score = risk.get(
        "score",
        0
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

    return {
        "risk_level": risk_level,
        "risk_score": risk_score,
        "risk_action": risk_action,
        "risk_explanation": risk_explanation,
        "risk_factors_text": risk_factors_text,
        "official_alert": official_alert,
    }


def build_timeline_text(weather):

    timeline = weather.get(
        "timeline",
        []
    )

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

    return "\n".join(
        timeline_text
    )


def build_alert_text(weather):

    alerts = weather.get(
        "alerts",
        []
    )

    alert_text = (
        "No active weather alerts."
    )

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

        alert_text = "\n".join(
            alert_parts
        )

    return alert_text


def call_openrouter(
    prompt,
    max_tokens=1000
):

    if not OPENROUTER_API_KEY:

        raise Exception(
            "OPENROUTER_API_KEY is missing in .env"
        )

    headers = {
        "Authorization": (
            f"Bearer {OPENROUTER_API_KEY}"
        ),
        "Content-Type": "application/json",
    }

    payload = {

        "model": MODEL,

        "messages": [

            {
                "role": "system",
                "content": (
                    "You are Weather GPT. "
                    "Give factual, weather-grounded "
                    "recommendations using only the "
                    "supplied live weather data."
                )
            },

            {
                "role": "user",
                "content": prompt
            }

        ],

        "temperature": 0.1,

        "max_tokens": max_tokens,
    }

    response = requests.post(
        OPENROUTER_URL,
        headers=headers,
        json=payload,
        timeout=60
    )

    print(
        "========== OPENROUTER DEBUG =========="
    )

    print(
        "Status Code:",
        response.status_code
    )

    print(
        "Response:",
        response.text
    )

    print(
        "======================================"
    )

    if response.status_code != 200:

        raise Exception(
            f"OpenRouter error "
            f"{response.status_code}: "
            f"{response.text}"
        )

    data = response.json()

    if (
        "choices" not in data
        or not data["choices"]
    ):

        raise Exception(
            f"OpenRouter returned no choices: "
            f"{data}"
        )

    return data[
        "choices"
    ][0][
        "message"
    ][
        "content"
    ]


# ==========================================================
# DASHBOARD - PLAN MY DAY
# ==========================================================

def generate_day_plan(weather):

    if not OPENROUTER_API_KEY:

        raise Exception(
            "OPENROUTER_API_KEY is missing in .env"
        )


    # --------------------------------------------------
    # REAL WEATHER DATA FROM BACKEND
    #
    # Visual Crossing data has already been fetched
    # and normalized by weather_service.py.
    # --------------------------------------------------

    city = weather.get(
        "city",
        "Unknown"
    )

    country = weather.get(
        "country",
        ""
    )

    weather_source = weather.get(
        "weatherSource",
        "Visual Crossing"
    )

    temperature = weather.get(
        "temperatureC"
    )

    feels_like = weather.get(
        "feelsLikeC"
    )

    condition = weather.get(
        "condition",
        "Unknown"
    )

    humidity = weather.get(
        "humidity"
    )

    wind = weather.get(
        "wind"
    )

    wind_direction = weather.get(
        "windDirection",
        "Unknown"
    )

    uv = weather.get(
        "uv"
    )

    pressure = weather.get(
        "pressure"
    )

    visibility = weather.get(
        "visibility"
    )


    # --------------------------------------------------
    # BACKEND DECISION ENGINE
    # --------------------------------------------------

    best_window = weather.get(
        "best_window",
        "No suitable outdoor window found."
    )


    # --------------------------------------------------
    # WEATHER RISK
    # --------------------------------------------------

    risk_context = get_risk_context(
        weather
    )

    risk_level = risk_context[
        "risk_level"
    ]

    risk_score = risk_context[
        "risk_score"
    ]

    risk_action = risk_context[
        "risk_action"
    ]

    risk_explanation = risk_context[
        "risk_explanation"
    ]

    risk_factors_text = risk_context[
        "risk_factors_text"
    ]

    official_alert = risk_context[
        "official_alert"
    ]


    # --------------------------------------------------
    # HOURLY LIVE FORECAST
    # --------------------------------------------------

    forecast_text = build_timeline_text(
        weather
    )


    # --------------------------------------------------
    # WEATHER ALERTS
    # --------------------------------------------------

    alert_text = build_alert_text(
        weather
    )


    # --------------------------------------------------
    # AI PROMPT
    # --------------------------------------------------

    prompt = f"""
You are Weather GPT, a practical weather
decision assistant.

You are given REAL weather data retrieved
from the Visual Crossing weather service
through the Weather GPT backend.

Your job is to explain what the weather
means and give practical, actionable advice.

IMPORTANT:

1. Use ONLY the weather data supplied below.
2. NEVER invent weather values.
3. NEVER invent a different best outdoor window.
4. NEVER change the provided BEST WINDOW.
5. The BEST WINDOW was calculated by the
   backend decision engine from live hourly data.
6. The backend WEATHER RISK is the source
   of truth for the overall weather risk.
7. NEVER calculate a competing risk score.
8. Explain the backend decision using the
   supplied weather conditions.
9. Respect active weather alerts.
10. If an active severe alert exists, prioritize
    the alert over normal recommendations.
11. Do not claim conditions are safe when the
    supplied risk or alert indicates otherwise.
12. Recommendations must be based on the actual
    hourly weather data.
13. Do not use generic pre-written weather
    statements.
14. Do not mention that you are an AI model.
15. Do not mention prompts or API implementation.
16. Do not invent information that is not supplied.

WEATHER SOURCE:
{weather_source}

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
UV: {uv}

BACKEND DECISION ENGINE:

BEST WINDOW:
{best_window}

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
Identify the actual hours that should be avoided
based on rain, high temperature, high UV, strong
wind, storms or alerts.

PLAN:
Give a practical recommendation based on the
actual weather and the selected best window.

WHY:
Briefly explain which actual weather conditions
support the recommendation.

IMPORTANT:
Do not create or calculate a different BEST WINDOW.
Do not create a different risk score.
"""


    # --------------------------------------------------
    # OPENROUTER REQUEST
    # --------------------------------------------------

    return call_openrouter(
        prompt,
        max_tokens=1000
    )


# ==========================================================
# AI ASSISTANT - ANSWER USER WEATHER QUESTIONS
# ==========================================================

def answer_weather_question(
    weather,
    question,
    language="English"
):

    if not OPENROUTER_API_KEY:

        raise Exception(
            "OPENROUTER_API_KEY is missing in .env"
        )


    # --------------------------------------------------
    # CURRENT WEATHER
    # --------------------------------------------------

    city = weather.get(
        "city",
        "Unknown"
    )

    country = weather.get(
        "country",
        ""
    )

    weather_source = weather.get(
        "weatherSource",
        "Visual Crossing"
    )

    temperature = weather.get(
        "temperatureC"
    )

    feels_like = weather.get(
        "feelsLikeC"
    )

    condition = weather.get(
        "condition",
        "Unknown"
    )

    humidity = weather.get(
        "humidity"
    )

    wind = weather.get(
        "wind"
    )

    wind_direction = weather.get(
        "windDirection"
    )

    pressure = weather.get(
        "pressure"
    )

    visibility = weather.get(
        "visibility"
    )

    uv = weather.get(
        "uv"
    )


    # --------------------------------------------------
    # BACKEND DECISION ENGINE
    # --------------------------------------------------

    best_window = weather.get(
        "best_window",
        "No suitable outdoor window found."
    )


    # --------------------------------------------------
    # WEATHER RISK
    # --------------------------------------------------

    risk_context = get_risk_context(
        weather
    )

    risk_level = risk_context[
        "risk_level"
    ]

    risk_score = risk_context[
        "risk_score"
    ]

    risk_action = risk_context[
        "risk_action"
    ]

    risk_explanation = risk_context[
        "risk_explanation"
    ]

    risk_factors_text = risk_context[
        "risk_factors_text"
    ]

    official_alert = risk_context[
        "official_alert"
    ]


    # --------------------------------------------------
    # HOURLY FORECAST
    # --------------------------------------------------

    forecast_text = build_timeline_text(
        weather
    )


    # --------------------------------------------------
    # WEATHER ALERTS
    # --------------------------------------------------

    alert_text = build_alert_text(
        weather
    )


    # --------------------------------------------------
    # AI PROMPT
    # --------------------------------------------------

    prompt = f"""
You are Weather GPT, a practical weather
decision assistant.

The user asked:

{question}

RESPONSE LANGUAGE:
{language}

Answer the user in the selected language.

Supported response languages include:
English, Hindi, Bengali, Tamil, Telugu, Marathi,
Kannada, Gujarati, Punjabi, Malayalam and Odia.

IMPORTANT:

1. Use ONLY the weather information supplied below.
2. NEVER invent weather values.
3. NEVER invent rain probabilities.
4. NEVER invent temperatures.
5. NEVER invent weather conditions.
6. NEVER create a different best outdoor window.
7. If the question involves the best time for
   an activity, use the backend BEST WINDOW exactly.
8. The BACKEND WEATHER RISK ASSESSMENT is the
   source of truth for overall weather risk.
9. NEVER calculate or create a competing risk score.
10. If the backend risk level is HIGH or SEVERE,
    clearly consider that when answering activity
    or travel questions.
11. If an active severe weather alert exists,
    prioritize the official warning.
12. Do not say an activity is safe when the supplied
    risk or severe weather warning indicates otherwise.
13. Use the provided risk factors to explain the
    recommendation.
14. Answer the user's actual question directly.
15. Give practical advice.
16. Do not show your reasoning process.
17. Do not mention prompts, APIs, models or backend
    implementation.
18. Do not give generic weather advice unrelated
    to the supplied weather data.

WEATHER SOURCE:
{weather_source}

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

Best outdoor window:
{best_window}

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

Use the supplied Visual Crossing weather data
and backend decision results to answer the user.

Keep the answer concise and conversational.

When appropriate, use:

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

    return call_openrouter(
        prompt,
        max_tokens=700
    )