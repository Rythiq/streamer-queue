import { ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CopyButton } from './CopyButton'
import { cn } from './utils'

interface CopyFieldProps {
  label: string
  value: string
  openHref?: string
  className?: string
}

export function CopyField({ label, value, openHref, className }: CopyFieldProps) {
  return (
    <div className={cn(className)}>
      <span className="eyebrow">{label}</span>
      <div className="mt-2 flex items-center gap-1.5 rounded-xl border border-white/10 bg-black/30 p-1.5 pl-3">
        <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-fog" title={value}>
          {value}
        </span>
        {openHref && (
          <Link
            to={openHref}
            aria-label={`Open ${label}`}
            title={`Open ${label}`}
            className="grid size-9 shrink-0 place-items-center rounded-lg text-fog transition-colors hover:bg-white/[0.06] hover:text-chalk"
          >
            <ExternalLink aria-hidden className="size-4" />
          </Link>
        )}
        <CopyButton value={value} label="Copy" iconOnly variant="secondary" size="sm" />
      </div>
    </div>
  )
}
