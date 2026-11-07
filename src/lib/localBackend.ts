import type { QueueBackend, QueueMeta, QueueSnapshot } from './types'

interface LocalEntry {
  twitch: string
  ingame: string
  joinedAt: number
}

interface LocalRecord {
  meta: QueueMeta & { _a: string }
  entries: Record<string, LocalEntry>
  left: Record<string, string>
}

const recordKey = (id: string) => `qj:demo:q:${id}`
const CHANNEL_NAME = 'qj:demo:sync'

const channel =
  typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(CHANNEL_NAME) : null

function read(id: string): LocalRecord | null {
  try {
    const raw = localStorage.getItem(recordKey(id))
    return raw ? (JSON.parse(raw) as LocalRecord) : null
  } catch {
    return null
  }
}

function write(id: string, record: LocalRecord): void {
  localStorage.setItem(recordKey(id), JSON.stringify(record))
  channel?.postMessage({ id })
}

function toSnapshot(record: LocalRecord | null): QueueSnapshot {
  if (!record) return { exists: false, meta: null, entries: [], left: {} }
  const { _a: _adminKey, ...meta } = record.meta
  return {
    exists: true,
    meta,
    entries: Object.entries(record.entries ?? {}).map(([id, entry]) => ({
      id,
      twitch: entry.twitch ?? '',
      ingame: entry.ingame ?? '',
      joinedAt: entry.joinedAt,
    })),
    left: record.left ?? {},
  }
}

export const localBackend: QueueBackend = {
  kind: 'local',

  subscribe(id, onData, onError) {
    let alive = true
    const emit = () => {
      if (!alive) return
      try {
        onData(toSnapshot(read(id)))
      } catch (err) {
        onError(err instanceof Error ? err : new Error(String(err)))
      }
    }

    emit()

    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === recordKey(id)) emit()
    }
    const onMessage = (event: MessageEvent) => {
      if ((event.data as { id?: string } | null)?.id === id) emit()
    }

    window.addEventListener('storage', onStorage)
    channel?.addEventListener('message', onMessage)

    return () => {
      alive = false
      window.removeEventListener('storage', onStorage)
      channel?.removeEventListener('message', onMessage)
    }
  },

  async joinQueue(id, entryId, twitch, ingame, token) {
    const record = read(id)
    if (!record) throw new Error('Queue not found in this browser (demo mode is local-only)')
    record.entries[entryId] = { twitch, ingame, joinedAt: Date.now() }
    delete record.left[entryId]
    void token
    write(id, record)
  },

  async leaveQueue(id, entryId, token) {
    const record = read(id)
    if (!record) return
    record.left[entryId] = token
    write(id, record)
  },

  async writeMeta(id, adminKey, meta) {
    const record = read(id)
    if (record && record.meta._a !== adminKey) {
      throw new Error('This browser does not have management access to this queue')
    }
    const next: LocalRecord = record ?? { meta: { ...meta, _a: adminKey }, entries: {}, left: {} }
    next.meta = { ...meta, _a: record ? record.meta._a : adminKey }
    next.entries ??= {}
    next.left ??= {}
    write(id, next)
  },
}
