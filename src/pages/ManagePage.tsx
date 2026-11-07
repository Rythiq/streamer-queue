import {
  Check,
  ExternalLink,
  Info,
  Lock,
  Pencil,
  Share2,
  Shield,
  Trash,
  X,
} from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AdminQueueList } from '../components/AdminQueueList'
import { Button } from '../components/Button'
import { buttonClass } from '../components/buttonStyles'
import { CopyField } from '../components/CopyField'
import { RelativeTime } from '../components/RelativeTime'
import { Shell } from '../components/Shell'
import { ErrorScreen, LoadingScreen, MissingQueueScreen, NoManagementScreen } from '../components/States'
import { Stat } from '../components/Stat'
import { StatusControl } from '../components/StatusControl'
import { StatusPill } from '../components/StatusPill'
import { useQueueAdmin } from '../lib/hooks'
import { shareUrl } from '../lib/queueApi'
import { getOwnedQueue } from '../lib/storage'
import type { QueueStatus } from '../lib/types'

const statusLabels: Record<QueueStatus, string> = {
  open: 'Open',
  paused: 'Paused',
  closed: 'Closed',
}

const statusHints: Record<QueueStatus, string> = {
  open: 'Viewers can join and their positions update live.',
  paused: 'New names are accepted, but hold off calling them until you reopen.',
  closed: 'No new names. Existing spots stay put until you reopen.',
}

export default function ManagePage() {
  const { id = '' } = useParams()
  const owned = useMemo(() => getOwnedQueue(id), [id])

  if (!owned) {
    return <NoManagementScreen viewerHref={id ? `/q/${id}` : undefined} />
  }

  return <ManageConsole key={id} id={id} adminKey={owned.adminKey} fallbackName={owned.name} />
}

function ManageConsole({
  id,
  adminKey,
  fallbackName,
}: {
  id: string
  adminKey: string
  fallbackName: string
}) {
  const admin = useQueueAdmin(id, adminKey)
  const meta = admin.meta

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(fallbackName)
  const [confirmClear, setConfirmClear] = useState(false)
  const committing = useRef(false)
  const nameInput = useRef<HTMLInputElement>(null)

  const keyRejected = Boolean(
    admin.error &&
      /admin key|permission|denied|unauthor|not allowed|management access/i.test(admin.error),
  )

  if (admin.loading) return <LoadingScreen max="wide" label="Loading owner console" />

  if (admin.notFound) {
    return (
      <MissingQueueScreen
        max="wide"
        title="This queue doesn’t exist."
        body="There’s nothing to manage at this address. Check the queue still exists, or start a new one from the home page."
      />
    )
  }

  if (keyRejected) {
    return (
      <ErrorScreen
        max="wide"
        eyebrow="Owner access"
        title="This browser can’t manage this queue."
        body="The saved management key was rejected. Access may have been reset, or the queue was recreated. Start a fresh queue from the home page if this keeps happening."
        message={admin.error}
      />
    )
  }

  if (!meta) {
    return (
      <ErrorScreen
        max="wide"
        title="Couldn’t load the owner console"
        message={admin.error}
      />
    )
  }

  const nowPlayingEntry = admin.entries.find((entry) => entry.id === meta.nowPlaying) ?? null

  function startEdit() {
    if (!meta) return
    committing.current = false
    setDraft(meta.name)
    setEditing(true)
    window.requestAnimationFrame(() => nameInput.current?.select())
  }

  function cancelEdit() {
    if (!meta) return
    setEditing(false)
    setDraft(meta.name)
  }

  async function saveName() {
    if (!meta || !editing || committing.current) return
    const clean = draft.trim()
    committing.current = true
    setEditing(false)

    if (!clean || clean === meta.name) {
      setDraft(meta.name)
      committing.current = false
      return
    }

    try {
      await admin.setName(clean)
    } catch {
      setDraft(meta.name)
    } finally {
      committing.current = false
    }
  }

  function run(action: () => Promise<void>) {
    void action().catch(() => {
      // Errors surface through admin.error.
    })
  }

  async function handleClear() {
    if (admin.busy) return
    setConfirmClear(false)
    try {
      await admin.clearQueue()
    } catch {
      // Errors surface through admin.error.
    }
  }

  return (
    <Shell
      max="wide"
      footer={false}
      right={
        <Link to={`/q/${id}`} className={buttonClass('ghost', 'sm')}>
          <ExternalLink aria-hidden className="size-3.5" />
          <span className="hidden sm:inline">Viewer view</span>
          <span className="sm:hidden">Viewer</span>
        </Link>
      }
    >
      <div className="space-y-6 pb-10">
        <header>
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg border border-lime/25 bg-lime/[0.07] text-lime">
              <Shield aria-hidden className="size-3.5" />
            </span>
            <span className="eyebrow">Owner console</span>
            <StatusPill status={meta.status} className="ml-auto" />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {editing ? (
              <form
                className="flex w-full flex-wrap items-center gap-2"
                onSubmit={(event) => {
                  event.preventDefault()
                  void saveName()
                }}
              >
                <input
                  ref={nameInput}
                  autoFocus
                  type="text"
                  maxLength={60}
                  value={draft}
                  aria-label="Queue name"
                  onChange={(event) => setDraft(event.target.value)}
                  onFocus={(event) => event.currentTarget.select()}
                  onBlur={() => void saveName()}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') {
                      event.preventDefault()
                      cancelEdit()
                    }
                  }}
                  className="field h-11 w-full max-w-xl text-lg font-semibold"
                />
                <div className="flex items-center gap-1.5">
                  <Button
                    type="submit"
                    size="sm"
                    variant="primary"
                    disabled={admin.busy}
                    onMouseDown={(event) => event.preventDefault()}
                  >
                    <Check aria-hidden className="size-3.5" />
                    Save
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={cancelEdit}
                  >
                    <X aria-hidden className="size-3.5" />
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <h1 className="display min-w-0 text-[clamp(1.9rem,5.4vw,3rem)]">
                  {meta.name}
                </h1>
                <button
                  type="button"
                  onClick={startEdit}
                  aria-label="Rename queue"
                  title="Rename queue"
                  className="rounded-lg p-2 text-fog transition-colors hover:bg-white/[0.06] hover:text-chalk"
                >
                  <Pencil aria-hidden className="size-4" />
                </button>
              </>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-fog/80">
            <span>
              in-game <span className="text-chalk/85">{meta.ownerName}</span>
            </span>
            <span aria-hidden className="text-fog/25">
              ·
            </span>
            <span className="num text-fog/55">#{id.slice(0, 8)}</span>
            <span aria-hidden className="text-fog/25">
              ·
            </span>
            <span>
              created <RelativeTime ts={meta.createdAt} />
            </span>
            <span aria-hidden className="text-fog/25">
              ·
            </span>
            <span>live for everyone with the viewer link</span>
          </div>

          {admin.error && (
            <div
              role="alert"
              className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose/20 bg-rose/[0.06] px-3.5 py-3 text-xs leading-relaxed text-rose/90"
            >
              <Info aria-hidden className="mt-0.5 size-3.5 shrink-0" />
              <span>{admin.error}</span>
            </div>
          )}
        </header>

        <section className="panel rounded-2xl p-4 sm:p-5">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_24rem] lg:items-center">
            <dl className="grid grid-cols-3 gap-3 sm:gap-6">
              <Stat label="In line" value={admin.entries.length} big />
              <Stat
                label="Now playing"
                value={nowPlayingEntry ? `@${nowPlayingEntry.twitch}` : 'Nobody'}
                hint={nowPlayingEntry ? `in-game ${nowPlayingEntry.ingame}` : undefined}
              />
              <Stat label="Status" value={statusLabels[meta.status]} />
            </dl>

            <div className="border-t border-white/5 pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
              <p className="eyebrow mb-2">Queue control</p>
              <StatusControl
                value={meta.status}
                busy={admin.busy}
                onChange={(status) => run(() => admin.setStatus(status))}
              />
              <p className="mt-2 text-[11px] leading-relaxed text-fog/70">
                {statusHints[meta.status]}
              </p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-start">
          <section className="panel overflow-hidden rounded-2xl">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 px-4 py-3.5 sm:px-5">
              <div className="flex items-center gap-2.5">
                <h2 className="text-sm font-semibold">In line</h2>
                <span className="num rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[11px] text-fog">
                  {admin.entries.length}
                </span>
                <span aria-hidden className="dot-pulse size-1.5 rounded-full bg-lime text-lime" />
              </div>

              {admin.entries.length > 0 && !confirmClear && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-fog hover:bg-rose/10 hover:text-rose"
                  disabled={admin.busy}
                  onClick={() => setConfirmClear(true)}
                >
                  <Trash aria-hidden className="size-3.5" />
                  Clear queue
                </Button>
              )}
            </header>

            {confirmClear && (
              <div className="border-b border-rose/15 bg-rose/[0.05] px-4 py-3 sm:px-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs leading-relaxed text-rose/90">
                    Clear all {admin.entries.length} names? This resets the line for everyone.
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={admin.busy}
                      onClick={() => void handleClear()}
                    >
                      Yes, clear it
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setConfirmClear(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <AdminQueueList
              entries={admin.entries}
              nowPlayingId={meta.nowPlaying}
              busy={admin.busy}
              onSetNowPlaying={(entryId) => run(() => admin.setNowPlaying(entryId))}
              onKick={(entryId) => run(() => admin.removeEntry(entryId))}
            />
          </section>

          <div className="space-y-5">
            <section className="panel rounded-2xl p-4 sm:p-5">
              <div className="flex items-center gap-2">
                <Share2 aria-hidden className="size-4 text-lime" />
                <h2 className="text-sm font-semibold">Share</h2>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-fog">
                Send viewers the link. Management stays in this browser.
              </p>

              <div className="mt-4">
                <CopyField
                  label="Viewer link"
                  value={shareUrl(id)}
                  openHref={`/q/${id}`}
                />
              </div>

              <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber/20 bg-amber/[0.05] p-3.5">
                <Lock aria-hidden className="mt-0.5 size-4 shrink-0 text-amber" />
                <p className="text-[11px] leading-relaxed text-amber/90">
                  <span className="font-medium text-chalk">Management is browser-bound.</span>{' '}
                  This console only works in the browser that created the queue. It won’t open
                  from another device or a private window, and clearing site data removes
                  access.
                </p>
              </div>

              <Link to={`/q/${id}`} className={buttonClass('secondary', 'sm', 'mt-4')}>
                <ExternalLink aria-hidden className="size-3.5" />
                Open viewer view
              </Link>
            </section>

            <section className="panel rounded-2xl p-4 sm:p-5">
              <p className="eyebrow">On stream</p>
              <ul className="mt-3 space-y-2 text-xs leading-relaxed text-fog">
                <li>
                  <span className="text-chalk/90">Set up</span> highlights one name on every
                  open viewer screen.
                </li>
                <li>
                  <span className="text-chalk/90">Kick</span> removes a name without moving
                  anyone else.
                </li>
                <li>
                  <span className="text-chalk/90">Clear</span> resets the whole line. Share the
                  link again after.
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </Shell>
  )
}
