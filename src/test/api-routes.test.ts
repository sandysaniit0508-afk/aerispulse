import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as healthHandler } from '../app/api/health/route';
import { GET as telemetryHandler } from '../app/api/telemetry/route';
import { POST as planHandler } from '../app/api/plan/route';
import { POST as chatHandler } from '../app/api/chat/route';
import { POST as simulateHandler } from '../app/api/simulate/route';
import { globalRateLimiter } from '../services/rate-limiter';

describe('API Route Handlers (Integration)', () => {
  beforeEach(() => {
    globalRateLimiter.reset();
  });

  describe('GET /api/health', () => {
    it('returns HTTP 200 with UP status', async () => {
      const response = await healthHandler();
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.status).toBe('UP');
      expect(json.system).toBe('AerisPulse');
    });
  });

  describe('GET /api/telemetry', () => {
    it('returns telemetry for valid coordinates', async () => {
      const req = new NextRequest(
        'http://localhost:3000/api/telemetry?cityId=delhi-ncr&lat=28.6139&lon=77.2090&cityName=Delhi'
      );
      const response = await telemetryHandler(req);
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.cityId).toBe('delhi-ncr');
      expect(json.usAqi).toBeGreaterThan(0);
      expect(json.pollutants).toBeDefined();
    });

    it('rejects invalid latitude with HTTP 400', async () => {
      const req = new NextRequest(
        'http://localhost:3000/api/telemetry?cityId=delhi-ncr&lat=180.0&lon=77.2090'
      );
      const response = await telemetryHandler(req);
      expect(response.status).toBe(400);
    });

    it('rejects invalid longitude with HTTP 400', async () => {
      const req = new NextRequest(
        'http://localhost:3000/api/telemetry?cityId=delhi-ncr&lat=28.0&lon=250.0'
      );
      const response = await telemetryHandler(req);
      expect(response.status).toBe(400);
    });

    it('handles refresh=true query parameter cleanly', async () => {
      const req = new NextRequest(
        'http://localhost:3000/api/telemetry?cityId=delhi-ncr&lat=28.6139&lon=77.2090&refresh=true'
      );
      const response = await telemetryHandler(req);
      expect(response.status).toBe(200);
    });

    it('uses fallback defaults when query params are partially missing', async () => {
      const req = new NextRequest('http://localhost:3000/api/telemetry');
      const response = await telemetryHandler(req);
      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/plan', () => {
    it('generates plan for valid payload', async () => {
      const body = {
        cityId: 'mumbai-coastal',
        cityName: 'Mumbai Coastal',
        aqi: 140,
        pollutants: {
          pm25: 65,
          pm10: 120,
          no2: 40,
          so2: 15,
          o3: 35,
          co: 800,
        },
        language: 'en',
      };

      const req = new NextRequest('http://localhost:3000/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const response = await planHandler(req);
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.summary).toBeDefined();
      expect(json.items.length).toBeGreaterThanOrEqual(4);
    });

    it('returns HTTP 400 for invalid payload schema', async () => {
      const req = new NextRequest('http://localhost:3000/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invalid: 'body' }),
      });

      const response = await planHandler(req);
      expect(response.status).toBe(400);
    });

    it('returns HTTP 429 when rate limit is exceeded', async () => {
      const body = {
        cityId: 'mumbai-coastal',
        cityName: 'Mumbai Coastal',
        aqi: 140,
        pollutants: { pm25: 65, pm10: 120, no2: 40, so2: 15, o3: 35, co: 800 },
        language: 'en',
      };

      // Exhaust limit of 30 requests
      for (let i = 0; i < 30; i++) {
        globalRateLimiter.check('127.0.0.1');
      }

      const req = new NextRequest('http://localhost:3000/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '127.0.0.1' },
        body: JSON.stringify(body),
      });

      const response = await planHandler(req);
      expect(response.status).toBe(429);
    });
  });

  describe('POST /api/chat', () => {
    it('returns streaming response for valid chat query', async () => {
      const body = {
        message: 'Is outdoor walking safe today?',
        cityName: 'Bengaluru Corridor',
        aqi: 65,
        dominantPollutant: 'o3',
        pm25: 25.0,
        language: 'en',
      };

      const req = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const response = await chatHandler(req);
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toContain('text/event-stream');
    });

    it('rejects invalid chat format with HTTP 400', async () => {
      const req = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: '' }),
      });

      const response = await chatHandler(req);
      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/simulate', () => {
    it('returns simulation outputs for valid inputs', async () => {
      const body = {
        inputs: {
          commuteMode: 'metro',
          commuteDistanceKm: 15,
          maskGrade: 'n95',
          hepaFilterEnabled: true,
          outdoorExerciseHours: 1,
        },
        ambientPm25: 80,
      };

      const req = new NextRequest('http://localhost:3000/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const response = await simulateHandler(req);
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.dailyInhaledUg).toBeDefined();
      expect(json.inhaledReductionPercent).toBeGreaterThan(0);
    });

    it('rejects invalid simulation body with HTTP 400', async () => {
      const req = new NextRequest('http://localhost:3000/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ambientPm25: -20 }),
      });

      const response = await simulateHandler(req);
      expect(response.status).toBe(400);
    });

    it('returns HTTP 429 when rate limit is exceeded on /api/simulate', async () => {
      for (let i = 0; i < 30; i++) {
        globalRateLimiter.check('127.0.0.1');
      }

      const req = new NextRequest('http://localhost:3000/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '127.0.0.1' },
        body: JSON.stringify({ inputs: {}, ambientPm25: 50 }),
      });

      const response = await simulateHandler(req);
      expect(response.status).toBe(429);
    });
  });
});
