import { useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react'

export default function InsightCard({
  mode = 'Outdoor Activity',
  setMode,
  weather,
}) {
  const [open, setOpen] = useState(false)

  // --------------------------------------------------
  // LIVE WEATHER VALUES
  // --------------------------------------------------

  const temperature = Number(weather?.temperatureC ?? 0)
  const humidity = Number(weather?.humidity ?? 0)
  const wind = Number(weather?.wind ?? 0)
  const uv = Number(weather?.uv ?? 0)

  // Today's forecast
  const today =
    weather?.forecast?.[0]

  const todayHours =
    today?.hour || []

  // Find highest rain probability today
  const rainValues = todayHours.map(
    hour => Number(hour.chance_of_rain ?? 0)
  )

  const maxRain =
    rainValues.length
      ? Math.max(...rainValues)
      : 0

  // Find best outdoor window
  const goodHours = todayHours.filter(hour => {
    const rain = Number(hour.chance_of_rain ?? 0)
    const temp = Number(hour.temp_c ?? 0)
    const windSpeed = Number(hour.wind_kph ?? 0)

    return (
      rain < 30 &&
      temp < 33 &&
      windSpeed < 25
    )
  })

  let bestWindow = 'No clear window'

  if (goodHours.length >= 2) {
    const first =
      new Date(goodHours[0].time)
        .toLocaleTimeString([], {
          hour: 'numeric',
        })

    const last =
      new Date(
        goodHours[goodHours.length - 1].time
      ).toLocaleTimeString([], {
        hour: 'numeric',
      })

    bestWindow = `${first}–${last}`
  } else if (goodHours.length === 1) {
    bestWindow =
      new Date(goodHours[0].time)
        .toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit',
        })
  }

  // --------------------------------------------------
  // RISK
  // --------------------------------------------------

  let risk = 'Low'

  if (
    maxRain >= 70 ||
    wind >= 35 ||
    temperature >= 38 ||
    uv >= 9
  ) {
    risk = 'High'
  } else if (
    maxRain >= 40 ||
    wind >= 25 ||
    temperature >= 33 ||
    uv >= 6
  ) {
    risk = 'Moderate'
  }

  // --------------------------------------------------
  // MODE-SPECIFIC RECOMMENDATION
  // --------------------------------------------------

  let message = ''

  if (mode === 'Outdoor Activity') {

    if (maxRain >= 70) {
      message =
        'Outdoor activity is not recommended during the wetter periods today. Consider using the clearer part of the day instead.'
    } else if (temperature >= 33) {
      message =
        'Outdoor activity is possible, but heat may become uncomfortable. Prefer the cooler part of the day and stay hydrated.'
    } else if (maxRain >= 40) {
      message =
        'Outdoor activity is possible, but rain may interrupt your plans. Keep a rain layer available and use the better weather window.'
    } else {
      message =
        'Conditions look generally favourable for outdoor activity today. Weather risk remains relatively manageable.'
    }

  } else if (mode === 'Travel') {

    if (maxRain >= 70) {
      message =
        'Travel may become difficult during periods of heavier rain. Plan important travel around the better weather window.'
    } else if (wind >= 30) {
      message =
        'Travel is possible, but stronger winds may affect conditions. Allow some extra travel time and monitor updates.'
    } else {
      message =
        'Travel conditions look generally manageable today. Continue checking the forecast before longer journeys.'
    }

  } else if (mode === 'Daily Life') {

    if (maxRain >= 70) {
      message =
        'Your routine is manageable, but rain may affect outdoor activities later today. Carry an umbrella or rain layer.'
    } else if (temperature >= 33) {
      message =
        'Your routine looks manageable, although warmer conditions may make outdoor activities uncomfortable around the hotter hours.'
    } else {
      message =
        'Your routine looks manageable today, with no major weather-related disruption expected from the current signals.'
    }

  } else if (mode === 'Agriculture') {

    if (maxRain >= 60) {
      message =
        'Rain probability is elevated, so spraying may be less suitable. Review rainfall conditions before applying treatments.'
    } else if (humidity >= 80) {
      message =
        'High humidity may affect agricultural operations. Consider local crop conditions and review the forecast before spraying.'
    } else {
      message =
        'Current weather conditions appear reasonably suitable for routine agricultural activity, subject to crop-specific conditions.'
    }
  }

  // --------------------------------------------------
  // SIGNALS
  // --------------------------------------------------

  const signals = [
    ['Rain probability', `${maxRain}%`],
    ['Temperature', `${Math.round(temperature)}°C`],
    ['Wind', `${Math.round(wind)} km/h`],
    ['Risk', risk],
  ]

  return (
    <section className="card insight">

      <div className="section-title">

        <div>

          <div className="eyebrow">
            WEATHER GPT INSIGHT
          </div>

          <h2 style={{ marginTop: 7 }}>
            From weather signals to a decision
          </h2>

        </div>

        <Sparkles color="#0b9f92" />

      </div>

      <div className="insight-grid">

        <div>

          <div className="insight-message">
            {message}
          </div>

          <div className="signal-row">

            {signals.map(([label, value]) => (

              <div
                className="signal"
                key={label}
              >
                {label}:{' '}
                <strong>
                  {value}
                </strong>
              </div>

            ))}

          </div>

          <div className="chips">

            <span className="chip">
              Clothing
            </span>

            <span className="chip">
              Umbrella
            </span>

            <span className="chip">
              Travel
            </span>

            <span className="chip">
              Outdoor Activity
            </span>

          </div>

          <div className="demo-note">
            ⓘ Based on live weather forecast signals
          </div>

        </div>

        <div className="why">

          <button
            onClick={() =>
              setOpen(previous => !previous)
            }
          >

            Why this recommendation?

            {open ? (
              <ChevronUp size={17} />
            ) : (
              <ChevronDown size={17} />
            )}

          </button>

          {open && (

            <p>

              This recommendation uses the
              current temperature, humidity,
              wind, UV index and today's
              forecast rainfall probability.

              {' '}

              The system evaluates these
              signals against the selected
              planning mode:

              {' '}

              <strong>
                {mode}
              </strong>

              {' '}

              and converts the weather
              conditions into an actionable
              recommendation.

            </p>

          )}

        </div>

      </div>

    </section>
  )
}