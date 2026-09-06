import { useEffect, useState } from 'react'
import {
  Settings as SettingsIcon,
  MapPin,
  Bell,
  Mic,
  Palette,
  Globe2,
} from 'lucide-react'

export default function Settings({ unit, setUnit }) {

  // ---------------------------------------------------------
  // LOAD SAVED SETTINGS
  // ---------------------------------------------------------

  const [lang, setLang] = useState(() => {
    return localStorage.getItem('weather-gpt-language') || 'English'
  })

  const [dark, setDark] = useState(() => {
    return localStorage.getItem('weather-gpt-theme') === 'dark'
  })

  const [alerts, setAlerts] = useState(() => {
    return localStorage.getItem('weather-gpt-alerts') !== 'false'
  })

  const [summary, setSummary] = useState(() => {
    return localStorage.getItem('weather-gpt-summary') !== 'false'
  })

  const [voice, setVoice] = useState(() => {
    return localStorage.getItem('weather-gpt-voice') !== 'false'
  })


  // ---------------------------------------------------------
  // SAVE SETTINGS
  // ---------------------------------------------------------

  useEffect(() => {
    localStorage.setItem(
      'weather-gpt-language',
      lang
    )
  }, [lang])


  useEffect(() => {
    localStorage.setItem(
      'weather-gpt-theme',
      dark ? 'dark' : 'light'
    )

    document.body.classList.toggle(
      'weather-dark',
      dark
    )
  }, [dark])


  useEffect(() => {
    localStorage.setItem(
      'weather-gpt-alerts',
      alerts
    )
  }, [alerts])


  useEffect(() => {
    localStorage.setItem(
      'weather-gpt-summary',
      summary
    )
  }, [summary])


  useEffect(() => {
    localStorage.setItem(
      'weather-gpt-voice',
      voice
    )
  }, [voice])


  return (
    <div className="page">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="page-heading">

        <div>

          <div className="eyebrow">
            PREFERENCES
          </div>

          <h1>
            Settings
          </h1>

          <p className="subtitle">
            Control how Weather GPT presents information
            and recommendations.
          </p>

        </div>

      </div>


      {/* =====================================================
          SETTINGS GRID
          ===================================================== */}

      <div className="settings-grid">


        {/* ===================================================
            GENERAL
            =================================================== */}

        <section className="card settings-card">

          <div className="section-title">

            <h2>
              General
            </h2>

            <SettingsIcon
              size={19}
              color="#0b9f92"
            />

          </div>


          <Setting
            label="Temperature Unit"
            desc="Choose how temperatures are displayed"
          >

            <div className="segmented">

              <button
                className={
                  unit === 'C'
                    ? 'active'
                    : ''
                }
                onClick={() => setUnit('C')}
              >
                °C
              </button>

              <button
                className={
                  unit === 'F'
                    ? 'active'
                    : ''
                }
                onClick={() => setUnit('F')}
              >
                °F
              </button>

            </div>

          </Setting>


          <Setting
            label="Language"
            desc="Preferred Weather GPT language"
          >

            <select
              className="settings-select"
              value={lang}
              onChange={(event) =>
                setLang(event.target.value)
              }
            >

              <option>
                English
              </option>

              <option>
                Hindi
              </option>

              <option>
                Bengali
              </option>

              <option>
                Tamil
              </option>

              <option>
                Telugu
              </option>

              <option>
                Marathi
              </option>

              <option>
                Kannada
              </option>

              <option>
                Gujarati
              </option>

              <option>
                Punjabi
              </option>

              <option>
                Malayalam
              </option>

              <option>
                Odia
              </option>

            </select>

          </Setting>


          <Setting
            label="Location"
            desc="Manage your active location from Saved Locations"
          >

            <button
              className="btn"
              onClick={() => {
                window.location.href =
                  '/locations'
              }}
            >

              <MapPin size={14} />

              Manage Locations

            </button>

          </Setting>

        </section>


        {/* ===================================================
            NOTIFICATIONS
            =================================================== */}

        <section className="card settings-card">

          <div className="section-title">

            <h2>
              Notifications
            </h2>

            <Bell
              size={19}
              color="#0b9f92"
            />

          </div>


          <Setting
            label="Weather Alerts"
            desc="Show severe-weather warnings"
          >

            <Switch
              on={alerts}
              setOn={setAlerts}
            />

          </Setting>


          <Setting
            label="Daily Weather Summary"
            desc="Enable your daily weather decision brief"
          >

            <Switch
              on={summary}
              setOn={setSummary}
            />

          </Setting>


          <Setting
            label="Voice Assistant"
            desc="Enable voice input and spoken responses"
          >

            <Switch
              on={voice}
              setOn={setVoice}
            />

          </Setting>

        </section>


        {/* ===================================================
            APPEARANCE
            =================================================== */}

        <section className="card settings-card">

          <div className="section-title">

            <h2>
              Appearance
            </h2>

            <Palette
              size={19}
              color="#0b9f92"
            />

          </div>


          <Setting
            label="Theme"
            desc="Visual appearance of Weather GPT"
          >

            <div className="segmented">

              <button
                className={
                  !dark
                    ? 'active'
                    : ''
                }
                onClick={() =>
                  setDark(false)
                }
              >
                Light
              </button>

              <button
                className={
                  dark
                    ? 'active'
                    : ''
                }
                onClick={() =>
                  setDark(true)
                }
              >
                Dark
              </button>

            </div>

          </Setting>


          <Setting
            label="Product style"
            desc="Professional decision-intelligence dashboard"
          >

            <span className="badge good">
              SAAS / BI
            </span>

          </Setting>

        </section>


        {/* ===================================================
            ABOUT
            =================================================== */}

        <section className="card settings-card">

          <div className="section-title">

            <h2>
              About Weather GPT
            </h2>

            <Globe2
              size={19}
              color="#0b9f92"
            />

          </div>


          <p className="subtitle">

            Weather GPT combines live weather data,
            forecast signals, weather risk analysis,
            official alerts and AI-powered explanations
            to help users make better decisions.

          </p>


          <div className="demo-note">

            ⓘ Architecture: React → FastAPI →
            Weather Service → Risk Engine → AI Model

          </div>

        </section>

      </div>

    </div>
  )
}


/* =========================================================
   SETTING ROW
   ========================================================= */

function Setting({
  label,
  desc,
  children,
}) {

  return (

    <div className="setting-row">

      <div className="setting-label">

        <strong>
          {label}
        </strong>

        <span>
          {desc}
        </span>

      </div>

      {children}

    </div>

  )
}


/* =========================================================
   SWITCH
   ========================================================= */

function Switch({
  on,
  setOn,
}) {

  return (

    <button
      className={`switch ${
        on ? 'on' : ''
      }`}
      onClick={() =>
        setOn(!on)
      }
      aria-label="Toggle setting"
      aria-pressed={on}
    >

      <span />

    </button>

  )
}