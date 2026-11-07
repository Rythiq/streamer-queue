import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  ArrowRight,
  CircleSlash,
  Info,
  LogOut,
  Pause,
  Settings,
  UserPlus,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '../components/Button'
import { CopyButton } from '../components/CopyButton'
import { Corners } from '../components/Corners'
import { Equalizer } from '../components/Equalizer'
import { QueueList } from '../components/QueueList'
import { Shell } from '../components/Shell'
import { Spinner } from '../components/Spinner'
import { ErrorScreen, LoadingScreen, MissingQueueScreen } from '../components/States'
import { Stat } from '../components/Stat'
import { StatusPill } from '../components/StatusPill'
import { cn } from '../components/utils'
import { estimateWait } from '../lib/format'
import { useQueue } from '../lib/hooks'
import { shareUrl } from '../lib/queueApi'
import { getOwnedQueue } from '../lib/storage'
import type { QueueEntry } from '../lib/types'

interface JoinErrors {
  twitch?: string
  ingame?: string
}

export default function QueueView() {
  const { id = '' } = useParams()
  const queue = useQueue(id)
  const owned = useMemo(() => getOwnedQueue(id), [id])

  const [twitch, setTwitch] = useState('')
  const [ingame, setIngame] = useState('')
  const [joinErrors, setJoinErrors] = useState<JoinErrors>({})

  if (queue.loading) return <LoadingScreen label="Loading queue" />

  if (queue.notFound) {
    return (
      <MissingQueueScreen
        title="This queue doesn’t exist."
        body="The link may be incomplete, or the queue was never created. Ask the streamer for a fresh one."
      />
    )
  }

  if (!queue.meta) {
    return (
      <ErrorScreen
        title="Couldn’t load this queue"
        message={queue.error}
      />
    )
  }

  const meta = queue.meta
  const total = queue.entries.length
  const joined = queue.myPosition !== null
  const nowPlayingEntry = queue.entries.find((entry) => entry.id === meta.nowPlaying) ?? null
  const isMineUp = Boolean(
    queue.myEntryId && nowPlayingEntry && queue.myEntryId === nowPlayingEntry.id,
  )
  const closed = meta.status === 'closed'
  const paused = meta.status === 'paused'

  async function handleJoin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (closed) return

    const handle = twitch.trim().replace(/^@+/, '')
    const gameName = ingame.trim()
    const errors: JoinErrors = {}
    if (!handle) errors.twitch = 'Add your Twitch username.'
    if (!gameName) errors.ingame = 'Add your in-game name.'
    setJoinErrors(errors)
    if (errors.twitch || errors.ingame) return

    try {
      await queue.join(handle, gameName)
    } catch {
      // Action errors surface through queue.error.
    }
  }

  async function handleLeave() {
    try {
      await queue.leave()
    } catch {
      // Action errors surface through queue.error.
    }
  }

  return (
    <Shell
      max="viewer"
      footer={false}
      right={
        owned ? (
          <Link
            to={`/m/${id}`}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-fog transition-colors hover:text-cyan"
          >
            <Settings aria-hidden className="size-3.5" />
            <span className="hidden sm:inline">You manage this queue</span>
            <span className="sm:hidden">Manage</span>
          </Link>
        ) : undefined
      }
    >
      <div className="space-y-6 pb-10">
        <header>
          <div className="flex flex-wrap items-center gap-3">
            <p className="eyebrow">Live queue</p>
            <StatusPill status={meta.status} />
          </div>
          <h1 className="display mt-3 text-[clamp(2rem,6.4vw,3.4rem)]">{meta.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-fog">
            <span className="num">{total} in line</span>
            <span aria-hidden className="text-fog/25">
              ·
            </span>
            <span>Updates live — no refresh needed</span>
          </div>

          {meta.ownerName && (
            <div className="mt-3 inline-flex max-w-full items-center gap-2.5 rounded-xl border border-lime/20 bg-lime/[0.05] px-3.5 py-2.5">
              <UserPlus aria-hidden className="size-4 shrink-0 text-lime" />
              <p className="min-w-0 text-sm text-fog">
                Add <span className="font-semibold text-chalk">{meta.ownerName}</span> in game
              </p>
            </div>
          )}

          {queue.error && (
            <div
              role="alert"
              className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose/20 bg-rose/[0.06] px-3.5 py-3 text-xs leading-relaxed text-rose/90"
            >
              <Info aria-hidden className="mt-0.5 size-3.5 shrink-0" />
              <span>{queue.error}</span>
            </div>
          )}
        </header>

        {joined ? (
          <JoinedHero
            myPosition={queue.myPosition ?? 0}
            myTwitch={queue.myTwitch ?? ''}
            myIngame={queue.myIngame ?? ''}
            total={total}
            nowPlayingEntry={nowPlayingEntry}
            isMineUp={isMineUp}
            busy={queue.busy}
            closed={closed}
            paused={paused}
            onLeave={() => void handleLeave()}
          />
        ) : closed ? (
          <ClosedCard total={total} />
        ) : (
          <section className="panel relative overflow-hidden rounded-3xl">
            <Corners tone="lime" />
            <div className="relative p-5 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">Get in line</p>
                  <h2 className="display mt-3 text-3xl sm:text-4xl">Pull up a spot.</h2>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="eyebrow">In line</p>
                  <p className="num mt-1 text-2xl font-semibold text-chalk">{total}</p>
                </div>
              </div>

              <p className="mt-2 text-sm text-fog">
                Your position updates live. No account, no refresh.
              </p>

              {paused && <PausedNotice className="mt-4" />}

              <form onSubmit={(event) => void handleJoin(event)} noValidate>
                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="min-w-0">
                    <label htmlFor="viewer-twitch" className="eyebrow">
                      Twitch username
                    </label>
                    <input
                      id="viewer-twitch"
                      name="viewerTwitch"
                      type="text"
                      maxLength={32}
                      autoComplete="username"
                      autoCapitalize="none"
                      spellCheck={false}
                      placeholder="@yourhandle"
                      value={twitch}
                      onChange={(event) => {
                        setTwitch(event.target.value)
                        if (joinErrors.twitch) {
                          setJoinErrors((current) => ({ ...current, twitch: undefined }))
                        }
                      }}
                      className="field mt-2 h-12"
                      aria-invalid={Boolean(joinErrors.twitch)}
                      aria-describedby={joinErrors.twitch ? 'viewer-twitch-error' : undefined}
                    />
                    {joinErrors.twitch && (
                      <p
                        id="viewer-twitch-error"
                        role="alert"
                        className="mt-2 text-xs text-rose"
                      >
                        {joinErrors.twitch}
                      </p>
                    )}
                  </div>

                  <div className="min-w-0">
                    <label htmlFor="viewer-ingame" className="eyebrow">
                      In-game name
                    </label>
                    <input
                      id="viewer-ingame"
                      name="viewerIngame"
                      type="text"
                      maxLength={32}
                      autoComplete="off"
                      placeholder="Name in game"
                      value={ingame}
                      onChange={(event) => {
                        setIngame(event.target.value)
                        if (joinErrors.ingame) {
                          setJoinErrors((current) => ({ ...current, ingame: undefined }))
                        }
                      }}
                      className="field mt-2 h-12"
                      aria-invalid={Boolean(joinErrors.ingame)}
                      aria-describedby={joinErrors.ingame ? 'viewer-ingame-error' : undefined}
                    />
                    {joinErrors.ingame && (
                      <p
                        id="viewer-ingame-error"
                        role="alert"
                        className="mt-2 text-xs text-rose"
                      >
                        {joinErrors.ingame}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[11px] text-fog/65">
                    Both names show on the line. No account needed.
                  </p>
                  <Button
                    type="submit"
                    size="lg"
                    variant="primary"
                    disabled={queue.busy}
                    className="w-full shrink-0 sm:w-auto"
                  >
                    {queue.busy ? (
                      <Spinner />
                    ) : (
                      <ArrowRight aria-hidden className="size-4" />
                    )}
                    Join queue
                  </Button>
                </div>
              </form>
            </div>
          </section>
        )}

        <section className="panel overflow-hidden rounded-2xl">
          <header className="flex items-center justify-between gap-3 border-b border-white/5 px-4 py-3.5 sm:px-5">
            <div className="flex items-center gap-2.5">
              <h2 className="text-sm font-semibold">In line</h2>
              <span className="num rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[11px] text-fog">
                {total}
              </span>
            </div>
            <span className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-lime/90">
              <span aria-hidden className="dot-pulse size-1.5 rounded-full bg-lime text-lime" />
              Live
            </span>
          </header>
          <QueueList
            entries={queue.entries}
            myEntryId={queue.myEntryId}
            nowPlayingId={meta.nowPlaying}
          />
        </section>

        <section className="panel rounded-2xl p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-chalk">Invite someone</p>
              <p className="mt-1 text-xs text-fog">
                Send this link to chat. Their spot shows up instantly.
              </p>
            </div>
            <CopyButton value={shareUrl(id)} label="Copy invite link" />
          </div>
        </section>
      </div>
    </Shell>
  )
}

function JoinedHero({
  myPosition,
  myTwitch,
  myIngame,
  total,
  nowPlayingEntry,
  isMineUp,
  busy,
  closed,
  paused,
  onLeave,
}: {
  myPosition: number
  myTwitch: string
  myIngame: string
  total: number
  nowPlayingEntry: QueueEntry | null
  isMineUp: boolean
  busy: boolean
  closed: boolean
  paused: boolean
  onLeave: () => void
}) {
  const wait = estimateWait(myPosition)
  const isNext = myPosition === 1 && !isMineUp

  return (
    <section
      aria-label="Your position in the queue"
      className="panel relative overflow-hidden rounded-3xl"
    >
      <Corners tone={isMineUp ? 'lime' : 'cyan'} />
      {isMineUp && (
        <div
          aria-hidden
          className="absolute -right-24 -top-24 size-72 rounded-full bg-lime/10 blur-3xl"
        />
      )}
      <div className="relative p-5 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="eyebrow">{isMineUp ? 'Now playing' : 'Your position'}</p>
        </div>

        {isMineUp && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-lime/25 bg-lime/[0.08] px-4 py-3">
            <Equalizer className="mt-0.5 h-3 text-lime" />
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-lime">
                You’re up
              </p>
              <p className="mt-1 text-xs leading-relaxed text-lime-soft/85">
                The streamer called your name. Get in the lobby.
              </p>
            </div>
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-[minmax(0,1fr)_13rem] sm:items-end">
          <div className="min-w-0">
            <PositionNumber value={myPosition} />
            <p className="num mt-1 text-xs text-fog">of {total} in line</p>

            {isNext && (
              <p className="mt-3 text-xs font-medium text-lime/90">You’re next. Stay close.</p>
            )}
            {isMineUp && (
              <p className="mt-3 text-xs font-medium text-lime/90">
                You’re on the board right now.
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan/20 bg-cyan/[0.06] px-3 py-1.5 text-xs text-chalk">
                <span aria-hidden className="size-1.5 rounded-full bg-cyan" />@{myTwitch}
              </span>
              <span className="text-xs text-fog">
                in-game <span className="text-chalk/90">{myIngame}</span>
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="text-fog hover:bg-rose/10 hover:text-rose"
                disabled={busy}
                onClick={onLeave}
              >
                {busy ? <Spinner /> : <LogOut aria-hidden className="size-3.5" />}
                Leave queue
              </Button>
            </div>
          </div>

          <dl className="grid grid-cols-3 gap-3 border-t border-white/5 pt-4 sm:grid-cols-1 sm:gap-2.5 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
            <Stat label="In line" value={total} big />
            <Stat
              label="Now playing"
              value={isMineUp ? 'You' : nowPlayingEntry ? `@${nowPlayingEntry.twitch}` : '—'}
            />
            <Stat
              label="Est. wait"
              value={wait === null ? (isMineUp ? 'Now' : 'Next') : `~${wait} min`}
            />
          </dl>
        </div>

        {wait !== null && (
          <p className="mt-4 text-[10px] text-fog/60">Wait estimate assumes about 2 minutes per match.</p>
        )}

        {paused && <PausedNotice className="mt-4" joined />}
        {closed && <ClosedNotice className="mt-4" />}

        <p className="sr-only" aria-live="polite">
          {isMineUp
            ? 'You are up now.'
            : `You are number ${myPosition} of ${total} in line.`}
        </p>
      </div>
    </section>
  )
}

function PositionNumber({ value }: { value: number }) {
  const reduce = useReducedMotion()

  return (
    <span className="relative inline-flex items-baseline">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={reduce ? false : { opacity: 0, y: 16, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={reduce ? undefined : { opacity: 0, y: -16, filter: 'blur(6px)' }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="accent-text num inline-block text-[clamp(4.5rem,23vw,8.5rem)] font-bold leading-[0.8] tracking-[-0.07em]"
        >
          #{value}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

function ClosedCard({ total }: { total: number }) {
  return (
    <section className="panel relative overflow-hidden rounded-3xl" aria-label="Queue closed">
      <Corners tone="neutral" />
      <div className="relative p-6 text-center sm:p-9">
        <div className="mx-auto grid size-11 place-items-center rounded-2xl border border-rose/25 bg-rose/[0.08] text-rose">
          <CircleSlash aria-hidden className="size-5" />
        </div>
        <p className="eyebrow mt-4 text-rose">Closed</p>
        <h2 className="display mt-2 text-3xl sm:text-4xl">This queue is closed.</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-fog">
          The streamer isn’t taking new names right now. Ask them to reopen it.
        </p>
        {total > 0 && (
          <p className="num mt-4 text-[11px] text-fog/60">
            {total} still on the board
          </p>
        )}
      </div>
    </section>
  )
}

function PausedNotice({ className, joined = false }: { className?: string; joined?: boolean }) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border border-amber/20 bg-amber/[0.055] px-4 py-3',
        className,
      )}
    >
      <Pause aria-hidden className="mt-0.5 size-4 shrink-0 text-amber" />
      <p className="text-xs leading-relaxed text-amber/90">
        <span className="font-medium">Queue paused.</span>{' '}
        {joined
          ? 'Your spot is safe. Names get called when the streamer reopens it.'
          : 'You can still join — names get called when it reopens.'}
      </p>
    </div>
  )
}

function ClosedNotice({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border border-rose/20 bg-rose/[0.055] px-4 py-3',
        className,
      )}
    >
      <CircleSlash aria-hidden className="mt-0.5 size-4 shrink-0 text-rose" />
      <p className="text-xs leading-relaxed text-rose/90">
        <span className="font-medium">Queue closed.</span> Your spot is frozen until the
        streamer reopens it.
      </p>
    </div>
  )
}
