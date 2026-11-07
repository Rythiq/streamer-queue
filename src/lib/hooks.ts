import { useCallback, useEffect, useMemo, useState } from 'react'
import { randomId } from './ids'
import { backend } from './queueApi'
import { clearJoined, getJoined, setJoined } from './storage'
import type { QueueEntry, QueueMeta, QueueSnapshot, QueueStatus } from './types'

const MAX_HANDLE = 32

function useSnapshot(id: string) {
  const [snap, setSnap] = useState<QueueSnapshot | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setSnap(null)
    setError(null)
    if (!id) return
    return backend.subscribe(
      id,
      (next) => setSnap(next),
      (err) => setError(err.message),
    )
  }, [id])

  return { snap, error }
}

function activeEntries(snap: QueueSnapshot | null): QueueEntry[] {
  if (!snap?.meta) return []
  const removed = snap.meta.removed ?? {}
  const resetAt = snap.meta.resetAt ?? 0
  return snap.entries
    .filter(
      (entry) => !snap.left[entry.id] && !removed[entry.id] && entry.joinedAt >= resetAt,
    )
    .sort((a, b) => a.joinedAt - b.joinedAt || a.id.localeCompare(b.id))
}

function toMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}

function cleanHandle(value: string): string {
  return value.trim().replace(/^@+/, '').slice(0, MAX_HANDLE)
}

export interface QueueView {
  loading: boolean
  notFound: boolean
  error: string | null
  meta: QueueMeta | null
  entries: QueueEntry[]
  myEntryId: string | null
  myPosition: number | null
  myTwitch: string | null
  myIngame: string | null
  busy: boolean
  join: (twitch: string, ingame: string) => Promise<void>
  leave: () => Promise<void>
}

export function useQueue(id: string): QueueView {
  const { snap, error } = useSnapshot(id)
  const [mine, setMine] = useState(() => getJoined(id))
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    setMine(getJoined(id))
  }, [id])

  const entries = useMemo(() => activeEntries(snap), [snap])
  const myIndex = mine ? entries.findIndex((entry) => entry.id === mine.entryId) : -1
  const myEntry = myIndex >= 0 ? entries[myIndex] : null

  const join = useCallback(
    async (twitch: string, ingame: string) => {
      const handle = cleanHandle(twitch)
      const gameName = ingame.trim().slice(0, MAX_HANDLE)
      if (!handle) throw new Error('Add your Twitch username')
      if (!gameName) throw new Error('Add your in-game name')

      setBusy(true)
      setActionError(null)
      try {
        const entryId = randomId(16)
        const token = randomId(32)
        await backend.joinQueue(id, entryId, handle, gameName, token)
        setJoined(id, { entryId, token })
        setMine({ entryId, token })
      } catch (err) {
        setActionError(toMessage(err))
        throw err
      } finally {
        setBusy(false)
      }
    },
    [id],
  )

  const leave = useCallback(async () => {
    if (!mine) return
    setBusy(true)
    setActionError(null)
    try {
      await backend.leaveQueue(id, mine.entryId, mine.token)
      clearJoined(id)
      setMine(null)
    } catch (err) {
      setActionError(toMessage(err))
      throw err
    } finally {
      setBusy(false)
    }
  }, [id, mine])

  return {
    loading: Boolean(id) && snap === null && error === null,
    notFound: snap !== null && !snap.exists,
    error: error ?? actionError,
    meta: snap?.meta ?? null,
    entries,
    myEntryId: myEntry?.id ?? null,
    myPosition: myIndex >= 0 ? myIndex + 1 : null,
    myTwitch: myEntry?.twitch ?? null,
    myIngame: myEntry?.ingame ?? null,
    busy,
    join,
    leave,
  }
}

export interface QueueAdminView {
  loading: boolean
  notFound: boolean
  error: string | null
  meta: QueueMeta | null
  entries: QueueEntry[]
  busy: boolean
  setName: (name: string) => Promise<void>
  setStatus: (status: QueueStatus) => Promise<void>
  setNowPlaying: (entryId: string) => Promise<void>
  removeEntry: (entryId: string) => Promise<void>
  clearQueue: () => Promise<void>
}

export function useQueueAdmin(id: string, adminKey: string): QueueAdminView {
  const { snap, error } = useSnapshot(id)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const entries = useMemo(() => activeEntries(snap), [snap])
  const meta = snap?.meta ?? null

  const commit = useCallback(
    async (patch: Partial<QueueMeta>) => {
      if (!meta) return
      setBusy(true)
      setActionError(null)
      try {
        await backend.writeMeta(id, adminKey, { ...meta, ...patch })
      } catch (err) {
        setActionError(toMessage(err))
        throw err
      } finally {
        setBusy(false)
      }
    },
    [id, adminKey, meta],
  )

  const setName = useCallback(
    async (name: string) => {
      const clean = name.trim().slice(0, 60)
      if (!clean) return
      await commit({ name: clean })
    },
    [commit],
  )

  const setStatus = useCallback(
    async (status: QueueStatus) => {
      await commit({ status })
    },
    [commit],
  )

  const setNowPlaying = useCallback(
    async (entryId: string) => {
      await commit({ nowPlaying: meta?.nowPlaying === entryId ? '' : entryId })
    },
    [commit, meta],
  )

  const removeEntry = useCallback(
    async (entryId: string) => {
      await commit({
        removed: { ...(meta?.removed ?? {}), [entryId]: true },
        nowPlaying: meta?.nowPlaying === entryId ? '' : meta?.nowPlaying ?? '',
      })
    },
    [commit, meta],
  )

  const clearQueue = useCallback(async () => {
    await commit({ resetAt: Date.now(), nowPlaying: '', removed: {} })
  }, [commit])

  return {
    loading: Boolean(id) && snap === null && error === null,
    notFound: snap !== null && !snap.exists,
    error: error ?? actionError,
    meta,
    entries,
    busy,
    setName,
    setStatus,
    setNowPlaying,
    removeEntry,
    clearQueue,
  }
}
