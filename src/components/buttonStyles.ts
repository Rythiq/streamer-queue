import { cn } from './utils'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

const base =
  'inline-flex select-none items-center justify-center rounded-xl font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-150 active:translate-y-px disabled:pointer-events-none disabled:opacity-45'

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-lime font-semibold text-[#0a0d04] shadow-[0_10px_30px_-14px_rgba(201,255,63,0.7)] hover:bg-lime-soft',
  secondary:
    'border border-white/10 bg-white/[0.055] text-chalk hover:border-white/15 hover:bg-white/[0.09]',
  outline:
    'border border-lime/30 bg-lime/[0.06] text-lime hover:border-lime/45 hover:bg-lime/[0.12]',
  ghost: 'text-fog hover:bg-white/[0.06] hover:text-chalk',
  danger:
    'border border-rose/25 bg-rose/[0.08] text-rose hover:border-rose/40 hover:bg-rose/[0.15]',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 gap-1.5 px-3 text-xs',
  md: 'h-11 gap-2 px-4 text-sm',
  lg: 'h-12 gap-2 px-5 text-[15px]',
  icon: 'size-9 p-0',
}

/** Shared styling for links that need to look like buttons. */
export function buttonClass(
  variant: ButtonVariant = 'secondary',
  size: ButtonSize = 'md',
  className?: string,
): string {
  return cn(base, variants[variant], sizes[size], className)
}
