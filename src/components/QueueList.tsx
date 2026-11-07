import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Users } from 'lucide-react'
import type { QueueEntry } from '../lib/types'
import { Equalizer } from './Equalizer'
import { cn } from './utils'

interface QueueListProps {
  entries: QueueEntry[]
  myEntryId: string | null
  nowPlayingId: string
}

export function QueueList({ entries, myEntryId, nowPlayingId }: QueueListProps) {
  const reduce = useReducedMotion()

  if (entries.length === 0) {
    return (
      <div className="px-5 py-12 text-center">
        <div className="mx-auto grid size-10 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-fog">
          <Users aria-hidden className="size-4" />
        </div>
        <p className="mt-3 text-sm font-medium text-chalk">Nobody’s in line yet.</p>
        <p className="mt-1 text-xs text-fog">Be the first name on the board.</p>
      </div>
    )
  }

  return (
    <ol aria-label="Queue order" className="divide-y divide-white/5">
      <AnimatePresence initial={false}>
        {entries.map((entry, index) => {
          const isMe = entry.id === myEntryId
          const isNow = entry.id === nowPlayingId
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
                isNow && 'bg-lime/[0.055]',
                isMe && !isNow && 'bg-white/[0.035]',
              )}
            >
              {isNow && (
                <span aria-hidden className="absolute inset-y-0 left-0 w-0.5 bg-lime" />
              )}
              <span
                className={cn(
                  'num w-7 shrink-0 text-right text-sm',
                  isNow ? 'text-lime' : isMe ? 'text-cyan' : 'text-fog/65',
                )}
              >
                {String(index + 1).padStart(2, '0')}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'truncate text-[15px]',
                      isNow ? 'font-semibold text-chalk' : 'text-chalk/90',
                    )}
                  >
                    @{entry.twitch}
                  </span>
                  {isNow && (
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-lime/25 bg-lime/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-lime">
                      <Equalizer className="h-2.5" />
                      Now playing
                    </span>
                  )}
                  {isMe && (
                    <span className="shrink-0 rounded-full border border-cyan/25 bg-cyan/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-cyan">
                      You
                    </span>
                  )}
                </div>
                <p className="mt-0.5 truncate text-xs text-fog/70">
                  in-game <span className="text-fog/90">{entry.ingame}</span>
                </p>
              </div>
            </motion.li>
          )
        })}
      </AnimatePresence>
    </ol>
  )
}
