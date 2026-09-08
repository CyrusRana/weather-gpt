import {
  MapPin,
  CalendarDays,
  Menu,
  Navigation,
} from 'lucide-react'

export default function Topbar({
  unit,
  setUnit,
  onMenu,
  location,
  weather,
  onCurrentLocation,
  locating,
}) {

  // ---------------------------------------------------------
  // LOCATION
  // ---------------------------------------------------------

  // Use live API location when available
  const city =
    weather?.city ||
    location?.city ||
    'Bengaluru'

  const country =
    weather?.country ||
    location?.country ||
    'India'


  // ---------------------------------------------------------
  // LOCATION TIMEZONE
  // ---------------------------------------------------------

  const timezone =
    weather?.timezone ||
    'Asia/Kolkata'


  // ---------------------------------------------------------
  // CURRENT LOCAL DATE
  // ---------------------------------------------------------

  const formattedDate =
    new Intl.DateTimeFormat(
      'en-IN',
      {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        timeZone: timezone,
      }
    ).format(new Date())


  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------

  return (
    <header className="topbar">

      <div className="top-left">


        {/* MOBILE MENU */}

        <button
          className="mobile-menu"
          onClick={onMenu}
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>


        {/* LOCATION */}

        <div className="location-control">

          <MapPin size={18} />

          <span>
            {city}, {country}
          </span>

        </div>


        <div className="divider" />


        {/* DATE */}

        <div className="date-control">

          <CalendarDays size={18} />

          <span>
            {formattedDate}
          </span>

        </div>


        {/* CURRENT LOCATION */}

        <button
          className="current-location-button"
          onClick={onCurrentLocation}
          disabled={locating}
          title="Use my current location"
        >

          <Navigation size={15} />

          <span>
            {locating
              ? 'Locating...'
              : 'Current Location'}
          </span>

        </button>

      </div>


      {/* TEMPERATURE UNIT */}

      <div
        className="unit-toggle"
        aria-label="Temperature unit"
      >

        <button
          className={
            unit === 'C'
              ? 'active'
              : ''
          }
          onClick={() =>
            setUnit('C')
          }
        >
          °C
        </button>


        <button
          className={
            unit === 'F'
              ? 'active'
              : ''
          }
          onClick={() =>
            setUnit('F')
          }
        >
          °F
        </button>

      </div>

    </header>
  )
}