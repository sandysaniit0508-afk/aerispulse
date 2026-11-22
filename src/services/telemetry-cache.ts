/**
 * In-Memory Stale-While-Revalidate (SWR) TTL Cache
 * Keeps upstream telemetry latency < 50ms on cache hits.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export class TelemetryCache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private ttlMs: number;

  constructor(ttlMs: number = 300_000) { // Default 5 minutes
    this.ttlMs = ttlMs;
  }

  /**
   * Retrieves cached entry by key, returning staleness status.
   * 
   * @param key - Cache lookup key
   * @returns Cache retrieval record containing data (or null) and isStale boolean flag
   */
  public get(key: string): { data: T | null; isStale: boolean } {
    const entry = this.cache.get(key);
    if (!entry) {
      return { data: null, isStale: false };
    }

    const now = Date.now();
    const isStale = now > entry.expiresAt;

    return {
      data: entry.data,
      isStale,
    };
  }

  /**
   * Inserts or updates an entry in the TTL cache.
   * 
   * @param key - Cache storage key
   * @param data - Generic payload to store
   */
  public set(key: string, data: T): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + this.ttlMs,
    });
  }

  /**
   * Empties all stored records from the in-memory cache.
   */
  public clear(): void {
    this.cache.clear();
  }

  /**
   * Returns total count of active cache keys.
   */
  public size(): number {
    return this.cache.size;
  }
}

// Global singleton instance for serverless runtime memory persistence
export const globalTelemetryCache = new TelemetryCache(300_000);
