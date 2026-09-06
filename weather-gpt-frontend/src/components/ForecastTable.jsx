import WeatherIcon from './WeatherIcon'

export default function ForecastTable({
  unit = 'C',
  forecast = [],
  location = '',
}) {

  if (!forecast.length) {
    return null
  }

  const convertTemp = (celsius) => {
    if (unit === 'C') {
      return Math.round(celsius)
    }

    return Math.round(
      celsius * 9 / 5 + 32
    )
  }

  return (
    <section className="card forecast-table-card">

      <div className="section-title">

        <h2>7-Day Forecast</h2>

        <span
          className="muted"
          style={{ fontSize: 12 }}
        >
          {location}
        </span>

      </div>

      <div className="forecast-scroll">

        <table className="forecast-table">

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

            {forecast.slice(0, 7).map((day, index) => {

              const dayData = day.day || {}

              const condition =
                dayData.condition?.text ||
                'Unknown'

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

              const date = day.date
                ? new Date(
                    `${day.date}T12:00:00`
                  )
                : null

              const dayName = date
                ? date.toLocaleDateString(
                    [],
                    { weekday: 'long' }
                  )
                : `Day ${index + 1}`

              const high =
                dayData.maxtemp_c ?? 0

              const low =
                dayData.mintemp_c ?? 0

              const rain =
                dayData.daily_chance_of_rain ?? 0

              const wind =
                dayData.maxwind_kph ?? 0

              return (
                <tr
                  key={
                    day.date ||
                    `forecast-${index}`
                  }
                >

                  <td>
                    {dayName}
                  </td>

                  <td>
                    <div className="condition-cell">

                      <WeatherIcon
                        type={iconType}
                        size={19}
                      />

                      {condition}

                    </div>
                  </td>

                  <td>
                    {convertTemp(high)}°
                  </td>

                  <td>
                    {convertTemp(low)}°
                  </td>

                  <td>
                    {rain}%
                  </td>

                  <td>
                    {Math.round(wind)} km/h
                  </td>

                </tr>
              )
            })}

          </tbody>

        </table>

      </div>

    </section>
  )
}