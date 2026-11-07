const OWNED_KEY = 'qj:owned'
const joinedKey = (id: string) => `qj:joined:${id}`

export interface OwnedQueue {
  id: string
  adminKey: string
  name: string
  createdAt: number
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function listOwnedQueues(): OwnedQueue[] {
  const list = safeParse<OwnedQueue[]>(localStorage.getItem(OWNED_KEY), [])
  return [...list].sort((a, b) => b.createdAt - a.createdAt)
}

export function saveOwnedQueue(queue: OwnedQueue): void {
  const list = listOwnedQueues().filter((q) => q.id !== queue.id)
  list.unshift(queue)
  localStorage.setItem(OWNED_KEY, JSON.stringify(list.slice(0, 50)))
}

export function removeOwnedQueue(id: string): void {
  localStorage.setItem(
    OWNED_KEY,
    JSON.stringify(listOwnedQueues().filter((q) => q.id !== id)),
  )
}

export function getOwnedQueue(id: string): OwnedQueue | null {
  return listOwnedQueues().find((q) => q.id === id) ?? null
}

export interface JoinedRef {
  entryId: string
  token: string
}

export function getJoined(id: string): JoinedRef | null {
  return safeParse<JoinedRef | null>(localStorage.getItem(joinedKey(id)), null)
}

export function setJoined(id: string, ref: JoinedRef): void {
  localStorage.setItem(joinedKey(id), JSON.stringify(ref))
}

export function clearJoined(id: string): void {
  localStorage.removeItem(joinedKey(id))
}
