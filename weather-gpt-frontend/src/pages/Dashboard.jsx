import { useEffect, useState } from 'react'

import {
  Droplets,
  Wind,
  Sun,
  Eye,
  Gauge,
  Sunrise,
  Sunset,
  Home,
  Plane,
  TreePine,
  Sprout,
  MapPin,
  ChevronDown,
} from 'lucide-react'

import { getDayPlan } from '../lib/api'

import Warning from '../components/Warning'
import RiskCard from '../components/RiskCard'
import InsightCard from '../components/InsightCard'
import Hourly from '../components/Hourly'
import ForecastTable from '../components/ForecastTable'
import PlanTimeline from '../components/PlanTimeline'
import WeatherIcon from '../components/WeatherIcon'


const locationOptions = [
  'Bengaluru',
  'New Delhi',
  'Mumbai',
  'Chennai',
  'Hyderabad',
]


const modes = [
  [
    'Daily Life',
    'How will today’s weather affect my routine?',
    Home,
  ],
  [
    'Travel',
    'Should I travel today?',
    Plane,
  ],
  [
    'Outdoor Activity',
    'Is it safe to go outside?',
    TreePine,
  ],
  [
    'Agriculture',
    'Should I irrigate or spray today?',
    Sprout,
  ],
]


export default function Dashboard({
  unit = 'C',
  location,
  setLocation,
  weather,
}) {

  const [mode, setMode] = useState('Outdoor Activity')

  const [locationOpen, setLocationOpen] = useState(false)

  const [aiPlan, setAiPlan] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')

  // Live browser clock
  const [currentTime, setCurrentTime] = useState(
    new Date()
  )


  const city = location?.city || 'Bengaluru'


  // ---------------------------------------------------------
  // AI WEATHER PLAN
  // ---------------------------------------------------------

  useEffect(() => {

    async function loadAiPlan() {

      if (!city) return

      setAiLoading(true)
      setAiError('')

      try {

        const data = await getDayPlan(city)

        if (data?.plan) {
          setAiPlan(data.plan)
        }

      } catch (err) {

        console.error('AI plan error:', err)

        // Keep previous AI plan instead of deleting it
        setAiError('AI plan is temporarily unavailable.')

      } finally {

        setAiLoading(false)

      }
    }

    loadAiPlan()

  }, [city])


  // ---------------------------------------------------------
  // LIVE LOCAL CLOCK
  // ---------------------------------------------------------

  useEffect(() => {

    const timer = setInterval(() => {

      setCurrentTime(
        new Date()
      )

    }, 1000)

    return () => {
      clearInterval(timer)
    }

  }, [])


  // ---------------------------------------------------------
  // LOCATION CHANGE
  // ---------------------------------------------------------

  const handleLocationChange = (cityName) => {

    setLocation({
      city: cityName,
      country: 'India',
    })

    setLocationOpen(false)
  }


  // ---------------------------------------------------------
  // INITIAL LOADING
  // ---------------------------------------------------------

  if (!weather) {

    return (
      <div className="page">

        <section
          className="card"
          style={{ padding: 40 }}
        >

          <h2>
            Loading weather...
          </h2>

          <p className="subtitle">
            Getting the latest weather information.
          </p>

        </section>

      </div>
    )
  }


  // ---------------------------------------------------------
  // WEATHER DATA
  // ---------------------------------------------------------

  const firstDay = weather.forecast?.[0]


  // ---------------------------------------------------------
  // FORMAT API TIMES
  // ---------------------------------------------------------

  const formatTime = (value) => {

    if (!value) {
      return '--'
    }

    try {

      const date = new Date(value)

      if (Number.isNaN(date.getTime())) {
        return value
      }

      return date.toLocaleTimeString(
        'en-IN',
        {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }
      )

    } catch {

      return value

    }
  }


  // ---------------------------------------------------------
  // SUNRISE / SUNSET
  // ---------------------------------------------------------

  const sunrise = formatTime(
    firstDay?.astro?.sunrise
  )

  const sunset = formatTime(
    firstDay?.astro?.sunset
  )


  // ---------------------------------------------------------
  // LIVE CURRENT TIME
  // ---------------------------------------------------------

  const localTime =
    currentTime.toLocaleTimeString(
      'en-IN',
      {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }
    )


  // ---------------------------------------------------------
  // WEATHER ICON
  // ---------------------------------------------------------

  const conditionLower =
    (weather.condition || '').toLowerCase()


  let weatherType = 'cloud'


  if (
    conditionLower.includes('rain') ||
    conditionLower.includes('drizzle')
  ) {

    weatherType = 'rain'

  } else if (
    conditionLower.includes('sun') ||
    conditionLower.includes('clear')
  ) {

    weatherType = 'sun'

  }


  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------

  return (
    <div className="page">


      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="hero">

        <div className="hero-copy">

          <div className="eyebrow">
            WEATHER INTELLIGENCE
          </div>

          <h1>
            Don't just know the weather.
            <br />
            Know what to do about it.
          </h1>

          <p className="subtitle">
            Real-time weather intelligence, AI explanations
            and personalized recommendations.
          </p>

        </div>


        <div className="hero-side">


          {/* LOCATION SELECTOR */}

          <div className="location-selector">

            <button
              className="hero-chip location-button"
              type="button"
              onClick={() =>
                setLocationOpen(
                  (previous) => !previous
                )
              }
            >

              <MapPin size={15} />

              <span>
                Location
              </span>

              <strong>
                {weather.city}
              </strong>

              <ChevronDown
                size={15}
                className={
                  locationOpen
                    ? 'rotate-180'
                    : ''
                }
              />

            </button>


            {locationOpen && (

              <div className="location-menu">

                <div className="location-menu-title">
                  SELECT LOCATION
                </div>


                {locationOptions.map(
                  (cityName) => (

                    <button
                      key={cityName}
                      type="button"
                      className={`location-option ${
                        city === cityName
                          ? 'selected'
                          : ''
                      }`}
                      onClick={() =>
                        handleLocationChange(
                          cityName
                        )
                      }
                    >

                      <MapPin size={16} />

                      <span>
                        {cityName}, India
                      </span>

                    </button>

                  )
                )}

              </div>

            )}

          </div>


          {/* LOCAL TIME */}

          <div className="hero-chip">

            <span>
              Local time
            </span>

            <strong>
              {localTime}
            </strong>

          </div>

        </div>

      </section>



      {/* =====================================================
          WARNING
      ===================================================== */}

      <Warning
        warning={weather.alerts?.[0]}
      />


      {/* =====================================================
          CURRENT WEATHER + RISK
      ===================================================== */}

      <div className="dashboard-top">


        {/* CURRENT WEATHER */}

        <section className="card current-card">

          <div className="current-top">

            <div>

              <div className="eyebrow">
                CURRENT CONDITIONS
              </div>

              <div className="current-location">
                {weather.city}, {weather.country}
              </div>


              <div className="temp-row">

                <div>

                  <div className="temperature">

                    {unit === 'C'
                      ? Math.round(
                          weather.temperatureC
                        )
                      : Math.round(
                          weather.temperatureF
                        )}

                    °{unit}

                  </div>


                  <div className="condition">

                    {weather.condition}

                    {' · Feels like '}

                    {unit === 'C'
                      ? Math.round(
                          weather.feelsLikeC
                        )
                      : Math.round(
                          weather.feelsLikeF
                        )}

                    °{unit}

                  </div>

                </div>

              </div>

            </div>


            <div className="weather-icon">

              <WeatherIcon
                type={weatherType}
                size={38}
              />

            </div>

          </div>



          {/* METRICS */}

          <div className="metrics-grid">

            <Metric
              icon={Droplets}
              label="Humidity"
              value={`${weather.humidity}%`}
            />

            <Metric
              icon={Wind}
              label="Wind"
              value={`${weather.wind} km/h ${weather.windDirection}`}
            />

            <Metric
              icon={Sun}
              label="UV Index"
              value={weather.uv}
            />

            <Metric
              icon={Eye}
              label="Visibility"
              value={`${weather.visibility} km`}
            />

            <Metric
              icon={Gauge}
              label="Pressure"
              value={`${weather.pressure} hPa`}
            />

            <Metric
              icon={Sunrise}
              label="Sunrise"
              value={sunrise}
            />

            <Metric
              icon={Sunset}
              label="Sunset"
              value={sunset}
            />

          </div>


          <div
            className="demo-note"
            style={{ marginTop: 14 }}
          >
            Last updated: {formatTime(weather.lastUpdated)}
          </div>

        </section>



        {/* RISK */}

        <RiskCard
          weather={weather}
          mode={mode}
        />

      </div>



      {/* =====================================================
          AI INSIGHT
      ===================================================== */}

      <InsightCard
        mode={mode}
        setMode={setMode}
        weather={weather}
      />



      {/* =====================================================
          PLANNING MODE
      ===================================================== */}

      <section className="card planning">

        <div className="section-title">

          <div>

            <h2>
              What are you planning?
            </h2>

            <p className="subtitle">
              Get recommendations based on what
              you actually want to do.
            </p>

          </div>

        </div>


        <div className="mode-grid">

          {modes.map(
            ([name, text, Icon]) => (

              <button
                key={name}
                type="button"
                className={`mode-card ${
                  mode === name
                    ? 'selected'
                    : ''
                }`}
                onClick={() =>
                  setMode(name)
                }
              >

                <div className="mode-icon">
                  <Icon size={20} />
                </div>

                <h3>
                  {name.toUpperCase()}
                </h3>

                <p>
                  {text}
                </p>

                <div className="mode-link">
                  Get guidance →
                </div>

              </button>

            )
          )}

        </div>

      </section>



      {/* =====================================================
          HOURLY
      ===================================================== */}

      <Hourly
        unit={unit}
        forecast={weather.hourly}
      />



      {/* =====================================================
          WEEKLY
      ===================================================== */}

      <ForecastTable
        unit={unit}
        forecast={weather.forecast}
        location={`${weather.city}, ${weather.country}`}
      />



      {/* =====================================================
          PLAN MY DAY
      ===================================================== */}

      <PlanTimeline
        timeline={weather.timeline}
        mode={mode}
        aiPlan={aiPlan}
        aiLoading={aiLoading}
        aiError={aiError}
      />

    </div>
  )
}



// =============================================================
// METRIC COMPONENT
// =============================================================

function Metric({
  icon: Icon,
  label,
  value,
}) {

  return (

    <div className="metric">

      <div className="metric-label">

        <Icon
          className="metric-icon"
          size={14}
        />

        {label}

      </div>


      <div className="metric-value">
        {value}
      </div>

    </div>

  )
}