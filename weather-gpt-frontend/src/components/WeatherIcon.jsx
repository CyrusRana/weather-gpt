import { Cloud, CloudRain, CloudSun, Sun, CloudLightning } from 'lucide-react'

export default function WeatherIcon({ type='cloud', size=32 }) {
  const props = { size, strokeWidth: 1.8 }
  if (type === 'sun') return <Sun {...props} />
  if (type === 'rain') return <CloudRain {...props} />
  if (type === 'storm') return <CloudLightning {...props} />
  return <CloudSun {...props} />
}
