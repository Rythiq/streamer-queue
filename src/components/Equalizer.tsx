import { cn } from './utils'

/** Tiny live-level bars used on the now-playing row. */
export function Equalizer({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn('eq', className)}>
      <span />
      <span />
      <span />
    </span>
  )
}
