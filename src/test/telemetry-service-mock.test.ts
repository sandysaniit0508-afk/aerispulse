import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TelemetryService } from '../services/telemetry-service';
import { globalTelemetryCache } from '../services/telemetry-cache';

describe('TelemetryService Live Fetch Mocking', () => {
  beforeEach(() => {
    globalTelemetryCache.clear();
    vi.restoreAllMocks();
  });

  it('successfully parses Open-Meteo HTTP response', async () => {
    const mockPayload = {
      current: {
        time: '2026-11-22T10:00:00Z',
        pm10: 110.5,
        pm2_5: 65.2,
        carbon_monoxide: 750,
        nitrogen_dioxide: 42.0,
        sulphur_dioxide: 18.0,
        ozone: 38.0,
        us_aqi: 156,
        european_aqi: 72,
      },
    };

    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockPayload,
    } as unknown as Response);

    const result = await TelemetryService.getTelemetry(
      'delhi-ncr',
      'Delhi NCR',
      28.6139,
      77.209,
      true
    );

    expect(result.usAqi).toBe(156);
    expect(result.pollutants.pm25).toBe(65.2);
    expect(result.source).toContain('Open-Meteo');
  });

  it('handles non-ok HTTP status code by falling back to calibrated baseline', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 503,
    } as unknown as Response);

    const result = await TelemetryService.getTelemetry(
      'delhi-ncr',
      'Delhi NCR',
      28.6139,
      77.209,
      true
    );

    expect(result).toBeDefined();
    expect(result.source).toContain('Calibrated Atmospheric Model');
  });

  it('handles malformed JSON payload by falling back to calibrated baseline', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ current: null }),
    } as unknown as Response);

    const result = await TelemetryService.getTelemetry(
      'delhi-ncr',
      'Delhi NCR',
      28.6139,
      77.209,
      true
    );

    expect(result).toBeDefined();
    expect(result.source).toContain('Calibrated');
  });
});
