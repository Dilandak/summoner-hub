interface CacheEntry<T> {
  data: T
  expiresAt: number
}

const store = new Map<string, CacheEntry<unknown>>()

export function cacheGet<T>(key: string): T | null {
  const entry = store.get(key)

  if (!entry) return null

  if (Date.now() > entry.expiresAt) {
    store.delete(key)
    return null
  }

  return entry.data as T
}

export function cacheSet<T>(key: string, data: T, ttlMs: number): void {
  store.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  })
}

export function cacheDelete(key: string): boolean {
  return store.delete(key)
}

export function cacheDeleteByPrefix(prefix: string): number {
  let deleted = 0

  for (const key of store.keys()) {
    if (key.startsWith(prefix)) {
      store.delete(key)
      deleted++
    }
  }

  return deleted
}

export function cacheStats() {
  return {
    keys: store.size,
    items: [...store.keys()],
  }
}