import type { ReactNode } from 'react'
import { cn } from './utils'

interface StatProps {
  label: string
  value: ReactNode
  hint?: string
  big?: boolean
  className?: string
}

export function Stat({ label, value, hint, big = false, className }: StatProps) {
  return (
    <div className={cn('min-w-0', className)}>
      <dt className="eyebrow">{label}</dt>
      <dd
        className={cn(
          'num mt-1.5 truncate',
          big
            ? 'text-2xl font-semibold tracking-tight text-chalk'
            : 'text-sm text-chalk/90',
        )}
      >
        {value}
      </dd>
      {hint && <p className="mt-0.5 truncate text-[10px] text-fog/70">{hint}</p>}
    </div>
  )
}
