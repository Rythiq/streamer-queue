export type QueueStatus = 'open' | 'paused' | 'closed'

/** Public queue settings. Mirrored server-side in Realtime Database. */
export interface QueueMeta {
  name: string
  /** The streamer's IN-GAME name, so viewers know who to add. Not a @handle. */
  ownerName: string
  status: QueueStatus
  createdAt: number
  /** entry id currently "up next"; '' means nobody. */
  nowPlaying: string
  /** entries joined before this timestamp are hidden (queue reset marker). */
  resetAt: number
  /** owner-kicked entry ids. */
  removed: Record<string, true>
}

export interface QueueEntry {
  id: string
  /** Viewer's Twitch handle. */
  twitch: string
  /** Viewer's in-game name. */
  ingame: string
  joinedAt: number
}

/** Raw snapshot emitted by a backend. */
export interface QueueSnapshot {
  exists: boolean
  meta: QueueMeta | null
  entries: QueueEntry[]
  /** entry id -> leave token, proving that entry has left. */
  left: Record<string, string>
}

export type Unsubscribe = () => void

/**
 * Storage contract. Implementations:
 *  - localBackend   (demo mode, localStorage + BroadcastChannel)
 *  - firebaseBackend (Realtime Database, rules-enforced)
 */
export interface QueueBackend {
  readonly kind: 'firebase' | 'local'
  subscribe(
    id: string,
    onData: (snap: QueueSnapshot) => void,
    onError: (err: Error) => void,
  ): Unsubscribe
  joinQueue(
    id: string,
    entryId: string,
    twitch: string,
    ingame: string,
    token: string,
  ): Promise<void>
  leaveQueue(id: string, entryId: string, token: string): Promise<void>
  /** Creates the queue when it does not exist yet; otherwise requires the matching admin key. */
  writeMeta(id: string, adminKey: string, meta: QueueMeta): Promise<void>
}
