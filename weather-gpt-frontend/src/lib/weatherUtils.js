export function toF(c) {
  return Math.round((c * 9 / 5) + 32)
}

export function displayTemp(c, unit = 'C') {
  return `${unit === 'C' ? Math.round(c) : toF(c)}°`
}
