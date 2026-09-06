import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'

import { useEffect, useMemo, useState } from 'react'

import {
  Thermometer,
  CloudRain,
  Droplets,
  Wind,
  Gauge,
  Loader2,
} from 'lucide-react'


const API_BASE_URL = 'http://127.0.0.1:8000'


export default function Analytics({ location }) {

  const [range, setRange] = useState('7 Days')

  const [weather, setWeather] = useState(null)

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState('')


  /* =====================================================
     FETCH WEATHER
     ===================================================== */

  useEffect(() => {

    const fetchAnalyticsWeather = async () => {

      try {

        setLoading(true)

        setError('')

        const city =
          location?.city || 'Bengaluru'


        const response = await fetch(
          `${API_BASE_URL}/api/weather?city=${encodeURIComponent(city)}`
        )


        if (!response.ok) {

          throw new Error(
            'Failed to fetch weather data'
          )

        }


        const data =
          await response.json()


        setWeather(data)

      } catch (err) {

        console.error(
          'Analytics weather error:',
          err
        )

        setError(
          'Unable to load live weather analytics.'
        )

      } finally {

        setLoading(false)

      }

    }


    fetchAnalyticsWeather()

  }, [location?.city])


  /* =====================================================
     DAILY FORECAST DATA
     ===================================================== */

  const forecast =
    weather?.forecast || []


  const dailyData = useMemo(() => {

    return forecast.map((day) => {

      const date =
        new Date(day.date)


      return {

        day:
          date.toLocaleDateString(
            'en-IN',
            {
              weekday: 'short',
            }
          ),

        date: day.date,

        maxTemp:
          Number(
            day.maxTempC ?? 0
          ),

        minTemp:
          Number(
            day.minTempC ?? 0
          ),

        rain:
          Number(
            day.chanceOfRain ?? 0
          ),

        humidity:
          Number(
            day.humidity ?? 0
          ),

        wind:
          Number(
            day.windKph ?? 0
          ),

        pressure:
          Number(
            day.pressure ?? 0
          ),

      }

    })

  }, [forecast])


  /* =====================================================
     TODAY HOURLY DATA
     ===================================================== */

  const todayData = useMemo(() => {

    const hours =
      weather?.analyticsHourly || []


    return hours.map((hour) => {

      const date =
        new Date(
          hour.time.replace(
            ' ',
            'T'
          )
        )


      return {

        day:
          date.toLocaleTimeString(
            'en-IN',
            {
              hour: 'numeric',
              hour12: true,
            }
          ),

        date: hour.time,

        maxTemp:
          Number(
            hour.temp_c ?? 0
          ),

        minTemp:
          Number(
            hour.temp_c ?? 0
          ),

        rain:
          Number(
            hour.chance_of_rain ?? 0
          ),

        humidity:
          Number(
            hour.humidity ?? 0
          ),

        wind:
          Number(
            hour.wind_kph ?? 0
          ),

        pressure:
          Number(
            hour.pressure_mb ?? 0
          ),

      }

    })

  }, [weather])


  /* =====================================================
     SELECT DATA BASED ON RANGE
     ===================================================== */

  const chartData = useMemo(() => {

    if (range === 'Today') {

      return todayData

    }


    if (range === '14 Days') {

      return dailyData.slice(
        0,
        14
      )

    }


    return dailyData.slice(
      0,
      7
    )

  }, [
    range,
    todayData,
    dailyData,
  ])


  /* =====================================================
     SUMMARY STATISTICS
     ===================================================== */

  const analytics = useMemo(() => {

    if (!chartData.length) {

      return {

        averageTemperature: '--',

        averageRain: '--',

        averageHumidity: '--',

        maximumWind: '--',

      }

    }


    const averageTemperature =
      chartData.reduce(
        (sum, item) =>
          sum + item.maxTemp,
        0
      ) / chartData.length


    const averageRain =
      chartData.reduce(
        (sum, item) =>
          sum + item.rain,
        0
      ) / chartData.length


    const humidityValues =
      chartData
        .map(
          item => item.humidity
        )
        .filter(
          value => value > 0
        )


    const averageHumidity =
      humidityValues.length
        ? humidityValues.reduce(
            (sum, value) =>
              sum + value,
            0
          ) /
          humidityValues.length
        : null


    const maximumWind =
      Math.max(
        ...chartData.map(
          item => item.wind
        )
      )


    return {

      averageTemperature:
        `${averageTemperature.toFixed(1)}°C`,

      averageRain:
        `${Math.round(averageRain)}%`,

      averageHumidity:
        averageHumidity !== null
          ? `${Math.round(averageHumidity)}%`
          : '--',

      maximumWind:
        `${Math.round(maximumWind)} km/h`,

    }

  }, [chartData])


  /* =====================================================
     PATTERN SUMMARY
     ===================================================== */

  const patternSummary =
    useMemo(() => {

      if (!chartData.length) {

        return {

          title:
            'Weather pattern unavailable',

          description:
            'Live forecast data is currently unavailable for this location.',

        }

      }


      const highestRainDay =
        [...chartData].sort(
          (a, b) =>
            b.rain - a.rain
        )[0]


      const highestWindDay =
        [...chartData].sort(
          (a, b) =>
            b.wind - a.wind
        )[0]


      const hottestDay =
        [...chartData].sort(
          (a, b) =>
            b.maxTemp - a.maxTemp
        )[0]


      const averageRain =
        chartData.reduce(
          (sum, item) =>
            sum + item.rain,
          0
        ) / chartData.length


      let title =
        'A relatively stable weather pattern is expected.'


      if (averageRain >= 60) {

        title =
          'A wetter period is expected across the forecast.'

      } else if (averageRain >= 35) {

        title =
          'Moderate rainfall chances are present across the forecast.'

      } else if (
        hottestDay.maxTemp >= 32
      ) {

        title =
          'Warmer conditions are expected during the forecast.'

      }


      const description =
        `Rain probability peaks at ${Math.round(highestRainDay.rain)}%. ` +
        `The strongest winds reach ${Math.round(highestWindDay.wind)} km/h. ` +
        `The highest temperature reaches ${Math.round(hottestDay.maxTemp)}°C.`


      return {

        title,

        description,

      }

    }, [chartData])


  /* =====================================================
     LOADING
     ===================================================== */

  if (loading) {

    return (

      <div className="page">

        <div
          className="card"
          style={{
            minHeight: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }}
        >

          <Loader2
            size={20}
            className="spin"
          />

          <span>
            Loading live weather analytics...
          </span>

        </div>

      </div>

    )

  }


  /* =====================================================
     ERROR
     ===================================================== */

  if (error) {

    return (

      <div className="page">

        <div className="card">

          <div className="eyebrow">
            WEATHER ANALYTICS
          </div>

          <h1>
            Weather Analytics
          </h1>

          <p className="subtitle">
            {error}
          </p>

        </div>

      </div>

    )

  }


  /* =====================================================
     MAIN PAGE
     ===================================================== */

  return (

    <div className="page">


      {/* PAGE HEADER */}

      <div className="page-heading">

        <div>

          <div className="eyebrow">
            WEATHER ANALYTICS
          </div>

          <h1>
            Weather Analytics
          </h1>

          <p className="subtitle">

            {weather?.city ||
              location?.city ||
              'Bengaluru'}

            {', '}

            {weather?.country ||
              location?.country ||
              'India'}

            {' · '}

            {range === 'Today'
              ? 'Hourly weather analysis'
              : `${range} forecast trends`}

          </p>

        </div>


        {/* RANGE SELECTOR */}

        <div className="segmented">

          {[
            'Today',
            '7 Days',
            '14 Days',
          ].map((item) => (

            <button
              key={item}
              className={
                range === item
                  ? 'active'
                  : ''
              }
              onClick={() =>
                setRange(item)
              }
            >

              {item}

            </button>

          ))}

        </div>

      </div>


      {/* SUMMARY */}

      <div className="summary-grid">

        <Summary
          icon={Thermometer}
          label="Average Temperature"
          value={
            analytics.averageTemperature
          }
          sub={
            range === 'Today'
              ? 'today average'
              : 'forecast average'
          }
        />


        <Summary
          icon={CloudRain}
          label="Rain Probability"
          value={
            analytics.averageRain
          }
          sub={
            range === 'Today'
              ? 'average likelihood today'
              : 'average likelihood'
          }
        />


        <Summary
          icon={Droplets}
          label="Average Humidity"
          value={
            analytics.averageHumidity
          }
          sub={
            range === 'Today'
              ? 'today average'
              : 'forecast average'
          }
        />


        <Summary
          icon={Wind}
          label="Maximum Wind"
          value={
            analytics.maximumWind
          }
          sub={
            range === 'Today'
              ? 'today peak'
              : 'forecast peak'
          }
        />

      </div>


      {/* CHARTS */}

      <div className="grid grid-2">


        <Chart
          title="Temperature Trend"
          data={chartData}
          type="temperature"
          unit="°C"
        />


        <Chart
          title="Rainfall Probability"
          data={chartData}
          type="bar"
          unit="%"
        />


        <Chart
          title="Humidity Levels"
          data={chartData}
          type="humidity"
          unit="%"
        />


        <Chart
          title="Wind Speed"
          data={chartData}
          type="wind"
          unit="km/h"
        />


        {/* PRESSURE */}

        <div
          className="card chart-card"
          style={{
            gridColumn: '1 / -1',
          }}
        >

          <div className="section-title">

            <div>

              <h2>
                Pressure
              </h2>

              <p className="subtitle">

                Atmospheric pressure across the selected period.

              </p>

            </div>

            <Gauge color="#0b9f92" />

          </div>


          <div className="chart-wrap">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <LineChart
                data={chartData}
              >

                <CartesianGrid
                  strokeDasharray="3 5"
                  vertical={false}
                />

                <XAxis
                  dataKey="day"
                />

                <YAxis />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="pressure"
                  stroke="#6e849e"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />

              </LineChart>

            </ResponsiveContainer>

          </div>

        </div>

      </div>


      {/* SUMMARY */}

      <section
        className="card insight"
        style={{
          marginTop: 20,
        }}
      >

        <div className="eyebrow">
          WEATHER PATTERN SUMMARY
        </div>

        <h2
          style={{
            marginTop: 8,
          }}
        >

          {patternSummary.title}

        </h2>

        <p className="subtitle">

          {patternSummary.description}

        </p>

        <div className="demo-note">

          Live forecast-based analytics

        </div>

      </section>

    </div>

  )

}


/* =====================================================
   SUMMARY CARD
   ===================================================== */

function Summary({
  icon: Icon,
  label,
  value,
  sub,
}) {

  return (

    <div className="card summary-card">

      <div className="summary-icon">

        <Icon size={18} />

      </div>

      <div className="summary-label">
        {label}
      </div>

      <div className="summary-value">
        {value}
      </div>

      <div className="summary-sub">
        {sub}
      </div>

    </div>

  )

}


/* =====================================================
   CHART
   ===================================================== */

function Chart({
  title,
  data,
  type,
  unit,
}) {

  return (

    <section className="card chart-card">

      <div className="section-title">

        <h2>
          {title}
        </h2>

        <span
          className="muted"
          style={{
            fontSize: 11,
          }}
        >
          {unit}
        </span>

      </div>


      <div className="chart-wrap">

        <ResponsiveContainer
          width="100%"
          height="100%"
        >

          {type === 'bar' ? (

            <BarChart
              data={data}
            >

              <CartesianGrid
                strokeDasharray="3 5"
                vertical={false}
              />

              <XAxis
                dataKey="day"
              />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="rain"
                fill="#4380e9"
                radius={[
                  5,
                  5,
                  0,
                  0,
                ]}
              />

            </BarChart>

          ) : type === 'temperature' ? (

            <AreaChart
              data={data}
            >

              <CartesianGrid
                strokeDasharray="3 5"
                vertical={false}
              />

              <XAxis
                dataKey="day"
              />

              <YAxis />

              <Tooltip />

              <Area
                type="monotone"
                dataKey="maxTemp"
                stroke="#0b9f92"
                fill="#dff5f1"
                strokeWidth={2}
              />

            </AreaChart>

          ) : (

            <LineChart
              data={data}
            >

              <CartesianGrid
                strokeDasharray="3 5"
                vertical={false}
              />

              <XAxis
                dataKey="day"
              />

              <YAxis />

              <Tooltip />

              <Line
                type="monotone"
                dataKey={
                  type === 'humidity'
                    ? 'humidity'
                    : 'wind'
                }
                stroke="#0b9f92"
                strokeWidth={2.5}
                dot={{ r: 3 }}
              />

            </LineChart>

          )}

        </ResponsiveContainer>

      </div>

    </section>

  )

}