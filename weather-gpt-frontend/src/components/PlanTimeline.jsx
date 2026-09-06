import {
  Check,
  Eye,
  TriangleAlert,
  CircleX,
  Sun,
  Umbrella,
  Wind,
} from 'lucide-react'


const icons = {
  good: Check,
  watch: Eye,
  caution: TriangleAlert,
  avoid: CircleX,
}


export default function PlanTimeline({
  timeline = [],
  mode = 'Outdoor Activity',
  aiPlan = '',
  aiLoading = false,
  aiError = '',
}) {

  if (!timeline.length) {
    return (
      <section className="card timeline-card">

        <div className="section-title">

          <div>

            <div className="eyebrow">
              WEATHER-AWARE PLANNING
            </div>

            <h2>
              Plan My Day
            </h2>

            <p className="subtitle">
              No future forecast information is available.
            </p>

          </div>

        </div>

      </section>
    )
  }


  // =========================================================
  // NORMALIZE DATA
  // =========================================================

  const items = timeline
    .slice(0, 12)
    .map((hour, index) => {

      const rain =
        Number(hour.chance_of_rain || 0)

      const temperature =
        Number(hour.temp_c || 0)

      const wind =
        Number(hour.wind_kph || 0)

      const humidity =
        Number(hour.humidity || 0)

      const uv =
        Number(hour.uv || 0)

      const condition =
        hour.condition?.text ||
        hour.condition ||
        ''


      const dateObject = hour.time
        ? new Date(hour.time)
        : null


      const time =
        dateObject
          ? dateObject.toLocaleTimeString(
              [],
              {
                hour: 'numeric',
                minute: '2-digit',
              }
            )
          : `Hour ${index + 1}`


      // 24-hour value used for daylight/activity filtering
      const hourOfDay =
        dateObject
          ? dateObject.getHours()
          : null


      let type = 'good'

      let status = 'FAVOURABLE'

      let text =
        'Good conditions for outdoor activities and routine plans.'


      // =======================================================
      // THUNDERSTORM
      // =======================================================

      if (
        condition
          .toLowerCase()
          .includes('thunder')
      ) {

        type = 'avoid'
        status = 'AVOID'

        text =
          'Thunderstorm risk. Avoid exposed outdoor areas.'
      }


      // =======================================================
      // HEAVY RAIN
      // =======================================================

      else if (rain >= 70) {

        type = 'avoid'
        status = 'AVOID'

        text =
          `High rain probability (${Math.round(rain)}%). Move outdoor plans indoors if possible.`
      }


      // =======================================================
      // MODERATE RAIN
      // =======================================================

      else if (rain >= 40) {

        type = 'caution'
        status = 'CAUTION'

        text =
          `Rain probability is ${Math.round(rain)}%. Keep an umbrella or rain protection available.`
      }


      // =======================================================
      // EXTREME HEAT
      // =======================================================

      else if (temperature >= 35) {

        type = 'avoid'
        status = 'AVOID'

        text =
          `Very high temperature (${Math.round(temperature)}°C). Avoid prolonged outdoor exposure.`
      }


      // =======================================================
      // HIGH HEAT
      // =======================================================

      else if (temperature >= 32) {

        type = 'watch'
        status = 'WATCH'

        text =
          `Temperature is ${Math.round(temperature)}°C. Stay hydrated and limit prolonged outdoor activity.`
      }


      // =======================================================
      // STRONG WIND
      // =======================================================

      else if (wind >= 30) {

        type = 'watch'
        status = 'WATCH'

        text =
          `Wind speed is ${Math.round(wind)} km/h. Be cautious with outdoor activities.`
      }


      // =======================================================
      // HIGH UV
      // =======================================================

      else if (uv >= 8) {

        type = 'watch'
        status = 'WATCH'

        text =
          `UV index is ${Math.round(uv)}. Use sun protection and avoid prolonged midday exposure.`
      }


      // =======================================================
      // HIGH HUMIDITY
      // =======================================================

      else if (
        humidity >= 80 &&
        temperature >= 28
      ) {

        type = 'watch'
        status = 'WATCH'

        text =
          `High humidity (${Math.round(humidity)}%). Outdoor activity may feel uncomfortable.`
      }


      return {
        time,
        timeOfDay: hourOfDay,
        text,
        status,
        type,
        rain,
        temperature,
        wind,
        humidity,
        uv,
      }
    })


  // =========================================================
  // FIND BEST DAYLIGHT / ACTIVITY WINDOW
  // =========================================================

  /*
    We only consider reasonable outdoor hours:

    6 AM → 9 PM

    This prevents the application from recommending
    midnight / 1 AM / 2 AM as the best outdoor window.
  */

  const activityItems = items.filter(
    item =>
      item.timeOfDay === null ||
      (
        item.timeOfDay >= 6 &&
        item.timeOfDay <= 21
      )
  )


  let bestWindow = []

  let currentWindow = []


  for (const item of activityItems) {

    if (item.type === 'good') {

      currentWindow.push(item)

    } else {

      if (
        currentWindow.length >
        bestWindow.length
      ) {

        bestWindow = [
          ...currentWindow,
        ]
      }

      currentWindow = []
    }
  }


  // Check final window

  if (
    currentWindow.length >
    bestWindow.length
  ) {

    bestWindow = [
      ...currentWindow,
    ]
  }


  // =========================================================
  // FALLBACK
  // =========================================================

  /*
    If there is no completely GOOD window,
    choose the lowest-risk activity period.

    This prevents "No clear window" when every hour
    is marked WATCH because of heat/UV.
  */

  if (!bestWindow.length && activityItems.length) {

    const sorted = [
      ...activityItems,
    ].sort((a, b) => {

      const scoreA =
        a.rain +
        a.wind +
        Math.max(0, a.temperature - 28) * 3 +
        a.uv * 2

      const scoreB =
        b.rain +
        b.wind +
        Math.max(0, b.temperature - 28) * 3 +
        b.uv * 2

      return scoreA - scoreB
    })


    bestWindow = [
      sorted[0],
    ]
  }


  // =========================================================
  // FORMAT BEST WINDOW
  // =========================================================

  let bestWindowText =
    'No suitable window'


  if (bestWindow.length === 1) {

    bestWindowText =
      bestWindow[0].time

  } else if (bestWindow.length >= 2) {

    bestWindowText =
      `${bestWindow[0].time} – ${
        bestWindow[
          bestWindow.length - 1
        ].time
      }`
  }


  // =========================================================
  // MAX VALUES
  // =========================================================

  const maxRain =
    Math.max(
      ...items.map(
        item => item.rain
      )
    )


  const maxWind =
    Math.max(
      ...items.map(
        item => item.wind
      )
    )


  // =========================================================
  // MODE-SPECIFIC SUMMARY
  // =========================================================

  let summary = ''


  if (mode === 'Travel') {

    summary =
      `Plan travel during ${bestWindowText} where conditions are most favourable. Avoid periods with high rain, wind or storm risk.`

  } else if (mode === 'Agriculture') {

    summary =
      `Schedule field work during ${bestWindowText}. Avoid spraying when rain probability is high.`

  } else if (mode === 'Daily Life') {

    summary =
      `Use ${bestWindowText} for outdoor errands and keep flexible plans during higher-risk periods.`

  } else {

    summary =
      `The best outdoor window is ${bestWindowText}. Avoid periods with significant rain, heat or storm risk.`
  }


  // =========================================================
  // UI
  // =========================================================

  return (
    <section className="card timeline-card">


      {/* HEADER */}

      <div className="section-title">

        <div>

          <div className="eyebrow">
            WEATHER-AWARE PLANNING
          </div>

          <h2>
            Plan My Day
          </h2>

          <p className="subtitle">
            {summary}
          </p>

        </div>


        <div className="badge good">

          BEST WINDOW · {bestWindowText}

        </div>

      </div>


      {/* QUICK SUMMARY */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(3, 1fr)',
          gap: 12,
          marginBottom: 24,
        }}
      >

        <div className="signal">

          <Sun size={16} />

          <span>

            Best window

            <strong>
              {bestWindowText}
            </strong>

          </span>

        </div>


        <div className="signal">

          <Umbrella size={16} />

          <span>

            Maximum rain

            <strong>
              {Math.round(maxRain)}%
            </strong>

          </span>

        </div>


        <div className="signal">

          <Wind size={16} />

          <span>

            Maximum wind

            <strong>
              {Math.round(maxWind)} km/h
            </strong>

          </span>

        </div>

      </div>


      {/* AI WEATHER DECISION */}

      {(aiLoading || aiPlan || aiError) && (

        <div
          className="ai-plan"
          style={{
            marginBottom: 24,
            padding: 18,
            borderRadius: 14,
            border:
              '1px solid rgba(15, 23, 42, 0.08)',
            background: '#f8fafc',
          }}
        >

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 10,
            }}
          >

            <div className="eyebrow">
              AI WEATHER DECISION
            </div>

            {!aiLoading && (
              <span className="badge good">
                LIVE
              </span>
            )}

          </div>


          {aiLoading && (

            <p className="subtitle">
              Analyzing live weather conditions...
            </p>

          )}


          {aiError && !aiLoading && (

            <p className="subtitle">
              {aiError}
            </p>

          )}


          {aiPlan && !aiLoading && (
  <div
    className="ai-plan-text"
    style={{
      whiteSpace: 'pre-line',
      lineHeight: 1.7,
      fontSize: 14,
    }}
  >
    {aiPlan
      .replace(/^#{1,6}\s?/gm, '')
      .replace(/^\s*---+\s*$/gm, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .trim()}
  </div>
)}

        </div>

      )}


      {/* TIMELINE */}

      <div className="timeline">

        {items.map(
          (item, index) => {

            const Icon =
              icons[item.type] ||
              Check


            return (

              <div
                className="timeline-item"
                key={`${item.time}-${index}`}
              >

                {/* ICON */}

                <div
                  className={`timeline-dot ${item.type}`}
                >

                  <Icon size={14} />

                </div>


                {/* TIME */}

                <div className="timeline-time">

                  {item.time}

                </div>


                {/* RECOMMENDATION */}

                <div className="timeline-text">

                  <strong>
                    {item.text}
                  </strong>

                  <span>

                    {Math.round(
                      item.temperature
                    )}°C

                    {' · '}

                    {Math.round(
                      item.rain
                    )}% rain

                    {' · '}

                    {Math.round(
                      item.wind
                    )} km/h wind

                  </span>

                </div>


                {/* STATUS */}

                <span
                  className={`badge ${item.type}`}
                >

                  {item.status}

                </span>

              </div>

            )
          }
        )}

      </div>


      {/* FOOTER */}

      <div className="demo-note">

        ⓘ Plan generated from live hourly weather forecast data.

      </div>

    </section>
  )
}