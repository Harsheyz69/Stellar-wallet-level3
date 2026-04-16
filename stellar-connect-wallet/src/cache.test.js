import { appCache, CACHE_KEYS, CACHE_TTL } from './cache';

describe('Cache Layer', () => {
  beforeEach(() => {
    appCache.clear();
    jest.useRealTimers();
  });

  // ─── Test 4: Cache stores and retrieves values correctly ──────────────────

  test('stores and retrieves values within TTL', () => {
    appCache.set('test-key', 'test-value', 5000);

    // Should retrieve the value
    expect(appCache.get('test-key')).toBe('test-value');

    // Should report the key exists
    expect(appCache.has('test-key')).toBe(true);

    // Stats should reflect one entry
    const s = appCache.stats();
    expect(s.size).toBe(1);
    expect(s.keys).toContain('test-key');
  });

  // ─── Test 5: Cache expires entries after TTL ──────────────────────────────

  test('returns null for expired entries', () => {
    jest.useFakeTimers();

    // Store with a short TTL
    appCache.set('expires-soon', 'hello', 1000);

    // Should be accessible immediately
    expect(appCache.get('expires-soon')).toBe('hello');

    // Advance past TTL
    jest.advanceTimersByTime(1500);

    // Should have expired
    expect(appCache.get('expires-soon')).toBeNull();
    expect(appCache.has('expires-soon')).toBe(false);
  });

  // ─── Bonus: Cache invalidation works ──────────────────────────────────────

  test('invalidate removes specific keys', () => {
    appCache.set('key-a', 'value-a', 10000);
    appCache.set('key-b', 'value-b', 10000);

    expect(appCache.get('key-a')).toBe('value-a');
    expect(appCache.get('key-b')).toBe('value-b');

    // Invalidate only key-a
    appCache.invalidate('key-a');

    expect(appCache.get('key-a')).toBeNull();
    expect(appCache.get('key-b')).toBe('value-b');
  });

  // ─── Bonus: Cache keys constants are defined ──────────────────────────────

  test('exports cache keys and TTL constants', () => {
    expect(CACHE_KEYS.BALANCE).toBe('balance');
    expect(CACHE_KEYS.PAYMENTS).toBe('payments');
    expect(CACHE_KEYS.TX_HISTORY).toBe('tx_history');
    expect(CACHE_TTL.BALANCE).toBe(10000);
    expect(CACHE_TTL.PAYMENTS).toBe(15000);
  });
});
