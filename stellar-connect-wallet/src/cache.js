/**
 * cache.js — Lightweight Caching Layer with TTL
 *
 * Provides an in-memory cache with configurable time-to-live (TTL) per entry.
 * Also supports optional localStorage persistence so cached values survive
 * page reloads (used for balance display).
 *
 * Usage:
 *   import { appCache } from './cache';
 *   appCache.set('balance', '100.00', 10000);  // cache for 10s
 *   appCache.get('balance');                     // '100.00' or null if expired
 *   appCache.invalidate('balance');              // remove entry
 */

// ─── In-Memory Store ────────────────────────────────────────────────────────

const store = new Map();

// ─── Cache API ──────────────────────────────────────────────────────────────

/**
 * Retrieve a cached value by key.
 * Returns null if the key doesn't exist or has expired.
 * @param {string} key
 * @returns {*|null}
 */
function get(key) {
  const entry = store.get(key);
  if (!entry) {
    // Try localStorage fallback
    return _getFromStorage(key);
  }
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

/**
 * Store a value in cache with a TTL (time-to-live) in milliseconds.
 * @param {string} key
 * @param {*} value
 * @param {number} ttlMs - Time to live in milliseconds (default: 15000)
 * @param {boolean} persist - If true, also saves to localStorage
 */
function set(key, value, ttlMs = 15000, persist = false) {
  store.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
    persist,
  });

  if (persist) {
    _saveToStorage(key, value, ttlMs);
  }
}

/**
 * Remove a specific key from the cache.
 * @param {string} key
 */
function invalidate(key) {
  store.delete(key);
  _removeFromStorage(key);
}

/**
 * Clear the entire cache.
 */
function clear() {
  // Remove persisted entries
  for (const [key, entry] of store.entries()) {
    if (entry.persist) {
      _removeFromStorage(key);
    }
  }
  store.clear();
}

/**
 * Check if a key exists and is not expired.
 * @param {string} key
 * @returns {boolean}
 */
function has(key) {
  return get(key) !== null;
}

/**
 * Get cache stats for debugging.
 * @returns {{ size: number, keys: string[] }}
 */
function stats() {
  // Clean expired entries
  for (const [key, entry] of store.entries()) {
    if (Date.now() > entry.expiresAt) {
      store.delete(key);
    }
  }
  return {
    size: store.size,
    keys: Array.from(store.keys()),
  };
}

// ─── localStorage Helpers ───────────────────────────────────────────────────

const STORAGE_PREFIX = "stellarpay_cache_";

function _saveToStorage(key, value, ttlMs) {
  try {
    const data = {
      value,
      expiresAt: Date.now() + ttlMs,
    };
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch {
    // localStorage might be full or unavailable
  }
}

function _getFromStorage(key) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (Date.now() > data.expiresAt) {
      localStorage.removeItem(STORAGE_PREFIX + key);
      return null;
    }
    return data.value;
  } catch {
    return null;
  }
}

function _removeFromStorage(key) {
  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
  } catch {
    // Ignore
  }
}

// ─── Cache Keys Constants ───────────────────────────────────────────────────

export const CACHE_KEYS = {
  BALANCE: "balance",
  PAYMENTS: "payments",
  TX_HISTORY: "tx_history",
};

export const CACHE_TTL = {
  BALANCE: 10000, // 10 seconds
  PAYMENTS: 15000, // 15 seconds
  TX_HISTORY: 15000, // 15 seconds
};

// ─── Export Singleton ───────────────────────────────────────────────────────

export const appCache = {
  get,
  set,
  invalidate,
  clear,
  has,
  stats,
};
