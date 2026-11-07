import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Play, Trash, Users } from 'lucide-react'
import type { QueueEntry } from '../lib/types'
import { Button } from './Button'
import { Equalizer } from './Equalizer'
import { RelativeTime } from './RelativeTime'
import { cn } from './utils'

interface AdminQueueListProps {
  entries: QueueEntry[]
  nowPlayingId: string
  busy: boolean
  onSetNowPlaying: (entryId: string) => void
  onKick: (entryId: string) => void
}

export function AdminQueueList({
  entries,
  nowPlayingId,
  busy,
  onSetNowPlaying,
  onKick,
}: AdminQueueListProps) {
  const reduce = useReducedMotion()

  if (entries.length === 0) {
    return (
      <div className="px-5 py-12 text-center">
        <div className="mx-auto grid size-10 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-fog">
          <Users aria-hidden className="size-4" />
        </div>
        <p className="mt-3 text-sm font-medium text-chalk">The line is empty.</p>
        <p className="mt-1 text-xs text-fog">
          Share the viewer link — new names land here live.
        </p>
      </div>
    )
  }

  return (
    <ol aria-label="Queue order" className="divide-y divide-white/5">
      <AnimatePresence initial={false}>
        {entries.map((entry, index) => {
          const isNow = entry.id === nowPlayingId
          const actionLabel = isNow
            ? `Clear now playing for ${entry.twitch}`
            : `Set ${entry.twitch} as now playing`
          return (
            <motion.li
              key={entry.id}
              layout={!reduce}
              initial={reduce ? false : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className={cn(
                'relative flex items-center gap-3 px-4 py-3 sm:px-5',
                isNow && 'bg-lime/[0.05]',
              )}
            >
              {isNow && (
                <span aria-hidden className="absolute inset-y-0 left-0 w-0.5 bg-lime" />
              )}
              <span
                className={cn(
                  'num w-7 shrink-0 text-right text-sm',
                  isNow ? 'text-lime' : 'text-fog/65',
                )}
              >
                {String(index + 1).padStart(2, '0')}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-[15px] text-chalk/90">
                    @{entry.twitch}
                  </span>
                  {isNow && (
                    <span className="hidden shrink-0 rounded-full border border-lime/25 bg-lime/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-lime sm:inline-flex">
                      Now playing
                    </span>
                  )}
                </div>
                <p className="mt-0.5 truncate text-[11px] text-fog/75">
                  in-game <span className="text-fog/90">{entry.ingame}</span>
                  <span aria-hidden className="text-fog/25"> · </span>
                  joined <RelativeTime ts={entry.joinedAt} />
                </p>
              </div>

              <div className="ml-auto flex shrink-0 items-center gap-1">
                <Button
                  variant={isNow ? 'outline' : 'ghost'}
                  size="sm"
                  disabled={busy}
                  aria-pressed={isNow}
                  aria-label={actionLabel}
                  title={actionLabel}
                  onClick={() => onSetNowPlaying(entry.id)}
                >
                  {isNow ? (
                    <Equalizer className="h-3" />
                  ) : (
                    <Play aria-hidden className="size-3.5" />
                  )}
                  <span className="hidden sm:inline">
                    {isNow ? 'Now playing' : 'Set up'}
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={busy}
                  aria-label={`Kick @${entry.twitch} from the queue`}
                  title={`Kick @${entry.twitch}`}
                  className="text-fog hover:bg-rose/10 hover:text-rose"
                  onClick={() => onKick(entry.id)}
                >
                  <Trash aria-hidden className="size-4" />
                </Button>
              </div>
            </motion.li>
          )
        })}
      </AnimatePresence>
    </ol>
  )
}
