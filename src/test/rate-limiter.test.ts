import { describe, it, expect, beforeEach } from 'vitest';
import { SlidingWindowRateLimiter } from '../services/rate-limiter';

describe('SlidingWindowRateLimiter', () => {
  let limiter: SlidingWindowRateLimiter;

  beforeEach(() => {
    limiter = new SlidingWindowRateLimiter(3, 1000); // 3 requests per 1000ms window
  });

  it('allows requests within the limit', () => {
    const res1 = limiter.check('192.168.1.1');
    expect(res1.allowed).toBe(true);
    expect(res1.remaining).toBe(2);

    const res2 = limiter.check('192.168.1.1');
    expect(res2.allowed).toBe(true);
    expect(res2.remaining).toBe(1);

    const res3 = limiter.check('192.168.1.1');
    expect(res3.allowed).toBe(true);
    expect(res3.remaining).toBe(0);
  });

  it('blocks requests exceeding the limit', () => {
    limiter.check('192.168.1.1');
    limiter.check('192.168.1.1');
    limiter.check('192.168.1.1');

    const blocked = limiter.check('192.168.1.1');
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.resetTimeMs).toBeGreaterThan(0);
  });

  it('isolates rate limits by IP address', () => {
    limiter.check('192.168.1.1');
    limiter.check('192.168.1.1');
    limiter.check('192.168.1.1');

    // Different IP should still have its full quota
    const resIp2 = limiter.check('10.0.0.1');
    expect(resIp2.allowed).toBe(true);
    expect(resIp2.remaining).toBe(2);
  });

  it('resets all limits on reset()', () => {
    limiter.check('192.168.1.1');
    limiter.check('192.168.1.1');
    limiter.check('192.168.1.1');
    expect(limiter.check('192.168.1.1').allowed).toBe(false);

    limiter.reset();
    expect(limiter.check('192.168.1.1').allowed).toBe(true);
  });

  it('cleans up expired IP records during cleanup()', async () => {
    const shortLimiter = new SlidingWindowRateLimiter(5, 50);
    shortLimiter.check('192.168.1.5');

    await new Promise((r) => setTimeout(r, 70));
    shortLimiter.cleanup();

    const fresh = shortLimiter.check('192.168.1.5');
    expect(fresh.remaining).toBe(4);
  });
});
