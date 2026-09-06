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

  // Use live API location when available
  const city =
    weather?.city ||
    location?.city ||
    'Bengaluru'

  const country =
    weather?.country ||
    location?.country ||
    'India'

  // WeatherAPI gives us the actual local date/time
  const localTime = weather?.localtime
    ? new Date(weather.localtime.replace(' ', 'T'))
    : new Date()

  const formattedDate = localTime.toLocaleDateString(
    'en-IN',
    {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    }
  )

  return (
    <header className="topbar">

      <div className="top-left">

        <button
          className="mobile-menu"
          onClick={onMenu}
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>

        <div className="location-control">
          <MapPin size={18} />

          <span>
            {city}, {country}
          </span>
        </div>

        <div className="divider" />

        <div className="date-control">
          <CalendarDays size={18} />

          <span>
            {formattedDate}
          </span>
        </div>

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

      <div
        className="unit-toggle"
        aria-label="Temperature unit"
      >

        <button
          className={unit === 'C' ? 'active' : ''}
          onClick={() => setUnit('C')}
        >
          °C
        </button>

        <button
          className={unit === 'F' ? 'active' : ''}
          onClick={() => setUnit('F')}
        >
          °F
        </button>

      </div>

    </header>
  )
}