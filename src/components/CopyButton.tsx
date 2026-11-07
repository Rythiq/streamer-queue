import { Check, Copy, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from './Button'
import type { ButtonProps } from './Button'
import { cn, copyText } from './utils'

interface CopyButtonProps {
  value: string
  label?: string
  iconOnly?: boolean
  variant?: ButtonProps['variant']
  size?: ButtonProps['size']
  className?: string
}

export function CopyButton({
  value,
  label = 'Copy link',
  iconOnly = false,
  variant = 'secondary',
  size = 'md',
  className,
}: CopyButtonProps) {
  const [state, setState] = useState<'idle' | 'copied' | 'error'>('idle')
  const timer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current)
    }
  }, [])

  async function handleCopy() {
    const ok = await copyText(value)
    setState(ok ? 'copied' : 'error')
    if (timer.current !== null) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setState('idle'), 1800)
  }

  const Icon = state === 'copied' ? Check : state === 'error' ? X : Copy
  const text = state === 'copied' ? 'Copied' : state === 'error' ? 'Copy failed' : label

  return (
    <Button
      variant={variant}
      size={iconOnly ? 'icon' : size}
      onClick={() => void handleCopy()}
      aria-label={iconOnly ? text : undefined}
      title={iconOnly ? text : undefined}
      className={cn(!iconOnly && 'min-w-[7.75rem]', className)}
    >
      <Icon
        aria-hidden
        className={cn(
          'size-4 transition-transform duration-150',
          state === 'copied' && 'scale-110',
        )}
      />
      {!iconOnly && <span>{text}</span>}
      <span className="sr-only" role="status" aria-live="polite">
        {state === 'copied' ? 'Copied to clipboard' : state === 'error' ? 'Could not copy' : ''}
      </span>
    </Button>
  )
}
