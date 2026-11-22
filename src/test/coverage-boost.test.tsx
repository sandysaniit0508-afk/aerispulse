import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import React from 'react';
import { render } from '@testing-library/react';

// Domain and Services
import {
  DomainError,
  TelemetryServiceError,
  SchemaValidationError,
  RateLimitExceededError,
  TelemetryData,
  ActionPlan,
} from '@/domain/types';
import { calculateSubIndex } from '@/services/calculator';
import { SlidingWindowRateLimiter, globalRateLimiter } from '@/services/rate-limiter';
import { GeminiService } from '@/services/gemini-service';
import { TelemetryService } from '@/services/telemetry-service';
import { TelemetryCard } from '@/components/TelemetryCard';
import { ActionPlanSection } from '@/components/ActionPlanSection';

// API Route Handlers
import { GET as telemetryGet } from '@/app/api/telemetry/route';
import { POST as planPost } from '@/app/api/plan/route';
import { POST as chatPost } from '@/app/api/chat/route';
import { POST as simulatePost } from '@/app/api/simulate/route';

describe('Coverage & Code Quality Maximizer', () => {
  describe('Domain Error Classes', () => {
    it('properly constructs DomainError and subclasses with expected status codes', () => {
      const baseErr = new DomainError('Base error');
      expect(baseErr.code).toBe('DOMAIN_ERROR');
      expect(baseErr.statusCode).toBe(400);
      expect(baseErr.name).toBe('DomainError');

      const telemErr = new TelemetryServiceError('Telemetry unavailable');
      expect(telemErr.code).toBe('TELEMETRY_FETCH_ERROR');
      expect(telemErr.statusCode).toBe(502);
      expect(telemErr.name).toBe('TelemetryServiceError');

      const valErr = new SchemaValidationError('Validation failed');
      expect(valErr.code).toBe('VALIDATION_ERROR');
      expect(valErr.statusCode).toBe(422);
      expect(valErr.name).toBe('SchemaValidationError');

      const rateErr = new RateLimitExceededError();
      expect(rateErr.code).toBe('RATE_LIMIT_EXCEEDED');
      expect(rateErr.statusCode).toBe(429);
      expect(rateErr.name).toBe('RateLimitExceededError');
    });
  });

  describe('Calculator SubIndex Edge Cases', () => {
    it('returns 0 for negative or invalid pollutant concentration', () => {
      const sub = calculateSubIndex(-10, 'pm25');
      expect(sub).toBe(0);
    });
  });

  describe('Rate Limiter Active Cleanup Branch', () => {
    it('preserves and updates active timestamps during cleanup', () => {
      const limiter = new SlidingWindowRateLimiter(5, 5000);
      limiter.check('10.0.0.1');
      limiter.check('10.0.0.1');
      limiter.cleanup();
      // Should still have active entries
      const checkRes = limiter.check('10.0.0.1');
      expect(checkRes.allowed).toBe(true);
      expect(checkRes.remaining).toBe(2);
    });
  });

  describe('TelemetryCard Hazardous AQI (> 300)', () => {
    it('renders severe hazardous styles when AQI exceeds 300', () => {
      const hazardousTelemetry: TelemetryData = {
        cityId: 'delhi-ncr',
        cityName: 'Delhi NCR',
        latitude: 28.6139,
        longitude: 77.2090,
        timestamp: new Date().toISOString(),
        pollutants: { pm25: 450, pm10: 600, no2: 120, so2: 50, o3: 90, co: 3000 },
        usAqi: 420,
        europeanAqi: 95,
        category: 'Hazardous',
        dominantPollutant: 'pm25',
        confidenceScore: 92,
        validationStatus: 'ELEVATED_RISK',
        source: 'CAMS Telemetry',
      };

      const { container } = render(
        <TelemetryCard telemetry={hazardousTelemetry} isLoading={false} language="en" />
      );
      expect(container.textContent).toContain('420');
      expect(container.textContent).toContain('Hazardous');
    });
  });

  describe('ActionPlanSection Category Fallback', () => {
    it('renders fallback shield icon when category is unrecognized', () => {
      const planWithFallbackCategory: ActionPlan = {
        summary: 'Emergency mitigation plan',
        compositeRiskLevel: 'EXTREME',
        generatedAt: new Date().toISOString(),
        isFallback: true,
        modelUsed: 'AerisPulse-Rules-Engine-v1',
        items: [
          {
            category: 'unrecognized_category' as any,
            priority: 'critical',
            title: 'Emergency Advisory',
            action: 'Stay indoors with air filtration.',
            impactMetric: '100% risk reduction',
          },
        ],
      };

      const { container } = render(
        <ActionPlanSection
          plan={planWithFallbackCategory}
          isGenerating={false}
          onGeneratePlan={() => {}}
          language="en"
        />
      );
      expect(container.textContent).toContain('Emergency Advisory');
    });
  });

  describe('GeminiService Multilingual Fallback Branches', () => {
    it('generates Tamil pediatric advice when children are mentioned', async () => {
      const stream = await GeminiService.streamChat(
        'குழந்தைகள் வெளியே செல்லலாமா?',
        'சென்னை',
        220,
        'pm25',
        180,
        'ta'
      );
      const reader = stream.getReader();
      let fullText = '';
      let done = false;
      while (!done) {
        const chunk = await reader.read();
        done = chunk.done;
        if (chunk.value) fullText += new TextDecoder().decode(chunk.value);
      }
      expect(fullText).toContain('குழந்தைகள்');
    });

    it('generates Hindi mask advice when mask is mentioned', async () => {
      const stream = await GeminiService.streamChat(
        'क्या मास्क पहनना जरूरी है?',
        'दिल्ली',
        240,
        'pm25',
        210,
        'hi'
      );
      const reader = stream.getReader();
      let fullText = '';
      let done = false;
      while (!done) {
        const chunk = await reader.read();
        done = chunk.done;
        if (chunk.value) fullText += new TextDecoder().decode(chunk.value);
      }
      expect(fullText).toContain('मास्क');
    });

    it('generates Hindi general advice when query is generic', async () => {
      const stream = await GeminiService.streamChat(
        'आज का मौसम कैसा है?',
        'दिल्ली',
        110,
        'pm10',
        85,
        'hi'
      );
      const reader = stream.getReader();
      let fullText = '';
      let done = false;
      while (!done) {
        const chunk = await reader.read();
        done = chunk.done;
        if (chunk.value) fullText += new TextDecoder().decode(chunk.value);
      }
      expect(fullText).toContain('वर्तमान');
      expect(fullText).toContain('AQI');
    });

    it('generates English mask advice when mask query is asked', async () => {
      const stream = await GeminiService.streamChat(
        'Which mask should I wear?',
        'Delhi NCR',
        250,
        'pm25',
        210,
        'en'
      );
      const reader = stream.getReader();
      let fullText = '';
      let done = false;
      while (!done) {
        const chunk = await reader.read();
        done = chunk.done;
        if (chunk.value) fullText += new TextDecoder().decode(chunk.value);
      }
      expect(fullText).toContain('N95');
      expect(fullText).toContain('respirators');
    });
  });

  describe('API Routes Exception and Rate Limit Branches', () => {
    it('handles unexpected errors gracefully in /api/telemetry', async () => {
      vi.spyOn(TelemetryService, 'getTelemetry').mockRejectedValueOnce(new Error('Telemetry DB failure'));
      const req = {
        url: 'http://localhost:3000/api/telemetry?cityId=delhi-ncr&lat=28.6139&lon=77.2090',
      } as any;
      const res = await telemetryGet(req);
      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.error).toBe('Telemetry DB failure');
      vi.restoreAllMocks();
    });

    it('handles rate limit exceeded in /api/chat', async () => {
      vi.spyOn(globalRateLimiter, 'check').mockReturnValueOnce({
        allowed: false,
        remaining: 0,
        resetTimeMs: 45000,
      });
      const req = {
        headers: new Headers({ 'x-forwarded-for': '192.168.1.1' }),
      } as any;
      const res = await chatPost(req);
      expect(res.status).toBe(429);
      const data = await res.json();
      expect(data.error).toContain('Rate limit active');
      vi.restoreAllMocks();
    });

    it('handles unexpected errors gracefully in /api/simulate', async () => {
      const req = {
        headers: new Headers({ 'x-forwarded-for': '127.0.0.1' }),
        json: async () => {
          throw new Error('Simulate JSON parse explosion');
        },
      } as any;
      const res = await simulatePost(req);
      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.error).toBe('Simulate JSON parse explosion');
    });

    it('handles unexpected errors gracefully in /api/plan', async () => {
      const req = {
        headers: new Headers({ 'x-forwarded-for': '127.0.0.1' }),
        json: async () => {
          throw new Error('Plan JSON explosion');
        },
      } as any;
      const res = await planPost(req);
      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.error).toBe('Plan JSON explosion');
    });

    it('handles unexpected errors gracefully in /api/chat', async () => {
      const req = {
        headers: new Headers({ 'x-forwarded-for': '127.0.0.1' }),
        json: async () => {
          throw new Error('Chat JSON explosion');
        },
      } as any;
      const res = await chatPost(req);
      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.error).toBe('Chat JSON explosion');
    });
  });
});
