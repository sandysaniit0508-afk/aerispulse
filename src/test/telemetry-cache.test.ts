import { describe, it, expect, beforeEach } from 'vitest';
import { TelemetryCache } from '../services/telemetry-cache';

describe('TelemetryCache (Stale-While-Revalidate TTL)', () => {
  let cache: TelemetryCache<string>;

  beforeEach(() => {
    cache = new TelemetryCache<string>(100); // 100ms TTL
  });

  it('stores and retrieves cached data', () => {
    cache.set('key1', 'telemetry-data-1');
    const result = cache.get('key1');
    expect(result.data).toBe('telemetry-data-1');
    expect(result.isStale).toBe(false);
  });

  it('returns null data for non-existent key', () => {
    const result = cache.get('missing-key');
    expect(result.data).toBeNull();
    expect(result.isStale).toBe(false);
  });

  it('marks data as stale after TTL expires', async () => {
    cache.set('key2', 'telemetry-data-2');
    await new Promise((r) => setTimeout(r, 120));

    const result = cache.get('key2');
    expect(result.data).toBe('telemetry-data-2');
    expect(result.isStale).toBe(true);
  });

  it('clears all entries on clear()', () => {
    cache.set('a', '1');
    cache.set('b', '2');
    expect(cache.size()).toBe(2);

    cache.clear();
    expect(cache.size()).toBe(0);
    expect(cache.get('a').data).toBeNull();
  });
});
