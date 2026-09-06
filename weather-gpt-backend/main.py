from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from weather_service import get_weather
from ai_service import generate_day_plan, answer_weather_question


app = FastAPI(
    title="Weather GPT API",
    description="Backend API for Weather GPT",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================================
# WEATHER QUESTION REQUEST
# ==========================================================

class WeatherQuestion(BaseModel):
    city: str
    question: str
    language: str = "English"


# ==========================================================
# ROOT
# ==========================================================

@app.get("/")
def root():
    return {
        "message": "Weather GPT backend is running"
    }


# ==========================================================
# WEATHER
# Existing endpoint - DO NOT CHANGE
# ==========================================================

@app.get("/api/weather")
def weather(city: str = "Bengaluru"):
    try:
        return get_weather(city)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ==========================================================
# PLAN MY DAY
# Existing endpoint - DO NOT CHANGE
# ==========================================================

@app.get("/api/plan-day")
def plan_day(city: str = "Bengaluru"):
    try:
        weather = get_weather(city)

        plan = generate_day_plan(weather)

        return {
            "city": weather["city"],
            "plan": plan
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ==========================================================
# AI WEATHER QUESTION
# ==========================================================

@app.post("/api/ask")
def ask_weather_question(request: WeatherQuestion):
    try:

        weather = get_weather(request.city)

        answer = answer_weather_question(
            weather,
            request.question,
            request.language
        )

        return {
            "city": weather["city"],
            "question": request.question,
            "language": request.language,
            "answer": answer
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )