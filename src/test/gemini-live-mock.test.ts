import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeminiService } from '../services/gemini-service';
import { PollutantReadings } from '../domain/types';

describe('GeminiService Mocked SDK Live Execution', () => {
  const dummyPollutants: PollutantReadings = {
    pm25: 140,
    pm10: 220,
    no2: 50,
    so2: 15,
    o3: 35,
    co: 900,
  };

  beforeEach(() => {
    process.env.GEMINI_API_KEY = 'mock-key-12345';
    vi.restoreAllMocks();
  });

  it('generates structured action plan with validated Gemini output', async () => {
    const mockJson = JSON.stringify({
      summary: 'Extreme air pollution detected across Delhi NCR. Precautionary protocols enacted.',
      compositeRiskLevel: 'EXTREME',
      items: [
        {
          category: 'indoor',
          priority: 'critical',
          title: 'HEPA Purifier Active',
          action: 'Keep indoor air purifiers running continuously.',
          impactMetric: '85% PM2.5 abatement',
        },
        {
          category: 'commute',
          priority: 'high',
          title: 'Sealed Transit',
          action: 'Commute via metro rail with fitted N95 respirator.',
          impactMetric: '95% filtration',
        },
        {
          category: 'health',
          priority: 'moderate',
          title: 'Indoor Workout',
          action: 'Shift aerobic exercise indoors.',
          impactMetric: 'Zero pulmonary deposition',
        },
        {
          category: 'community',
          priority: 'low',
          title: 'Report Smoke',
          action: 'Report local open waste incineration.',
          impactMetric: 'Air basin defense',
        },
      ],
    });

    vi.spyOn(GeminiService as unknown as { getClient: () => unknown }, 'getClient').mockReturnValue({
      getGenerativeModel: () => ({
        generateContent: async () => ({
          response: {
            text: () => mockJson,
          },
        }),
      }),
    });

    const plan = await GeminiService.generateActionPlan(
      'Delhi NCR',
      240,
      'pm25',
      dummyPollutants,
      'en'
    );

    expect(plan.isFallback).toBe(false);
    expect(plan.compositeRiskLevel).toBe('EXTREME');
    expect(plan.items.length).toBe(4);
  });

  it('handles schema validation failure from Gemini by failing over to deterministic fallback', async () => {
    const invalidJson = JSON.stringify({
      invalidKey: 'missing summary and items',
    });

    vi.spyOn(GeminiService as unknown as { getClient: () => unknown }, 'getClient').mockReturnValue({
      getGenerativeModel: () => ({
        generateContent: async () => ({
          response: {
            text: () => invalidJson,
          },
        }),
      }),
    });

    const plan = await GeminiService.generateActionPlan(
      'Delhi NCR',
      240,
      'pm25',
      dummyPollutants,
      'en'
    );

    expect(plan.isFallback).toBe(true);
    expect(plan.compositeRiskLevel).toBe('HIGH');
  });

  it('handles live Gemini streaming content generation', async () => {
    async function* mockStreamGenerator() {
      yield { text: () => 'Air quality is ' };
      yield { text: () => 'moderate today.' };
    }

    vi.spyOn(GeminiService as unknown as { getClient: () => unknown }, 'getClient').mockReturnValue({
      getGenerativeModel: () => ({
        generateContentStream: async () => ({
          stream: mockStreamGenerator(),
        }),
      }),
    });

    const stream = await GeminiService.streamChat(
      'Is jogging safe today?',
      'Delhi NCR',
      80,
      'pm25',
      35,
      'en'
    );

    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let text = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      text += decoder.decode(value);
    }

    expect(text).toContain('Air quality is ');
    expect(text).toContain('moderate today.');
    expect(text).toContain('[DONE]');
  });
});
