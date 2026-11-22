/**
 * In-Memory Sliding-Window IP Rate Limiter
 * Enforces strict request bounds on public POST endpoints.
 */

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTimeMs: number;
}

export class SlidingWindowRateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 30, windowMs: number = 60_000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  /**
   * Evaluates if incoming IP address is within request rate bounds.
   * 
   * @param ip - Client IP identifier
   * @returns RateLimitResult with allowed boolean, remaining attempts, and reset cooldown
   */
  public check(ip: string): RateLimitResult {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    const timestamps = this.requests.get(ip) || [];
    // Filter timestamps within current sliding window
    const validTimestamps = timestamps.filter((t) => t > windowStart);

    if (validTimestamps.length >= this.maxRequests) {
      const oldest = validTimestamps[0] ?? now;
      const resetTimeMs = oldest + this.windowMs - now;
      return {
        allowed: false,
        remaining: 0,
        resetTimeMs: Math.max(0, resetTimeMs),
      };
    }

    validTimestamps.push(now);
    this.requests.set(ip, validTimestamps);

    return {
      allowed: true,
      remaining: this.maxRequests - validTimestamps.length,
      resetTimeMs: this.windowMs,
    };
  }

  public reset(): void {
    this.requests.clear();
  }

  public cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    for (const [ip, timestamps] of this.requests.entries()) {
      const active = timestamps.filter((t) => t > windowStart);
      if (active.length === 0) {
        this.requests.delete(ip);
      } else {
        this.requests.set(ip, active);
      }
    }
  }
}

// Global instance
export const globalRateLimiter = new SlidingWindowRateLimiter(30, 60_000);
