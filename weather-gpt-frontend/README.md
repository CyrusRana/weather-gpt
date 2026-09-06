# Weather GPT — Frontend

Premium React/Vite frontend for the Weather GPT Smart India Hackathon project.

## Current scope

Frontend only:
- realistic mock weather data
- responsive dashboard
- hourly + 7-day forecast
- Weather Risk Index
- warning-aware demo logic
- AI Assistant mock interaction
- analytics charts
- saved locations + comparison
- settings
- °C / °F conversion

No backend, weather API, API keys, database, authentication or environment variables are required.

## Run

```bash
npm install
npm run dev
```

Open the local URL shown by Vite, normally:

http://localhost:5173/

## Build

```bash
npm run build
```

## Future architecture

React Frontend → FastAPI Backend → Weather Service → Official Meteorological Data → Risk/Decision Engine → AI Model → Weather GPT Response
