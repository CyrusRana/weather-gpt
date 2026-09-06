import { useEffect, useState } from 'react'
import {
  CalendarDays,
  CloudRain,
  Wind,
  Thermometer,
  Droplets,
  AlertTriangle,
} from 'lucide-react'

import { getWeather } from '../lib/api'


export default function Forecast({
  unit = 'C',
  location,
}) {
  const city = location?.city || 'Bengaluru'

  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [chartMetric, setChartMetric] = useState('temperature')


  // =========================================================
  // LOAD LIVE WEATHER
  // =========================================================

  useEffect(() => {

    async function loadWeather() {

      try {

        setLoading(true)
        setError('')

        const data = await getWeather(city)

        setWeather(data)

      } catch (err) {

        console.error(err)

        setError(
          'Unable to load live forecast data.'
        )

      } finally {

        setLoading(false)

      }
    }

    loadWeather()

  }, [city])


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (
      <div className="page">

        <section
          className="card"
          style={{ padding: 40 }}
        >

          <h2>
            Loading forecast...
          </h2>

          <p className="subtitle">
            Getting the latest forecast information.
          </p>

        </section>

      </div>
    )
  }


  // =========================================================
  // ERROR
  // =========================================================

  if (error || !weather) {

    return (
      <div className="page">

        <section
          className="card"
          style={{ padding: 40 }}
        >

          <h2>
            Forecast unavailable
          </h2>

          <p className="subtitle">
            {error || 'Unable to load forecast data.'}
          </p>

        </section>

      </div>
    )
  }


  // =========================================================
  // DATA
  // =========================================================

  const hourly =
    weather.hourly || []

  const forecast =
    weather.forecast || []

  const alerts =
    weather.alerts || []


  // =========================================================
  // TODAY'S HOURLY DATA
  // =========================================================

  const hourlyData = hourly.map(
    (hour) => {

      const tempC =
        Number(hour.temp_c || 0)

      const temp =
        unit === 'F'
          ? Math.round(
              (tempC * 9) / 5 + 32
            )
          : Math.round(tempC)

      return {
        time: formatTime(hour.time),
        temp,
        rain: Number(
          hour.chance_of_rain || 0
        ),
        wind: Math.round(
          Number(hour.wind_kph || 0)
        ),
        condition:
          hour.condition?.text ||
          'Unknown',
      }
    }
  )


  // =========================================================
  // CHART VALUES
  // =========================================================

  const chartValues =
  hourlyData.map((item) => {

    if (
      chartMetric ===
      'temperature'
    ) {
      return item.temp
    }

    if (
      chartMetric ===
      'rain'
    ) {
      return item.rain
    }

    return item.wind
  })


  const chartMax =
    Math.max(
      ...chartValues,
      1
    )


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <section
        className="card"
        style={{
          padding: 28,
          marginBottom: 20,
        }}
      >

        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            alignItems: 'center',
            gap: 20,
            flexWrap: 'wrap',
          }}
        >

          <div>

            <div className="eyebrow">
              WEATHER FORECAST
            </div>

            <h1
              style={{
                margin: '5px 0 6px',
              }}
            >
              Weather Forecast
            </h1>

            <p className="subtitle">
              Hourly and 7-day weather
              outlook for {weather.city},
              {' '}
              {weather.country}.
            </p>

          </div>


          <div
            className="hero-chip"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >

            <CalendarDays size={16} />

            <strong>
              {weather.city},
              {' '}
              {weather.country}
            </strong>

          </div>

        </div>

      </section>


      {/* =====================================================
          ALERT
      ===================================================== */}

      {alerts.length > 0 && (

        <section
          className="card"
          style={{
            padding: 18,
            marginBottom: 20,
            borderLeft:
              '4px solid #e7a23b',
          }}
        >

          <div
            style={{
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start',
            }}
          >

            <AlertTriangle
              size={20}
            />

            <div>

              <strong>
                Active Weather Alert
              </strong>

              <p
                className="subtitle"
                style={{
                  marginTop: 5,
                }}
              >
                {alerts[0]?.headline ||
                  alerts[0]?.event ||
                  'Weather alert is active for this location.'}
              </p>

            </div>

          </div>

        </section>

      )}


      {/* =====================================================
          TODAY SUMMARY
      ===================================================== */}

      <section
        className="card"
        style={{
          padding: 27,
          marginBottom: 20,
        }}
      >

        <div className="section-title">

          <div>

            <div className="eyebrow">
              TODAY
            </div>

            <h2>
              Today's Forecast
            </h2>

            <p className="subtitle">
              Live hourly forecast from
              {weather.city}.
            </p>

          </div>

        </div>


        <div
          style={{
            display: 'flex',
            gap: 12,
            overflowX: 'auto',
            paddingBottom: 8,
          }}
        >

          {hourlyData.map(
            (hour, index) => (

              <div
                key={`${hour.time}-${index}`}
                style={{
                  minWidth: 125,
                  padding: 16,
                  border:
                    '1px solid var(--border)',
                  borderRadius: 15,
                  background: '#fff',
                }}
              >

                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: '#71879f',
                  }}
                >
                  {hour.time}
                </div>


                <div
                  style={{
                    fontSize: 25,
                    fontWeight: 800,
                    color: 'var(--navy)',
                    margin:
                      '10px 0 4px',
                  }}
                >
                  {hour.temp}°{unit}
                </div>


                <div
                  style={{
                    fontSize: 11,
                    color: '#71879f',
                    minHeight: 32,
                  }}
                >
                  {hour.condition}
                </div>


                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    marginTop: 10,
                    color: 'var(--teal)',
                    fontSize: 11,
                    fontWeight: 800,
                  }}
                >

                  <CloudRain size={14} />

                  {hour.rain}% rain

                </div>


                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    marginTop: 7,
                    color: '#71879f',
                    fontSize: 11,
                  }}
                >

                  <Wind size={13} />

                  {hour.wind} km/h

                </div>

              </div>

            )
          )}

        </div>

      </section>


      {/* =====================================================
          CHART
      ===================================================== */}

      <section
        className="card"
        style={{
          padding: 27,
          marginBottom: 20,
        }}
      >

        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            alignItems: 'center',
            gap: 15,
            flexWrap: 'wrap',
            marginBottom: 20,
          }}
        >

          <div>

            <div className="eyebrow">
              FORECAST SIGNALS
            </div>

            <h2>
              Hourly Trend
            </h2>

          </div>


          <div className="chart-tabs">

            <button
              className={
                chartMetric ===
                'temperature'
                  ? 'active'
                  : ''
              }
              onClick={() =>
                setChartMetric(
                  'temperature'
                )
              }
            >
              Temperature
            </button>

            <button
              className={
                chartMetric === 'rain'
                  ? 'active'
                  : ''
              }
              onClick={() =>
                setChartMetric('rain')
              }
            >
              Rain Probability
            </button>

            <button
              className={
                chartMetric === 'wind'
                  ? 'active'
                  : ''
              }
              onClick={() =>
                setChartMetric('wind')
              }
            >
              Wind
            </button>

          </div>

        </div>


        <div
          style={{
            height: 250,
            display: 'flex',
            alignItems: 'flex-end',
            gap: 10,
            overflowX: 'auto',
            padding:
              '10px 5px 25px',
          }}
        >

          {hourlyData.map(
            (item, index) => {

              const value =
                chartValues[index]

              const height =
                Math.max(
                  8,
                  (value / chartMax) *
                    180
                )

              return (

                <div
                  key={`${item.time}-chart`}
                  style={{
                    minWidth: 58,
                    height: 220,
                    display: 'flex',
                    flexDirection:
                      'column',
                    justifyContent:
                      'flex-end',
                    alignItems: 'center',
                    gap: 7,
                  }}
                >

                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color:
                        'var(--navy)',
                    }}
                  >
                    {value}
                    {chartMetric ===
                      'temperature'
                      ? `°${unit}`
                      : chartMetric ===
                        'rain'
                      ? '%'
                      : ' km/h'}
                  </span>


                  <div
                    title={`${item.time}: ${value}`}
                    style={{
                      width: 30,
                      height,
                      borderRadius:
                        '7px 7px 3px 3px',
                      background:
                        'var(--teal)',
                      opacity: 0.85,
                    }}
                  />


                  <span
                    style={{
                      fontSize: 10,
                      color:
                        '#71879f',
                      whiteSpace:
                        'nowrap',
                    }}
                  >
                    {item.time}
                  </span>

                </div>

              )
            }
          )}

        </div>

      </section>


      {/* =====================================================
          7 DAY FORECAST
      ===================================================== */}

      <section
        className="card forecast-table-card"
      >

        <div
          className="section-title"
        >

          <div>

            <div className="eyebrow">
              WEEK AHEAD
            </div>

            <h2>
              7-Day Forecast
            </h2>

            <p className="subtitle">
              Daily forecast outlook for
              {weather.city}.
            </p>

          </div>

        </div>


        <div className="forecast-scroll">

          <table
            className="forecast-table"
          >

            <thead>

              <tr>

                <th>DAY</th>

                <th>CONDITION</th>

                <th>HIGH</th>

                <th>LOW</th>

                <th>RAIN</th>

                <th>WIND</th>

              </tr>

            </thead>


            <tbody>

              
              {forecast.slice(0, 7).map(
  (day, index) => {

                  const highC =
                    Number(
                      day.day?.maxtemp_c ||
                        0
                    )

                  const lowC =
                    Number(
                      day.day?.mintemp_c ||
                        0
                    )

                  const high =
                    unit === 'F'
                      ? Math.round(
                          (highC * 9) /
                            5 +
                            32
                        )
                      : Math.round(
                          highC
                        )

                  const low =
                    unit === 'F'
                      ? Math.round(
                          (lowC * 9) /
                            5 +
                            32
                        )
                      : Math.round(
                          lowC
                        )

                  const condition =
                    day.day
                      ?.condition
                      ?.text ||
                    'Unknown'

                  const rain =
                    day.day
                      ?.daily_chance_of_rain ??
                    0

                  const wind =
                    Math.round(
                      Number(
                        day.day
                          ?.maxwind_kph ||
                          0
                      )
                    )

                  return (

                    <tr
                      key={
                        day.date ||
                        index
                      }
                    >

                      <td>

                        {formatDay(
                          day.date,
                          index
                        )}

                      </td>


                      <td>

                        <div
                          className="condition-cell"
                        >

                          <span>
                            {getConditionIcon(
                              condition
                            )}
                          </span>

                          {condition}

                        </div>

                      </td>


                      <td>

                        {high}°{unit}

                      </td>


                      <td>

                        {low}°{unit}

                      </td>


                      <td>

                        <span
                          style={{
                            color:
                              Number(
                                rain
                              ) >= 40
                                ? '#d97706'
                                : 'var(--teal)',
                            fontWeight: 800,
                          }}
                        >
                          {rain}%
                        </span>

                      </td>


                      <td>

                        {wind} km/h

                      </td>

                    </tr>

                  )
                }
              )}

            </tbody>

          </table>

        </div>

      </section>


      {/* =====================================================
          FORECAST NOTE
      ===================================================== */}

      <div
        className="demo-note"
        style={{
          marginTop: 14,
          marginBottom: 30,
        }}
      >

        <Thermometer
          size={13}
          style={{
            display: 'inline',
            marginRight: 5,
            verticalAlign:
              'middle',
          }}
        />

        Forecast values are based on
        live weather service data.

      </div>

    </div>
  )
}


// ===========================================================
// HELPERS
// ===========================================================

function formatTime(value) {

  if (!value) {
    return '--'
  }

  const parts =
    value.split(' ')

  if (parts.length < 2) {
    return value
  }

  const time =
    parts[1]

  const [hour, minute] =
    time.split(':')

  let h =
    Number(hour)

  const suffix =
    h >= 12
      ? 'PM'
      : 'AM'

  h =
    h % 12 || 12

  return `${h}:${minute} ${suffix}`
}


function formatDay(
  dateString,
  index
) {

  if (!dateString) {
    return `Day ${index + 1}`
  }

  const date =
    new Date(
      `${dateString}T00:00:00`
    )

  if (Number.isNaN(
    date.getTime()
  )) {
    return dateString
  }

  if (index === 0) {
    return 'Today'
  }

  return date.toLocaleDateString(
    'en-IN',
    {
      weekday: 'long',
    }
  )
}


function getConditionIcon(
  condition
) {

  const value =
    condition.toLowerCase()

  if (
    value.includes('rain') ||
    value.includes('drizzle')
  ) {
    return '🌧'
  }

  if (
    value.includes('thunder')
  ) {
    return '⛈'
  }

  if (
    value.includes('clear') ||
    value.includes('sun')
  ) {
    return '☀'
  }

  if (
    value.includes('fog')
  ) {
    return '🌫'
  }

  return '☁'
}