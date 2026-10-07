/**
 * Lightweight API Response Cache
 * — In-memory (fast) + sessionStorage (cross-navigation)
 * — Auto-expires entries after TTL (default 3 minutes)
 * — Used to provide instant "stale-while-revalidate" data for student pages
 */

const MEMORY_CACHE = new Map();
const DEFAULT_TTL_MS = 3 * 60 * 1000; // 3 minutes

function getCacheKey(key) {
  return `ams_cache__${key}`;
}

export function cacheGet(key) {
  // 1. Check memory first (fastest)
  const memEntry = MEMORY_CACHE.get(key);
  if (memEntry && Date.now() < memEntry.expiresAt) {
    return memEntry.data;
  }

  // 2. Fallback to sessionStorage
  try {
    const raw = sessionStorage.getItem(getCacheKey(key));
    if (raw) {
      const entry = JSON.parse(raw);
      if (Date.now() < entry.expiresAt) {
        // Warm memory cache
        MEMORY_CACHE.set(key, entry);
        return entry.data;
      }
      // Expired — remove
      sessionStorage.removeItem(getCacheKey(key));
    }
  } catch {}

  return null;
}

export function cacheSet(key, data, ttlMs = DEFAULT_TTL_MS) {
  const entry = { data, expiresAt: Date.now() + ttlMs };
  MEMORY_CACHE.set(key, entry);
  try {
    sessionStorage.setItem(getCacheKey(key), JSON.stringify(entry));
  } catch {}
}

export function cacheInvalidate(keyPrefix) {
  // Remove all entries starting with keyPrefix
  for (const key of MEMORY_CACHE.keys()) {
    if (key.startsWith(keyPrefix)) MEMORY_CACHE.delete(key);
  }
  try {
    const toRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k && k.startsWith(getCacheKey(keyPrefix))) toRemove.push(k);
    }
    toRemove.forEach(k => sessionStorage.removeItem(k));
  } catch {}
}

/**
 * Stale-While-Revalidate fetch helper.
 * Returns cached data immediately (if available), then fetches fresh data in the background.
 *
 * @param {string} cacheKey - Unique cache identifier
 * @param {Function} fetcher - Async function that returns fresh data
 * @param {Function} onData - Callback called with data (may be called twice: once with cached, once with fresh)
 * @param {Function} onError - Callback called if the fetch errors
 * @param {number} [ttlMs] - Cache TTL in milliseconds
 */
export async function swrFetch(cacheKey, fetcher, onData, onError, ttlMs = DEFAULT_TTL_MS) {
  const cached = cacheGet(cacheKey);
  if (cached) {
    onData(cached, true); // isStale = true
  }

  try {
    const fresh = await fetcher();
    cacheSet(cacheKey, fresh, ttlMs);
    onData(fresh, false); // isStale = false
  } catch (err) {
    if (!cached) {
      // Only call onError if we had no cached data to show
      onError(err);
    }
  }
}
