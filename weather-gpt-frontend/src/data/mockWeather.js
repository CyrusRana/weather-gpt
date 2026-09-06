const bengaluruHourly = [
  { time: '10 AM', temp: 28, condition: 'Cloudy', rain: 12, type: 'cloud' },
  { time: '11 AM', temp: 29, condition: 'Cloudy', rain: 18, type: 'cloud' },
  { time: '12 PM', temp: 30, condition: 'Sunny', rain: 22, type: 'sun' },
  { time: '1 PM', temp: 31, condition: 'Sunny', rain: 30, type: 'sun' },
  { time: '2 PM', temp: 30, condition: 'Cloudy', rain: 42, type: 'cloud' },
  { time: '3 PM', temp: 29, condition: 'Rain', rain: 58, type: 'rain' },
  { time: '4 PM', temp: 28, condition: 'Rain', rain: 72, type: 'rain' },
  { time: '5 PM', temp: 27, condition: 'Rain', rain: 84, type: 'rain' },
]

const bengaluruWeekly = [
  ['Monday', 'Partly Cloudy', 30, 22, 20, 12, 'cloud'],
  ['Tuesday', 'Rain', 28, 23, 72, 18, 'rain'],
  ['Wednesday', 'Rain', 27, 22, 68, 18, 'rain'],
  ['Thursday', 'Cloudy', 29, 21, 35, 11, 'cloud'],
  ['Friday', 'Sunny', 31, 22, 12, 9, 'sun'],
  ['Saturday', 'Thunderstorm', 26, 21, 81, 22, 'storm'],
  ['Sunday', 'Sunny', 30, 22, 15, 10, 'sun'],
]

const chennaiHourly = [
  { time: '10 AM', temp: 29, condition: 'Sunny', rain: 8, type: 'sun' },
  { time: '11 AM', temp: 31, condition: 'Sunny', rain: 10, type: 'sun' },
  { time: '12 PM', temp: 33, condition: 'Sunny', rain: 12, type: 'sun' },
  { time: '1 PM', temp: 34, condition: 'Sunny', rain: 15, type: 'sun' },
  { time: '2 PM', temp: 35, condition: 'Cloudy', rain: 20, type: 'cloud' },
  { time: '3 PM', temp: 34, condition: 'Cloudy', rain: 28, type: 'cloud' },
  { time: '4 PM', temp: 33, condition: 'Rain', rain: 48, type: 'rain' },
  { time: '5 PM', temp: 32, condition: 'Rain', rain: 61, type: 'rain' },
]

const chennaiWeekly = [
  ['Monday', 'Sunny', 34, 27, 12, 15, 'sun'],
  ['Tuesday', 'Cloudy', 33, 27, 25, 16, 'cloud'],
  ['Wednesday', 'Rain', 31, 26, 61, 18, 'rain'],
  ['Thursday', 'Rain', 30, 25, 72, 20, 'rain'],
  ['Friday', 'Cloudy', 32, 26, 35, 17, 'cloud'],
  ['Saturday', 'Sunny', 34, 27, 15, 14, 'sun'],
  ['Sunday', 'Sunny', 35, 27, 10, 13, 'sun'],
]

const hyderabadHourly = [
  { time: '10 AM', temp: 30, condition: 'Cloudy', rain: 15, type: 'cloud' },
  { time: '11 AM', temp: 31, condition: 'Cloudy', rain: 22, type: 'cloud' },
  { time: '12 PM', temp: 32, condition: 'Cloudy', rain: 30, type: 'cloud' },
  { time: '1 PM', temp: 33, condition: 'Sunny', rain: 35, type: 'sun' },
  { time: '2 PM', temp: 32, condition: 'Cloudy', rain: 42, type: 'cloud' },
  { time: '3 PM', temp: 31, condition: 'Rain', rain: 50, type: 'rain' },
  { time: '4 PM', temp: 30, condition: 'Rain', rain: 61, type: 'rain' },
  { time: '5 PM', temp: 29, condition: 'Rain', rain: 68, type: 'rain' },
]

const hyderabadWeekly = [
  ['Monday', 'Cloudy', 32, 24, 35, 15, 'cloud'],
  ['Tuesday', 'Rain', 30, 23, 61, 17, 'rain'],
  ['Wednesday', 'Cloudy', 31, 23, 42, 14, 'cloud'],
  ['Thursday', 'Rain', 29, 22, 68, 19, 'rain'],
  ['Friday', 'Cloudy', 31, 23, 40, 16, 'cloud'],
  ['Saturday', 'Thunderstorm', 28, 22, 78, 21, 'storm'],
  ['Sunday', 'Sunny', 32, 23, 18, 12, 'sun'],
]

const delhiHourly = [
  { time: '10 AM', temp: 31, condition: 'Sunny', rain: 5, type: 'sun' },
  { time: '11 AM', temp: 33, condition: 'Sunny', rain: 6, type: 'sun' },
  { time: '12 PM', temp: 35, condition: 'Sunny', rain: 8, type: 'sun' },
  { time: '1 PM', temp: 36, condition: 'Sunny', rain: 10, type: 'sun' },
  { time: '2 PM', temp: 37, condition: 'Cloudy', rain: 15, type: 'cloud' },
  { time: '3 PM', temp: 36, condition: 'Cloudy', rain: 22, type: 'cloud' },
  { time: '4 PM', temp: 35, condition: 'Rain', rain: 35, type: 'rain' },
  { time: '5 PM', temp: 33, condition: 'Rain', rain: 48, type: 'rain' },
]

const delhiWeekly = [
  ['Monday', 'Sunny', 37, 27, 8, 14, 'sun'],
  ['Tuesday', 'Sunny', 36, 26, 10, 15, 'sun'],
  ['Wednesday', 'Cloudy', 34, 25, 22, 13, 'cloud'],
  ['Thursday', 'Rain', 32, 24, 48, 17, 'rain'],
  ['Friday', 'Rain', 31, 23, 55, 18, 'rain'],
  ['Saturday', 'Cloudy', 33, 24, 30, 14, 'cloud'],
  ['Sunday', 'Sunny', 35, 25, 12, 12, 'sun'],
]

const mumbaiHourly = [
  { time: '10 AM', temp: 28, condition: 'Cloudy', rain: 42, type: 'cloud' },
  { time: '11 AM', temp: 29, condition: 'Cloudy', rain: 48, type: 'cloud' },
  { time: '12 PM', temp: 29, condition: 'Rain', rain: 55, type: 'rain' },
  { time: '1 PM', temp: 30, condition: 'Rain', rain: 62, type: 'rain' },
  { time: '2 PM', temp: 29, condition: 'Rain', rain: 70, type: 'rain' },
  { time: '3 PM', temp: 28, condition: 'Rain', rain: 76, type: 'rain' },
  { time: '4 PM', temp: 28, condition: 'Rain', rain: 82, type: 'rain' },
  { time: '5 PM', temp: 27, condition: 'Rain', rain: 86, type: 'rain' },
]

const mumbaiWeekly = [
  ['Monday', 'Rain', 30, 25, 72, 20, 'rain'],
  ['Tuesday', 'Rain', 29, 25, 81, 22, 'rain'],
  ['Wednesday', 'Cloudy', 30, 25, 48, 18, 'cloud'],
  ['Thursday', 'Rain', 29, 24, 76, 21, 'rain'],
  ['Friday', 'Rain', 28, 24, 84, 23, 'rain'],
  ['Saturday', 'Cloudy', 30, 25, 52, 17, 'cloud'],
  ['Sunday', 'Rain', 29, 24, 70, 19, 'rain'],
]

export const weatherByCity = {
  Bengaluru: {
    city: 'Bengaluru',
    country: 'India',
    temperatureC: 28,
    feelsLikeC: 30,
    condition: 'Partly Cloudy',
    humidity: 72,
    wind: 14,
    windDirection: 'NW',
    uv: 6,
    visibility: 8,
    pressure: 1008,
    sunrise: '6:02 AM',
    sunset: '6:28 PM',

    risk: 68,

    riskComponents: [
      ['Heat', 62],
      ['Rain', 84],
      ['Wind', 45],
      ['UV', 60],
      ['Visibility', 38],
    ],

    warning: {
      title: 'Heavy Rain Expected',
      time: '5:00 PM – 9:00 PM',
      rain: '84%',
      severity: 'HIGH',
      action: 'Avoid unnecessary outdoor travel during this period.',
    },

    hourly: bengaluruHourly,

    weekly: bengaluruWeekly.map(
      ([day, condition, high, low, rain, wind, type]) => ({
        day,
        condition,
        high,
        low,
        rain,
        wind,
        type,
      })
    ),

    timeline: [
      ['08:00 AM', 'Good for outdoor activity', 'FAVOURABLE', 'good'],
      ['11:00 AM', 'UV increasing', 'WATCH', 'watch'],
      ['01:00 PM', 'High heat', 'WATCH', 'watch'],
      ['04:00 PM', 'Rain probability increasing', 'CAUTION', 'caution'],
      ['06:00 PM', 'Thunderstorm risk', 'AVOID', 'avoid'],
      ['08:00 PM', 'Heavy rain possible', 'AVOID', 'avoid'],
    ],
  },

  Chennai: {
    city: 'Chennai',
    country: 'India',
    temperatureC: 28,
    feelsLikeC: 32,
    condition: 'Partly Cloudy',
    humidity: 78,
    wind: 16,
    windDirection: 'SE',
    uv: 7,
    visibility: 7,
    pressure: 1005,
    sunrise: '5:58 AM',
    sunset: '6:18 PM',

    risk: 64,

    riskComponents: [
      ['Heat', 74],
      ['Rain', 61],
      ['Wind', 48],
      ['UV', 70],
      ['Visibility', 42],
    ],

    warning: {
      title: 'Rain Watch',
      time: '3:00 PM – 8:00 PM',
      rain: '61%',
      severity: 'WATCH',
      action: 'Keep rain protection ready and check conditions before evening travel.',
    },

    hourly: chennaiHourly,

    weekly: chennaiWeekly.map(
      ([day, condition, high, low, rain, wind, type]) => ({
        day,
        condition,
        high,
        low,
        rain,
        wind,
        type,
      })
    ),

    timeline: [
      ['08:00 AM', 'Good for outdoor activity', 'FAVOURABLE', 'good'],
      ['11:00 AM', 'UV increasing', 'WATCH', 'watch'],
      ['01:00 PM', 'High heat', 'CAUTION', 'caution'],
      ['04:00 PM', 'Rain probability increasing', 'CAUTION', 'caution'],
      ['06:00 PM', 'Rain expected', 'AVOID', 'avoid'],
      ['08:00 PM', 'Rain may continue', 'AVOID', 'avoid'],
    ],
  },

  Hyderabad: {
    city: 'Hyderabad',
    country: 'India',
    temperatureC: 30,
    feelsLikeC: 32,
    condition: 'Cloudy',
    humidity: 65,
    wind: 15,
    windDirection: 'W',
    uv: 7,
    visibility: 8,
    pressure: 1009,
    sunrise: '6:02 AM',
    sunset: '6:34 PM',

    risk: 55,

    riskComponents: [
      ['Heat', 68],
      ['Rain', 61],
      ['Wind', 42],
      ['UV', 70],
      ['Visibility', 35],
    ],

    warning: {
      title: 'Rain Watch',
      time: '3:00 PM – 8:00 PM',
      rain: '61%',
      severity: 'WATCH',
      action: 'Keep rain protection ready and check conditions before evening travel.',
    },

    hourly: hyderabadHourly,

    weekly: hyderabadWeekly.map(
      ([day, condition, high, low, rain, wind, type]) => ({
        day,
        condition,
        high,
        low,
        rain,
        wind,
        type,
      })
    ),

    timeline: [
      ['08:00 AM', 'Good for outdoor activity', 'FAVOURABLE', 'good'],
      ['11:00 AM', 'UV increasing', 'WATCH', 'watch'],
      ['01:00 PM', 'High heat', 'WATCH', 'watch'],
      ['04:00 PM', 'Rain probability increasing', 'CAUTION', 'caution'],
      ['06:00 PM', 'Rain risk', 'AVOID', 'avoid'],
      ['08:00 PM', 'Rain possible', 'CAUTION', 'caution'],
    ],
  },

  'New Delhi': {
    city: 'New Delhi',
    country: 'India',
    temperatureC: 31,
    feelsLikeC: 34,
    condition: 'Sunny',
    humidity: 52,
    wind: 12,
    windDirection: 'NW',
    uv: 8,
    visibility: 7,
    pressure: 1004,
    sunrise: '5:58 AM',
    sunset: '6:35 PM',

    risk: 61,

    riskComponents: [
      ['Heat', 82],
      ['Rain', 25],
      ['Wind', 35],
      ['UV', 80],
      ['Visibility', 48],
    ],

    warning: {
      title: 'Heat Advisory',
      time: '12:00 PM – 4:00 PM',
      rain: '25%',
      severity: 'WATCH',
      action: 'Limit prolonged outdoor activity during peak afternoon heat.',
    },

    hourly: delhiHourly,

    weekly: delhiWeekly.map(
      ([day, condition, high, low, rain, wind, type]) => ({
        day,
        condition,
        high,
        low,
        rain,
        wind,
        type,
      })
    ),

    timeline: [
      ['08:00 AM', 'Comfortable outdoor window', 'FAVOURABLE', 'good'],
      ['11:00 AM', 'Heat increasing', 'WATCH', 'watch'],
      ['01:00 PM', 'High heat and UV', 'CAUTION', 'caution'],
      ['04:00 PM', 'Heat remains elevated', 'CAUTION', 'caution'],
      ['06:00 PM', 'Better outdoor conditions', 'FAVOURABLE', 'good'],
      ['08:00 PM', 'Suitable for evening activity', 'FAVOURABLE', 'good'],
    ],
  },

  Mumbai: {
    city: 'Mumbai',
    country: 'India',
    temperatureC: 28,
    feelsLikeC: 31,
    condition: 'Rain',
    humidity: 84,
    wind: 20,
    windDirection: 'SW',
    uv: 4,
    visibility: 6,
    pressure: 1002,
    sunrise: '6:18 AM',
    sunset: '6:55 PM',

    risk: 76,

    riskComponents: [
      ['Heat', 48],
      ['Rain', 86],
      ['Wind', 62],
      ['UV', 40],
      ['Visibility', 58],
    ],

    warning: {
      title: 'Heavy Rain Expected',
      time: '12:00 PM – 9:00 PM',
      rain: '86%',
      severity: 'HIGH',
      action: 'Avoid unnecessary travel and allow extra time for road conditions.',
    },

    hourly: mumbaiHourly,

    weekly: mumbaiWeekly.map(
      ([day, condition, high, low, rain, wind, type]) => ({
        day,
        condition,
        high,
        low,
        rain,
        wind,
        type,
      })
    ),

    timeline: [
      ['08:00 AM', 'Rain possible', 'WATCH', 'watch'],
      ['11:00 AM', 'Rain probability increasing', 'CAUTION', 'caution'],
      ['01:00 PM', 'Heavy rain possible', 'AVOID', 'avoid'],
      ['04:00 PM', 'Heavy rain expected', 'AVOID', 'avoid'],
      ['06:00 PM', 'Poor travel conditions', 'AVOID', 'avoid'],
      ['08:00 PM', 'Heavy rain possible', 'AVOID', 'avoid'],
    ],
  },
}

export const currentWeather = weatherByCity.Bengaluru

export const hourlyForecast = bengaluruHourly

export const weeklyForecast = weatherByCity.Bengaluru.weekly

export const riskComponents = weatherByCity.Bengaluru.riskComponents

export const decisionModes = {
  'Daily Life': {
    text: 'Your routine looks manageable, but keep a light rain layer handy for the evening.',
    signals: [
      ['Rain probability', '72%'],
      ['Humidity', '82%'],
      ['Risk', 'Moderate'],
    ],
  },

  Travel: {
    text: 'Travel is manageable before 4 PM, but heavy rain and stronger winds are expected later.',
    signals: [
      ['Rain probability', '84%'],
      ['Wind', '18 km/h'],
      ['Best window', 'Before 4 PM'],
    ],
  },

  'Outdoor Activity': {
    text: 'Morning is the preferred outdoor window. Avoid the evening because thunderstorm risk increases.',
    signals: [
      ['Rain probability', '84%'],
      ['Best window', '7–11 AM'],
      ['Risk', 'Moderate'],
    ],
  },

  Agriculture: {
    text: 'High humidity and increasing rainfall may make spraying less suitable. Review conditions again tomorrow morning.',
    signals: [
      ['Humidity', '82%'],
      ['Rain probability', '84%'],
      ['Spraying', 'Not ideal'],
    ],
  },
}

export const planTimeline = weatherByCity.Bengaluru.timeline