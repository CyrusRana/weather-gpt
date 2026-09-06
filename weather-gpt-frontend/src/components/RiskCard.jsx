import { ShieldCheck, AlertTriangle } from 'lucide-react'


export default function RiskCard({
  weather,
  mode = 'Outdoor Activity',
}) {

  if (!weather) {
    return null
  }


  // =========================================================
  // BACKEND DECISION ENGINE
  // =========================================================

  const risk = weather.risk


  if (!risk) {

    return (
      <section className="card risk-card">

        <div className="risk-head">

          <div>

            <div className="eyebrow">
              WEATHER RISK INDEX
            </div>

            <h2 style={{ marginTop: 6 }}>
              Decision risk
            </h2>

          </div>

          <ShieldCheck
            color="#0b9f92"
            size={22}
          />

        </div>


        <p className="subtitle">
          Risk analysis is currently unavailable.
        </p>

      </section>
    )

  }


  // =========================================================
  // BACKEND VALUES
  // =========================================================

  const riskScore =
    Number(risk.score || 0)

  const riskLevel =
    risk.level || 'LOW'

  const action =
    risk.action ||
    'Conditions are generally suitable for normal outdoor activities.'


  const explanation =
    risk.explanation ||
    ''


  const factors =
    risk.factors || []


  const officialAlert =
    Boolean(risk.officialAlert)


  // =========================================================
  // RISK BAR VALUE
  // =========================================================

  const getRiskValue = (riskName) => {

    if (riskName === 'SEVERE') {
      return 100
    }

    if (riskName === 'HIGH') {
      return 80
    }

    if (riskName === 'MODERATE') {
      return 60
    }

    if (riskName === 'WATCH') {
      return 35
    }

    return 10
  }


  // =========================================================
  // RISK COLOR
  // =========================================================

  const getRiskColor = (level) => {

    if (level === 'SEVERE') {
      return '#dc2626'
    }

    if (level === 'HIGH') {
      return '#ef4444'
    }

    if (level === 'MODERATE') {
      return '#f59e0b'
    }

    if (level === 'WATCH') {
      return '#eab308'
    }

    return '#0b9f92'
  }


  const riskColor =
    getRiskColor(riskLevel)


  return (

    <section className="card risk-card">


      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="risk-head">

        <div>

          <div className="eyebrow">
            WEATHER RISK INDEX
          </div>

          <h2 style={{ marginTop: 6 }}>
            Decision risk
          </h2>

        </div>


        {officialAlert ? (

          <AlertTriangle
            color="#dc2626"
            size={22}
          />

        ) : (

          <ShieldCheck
            color="#0b9f92"
            size={22}
          />

        )}

      </div>


      {/* =====================================================
          OFFICIAL ALERT
          ===================================================== */}

      {officialAlert && (

        <div
          className="primary-concern"
          style={{
            borderColor: '#fecaca',
            background: '#fef2f2',
            color: '#991b1b',
          }}
        >

          <strong>
            OFFICIAL WEATHER WARNING
          </strong>

          Official weather guidance takes
          priority over routine recommendations.

        </div>

      )}


      {/* =====================================================
          SCORE
          ===================================================== */}

      <div className="risk-score-wrap">

        <div
          className="risk-ring"
          style={{
            background: `conic-gradient(
              ${riskColor}
              ${riskScore * 3.6}deg,
              #e8eef2
              ${riskScore * 3.6}deg
            )`,
          }}
        >

          <div className="risk-ring-inner">

            <strong>
              {riskScore}
            </strong>

            <span>
              / 100
            </span>

          </div>

        </div>


        <div className="risk-status">

          <strong
            style={{
              color: riskColor,
            }}
          >
            {riskLevel}
          </strong>

          <span>
            {mode}
          </span>

        </div>

      </div>


      {/* =====================================================
          DECISION
          ===================================================== */}

      <div className="primary-concern">

        <strong>
          RECOMMENDED ACTION
        </strong>

        {action}

      </div>


      {/* =====================================================
          EXPLANATION
          ===================================================== */}

      {explanation && (

        <div
          className="confidence"
          style={{
            display: 'block',
            lineHeight: 1.5,
          }}
        >

          <span>
            Why this assessment?
          </span>

          <p
            className="subtitle"
            style={{
              marginTop: 6,
              marginBottom: 0,
            }}
          >
            {explanation}
          </p>

        </div>

      )}


      {/* =====================================================
          RISK FACTORS
          ===================================================== */}

      <div className="risk-list">

        <div
          className="eyebrow"
          style={{
            marginBottom: 10,
          }}
        >
          RISK FACTORS
        </div>


        {factors.map((factor, index) => {

          const value =
            getRiskValue(factor.risk)


          const factorColor =
            getRiskColor(factor.risk)


          return (

            <div
              key={`${factor.name}-${index}`}
              style={{
                marginBottom: 12,
              }}
            >

              <div className="risk-line-head">

                <span>
                  {factor.name}
                </span>

                <strong
                  style={{
                    color: factorColor,
                  }}
                >
                  {factor.value}
                  {' · '}
                  {factor.risk}
                </strong>

              </div>


              <div className="progress">

                <span
                  style={{
                    width: `${value}%`,
                    background:
                      factorColor,
                  }}
                />

              </div>


              {factor.reason && (

                <div
                  className="subtitle"
                  style={{
                    fontSize: 11,
                    marginTop: 4,
                  }}
                >
                  {factor.reason}
                </div>

              )}

            </div>

          )

        })}

      </div>


      {/* =====================================================
          SCORE INFORMATION
          ===================================================== */}

      <div className="confidence">

        <span>
          Decision Score
        </span>

        <strong
          style={{
            color: riskColor,
          }}
        >
          {riskScore} / 100
        </strong>

      </div>


      {/* =====================================================
          DATA SOURCE
          ===================================================== */}

      <div className="demo-note">

        ⓘ Calculated by the Weather GPT Decision Engine
        using live weather conditions, forecast signals
        and official weather alerts.

      </div>

    </section>

  )
}