import { Link } from 'react-router-dom'
import { cn } from './utils'

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      fill="none"
      className={cn('size-4', className)}
    >
      <rect x="1.5" y="3.25" width="11.5" height="2.5" rx="1.25" fill="var(--color-lime)" />
      <rect x="1.5" y="8.75" width="17" height="2.5" rx="1.25" fill="#fff" opacity="0.72" />
      <rect x="1.5" y="14.25" width="8" height="2.5" rx="1.25" fill="#fff" opacity="0.3" />
      <circle cx="16.25" cy="4.5" r="1.25" fill="var(--color-cyan)" />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      aria-label="NextUp home"
      className={cn(
        'group inline-flex items-center gap-2.5 rounded-lg transition-opacity hover:opacity-90',
        className,
      )}
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-lime/30 bg-lime/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
        <LogoMark />
      </span>
      <span className="display text-[17px] font-bold tracking-[-0.035em]">
        Next<span className="text-lime">Up</span>
      </span>
    </Link>
  )
}
