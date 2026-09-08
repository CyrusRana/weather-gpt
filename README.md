# 🌦️ WeatherGPT

## AI-Powered Weather Decision Intelligence

WeatherGPT is an AI-powered weather intelligence platform designed to transform raw weather data into simple, actionable insights.

Instead of only displaying weather information, WeatherGPT helps users understand weather conditions and make better decisions for travel, outdoor activities, farming, and other weather-dependent tasks.

---

## 🎯 Problem Statement

Weather information is often presented as raw data such as temperature, rainfall, humidity, and wind speed.

For many users, understanding this information and deciding what action to take can be difficult.

WeatherGPT addresses this problem by combining:

- Real-time weather data
- Weather forecasting
- Location comparison
- AI-powered conversations
- Weather-based decision support

---

## 💡 Our Solution

WeatherGPT provides a user-friendly platform where users can:

- Check current weather conditions
- View upcoming forecasts
- Compare multiple locations
- Ask questions through an AI assistant
- Receive weather-based recommendations
- Analyze important weather parameters

The goal is to convert **weather data → meaningful insights → better decisions**.

---

## ✨ Key Features

### 🌤️ Real-Time Weather
Get current weather information including:

- Temperature
- Weather conditions
- Humidity
- Rain probability
- Wind speed

### 📅 7-Day Forecast
View upcoming weather conditions and understand the expected trend for the next seven days.

### 🤖 AI Weather Assistant
Users can ask natural-language questions such as:

> "Can I go for a bike ride this evening?"

> "Will it rain tomorrow?"

> "What should I wear today?"

The AI assistant provides weather-based responses to help users make decisions.

### 📍 Location Management
Save multiple cities and quickly access their weather conditions.

### 🔄 City Comparison
Compare weather conditions across multiple locations using parameters such as:

- Temperature
- Humidity
- Rain probability
- Weather condition

### 📊 Weather Analytics
Visualize weather trends and important forecast signals to make the information easier to understand.

### 💡 Decision Support
WeatherGPT can categorize conditions into simple decision indicators such as:

- **Favourable**
- **Watch**
- **Avoid**

This makes weather information easier to act upon.

---

## 🏗️ System Architecture

```text
                    ┌───────────────────┐
                    │       User        │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │   WeatherGPT UI   │
                    │   React + Vite    │
                    └─────────┬─────────┘
                              │
                 ┌────────────┴────────────┐
                 ▼                         ▼
       ┌───────────────────┐     ┌───────────────────┐
       │  Weather APIs     │     │   FastAPI Backend  │
       │ WeatherAPI /      │     │      Python        │
       │ Visual Crossing   │     └─────────┬─────────┘
       └─────────┬─────────┘               │
                 │                         ▼
                 │               ┌───────────────────┐
                 │               │   AI Processing   │
                 │               │    OpenRouter      │
                 │               └─────────┬─────────┘
                 │                         │
                 └────────────┬────────────┘
                              ▼
                    ┌───────────────────┐
                    │ Weather Insights  │
                    │ & Recommendations │
                    └───────────────────┘
