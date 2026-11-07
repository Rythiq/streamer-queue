import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getDatabase, ref, onValue, update, set, type Database } from 'firebase/database'
import { firebaseConfig } from '../firebase-config'
import type { QueueBackend, QueueMeta, QueueSnapshot } from './types'

/**
 * Realtime Database backend, implemented against the layout enforced by
 * database.rules.json:
 *
 *   queues/{qid}/meta/{name,ownerName,status,createdAt,nowPlaying,resetAt,removed,_a}
 *   queues/{qid}/entries/{eid}/{twitch,ingame,joinedAt}
 *   queues/{qid}/left/{eid}      = leave token
 *   tokens/{qid}/{eid}           = entry token (never readable by clients)
 *
 * `meta` itself is not publicly readable, so every readable child is
 * subscribed individually instead of listening on the parent node.
 */

let cachedDb: Database | null = null

/** Lazily create the Firebase app/database singleton (never throws on import). */
function getDb(): Database {
  if (cachedDb) return cachedDb
  const apps = getApps()
  const app: FirebaseApp = apps.length > 0 ? apps[0] : initializeApp(firebaseConfig)
  cachedDb = getDatabase(app)
  return cachedDb
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}

function isPermissionDenied(err: unknown): boolean {
  if (typeof err === 'object' && err !== null) {
    const code = (err as { code?: unknown }).code
    if (typeof code === 'string' && /permission[_\s-]?denied/i.test(code)) return true
  }
  return /permission[_\s-]?denied/i.test(errorMessage(err))
}

function readError(err: unknown): Error {
  if (isPermissionDenied(err)) return new Error('This queue could not be read.')
  return err instanceof Error ? err : new Error(errorMessage(err))
}

function writeError(err: unknown): Error {
  if (isPermissionDenied(err)) {
    return new Error(
      'Not allowed. This browser does not have management access to this queue.',
    )
  }
  return err instanceof Error ? err : new Error(errorMessage(err))
}

interface RawEntry {
  twitch?: string
  ingame?: string
  joinedAt?: number
}

interface RawCache {
  entries: Record<string, RawEntry> | null
  left: Record<string, string> | null
  name: string | null
  ownerName: string | null
  status: QueueMeta['status'] | null
  createdAt: number | null
  nowPlaying: string | null
  resetAt: number | null
  removed: Record<string, true> | null
}

export const firebaseBackend: QueueBackend = {
  kind: 'firebase',

  subscribe(id, onData, onError) {
    let db: Database
    try {
      db = getDb()
    } catch (err) {
      onError(readError(err))
      return () => {}
    }

    let alive = true
    let nameResolved = false

    const cache: RawCache = {
      entries: null,
      left: null,
      name: null,
      ownerName: null,
      status: null,
      createdAt: null,
      nowPlaying: null,
      resetAt: null,
      removed: null,
    }

    const emit = () => {
      if (!alive || !nameResolved) return

      const name = typeof cache.name === 'string' ? cache.name : null
      const snapshot: QueueSnapshot = {
        exists: name !== null,
        meta:
          name === null
            ? null
            : {
                name,
                ownerName: cache.ownerName ?? '',
                status: cache.status ?? 'open',
                createdAt: cache.createdAt ?? 0,
                nowPlaying: cache.nowPlaying ?? '',
                resetAt: cache.resetAt ?? 0,
                removed: cache.removed ?? {},
              },
        entries: Object.entries(cache.entries ?? {}).map(([eid, value]) => ({
          id: eid,
          twitch: value?.twitch ?? '',
          ingame: value?.ingame ?? '',
          joinedAt: value?.joinedAt ?? 0,
        })),
        left: cache.left ?? {},
      }

      onData(snapshot)
    }

    const handleError = (err: Error) => {
      if (!alive) return
      onError(readError(err))
    }

    // `meta` has no public read permission, so subscribe to each readable child.
    const subscriptions = [
      ['entries', `queues/${id}/entries`],
      ['left', `queues/${id}/left`],
      ['name', `queues/${id}/meta/name`],
      ['ownerName', `queues/${id}/meta/ownerName`],
      ['status', `queues/${id}/meta/status`],
      ['createdAt', `queues/${id}/meta/createdAt`],
      ['nowPlaying', `queues/${id}/meta/nowPlaying`],
      ['resetAt', `queues/${id}/meta/resetAt`],
      ['removed', `queues/${id}/meta/removed`],
    ] as const

    const unsubscribers = subscriptions.map(([key, path]) =>
      onValue(
        ref(db, path),
        (snap) => {
          if (!alive) return
          cache[key] = snap.val()
          if (key === 'name') nameResolved = true
          emit()
        },
        handleError,
      ),
    )

    return () => {
      alive = false
      for (const unsubscribe of unsubscribers) unsubscribe()
    }
  },

  async joinQueue(id, entryId, twitch, ingame, token) {
    try {
      await update(ref(getDb()), {
        [`queues/${id}/entries/${entryId}`]: { twitch, ingame, joinedAt: Date.now() },
        [`tokens/${id}/${entryId}`]: token,
      })
    } catch (err) {
      throw writeError(err)
    }
  },

  async leaveQueue(id, entryId, token) {
    try {
      await set(ref(getDb(), `queues/${id}/left/${entryId}`), token)
    } catch (err) {
      throw writeError(err)
    }
  },

  async writeMeta(id, adminKey, meta) {
    try {
      await set(ref(getDb(), `queues/${id}/meta`), {
        name: meta.name,
        ownerName: meta.ownerName,
        status: meta.status,
        createdAt: meta.createdAt,
        nowPlaying: meta.nowPlaying ?? '',
        resetAt: meta.resetAt ?? 0,
        removed: meta.removed ?? {},
        _a: adminKey,
      })
    } catch (err) {
      throw writeError(err)
    }
  },
}
