import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Backdrop } from './Backdrop'
import { Logo } from './Logo'
import { cn } from './utils'

export type ShellWidth = 'narrow' | 'viewer' | 'wide'

const widths: Record<ShellWidth, string> = {
  narrow: 'max-w-xl',
  viewer: 'max-w-3xl',
  wide: 'max-w-6xl',
}

interface ShellProps {
  children: ReactNode
  max?: ShellWidth
  right?: ReactNode
  footer?: boolean
}

export function Shell({ children, max = 'wide', right, footer = true }: ShellProps) {
  return (
    <div className="relative min-h-dvh">
      <Backdrop />
      <div className="relative z-10 flex min-h-dvh flex-col">
        <header
          className={cn(
            'mx-auto flex w-full items-center justify-between gap-4 px-5 py-5 sm:px-8',
            widths[max],
          )}
        >
          <Logo />
          <div className="flex items-center gap-2">{right}</div>
        </header>

        <main
          className={cn(
            'mx-auto w-full flex-1 px-5 pb-16 sm:px-8',
            widths[max],
          )}
        >
          {children}
        </main>

        {footer && (
          <footer className={cn('mx-auto w-full px-5 pb-8 sm:px-8', widths[max])}>
            <div className="flex flex-col gap-2 border-t border-white/5 pt-5 text-[11px] text-fog/70 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-mono uppercase tracking-[0.22em]">
                NextUp — live 1v1 queues
              </span>
              <span className="flex items-center gap-2">
                <span>No accounts. Your links are the app.</span>
                <Link
                  to="/"
                  className="rounded text-lime/80 transition-colors hover:text-lime"
                >
                  Create a queue
                </Link>
              </span>
            </div>
          </footer>
        )}
      </div>
    </div>
  )
}
