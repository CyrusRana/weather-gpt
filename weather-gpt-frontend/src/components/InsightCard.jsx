import { useMemo, useState } from 'react'
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

  // ==================================================
  // CURRENT LIVE WEATHER
  // ==================================================

  const temperature = Number(
    weather?.temperatureC ?? 0
  )

  const humidity = Number(
    weather?.humidity ?? 0
  )

  const wind = Number(
    weather?.wind ?? 0
  )

  const uv = Number(
    weather?.uv ?? 0
  )

  const visibility = Number(
    weather?.visibility ?? 0
  )

  // ==================================================
  // BACKEND TIMELINE
  // ==================================================
  // weather_service.py already creates this timeline
  // using real WeatherAPI hourly data.

  const timeline = Array.isArray(weather?.timeline)
    ? weather.timeline
    : []

  // ==================================================
  // REAL RAIN PROBABILITY
  // ==================================================

  const rainValues = timeline.map(
    item =>
      Number(
        item?.chance_of_rain ?? 0
      )
  )

  const maxRain = rainValues.length
    ? Math.max(...rainValues)
    : 0

  // ==================================================
  // OTHER FORECAST SIGNALS
  // ==================================================

  const forecastTemperatures = timeline.map(
    item =>
      Number(
        item?.temp_c ?? 0
      )
  )

  const forecastWinds = timeline.map(
    item =>
      Number(
        item?.wind_kph ?? 0
      )
  )

  const forecastHumidity = timeline.map(
    item =>
      Number(
        item?.humidity ?? 0
      )
  )

  const forecastUV = timeline.map(
    item =>
      Number(
        item?.uv ?? 0
      )
  )

  const maxTemperature =
    forecastTemperatures.length
      ? Math.max(...forecastTemperatures)
      : temperature

  const maxWind =
    forecastWinds.length
      ? Math.max(...forecastWinds)
      : wind

  const maxHumidity =
    forecastHumidity.length
      ? Math.max(...forecastHumidity)
      : humidity

  const maxUV =
    forecastUV.length
      ? Math.max(...forecastUV)
      : uv

  // ==================================================
  // BACKEND RISK ENGINE RESULT
  // ==================================================

  const backendRisk = weather?.risk

  const riskLevel =
    backendRisk?.level || 'LOW'

  const riskScore =
    Number(backendRisk?.score ?? 0)

  // ==================================================
  // BEST WINDOW
  // ==================================================

  const bestWindow =
    weather?.best_window ||
    'No suitable window'

  // ==================================================
  // FIND RAIN PERIOD
  // ==================================================

  const highestRainHour = timeline.find(
    item =>
      Number(
        item?.chance_of_rain ?? 0
      ) === maxRain
  )

  let rainTime = ''

  if (highestRainHour?.time) {
    try {
      rainTime = new Date(
        highestRainHour.time
      ).toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
      })
    } catch {
      rainTime = ''
    }
  }

  // ==================================================
  // THUNDERSTORM
  // ==================================================

  const thunderstorm = timeline.some(
    item => {
      const condition =
        typeof item?.condition === 'object'
          ? item?.condition?.text || ''
          : item?.condition || ''

      return (
        condition
          .toLowerCase()
          .includes('thunder')
      )
    }
  )

  // ==================================================
  // MODE-SPECIFIC DECISION
  // ==================================================

  const decision = useMemo(() => {

    let message = ''
    let recommendation = ''

    // ----------------------------------------------
    // OUTDOOR ACTIVITY
    // ----------------------------------------------

    if (mode === 'Outdoor Activity') {

      if (
        riskLevel === 'SEVERE' ||
        riskLevel === 'HIGH' ||
        thunderstorm ||
        maxRain >= 70
      ) {

        message =
          `Outdoor activity has elevated weather risk today. Rain probability can reach ${Math.round(maxRain)}%${rainTime ? ` around ${rainTime}` : ''}.`

        recommendation =
          `Avoid exposed outdoor activity during the higher-risk period. Use the better window: ${bestWindow}.`

      } else if (
        riskLevel === 'MODERATE' ||
        maxRain >= 40 ||
        maxTemperature >= 33 ||
        maxUV >= 8
      ) {

        message =
          `Outdoor activity is possible, but some weather conditions may reduce comfort or safety.`

        recommendation =
          `Prefer the better weather window (${bestWindow}) and avoid peak heat, UV or rainfall periods.`

      } else {

        message =
          `Conditions look generally favourable for outdoor activity, with maximum rain probability of ${Math.round(maxRain)}%.`

        recommendation =
          `Outdoor activity is generally suitable. The best available window is ${bestWindow}.`
      }
    }

    // ----------------------------------------------
    // TRAVEL
    // ----------------------------------------------

    else if (mode === 'Travel') {

      if (
        riskLevel === 'SEVERE' ||
        maxRain >= 80 ||
        maxWind >= 40 ||
        visibility > 0 && visibility < 2
      ) {

        message =
          `Travel conditions may become difficult because of elevated weather risk. Rain probability can reach ${Math.round(maxRain)}%.`

        recommendation =
          `Consider delaying non-essential travel during the higher-risk period and monitor weather conditions.`

      } else if (
        riskLevel === 'MODERATE' ||
        maxRain >= 40 ||
        maxWind >= 30 ||
        visibility > 0 && visibility < 5
      ) {

        message =
          `Travel is possible, but some forecast conditions may affect comfort or travel time.`

        recommendation =
          `Keep travel timing flexible and consider the better weather window: ${bestWindow}.`

      } else {

        message =
          `Travel conditions look generally manageable, with maximum forecast rain probability of ${Math.round(maxRain)}%.`

        recommendation =
          `Travel is generally favourable. Continue monitoring the forecast before longer journeys.`
      }
    }

    // ----------------------------------------------
    // DAILY LIFE
    // ----------------------------------------------

    else if (mode === 'Daily Life') {

      if (
        riskLevel === 'SEVERE' ||
        riskLevel === 'HIGH' ||
        maxRain >= 70
      ) {

        message =
          `Your daily routine may be affected because rain probability can reach ${Math.round(maxRain)}%.`

        recommendation =
          `Keep outdoor errands flexible and carry an umbrella or rain protection.`

      } else if (
        riskLevel === 'MODERATE' ||
        maxRain >= 40 ||
        maxTemperature >= 35 ||
        maxWind >= 30
      ) {

        message =
          `Your routine is manageable, but some periods may be less comfortable because of weather conditions.`

        recommendation =
          `Plan outdoor errands around the better weather window: ${bestWindow}.`

      } else {

        message =
          `Your routine looks generally manageable, with no major weather disruption indicated by the current forecast.`

        recommendation =
          `Normal daily activities are generally suitable today.`
      }
    }

    // ----------------------------------------------
    // AGRICULTURE
    // ----------------------------------------------

    else if (mode === 'Agriculture') {

      if (
        riskLevel === 'SEVERE' ||
        riskLevel === 'HIGH' ||
        maxRain >= 70
      ) {

        message =
          `Agricultural operations need caution because rain probability can reach ${Math.round(maxRain)}%.`

        recommendation =
          `Avoid spraying during the high-rain period and reassess field operations after conditions improve.`

      } else if (
        riskLevel === 'MODERATE' ||
        maxRain >= 40 ||
        maxHumidity >= 80 ||
        maxWind >= 25
      ) {

        message =
          `Agricultural activity may require timing adjustments because rainfall, humidity or wind conditions are elevated.`

        recommendation =
          `Check the rainfall window before spraying and schedule field work during calmer periods.`

      } else {

        message =
          `Weather conditions appear relatively favourable for routine agricultural activity, with maximum rain probability of ${Math.round(maxRain)}%.`

        recommendation =
          `Routine field activity is generally suitable, subject to crop-specific conditions.`
      }
    }

    return {
      message,
      recommendation,
    }

  }, [
    mode,
    riskLevel,
    maxRain,
    maxTemperature,
    maxWind,
    maxHumidity,
    maxUV,
    thunderstorm,
    rainTime,
    bestWindow,
    visibility,
  ])

  // ==================================================
  // SIGNALS
  // ==================================================

  const signals = [
    [
      'Rain probability',
      `${Math.round(maxRain)}%`,
    ],

    [
      'Temperature',
      `${Math.round(temperature)}°C`,
    ],

    [
      'Wind',
      `${Math.round(wind)} km/h`,
    ],

    [
      'Risk',
      riskLevel,
    ],
  ]

  // ==================================================
  // UI
  // ==================================================

  return (
    <section className="card insight">

      {/* HEADER */}

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

      {/* INSIGHT */}

      <div className="insight-grid">

        <div>

          <div className="insight-message">
            {decision.message}
          </div>

          {/* SIGNALS */}

          <div className="signal-row">

            {signals.map(
              ([label, value]) => (

                <div
                  className="signal"
                  key={label}
                >
                  {label}:{' '}

                  <strong>
                    {value}
                  </strong>
                </div>

              )
            )}

          </div>

          {/* ACTION CHIPS */}

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

          {/* DECISION */}

          <div
            className="demo-note"
            style={{ marginTop: 12 }}
          >
            <strong>
              {mode}:
            </strong>{' '}
            {decision.recommendation}
          </div>

          {/* BEST WINDOW */}

          <div
            className="demo-note"
            style={{ marginTop: 8 }}
          >
            ⓘ Best weather window:{' '}
            <strong>
              {bestWindow}
            </strong>
          </div>

        </div>

        {/* WHY */}

        <div className="why">

          <button
            onClick={() =>
              setOpen(
                previous => !previous
              )
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

              The recommendation uses
              real forecast signals from
              the backend decision engine.

              {' '}

              Current conditions:

              {' '}

              <strong>
                {Math.round(temperature)}°C
              </strong>
              {' · '}

              <strong>
                {Math.round(humidity)}% humidity
              </strong>
              {' · '}

              <strong>
                {Math.round(wind)} km/h wind
              </strong>
              {' · '}

              <strong>
                UV {Math.round(uv)}
              </strong>

              .

              {' '}

              The forecast reaches a maximum
              rain probability of:

              {' '}

              <strong>
                {Math.round(maxRain)}%
              </strong>

              .

              {' '}

              The backend risk engine currently
              evaluates the overall weather as:

              {' '}

              <strong>
                {riskLevel}
              </strong>

              {' '}

              with a risk score of:

              {' '}

              <strong>
                {riskScore}/100
              </strong>

              .

              {' '}

              The selected planning mode is:

              {' '}

              <strong>
                {mode}
              </strong>

              .

            </p>

          )}

        </div>

      </div>

    </section>
  )
}