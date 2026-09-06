const API_BASE_URL = 'https://weather-gpt-zrn2.onrender.com'


// ==========================================================
// GET WEATHER
// Used by Dashboard / Forecast
// ==========================================================

export async function getWeather(city) {
  const response = await fetch(
    `${API_BASE_URL}/api/weather?city=${encodeURIComponent(city)}`
  )

  if (!response.ok) {
    throw new Error('Failed to fetch weather data')
  }

  return response.json()
}


// ==========================================================
// GET AI DAY PLAN
// Used by Dashboard
// ==========================================================

export async function getDayPlan(city) {
  const response = await fetch(
    `${API_BASE_URL}/api/plan-day?city=${encodeURIComponent(city)}`
  )

  if (!response.ok) {
    throw new Error('Failed to fetch AI day plan')
  }

  return response.json()
}


// ==========================================================
// GET WEATHER BY CURRENT COORDINATES
// ==========================================================

export async function getWeatherByCoordinates(latitude, longitude) {
  const location = `${latitude},${longitude}`

  const response = await fetch(
    `${API_BASE_URL}/api/weather?city=${encodeURIComponent(location)}`
  )

  if (!response.ok) {
    throw new Error('Failed to fetch weather for current location')
  }

  return response.json()
}


// ==========================================================
// GET AI DAY PLAN BY CURRENT COORDINATES
// ==========================================================

export async function getDayPlanByCoordinates(latitude, longitude) {
  const location = `${latitude},${longitude}`

  const response = await fetch(
    `${API_BASE_URL}/api/plan-day?city=${encodeURIComponent(location)}`
  )

  if (!response.ok) {
    throw new Error('Failed to generate AI plan for current location')
  }

  return response.json()
}


// ==========================================================
// ASK WEATHER GPT
// ==========================================================

export async function askWeatherQuestion(
  city,
  question,
  language = 'English'
) {

  const response = await fetch(
    `${API_BASE_URL}/api/ask`,
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        city: city,
        question: question,
        language: language,
      }),
    }
  )


  if (!response.ok) {

    const errorText = await response.text()

    throw new Error(
      errorText || 'Failed to get Weather GPT answer'
    )

  }


  return response.json()
}