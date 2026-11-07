import { cn } from './utils'

type Tone = 'lime' | 'cyan' | 'neutral'

const tones: Record<Tone, string> = {
  lime: 'border-lime/40',
  cyan: 'border-cyan/35',
  neutral: 'border-white/20',
}

/** Four hairline corner brackets — a quiet broadcast framing motif. */
export function Corners({ tone = 'lime', className }: { tone?: Tone; className?: string }) {
  const toneClass = tones[tone]
  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-3 z-0', className)}>
      <span className={cn('absolute left-0 top-0 size-3.5 border-l border-t', toneClass)} />
      <span className={cn('absolute right-0 top-0 size-3.5 border-r border-t', toneClass)} />
      <span className={cn('absolute bottom-0 left-0 size-3.5 border-b border-l', toneClass)} />
      <span className={cn('absolute bottom-0 right-0 size-3.5 border-b border-r', toneClass)} />
    </div>
  )
}
