import WeatherIcon from './WeatherIcon'
import { displayTemp } from '../lib/weatherUtils'

export default function Hourly({ unit = 'C', forecast = [] }) {

  // WeatherAPI returns hourly data as objects
  const hours = forecast.slice(0, 8)

  if (!hours.length) {
    return null
  }

  return (
    <section className="card hourly">

      <div className="section-title">
        <h2>Today's Forecast</h2>
        <span
          className="muted"
          style={{ fontSize: 12 }}
        >
          Hourly outlook
        </span>
      </div>

      <div className="hourly-row">

        {hours.map((hour, index) => {

          const rain = hour.chance_of_rain ?? 0

          const condition =
            hour.condition?.text || 'Unknown'

          const conditionLower =
            condition.toLowerCase()

          let iconType = 'cloud'

          if (conditionLower.includes('rain')) {
            iconType = 'rain'
          } else if (
            conditionLower.includes('sun') ||
            conditionLower.includes('clear')
          ) {
            iconType = 'sun'
          } else if (
            conditionLower.includes('thunder')
          ) {
            iconType = 'storm'
          }

          const time = hour.time
            ? new Date(hour.time).toLocaleTimeString(
                [],
                {
                  hour: 'numeric',
                  minute: '2-digit',
                }
              )
            : `Hour ${index + 1}`

          return (
            <div
              className={`hour-card ${
                index === 0 ? 'active' : ''
              }`}
              key={hour.time_epoch || `${time}-${index}`}
            >

              <div className="hour-time">
                {time}
              </div>

              <WeatherIcon
                type={iconType}
                size={28}
              />

              <div className="hour-temp">
                {displayTemp(
                  hour.temp_c ?? 0,
                  unit
                )}
              </div>

              <div className="hour-condition">
                {condition}
              </div>

              <div className="rain">
                {rain}% rain
              </div>

            </div>
          )
        })}

      </div>

    </section>
  )
}