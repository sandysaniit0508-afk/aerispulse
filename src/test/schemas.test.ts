import { describe, it, expect } from 'vitest';
import {
  PollutantReadingsSchema,
  ActionPlanItemSchema,
  ActionPlanSchema,
  TelemetryRequestSchema,
  ActionPlanRequestSchema,
  ChatRequestSchema,
  SimulatorInputSchema,
} from '../domain/schemas';

describe('Validation Schemas (Zod)', () => {
  describe('PollutantReadingsSchema', () => {
    it('validates correct pollutant readings', () => {
      const valid = {
        pm25: 65.4,
        pm10: 120.0,
        no2: 45.2,
        so2: 12.0,
        o3: 35.0,
        co: 850.0,
      };
      const result = PollutantReadingsSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rejects negative pollutant values', () => {
      const invalid = {
        pm25: -5,
        pm10: 120,
        no2: 45,
        so2: 12,
        o3: 35,
        co: 850,
      };
      const result = PollutantReadingsSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('rejects out-of-range excessive values', () => {
      const invalid = {
        pm25: 2500, // Max 1500
        pm10: 120,
        no2: 45,
        so2: 12,
        o3: 35,
        co: 850,
      };
      const result = PollutantReadingsSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('rejects missing fields', () => {
      const missing = { pm25: 50 };
      const result = PollutantReadingsSchema.safeParse(missing);
      expect(result.success).toBe(false);
    });
  });

  describe('ActionPlanItemSchema & ActionPlanSchema', () => {
    const validItem = {
      category: 'indoor',
      priority: 'critical',
      title: 'Run HEPA Filter',
      action: 'Run HEPA air purifier on continuous high recirculation.',
      impactMetric: '85% PM2.5 reduction',
    };

    it('validates an individual action plan item', () => {
      expect(ActionPlanItemSchema.safeParse(validItem).success).toBe(true);
    });

    it('rejects invalid categories or priorities', () => {
      expect(
        ActionPlanItemSchema.safeParse({ ...validItem, category: 'gaming' }).success
      ).toBe(false);
      expect(
        ActionPlanItemSchema.safeParse({ ...validItem, priority: 'urgent' }).success
      ).toBe(false);
    });

    it('validates a complete ActionPlan with 3-8 items', () => {
      const validPlan = {
        summary: 'Air quality in Delhi is severe. Precautionary isolation advised.',
        compositeRiskLevel: 'EXTREME',
        items: [
          validItem,
          { ...validItem, category: 'commute' },
          { ...validItem, category: 'health' },
        ],
      };
      expect(ActionPlanSchema.safeParse(validPlan).success).toBe(true);
    });

    it('rejects ActionPlan with fewer than 3 items', () => {
      const tooFew = {
        summary: 'Valid summary text exceeding ten characters.',
        compositeRiskLevel: 'HIGH',
        items: [validItem],
      };
      expect(ActionPlanSchema.safeParse(tooFew).success).toBe(false);
    });

    it('rejects ActionPlan with short summary', () => {
      const shortSummary = {
        summary: 'Short',
        compositeRiskLevel: 'HIGH',
        items: [validItem, validItem, validItem],
      };
      expect(ActionPlanSchema.safeParse(shortSummary).success).toBe(false);
    });
  });

  describe('TelemetryRequestSchema', () => {
    it('validates coordinate query params', () => {
      const valid = { cityId: 'delhi-ncr', lat: '28.6139', lon: '77.2090' };
      const result = TelemetryRequestSchema.safeParse(valid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.lat).toBe(28.6139);
        expect(result.data.lon).toBe(77.2090);
      }
    });

    it('rejects out-of-range coordinates', () => {
      expect(
        TelemetryRequestSchema.safeParse({ cityId: 'test', lat: 100, lon: 50 }).success
      ).toBe(false);
      expect(
        TelemetryRequestSchema.safeParse({ cityId: 'test', lat: 50, lon: 200 }).success
      ).toBe(false);
    });
  });

  describe('ActionPlanRequestSchema', () => {
    it('validates valid action plan request payload', () => {
      const payload = {
        cityId: 'delhi-ncr',
        cityName: 'Delhi NCR',
        aqi: 220,
        pollutants: {
          pm25: 140,
          pm10: 220,
          no2: 50,
          so2: 15,
          o3: 30,
          co: 900,
        },
        language: 'ta',
      };
      expect(ActionPlanRequestSchema.safeParse(payload).success).toBe(true);
    });

    it('defaults language to en if omitted', () => {
      const payload = {
        cityId: 'delhi-ncr',
        cityName: 'Delhi NCR',
        aqi: 220,
        pollutants: {
          pm25: 140,
          pm10: 220,
          no2: 50,
          so2: 15,
          o3: 30,
          co: 900,
        },
      };
      const result = ActionPlanRequestSchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.language).toBe('en');
      }
    });
  });

  describe('ChatRequestSchema', () => {
    it('validates chat request payload', () => {
      const payload = {
        message: 'Is it safe to jog outside?',
        cityName: 'Mumbai Coastal',
        aqi: 85,
        dominantPollutant: 'pm10',
        pm25: 35.5,
        language: 'en',
      };
      expect(ChatRequestSchema.safeParse(payload).success).toBe(true);
    });

    it('rejects empty message', () => {
      const payload = {
        message: '',
        cityName: 'Mumbai Coastal',
        aqi: 85,
        dominantPollutant: 'pm10',
        pm25: 35.5,
      };
      expect(ChatRequestSchema.safeParse(payload).success).toBe(false);
    });
  });

  describe('SimulatorInputSchema', () => {
    it('validates simulator inputs', () => {
      const valid = {
        commuteMode: 'metro',
        commuteDistanceKm: 25,
        maskGrade: 'n95',
        hepaFilterEnabled: true,
        outdoorExerciseHours: 1.5,
      };
      expect(SimulatorInputSchema.safeParse(valid).success).toBe(true);
    });

    it('rejects negative distance or invalid mode', () => {
      expect(
        SimulatorInputSchema.safeParse({
          commuteMode: 'helicopter',
          commuteDistanceKm: 25,
          maskGrade: 'n95',
          hepaFilterEnabled: true,
          outdoorExerciseHours: 1.5,
        }).success
      ).toBe(false);

      expect(
        SimulatorInputSchema.safeParse({
          commuteMode: 'metro',
          commuteDistanceKm: -5,
          maskGrade: 'n95',
          hepaFilterEnabled: true,
          outdoorExerciseHours: 1.5,
        }).success
      ).toBe(false);
    });
  });
});
