import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'

import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'

import Dashboard from './pages/Dashboard'
import Forecast from './pages/Forecast'
import Assistant from './pages/Assistant'
import Analytics from './pages/Analytics'
import Locations from './pages/Locations'
import Settings from './pages/Settings'

import { getWeatherByCoordinates } from './lib/api'

export default function App() {
  const [unit, setUnit] = useState('C')

  const [location, setLocation] = useState({
    city: 'Bengaluru',
    country: 'India',
  })

  const [weather, setWeather] = useState(null)

  const [mobileOpen, setMobileOpen] = useState(false)

  const [locating, setLocating] = useState(false)

  // Get live weather whenever the selected city changes
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/weather?city=${encodeURIComponent(location.city)}`
        )

        if (!response.ok) {
          throw new Error('Weather request failed')
        }

        const data = await response.json()

        setWeather(data)

        // Keep location synchronized with WeatherAPI
        setLocation({
          city: data.city,
          country: data.country,
        })

      } catch (error) {
        console.error('Failed to fetch weather:', error)
      }
    }

    fetchWeather()
  }, [location.city])

  // Detect user's current location
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      console.error(
        'Geolocation is not supported by this browser.'
      )
      return
    }

    setLocating(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        try {
          console.log(
            'Current location:',
            latitude,
            longitude
          )

          const data = await getWeatherByCoordinates(
            latitude,
            longitude
          )

          setWeather(data)

          setLocation({
            city: data.city,
            country: data.country,
          })
        } catch (error) {
          console.error(
            'Failed to get weather for current location:',
            error
          )
        } finally {
          setLocating(false)
        }
      },

      (error) => {
        console.error(
          'Location permission/error:',
          error
        )

        setLocating(false)
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    )
  }

  return (
    <div className="app-shell">

      <Sidebar
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
          location={weather || location}
      />

      <main className="main-shell">

        <Topbar
          unit={unit}
          setUnit={setUnit}
          onMenu={() => setMobileOpen(true)}
          location={location}
          weather={weather}
          onCurrentLocation={handleCurrentLocation}
          locating={locating}
        />

        <div className="page-scroll">

          <Routes>

            <Route
              path="/"
              element={
                <Dashboard
                  unit={unit}
                  location={location}
                  setLocation={setLocation}
                  weather={weather}
                />
              }
            />

            <Route
              path="/forecast"
              element={
                <Forecast
                  unit={unit}
                  location={location}
                />
              }
            />

            <Route
              path="/assistant"
              element={
                <Assistant
                  unit={unit}
                  location={location}
                />
              }
            />

            <Route
              path="/analytics"
              element={
                <Analytics
                  location={location}
                />
              }
            />

            <Route
              path="/locations"
              element={
                <Locations
                  unit={unit}
                  location={location}
                  setLocation={setLocation}
                />
              }
            />

            <Route
              path="/settings"
              element={
                <Settings
                  unit={unit}
                  setUnit={setUnit}
                />
              }
            />

          </Routes>

        </div>

      </main>

    </div>
  )
}