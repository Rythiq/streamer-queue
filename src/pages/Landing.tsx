import { motion, useReducedMotion } from 'framer-motion'
import {
  ArrowRight,
  ArrowUpRight,
  Copy,
  Info,
  ListOrdered,
  Plus,
  Radio,
  Settings,
  Share2,
  Trash,
} from 'lucide-react'
import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { buttonClass } from '../components/buttonStyles'
import { Corners } from '../components/Corners'
import { Equalizer } from '../components/Equalizer'
import { RelativeTime } from '../components/RelativeTime'
import { Shell } from '../components/Shell'
import { Spinner } from '../components/Spinner'
import { StatusPill } from '../components/StatusPill'
import { cn } from '../components/utils'
import { createQueue, isDemoMode } from '../lib/queueApi'
import { listOwnedQueues, removeOwnedQueue } from '../lib/storage'
import type { OwnedQueue } from '../lib/storage'

const steps = [
  {
    title: 'Create it',
    body: 'Name the queue and you’re live. The owner console opens straight away.',
    icon: Plus,
  },
  {
    title: 'Share one link',
    body: 'Drop the viewer link in chat or your panels. They join with a Twitch handle and in-game name.',
    icon: Share2,
  },
  {
    title: 'Call the next handle',
    body: 'Hit set as now playing. Every open viewer screen updates in place.',
    icon: Radio,
  },
]

const previewRows = [
  { twitch: 'shibuya_ace', ingame: 'Shibuya', now: true, you: false },
  { twitch: 'mothwing', ingame: 'Moth', now: false, you: false },
  { twitch: 'kettlerun', ingame: 'Kettle', now: false, you: false },
  { twitch: 'nova_kid', ingame: 'Nova', now: false, you: true },
]

export default function Landing() {
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const nameInput = useRef<HTMLInputElement>(null)
  const ownerInput = useRef<HTMLInputElement>(null)

  const [name, setName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [owned, setOwned] = useState<OwnedQueue[]>(() => listOwnedQueues())
  const [pendingRemove, setPendingRemove] = useState<string | null>(null)

  function scrollToHow() {
    const behavior: ScrollBehavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'auto'
      : 'smooth'
    document.getElementById('how')?.scrollIntoView({ behavior, block: 'start' })
  }

  function focusCreate() {
    const behavior: ScrollBehavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'auto'
      : 'smooth'
    document.getElementById('create')?.scrollIntoView({ behavior, block: 'center' })
    nameInput.current?.focus({ preventScroll: true })
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const clean = name.trim()
    const cleanOwner = ownerName.trim()
    if (!clean) {
      setError('Give your queue a name first.')
      nameInput.current?.focus()
      return
    }
    if (!cleanOwner) {
      setError('Add your in-game name so viewers know who to add.')
      ownerInput.current?.focus()
      return
    }

    setPending(true)
    setError(null)
    try {
      const created = await createQueue(clean, cleanOwner)
      navigate(`/m/${created.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.')
      setPending(false)
    }
  }

  function forget(id: string) {
    removeOwnedQueue(id)
    setOwned(listOwnedQueues())
    setPendingRemove(null)
  }

  return (
    <Shell
      max="wide"
      right={
        <button
          type="button"
          onClick={scrollToHow}
          className="rounded-lg px-2 py-1 text-xs text-fog transition-colors hover:text-chalk"
        >
          How it works
        </button>
      }
    >
      {isDemoMode && (
        <div className="mt-1 flex items-start gap-3 rounded-xl border border-lime/15 bg-lime/[0.035] px-4 py-3 sm:items-center">
          <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-lime sm:mt-0" />
          <p className="text-xs leading-relaxed text-fog">
            <span className="font-medium text-chalk">Demo mode.</span> Queues live in this browser
            only, so links won’t open on other devices yet. Connect Firebase to go live — the
            steps are in <span className="font-mono text-lime/90">SETUP.md</span>.
          </p>
        </div>
      )}

      <section className="relative isolate grid grid-cols-1 items-center gap-12 overflow-hidden pb-16 pt-8 sm:pt-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:pb-24 lg:pt-16">
        <div aria-hidden className="aurora -z-10 opacity-80" />
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
            <span className="dot-pulse size-1.5 rounded-full bg-lime text-lime" />
            <span className="eyebrow text-fog">Live 1v1 queue for Twitch &amp; YouTube</span>
          </div>

          <h1 className="display mt-6 text-[clamp(2.7rem,7.2vw,4.9rem)]">
            Your 1v1 line,
            <br />
            <span className="accent-text">live on stream.</span>
          </h1>

          <p className="mt-5 max-w-lg text-base leading-relaxed text-fog sm:text-[17px]">
            NextUp gives every viewer one link to join, a clear spot in the queue, and both
            their names on the board. You call the next handle; the page keeps score.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button size="lg" variant="primary" onClick={focusCreate}>
              Create a queue
              <ArrowRight aria-hidden className="size-4" />
            </Button>
            <button
              type="button"
              onClick={scrollToHow}
              className={buttonClass('secondary', 'lg')}
            >
              How it works
            </button>
          </div>

          <p className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.18em] text-fog/65">
            <span>No accounts</span>
            <span aria-hidden className="text-fog/25">/</span>
            <span>No installs</span>
            <span aria-hidden className="text-fog/25">/</span>
            <span>Just links</span>
          </p>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
          className="relative"
        >
          <div
            aria-hidden
            className="absolute -inset-8 rounded-[2.5rem] bg-[radial-gradient(50%_50%_at_50%_42%,rgba(201,255,63,0.11),transparent_72%)] blur-2xl"
          />
          <div
            aria-hidden
            className="panel relative mx-auto w-full max-w-md overflow-hidden rounded-3xl lg:-rotate-[1.4deg]"
          >
            <Corners tone="lime" />
            <div className="relative p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="eyebrow">Viewer screen</span>
                <StatusPill status="open" />
              </div>

              <div className="mt-4 flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-chalk/85">
                    Friday night 1v1s
                  </p>
                  <p className="mt-0.5 text-[10px] text-lime/75">Add nightowl in game</p>
                  <div className="mt-2 flex items-end gap-2">
                    <span className="accent-text num text-6xl font-bold leading-[0.8] tracking-[-0.07em]">
                      #4
                    </span>
                    <span className="num pb-1 text-[11px] text-fog">of 12 in line</span>
                  </div>
                </div>
                <span className="mb-1 hidden shrink-0 rounded-full border border-cyan/20 bg-cyan/[0.07] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-cyan sm:inline-flex">
                  You
                </span>
              </div>

              <p className="mt-3 text-[11px] text-fog/80">
                ≈ 8 min wait · assuming 2 min per match
              </p>

              <div className="mt-5 overflow-hidden rounded-xl border border-white/8">
                {previewRows.map((row, index) => (
                  <div
                    key={row.twitch}
                    className={cn(
                      'flex items-start gap-3 border-b border-white/5 px-3 py-2 last:border-b-0',
                      row.now && 'bg-lime/[0.06]',
                      row.you && !row.now && 'bg-white/[0.035]',
                    )}
                  >
                    <span
                      className={cn(
                        'num w-5 pt-0.5 text-right text-[10px]',
                        row.now ? 'text-lime' : row.you ? 'text-cyan' : 'text-fog/60',
                      )}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            'truncate text-xs',
                            row.now ? 'font-semibold text-chalk' : 'text-chalk/85',
                          )}
                        >
                          @{row.twitch}
                        </span>
                        {row.now && (
                          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-lime/25 bg-lime/10 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.14em] text-lime">
                            <Equalizer className="h-2" />
                            Now playing
                          </span>
                        )}
                        {row.you && !row.now && (
                          <span className="shrink-0 rounded-full border border-cyan/25 bg-cyan/10 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.14em] text-cyan">
                            You
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-[9px] text-fog/60">
                        in-game {row.ingame}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] text-fog">
                  <Copy aria-hidden className="size-3.5" />
                  Copy invite link
                </span>
                <span className="num text-[10px] uppercase tracking-[0.16em] text-fog/60">
                  12 in line
                </span>
              </div>
            </div>
          </div>
          <p className="mt-4 text-center text-[11px] text-fog/60">What your viewers see</p>
        </motion.div>
      </section>

      <motion.section
        id="create"
        className="scroll-mt-24"
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.12, ease: 'easeOut' }}
      >
        <div className="panel overflow-hidden rounded-3xl">
          <Corners tone="cyan" />
          <div className="relative grid grid-cols-1 gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:gap-10 lg:p-8">
            <div>
              <p className="eyebrow">Start a queue</p>
              <h2 className="display mt-3 text-2xl sm:text-3xl">Name it, share it, run it.</h2>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-fog">
                You’ll get a viewer link right away. The owner console stays tied to this
                browser.
              </p>
            </div>

            <form onSubmit={(event) => void handleCreate(event)} noValidate>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="min-w-0">
                  <label htmlFor="queue-name" className="eyebrow">
                    Queue name
                  </label>
                  <input
                    ref={nameInput}
                    id="queue-name"
                    name="queueName"
                    type="text"
                    maxLength={60}
                    autoComplete="off"
                    placeholder="Friday night 1v1s"
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value)
                      if (error) setError(null)
                    }}
                    className="field mt-2 h-12"
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? 'create-error' : 'create-hint'}
                  />
                </div>
                <div className="min-w-0">
                  <label htmlFor="owner-name" className="eyebrow">
                    Your in-game name
                  </label>
                  <input
                    ref={ownerInput}
                    id="owner-name"
                    name="ownerName"
                    type="text"
                    maxLength={32}
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="nightowl"
                    value={ownerName}
                    onChange={(event) => {
                      setOwnerName(event.target.value)
                      if (error) setError(null)
                    }}
                    className="field mt-2 h-12"
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? 'create-error' : 'create-hint'}
                  />
                </div>
              </div>

              {error && (
                <p id="create-error" role="alert" className="mt-2 text-xs text-rose">
                  {error}
                </p>
              )}

              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  type="submit"
                  size="lg"
                  variant="primary"
                  disabled={pending}
                  className="w-full shrink-0 sm:w-auto"
                >
                  {pending ? (
                    <Spinner />
                  ) : (
                    <ArrowRight aria-hidden className="size-4" />
                  )}
                  {pending ? 'Creating…' : 'Create queue'}
                </Button>
                <p id="create-hint" className="text-[11px] text-fog/70">
                  Viewers see this so they can add you.
                </p>
              </div>
            </form>
          </div>
        </div>
      </motion.section>

      <section id="how" className="scroll-mt-10 pt-16 sm:pt-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">How it works</p>
            <h2 className="display mt-3 text-3xl sm:text-4xl">From link to line in a minute.</h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-fog">
            No dashboard to learn. No viewer accounts to chase.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title} className="panel rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <span className="num text-xs text-lime/80">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <step.icon aria-hidden className="size-4 text-fog/50" />
              </div>
              <h3 className="mt-8 text-[15px] font-semibold text-chalk">{step.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-fog">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="pt-16 sm:pt-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Owner console</p>
            <h2 className="display mt-3 text-3xl sm:text-4xl">Your queues</h2>
          </div>
          {owned.length > 0 && (
            <span className="num text-xs text-fog/70">{owned.length} saved</span>
          )}
        </div>

        <div className="mt-6">
          {owned.length === 0 ? (
            <div className="panel rounded-2xl px-6 py-12 text-center">
              <div className="mx-auto grid size-11 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-fog">
                <ListOrdered aria-hidden className="size-5" />
              </div>
              <p className="mt-4 text-sm font-medium text-chalk">
                No queues on this browser yet.
              </p>
              <p className="mt-1 text-xs text-fog">
                Name one above and your owner console opens right away.
              </p>
              <Button className="mt-5" variant="outline" onClick={focusCreate}>
                Create your first queue
              </Button>
            </div>
          ) : (
            <>
              <div className="panel divide-y divide-white/5 overflow-hidden rounded-2xl">
                {owned.map((queue) => (
                  <div
                    key={queue.id}
                    className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-chalk">{queue.name}</p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-fog/75">
                        <span>
                          created <RelativeTime ts={queue.createdAt} />
                        </span>
                        <span aria-hidden className="text-fog/25">
                          ·
                        </span>
                        <span className="num text-fog/55">#{queue.id.slice(0, 6)}</span>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {pendingRemove === queue.id ? (
                        <>
                          <span className="mr-1 text-[11px] text-fog">Forget it here?</span>
                          <Button size="sm" variant="danger" onClick={() => forget(queue.id)}>
                            Forget
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setPendingRemove(null)}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Link
                            to={`/q/${queue.id}`}
                            className={buttonClass('ghost', 'sm')}
                          >
                            Viewer
                            <ArrowUpRight aria-hidden className="size-3.5" />
                          </Link>
                          <Link
                            to={`/m/${queue.id}`}
                            className={buttonClass('secondary', 'sm')}
                          >
                            <Settings aria-hidden className="size-3.5" />
                            Manage
                          </Link>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-fog/70 hover:bg-rose/10 hover:text-rose"
                            aria-label={`Forget ${queue.name} in this browser`}
                            title="Forget this queue (removes local access)"
                            onClick={() => setPendingRemove(queue.id)}
                          >
                            <Trash aria-hidden className="size-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-fog/60">
                Removing a queue only forgets it in this browser. It doesn’t remove the live
                queue for viewers.
              </p>
            </>
          )}
        </div>
      </section>

      <div className="mt-16 flex items-start gap-2.5 rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3 sm:mt-24">
        <Info aria-hidden className="mt-0.5 size-3.5 shrink-0 text-fog/60" />
        <p className="text-[11px] leading-relaxed text-fog/70">
          There’s no public list of queues. A queue only opens when someone has its link.
        </p>
      </div>
    </Shell>
  )
}
