import { ArrowLeft, Info, Lock, ShieldQuestionMark } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from './Button'
import { buttonClass } from './buttonStyles'
import { Shell } from './Shell'
import type { ShellWidth } from './Shell'

export function LoadingScreen({
  max = 'viewer',
  label = 'Loading queue',
}: {
  max?: ShellWidth
  label?: string
}) {
  return (
    <Shell max={max} footer={false}>
      <div aria-busy="true" aria-live="polite" className="space-y-6">
        <span className="sr-only">{label}</span>
        <div className="space-y-3">
          <div className="skeleton h-3 w-28" />
          <div className="skeleton h-10 w-2/3 max-w-md" />
          <div className="skeleton h-3 w-40" />
        </div>
        <div className="skeleton h-56 w-full rounded-3xl sm:h-64" />
        <div className="panel rounded-2xl p-4">
          <div className="skeleton h-3 w-20" />
          <div className="mt-4 space-y-3">
            <div className="skeleton h-11 w-full" />
            <div className="skeleton h-11 w-full" />
            <div className="skeleton h-11 w-3/4" />
          </div>
        </div>
      </div>
    </Shell>
  )
}

export function ErrorScreen({
  max = 'viewer',
  eyebrow = 'Connection problem',
  title = 'Couldn’t load this queue',
  body = 'The live data didn’t come through. Check your connection and try again.',
  message,
}: {
  max?: ShellWidth
  eyebrow?: string
  title?: string
  body?: string
  message?: string | null
}) {
  return (
    <Shell max={max}>
      <div className="panel relative overflow-hidden rounded-3xl p-7 sm:p-10">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl border border-rose/25 bg-rose/[0.08] text-rose">
            <Info aria-hidden className="size-4" />
          </span>
          <span className="eyebrow text-rose">{eyebrow}</span>
        </div>
        <h1 className="display mt-5 text-3xl sm:text-4xl">{title}</h1>
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-fog">{body}</p>
        {message && (
          <p className="mt-5 rounded-xl border border-white/10 bg-black/30 px-3.5 py-3 font-mono text-[11px] leading-relaxed text-fog">
            {message}
          </p>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="primary" onClick={() => window.location.reload()}>
            Try again
          </Button>
          <Link to="/" className={buttonClass('secondary')}>
            <ArrowLeft aria-hidden className="size-4" />
            Back home
          </Link>
        </div>
      </div>
    </Shell>
  )
}

export function MissingQueueScreen({
  max = 'viewer',
  title = 'No queue lives at this link.',
  body = 'The link may be incomplete, or the queue was never created. Ask the streamer for a fresh one.',
}: {
  max?: ShellWidth
  title?: string
  body?: string
}) {
  return (
    <Shell max={max}>
      <div className="panel relative overflow-hidden rounded-3xl p-7 text-center sm:p-10">
        <div className="mx-auto grid size-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-fog">
          <ShieldQuestionMark aria-hidden className="size-5" />
        </div>
        <p className="eyebrow mt-5">Queue not found</p>
        <h1 className="display mt-3 text-3xl sm:text-4xl">{title}</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-fog">{body}</p>
        <div className="mt-6 flex justify-center">
          <Link to="/" className={buttonClass('primary')}>
            Go home
          </Link>
        </div>
      </div>
    </Shell>
  )
}

export function NoManagementScreen({ viewerHref }: { viewerHref?: string }) {
  return (
    <Shell
      max="viewer"
      right={
        viewerHref ? (
          <Link
            to={viewerHref}
            className="rounded-lg px-2 py-1 text-xs text-fog transition-colors hover:text-chalk"
          >
            Viewer view
          </Link>
        ) : undefined
      }
    >
      <div className="panel relative overflow-hidden rounded-3xl p-7 text-center sm:p-10">
        <div className="mx-auto grid size-12 place-items-center rounded-2xl border border-amber/25 bg-amber/[0.08] text-amber">
          <Lock aria-hidden className="size-5" />
        </div>
        <p className="eyebrow mt-5">Owner console</p>
        <h1 className="display mt-3 text-3xl sm:text-4xl">
          No management access in this browser.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-fog">
          Managing a queue is tied to the browser that created it. Open this page on that
          device, in a normal window. Clearing site data also removes access.
        </p>
        <p className="mt-4 text-xs text-fog/80">The viewer link still works anywhere.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/" className={buttonClass('primary')}>
            Back home
          </Link>
          {viewerHref && (
            <Link to={viewerHref} className={buttonClass('secondary')}>
              Open viewer view
            </Link>
          )}
        </div>
      </div>
    </Shell>
  )
}
