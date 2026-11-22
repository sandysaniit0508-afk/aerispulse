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

  public set(key: string, data: T): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + this.ttlMs,
    });
  }

  public clear(): void {
    this.cache.clear();
  }

  public size(): number {
    return this.cache.size;
  }
}

// Global singleton instance for serverless runtime memory persistence
export const globalTelemetryCache = new TelemetryCache(300_000);
