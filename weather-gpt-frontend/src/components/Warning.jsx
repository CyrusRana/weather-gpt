import { AlertTriangle } from 'lucide-react'


export default function Warning({ warning }) {

  if (!warning) {
    return null
  }


  // =========================================================
  // REAL WEATHER ALERT DATA
  // =========================================================

  const title =
    warning.headline ||
    warning.event ||
    'Weather Warning'


  const severity =
    warning.severity ||
    warning.level ||
    'Unknown'


  const description =
    warning.desc ||
    warning.description ||
    'Official weather warning is active for this location.'


  const instruction =
    warning.instruction ||
    ''


  // =========================================================
  // SEVERITY
  // =========================================================

  const severityText =
    severity.toString().toUpperCase()


  const isHigh =
    severityText === 'HIGH' ||
    severityText === 'SEVERE' ||
    severityText === 'EXTREME'


  const isModerate =
    severityText === 'MODERATE'


  const badgeClass =
    isHigh
      ? 'high'
      : isModerate
        ? 'moderate'
        : 'watch'


  // =========================================================
  // ACTION
  // =========================================================

  const action =
    instruction ||
    (
      isHigh
        ? 'Follow official weather guidance and avoid unnecessary outdoor activity.'
        : 'Check conditions before planning outdoor activity and follow official guidance.'
    )


  return (

    <section
      className="warning"
      aria-label="Active weather warning"
    >


      {/* =====================================================
          ICON
          ===================================================== */}

      <div className="warning-icon">

        <AlertTriangle
          size={21}
        />

      </div>


      {/* =====================================================
          MAIN CONTENT
          ===================================================== */}

      <div className="warning-main">


        <div className="warning-top">


          <div>


            <div
              className="eyebrow"
              style={{
                color: isHigh
                  ? '#b42318'
                  : '#bd7b08'
              }}
            >

              OFFICIAL WEATHER WARNING

            </div>


            <div className="warning-title">

              {title}

            </div>


            <div className="warning-meta">

              Severity: {severity}

            </div>


          </div>


          {/* =================================================
              SEVERITY BADGE
              ================================================= */}

          <span
            className={`badge ${badgeClass}`}
          >

            {severityText}

          </span>


        </div>


        {/* ===================================================
            DESCRIPTION
            =================================================== */}

        <p
          className="warning-action"
          style={{
            marginTop: 12,
          }}
        >

          <strong>
            Warning:
          </strong>{' '}

          {description}

        </p>


        {/* ===================================================
            ACTION
            =================================================== */}

        <p className="warning-action">

          <strong>
            Action:
          </strong>{' '}

          {action}

        </p>


      </div>

    </section>

  )

}