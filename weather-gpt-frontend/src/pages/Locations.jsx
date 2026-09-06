import { useEffect, useState } from 'react'
import {
  MapPin,
  Plus,
  Star,
  Trash2,
  GitCompareArrows,
  Search,
  Loader2,
} from 'lucide-react'

import { locations as mockLocations } from '../data/mockLocations'
import { getWeather } from '../lib/api'

export default function Locations({
  unit,
  location,
  setLocation,
}) {
  const [cities, setCities] = useState(() => {
  const savedCities = localStorage.getItem('weather-gpt-cities')

  return savedCities
    ? JSON.parse(savedCities)
    : mockLocations
})

useEffect(() => {
  localStorage.setItem(
    'weather-gpt-cities',
    JSON.stringify(cities)
  )
}, [cities])

  const [compare, setCompare] = useState([
    'Bengaluru',
    'Mumbai',
    'New Delhi',
  ])

  const [primary, setPrimary] = useState(
    location?.city || 'Bengaluru'
  )

  const [searchCity, setSearchCity] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')

  const temp = (c) =>
    unit === 'C'
      ? Math.round(c)
      : Math.round((c * 9) / 5 + 32)

  // ---------------------------------------------------------
  // SELECT CITY
  // ---------------------------------------------------------

  const selectCity = (city) => {
    setPrimary(city.city)

    setLocation({
      city: city.city,
      country: city.country || 'India',
    })
  }

  // ---------------------------------------------------------
  // COMPARE CITY
  // ---------------------------------------------------------

  const toggleCompare = (city) => {
    setCompare((current) =>
      current.includes(city)
        ? current.filter((item) => item !== city)
        : [...current, city].slice(-3)
    )
  }

  // ---------------------------------------------------------
  // SEARCH CITY
  // ---------------------------------------------------------

  const handleSearch = async (event) => {
    event.preventDefault()

    const cityName = searchCity.trim()

    if (!cityName) {
      return
    }

    setSearching(true)
    setSearchError('')

    try {
      const weather = await getWeather(cityName)

      const newCity = {
        city: weather.city,
        state: weather.region || '',
        country: weather.country || 'India',

        temp: Number(weather.temperatureC || 0),
        condition: weather.condition || 'Unknown',
        humidity: Number(weather.humidity || 0),

        rain: Number(
          weather.hourly?.[0]?.chance_of_rain || 0
        ),
      }

      setCities((current) => {
        const exists = current.some(
          (item) =>
            item.city.toLowerCase() ===
            newCity.city.toLowerCase()
        )

        if (exists) {
          return current.map((item) =>
            item.city.toLowerCase() ===
            newCity.city.toLowerCase()
              ? newCity
              : item
          )
        }

        return [...current, newCity]
      })

      // Make searched city the active location
      selectCity(newCity)

      setSearchCity('')
    } catch (error) {
      console.error('Location search failed:', error)

      setSearchError(
        'Could not find this city. Please try another city name.'
      )
    } finally {
      setSearching(false)
    }
  }

  // ---------------------------------------------------------
  // REMOVE CITY
  // ---------------------------------------------------------

  const removeCity = (cityName) => {
    setCities((current) =>
      current.filter(
        (city) => city.city !== cityName
      )
    )

    setCompare((current) =>
      current.filter(
        (city) => city !== cityName
      )
    )

    if (primary === cityName) {
      setPrimary('Bengaluru')

      setLocation({
        city: 'Bengaluru',
        country: 'India',
      })
    }
  }

  return (
    <div className="page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="page-heading">

        <div>

          <div className="eyebrow">
            LOCATION INTELLIGENCE
          </div>

          <h1>
            Saved Locations
          </h1>

          <p className="subtitle">
            Keep important cities close and compare
            conditions before making plans.
          </p>

        </div>

        {/* =================================================
            SEARCH
        ================================================= */}

        <form
          className="location-search"
          onSubmit={handleSearch}
        >

          <Search size={17} />

          <input
            type="text"
            value={searchCity}
            onChange={(event) =>
              setSearchCity(event.target.value)
            }
            placeholder="Search city..."
            disabled={searching}
          />

          <button
            type="submit"
            className="btn btn-primary"
            disabled={searching || !searchCity.trim()}
          >

            {searching ? (
              <>
                <Loader2
                  size={16}
                  className="spin"
                />

                Searching...
              </>
            ) : (
              <>
                <Plus size={17} />

                Add Location
              </>
            )}

          </button>

        </form>

      </div>

      {/* SEARCH ERROR */}

      {searchError && (
        <div className="location-search-error">
          {searchError}
        </div>
      )}


      {/* =====================================================
          SAVED LOCATIONS
      ===================================================== */}

      <div className="location-grid">

        {cities.map((c) => (

          <section
            className="card location-card"
            key={c.city}
          >

            {/* CITY HEADER */}

            <div className="location-row">

              <div className="city-main">

                <div className="city-icon">
                  <MapPin size={20} />
                </div>

                <div>

                  <div className="city-name">
                    {c.city}
                  </div>

                  <div className="city-state">

                    {c.state || c.country}

                    {c.city === primary && (
                      <span
                        className="badge good"
                        style={{
                          marginLeft: 6,
                          padding: '3px 6px',
                        }}
                      >
                        PRIMARY
                      </span>
                    )}

                  </div>

                </div>

              </div>

              <div className="city-temp">
                {temp(c.temp)}°
              </div>

            </div>


            {/* WEATHER DETAILS */}

            <div className="city-details">

              <span>
                {c.condition}
              </span>

              <span>
                Humidity {c.humidity}%
              </span>

              <span>
                Rain {c.rain}%
              </span>

            </div>


            {/* ACTIONS */}

            <div
              style={{
                display: 'flex',
                gap: 8,
                marginTop: 18,
                flexWrap: 'wrap',
              }}
            >

              <button
                className="btn"
                onClick={() => selectCity(c)}
              >
                <MapPin size={14} />

                View weather
              </button>


              <button
                className="btn"
                onClick={() => {
                  setPrimary(c.city)

                  setLocation({
                    city: c.city,
                    country: c.country || 'India',
                  })
                }}
              >

                <Star size={14} />

                Set primary

              </button>


              <button
                className={`btn ${
                  compare.includes(c.city)
                    ? 'btn-primary'
                    : ''
                }`}
                onClick={() =>
                  toggleCompare(c.city)
                }
              >

                <GitCompareArrows size={14} />

                Compare

              </button>


              {c.city !== 'Bengaluru' && (
                <button
                  className="btn"
                  aria-label={`Remove ${c.city}`}
                  onClick={() =>
                    removeCity(c.city)
                  }
                >

                  <Trash2 size={14} />

                </button>
              )}

            </div>

          </section>

        ))}

      </div>


      {/* =====================================================
          CITY COMPARISON
      ===================================================== */}

      <section className="card compare">

        <div className="section-title">

          <div>

            <h2>
              City Comparison
            </h2>

            <p className="subtitle">
              Compare up to three saved locations.
            </p>

          </div>

        </div>


        <div className="forecast-scroll">

          <table className="forecast-table">

            <thead>

              <tr>

                <th>CITY</th>
                <th>TEMP</th>
                <th>CONDITION</th>
                <th>HUMIDITY</th>
                <th>RAIN</th>
                <th>DECISION</th>

              </tr>

            </thead>


            <tbody>

              {cities
                .filter((c) =>
                  compare.includes(c.city)
                )
                .map((c) => (

                  <tr key={c.city}>

                    <td>
                      {c.city}
                    </td>

                    <td>
                      {temp(c.temp)}°
                    </td>

                    <td>
                      {c.condition}
                    </td>

                    <td>
                      {c.humidity}%
                    </td>

                    <td>
                      {c.rain}%
                    </td>

                    <td>

                      <span
                        className={`badge ${
                          c.rain > 70
                            ? 'avoid'
                            : c.rain > 40
                              ? 'watch'
                              : 'good'
                        }`}
                      >

                        {c.rain > 70
                          ? 'AVOID'
                          : c.rain > 40
                            ? 'WATCH'
                            : 'FAVOURABLE'}

                      </span>

                    </td>

                  </tr>

                ))}

            </tbody>

          </table>

        </div>

      </section>

    </div>
  )
}