import type { QueueStatus } from '../lib/types'
import { cn } from './utils'

const styles: Record<QueueStatus, { label: string; classes: string; dot: string }> = {
  open: {
    label: 'Open',
    classes: 'border-lime/25 bg-lime/[0.08] text-lime',
    dot: 'bg-lime dot-pulse',
  },
  paused: {
    label: 'Paused',
    classes: 'border-amber/25 bg-amber/[0.08] text-amber',
    dot: 'bg-amber',
  },
  closed: {
    label: 'Closed',
    classes: 'border-rose/25 bg-rose/[0.08] text-rose',
    dot: 'bg-rose',
  },
}

export function StatusPill({
  status,
  className,
}: {
  status: QueueStatus
  className?: string
}) {
  const style = styles[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em]',
        style.classes,
        className,
      )}
    >
      <span aria-hidden className={cn('size-1.5 rounded-full', style.dot)} />
      {style.label}
    </span>
  )
}
