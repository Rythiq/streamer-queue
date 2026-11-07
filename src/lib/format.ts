/** Small formatting helpers. No dependencies, no locale surprises. */

export function relativeTime(ts: number, now: number = Date.now()): string {
  const seconds = Math.max(0, Math.floor((now - ts) / 1000))
  if (seconds < 45) return 'just now'

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${Math.max(1, minutes)}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days}d ago`

  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function fullDateTime(ts: number): string {
  return new Date(ts).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/** Wait estimate in whole minutes, assuming a fixed match length. */
export function estimateWait(position: number, minutesPerMatch = 2): number | null {
  const ahead = position - 1
  if (ahead < 1) return null
  return ahead * minutesPerMatch
}
