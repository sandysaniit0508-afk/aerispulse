import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TelemetryService } from '../services/telemetry-service';
import { globalTelemetryCache } from '../services/telemetry-cache';

describe('CAMS Telemetry Service Error Handling & Fallback Resiliency', () => {
  const cityId = 'delhi-ncr';
  const cityName = 'Delhi NCR';
  const lat = 28.6139;
  const lon = 77.209;

  beforeEach(() => {
    globalTelemetryCache.clear();
    vi.restoreAllMocks();
  });

  it('handles network timeout (AbortError) with identical calibrated baseline fallback', async () => {
    const abortError = new Error('The operation was aborted');
    abortError.name = 'AbortError';

    vi.spyOn(global, 'fetch').mockRejectedValueOnce(abortError);

    const expectedBaseline = TelemetryService.getCalibratedBaseline(cityId, cityName, lat, lon);
    const result = await TelemetryService.getTelemetry(cityId, cityName, lat, lon, true);

    expect(result.cityId).toBe(expectedBaseline.cityId);
    expect(result.cityName).toBe(expectedBaseline.cityName);
    expect(result.usAqi).toBe(expectedBaseline.usAqi);
    expect(result.dominantPollutant).toBe(expectedBaseline.dominantPollutant);
    expect(result.pollutants).toEqual(expectedBaseline.pollutants);
    expect(result.source).toBe(expectedBaseline.source);
  });

  it('handles HTTP 500 Internal Server Error with identical calibrated baseline fallback', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    } as unknown as Response);

    const expectedBaseline = TelemetryService.getCalibratedBaseline(cityId, cityName, lat, lon);
    const result = await TelemetryService.getTelemetry(cityId, cityName, lat, lon, true);

    expect(result.usAqi).toBe(expectedBaseline.usAqi);
    expect(result.pollutants).toEqual(expectedBaseline.pollutants);
    expect(result.source).toBe(expectedBaseline.source);
  });

  it('handles HTTP 429 Rate Limit error with identical calibrated baseline fallback', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
    } as unknown as Response);

    const expectedBaseline = TelemetryService.getCalibratedBaseline(cityId, cityName, lat, lon);
    const result = await TelemetryService.getTelemetry(cityId, cityName, lat, lon, true);

    expect(result.usAqi).toBe(expectedBaseline.usAqi);
    expect(result.source).toBe(expectedBaseline.source);
  });

  it('handles bad schema with empty JSON object by returning identical fallback', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    } as unknown as Response);

    const expectedBaseline = TelemetryService.getCalibratedBaseline(cityId, cityName, lat, lon);
    const result = await TelemetryService.getTelemetry(cityId, cityName, lat, lon, true);

    expect(result.usAqi).toBe(expectedBaseline.usAqi);
    expect(result.pollutants).toEqual(expectedBaseline.pollutants);
  });

  it('handles malformed non-JSON response syntax error by returning identical fallback', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => {
        throw new SyntaxError('Unexpected token < in JSON at position 0');
      },
    } as unknown as Response);

    const expectedBaseline = TelemetryService.getCalibratedBaseline(cityId, cityName, lat, lon);
    const result = await TelemetryService.getTelemetry(cityId, cityName, lat, lon, true);

    expect(result.usAqi).toBe(expectedBaseline.usAqi);
    expect(result.source).toBe(expectedBaseline.source);
  });

  it('populates cache on fallback so subsequent queries hit cache directly', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network offline'));

    const result1 = await TelemetryService.getTelemetry(cityId, cityName, lat, lon, false);
    expect(result1.source).toContain('Calibrated');
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    // On second call, fetch should NOT be called again because cache returns baseline immediately
    const result2 = await TelemetryService.getTelemetry(cityId, cityName, lat, lon, false);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(result2.usAqi).toBe(result1.usAqi);
  });
});
