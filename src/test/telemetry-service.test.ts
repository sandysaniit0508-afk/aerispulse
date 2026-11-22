import { describe, it, expect, beforeEach } from 'vitest';
import { TelemetryService } from '../services/telemetry-service';
import { globalTelemetryCache } from '../services/telemetry-cache';

describe('TelemetryService', () => {
  beforeEach(() => {
    globalTelemetryCache.clear();
  });

  it('generates calibrated seasonal baseline for Delhi', () => {
    const data = TelemetryService.getCalibratedBaseline(
      'delhi-ncr',
      'Delhi NCR',
      28.6139,
      77.209
    );

    expect(data.cityId).toBe('delhi-ncr');
    expect(data.pollutants.pm25).toBe(185.4);
    expect(data.usAqi).toBeGreaterThan(200);
    expect(data.category).toBe('Very Unhealthy');
    expect(data.confidenceScore).toBeGreaterThan(0);
  });

  it('generates calibrated seasonal baseline for Mumbai', () => {
    const data = TelemetryService.getCalibratedBaseline(
      'mumbai-coastal',
      'Mumbai Coastal',
      18.922,
      72.8347
    );

    expect(data.cityId).toBe('mumbai-coastal');
    expect(data.pollutants.pm10).toBe(142.0);
    expect(data.usAqi).toBeGreaterThan(50);
  });

  it('generates calibrated seasonal baseline for Bengaluru', () => {
    const data = TelemetryService.getCalibratedBaseline(
      'bengaluru-corridor',
      'Bengaluru Corridor',
      12.9716,
      77.5946
    );

    expect(data.cityId).toBe('bengaluru-corridor');
    expect(data.pollutants.o3).toBe(74.0);
  });

  it('generates calibrated seasonal baseline for Chennai', () => {
    const data = TelemetryService.getCalibratedBaseline(
      'chennai-industrial',
      'Chennai Industrial',
      13.0827,
      80.2707
    );

    expect(data.cityId).toBe('chennai-industrial');
    expect(data.pollutants.so2).toBe(42.0);
  });

  it('falls back to generic baseline for unknown cities', () => {
    const data = TelemetryService.getCalibratedBaseline(
      'unknown-city',
      'Unknown City',
      0,
      0
    );

    expect(data.pollutants.pm25).toBe(58.0);
    expect(data.category).toBeDefined();
  });

  it('fetches telemetry with offline resilience without throwing', async () => {
    const data = await TelemetryService.getTelemetry(
      'delhi-ncr',
      'Delhi NCR',
      28.6139,
      77.209
    );

    expect(data).toBeDefined();
    expect(data.usAqi).toBeGreaterThan(0);
    expect(data.confidenceScore).toBeGreaterThanOrEqual(40);
  });

  it('caches telemetry and returns from cache on subsequent calls', async () => {
    const data1 = await TelemetryService.getTelemetry(
      'delhi-ncr',
      'Delhi NCR',
      28.6139,
      77.209
    );

    const data2 = await TelemetryService.getTelemetry(
      'delhi-ncr',
      'Delhi NCR',
      28.6139,
      77.209
    );

    expect(data1).toEqual(data2);
    expect(globalTelemetryCache.size()).toBe(1);
  });
});
