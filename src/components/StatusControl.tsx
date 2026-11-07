import { motion, useReducedMotion } from 'framer-motion'
import { CircleSlash, Pause, Radio } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { QueueStatus } from '../lib/types'
import { cn } from './utils'

const options: Array<{ value: QueueStatus; label: string; icon: LucideIcon }> = [
  { value: 'open', label: 'Open', icon: Radio },
  { value: 'paused', label: 'Paused', icon: Pause },
  { value: 'closed', label: 'Closed', icon: CircleSlash },
]

const activeStyles: Record<QueueStatus, string> = {
  open: 'bg-lime',
  paused: 'bg-amber',
  closed: 'bg-rose',
}

export function StatusControl({
  value,
  busy,
  onChange,
}: {
  value: QueueStatus
  busy: boolean
  onChange: (status: QueueStatus) => void
}) {
  const reduce = useReducedMotion()

  return (
    <div
      role="group"
      aria-label="Queue status"
      className="relative grid grid-cols-3 gap-1 rounded-xl border border-white/10 bg-black/30 p-1"
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            disabled={busy}
            onClick={() => {
              if (!active) onChange(option.value)
            }}
            className={cn(
              'relative flex h-9 items-center justify-center rounded-lg text-xs font-medium transition-colors disabled:opacity-60',
              active ? 'text-[#0a0d04]' : 'text-fog hover:text-chalk',
            )}
          >
            {active && (
              <motion.span
                layoutId="status-indicator"
                className={cn('absolute inset-0 rounded-lg', activeStyles[option.value])}
                transition={
                  reduce ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 38 }
                }
              />
            )}
            <span className="relative z-10 inline-flex items-center gap-1.5">
              <option.icon aria-hidden className="size-3.5" />
              {option.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
