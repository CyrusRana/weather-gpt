export function riskLabel(score) {
  if (score >= 80) return 'HIGH'
  if (score >= 55) return 'MODERATE'
  if (score >= 30) return 'LOW'
  return 'MINIMAL'
}

export function riskColor(score) {
  if (score >= 80) return 'avoid'
  if (score >= 55) return 'watch'
  return 'good'
}
