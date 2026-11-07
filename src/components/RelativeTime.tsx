import { useEffect, useState } from 'react'
import { fullDateTime, relativeTime } from '../lib/format'
import { cn } from './utils'

interface RelativeTimeProps {
  ts: number
  className?: string
}

/** Renders a relative timestamp and keeps it fresh while the page is open. */
export function RelativeTime({ ts, className }: RelativeTimeProps) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30_000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <time
      dateTime={new Date(ts).toISOString()}
      title={fullDateTime(ts)}
      className={cn(className)}
    >
      {relativeTime(ts, now)}
    </time>
  )
}
