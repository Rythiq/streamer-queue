import { isFirebaseConfigured } from '../firebase-config'
import { firebaseBackend } from './firebaseBackend'
import { localBackend } from './localBackend'
import { randomId } from './ids'
import { saveOwnedQueue } from './storage'
import type { QueueBackend, QueueMeta } from './types'

export const backend: QueueBackend = isFirebaseConfigured() ? firebaseBackend : localBackend
export const isDemoMode = backend.kind === 'local'

export interface CreatedQueue {
  id: string
  adminKey: string
  name: string
  ownerName: string
}

export function emptyMeta(name: string, ownerName: string): QueueMeta {
  return {
    name: name.trim().slice(0, 60),
    ownerName: ownerName.trim().slice(0, 32),
    status: 'open',
    createdAt: Date.now(),
    nowPlaying: '',
    resetAt: 0,
    removed: {},
  }
}

/**
 * @param name   Queue name, e.g. "Road to Diamond".
 * @param ownerName The streamer's IN-GAME name, so viewers know who to add.
 */
export async function createQueue(name: string, ownerName: string): Promise<CreatedQueue> {
  const cleanName = name.trim().slice(0, 60)
  const cleanOwner = ownerName.trim().slice(0, 32)

  if (!cleanName) throw new Error('Give your queue a name first')
  if (!cleanOwner) throw new Error('Add your in-game name so viewers can add you')

  const meta = emptyMeta(cleanName, cleanOwner)
  const adminKey = randomId(40)

  let lastError: unknown = null
  for (let attempt = 0; attempt < 3; attempt++) {
    const id = randomId(22)
    try {
      await backend.writeMeta(id, adminKey, meta)
      saveOwnedQueue({ id, adminKey, name: cleanName, createdAt: meta.createdAt })
      return { id, adminKey, name: cleanName, ownerName: cleanOwner }
    } catch (err) {
      lastError = err
      const message = err instanceof Error ? err.message : String(err)
      // A taken id is the only retryable case; surface real errors immediately.
      if (!/permission|exists|denied|not allowed/i.test(message)) break
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Could not create the queue')
}

function baseUrl(): string {
  const { origin, pathname } = window.location
  return origin + pathname.replace(/index\.html?$/, '')
}

export function shareUrl(id: string): string {
  return `${baseUrl()}#/q/${id}`
}

/**
 * Management lives in the creating browser only. The admin key is never
 * placed in a URL, so there is no owner link to leak.
 */
export function manageUrl(id: string): string {
  return `${baseUrl()}#/m/${id}`
}
