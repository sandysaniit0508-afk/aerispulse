import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeminiService } from '../services/gemini-service';

function extractChunks(rawOutput: string): string {
  const matches = rawOutput.match(/"chunk":"([^"]+)"/g);
  if (!matches) return rawOutput;
  return matches.map((m) => m.slice(9, -1)).join('');
}

describe('GeminiService Branch Coverage', () => {
  beforeEach(() => {
    delete process.env.GEMINI_API_KEY;
    vi.restoreAllMocks();
  });

  it('covers moderate exercise condition in English', async () => {
    const stream = await GeminiService.streamChat(
      'Can I jog outside?',
      'Bengaluru',
      85, // <= 150
      'pm25',
      30,
      'en'
    );
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let raw = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      raw += decoder.decode(value);
    }
    const text = extractChunks(raw);
    expect(text).toContain('moderate');
  });

  it('covers moderate exercise condition in Tamil', async () => {
    const stream = await GeminiService.streamChat(
      'நான் உடற்பயிற்சி செய்யலாமா?',
      'சென்னை',
      85, // <= 150
      'pm25',
      30,
      'ta'
    );
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let raw = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      raw += decoder.decode(value);
    }
    const text = extractChunks(raw);
    expect(text).toContain('லேசான உடற்பயிற்சி');
  });

  it('covers moderate exercise condition in Hindi', async () => {
    const stream = await GeminiService.streamChat(
      'क्या मैं व्यायाम कर सकता हूँ?',
      'दिल्ली',
      85, // <= 150
      'pm25',
      30,
      'hi'
    );
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let raw = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      raw += decoder.decode(value);
    }
    const text = extractChunks(raw);
    expect(text).toContain('हल्की सैर');
  });

  it('covers children/elderly advice in English', async () => {
    const stream = await GeminiService.streamChat(
      'Advice for elderly asthma patients?',
      'Delhi NCR',
      280,
      'pm25',
      190,
      'en'
    );
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let raw = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      raw += decoder.decode(value);
    }
    const text = extractChunks(raw);
    expect(text).toContain('Pediatric and sensitive populations');
  });

  it('covers general advice default in Tamil', async () => {
    const stream = await GeminiService.streamChat(
      'பொதுவான நிலவரம் என்ன?',
      'சென்னை',
      120,
      'so2',
      45,
      'ta'
    );
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let raw = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      raw += decoder.decode(value);
    }
    const text = extractChunks(raw);
    expect(text).toContain('பகுதிக்கான தற்போதைய காற்று தரம்');
  });

  it('covers general advice default in English', async () => {
    const stream = await GeminiService.streamChat(
      'General overview please',
      'Mumbai Coastal',
      90,
      'pm10',
      40,
      'en'
    );
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let raw = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      raw += decoder.decode(value);
    }
    const text = extractChunks(raw);
    expect(text).toContain('air quality is currently recorded');
  });

  it('covers live SDK streaming error catch branch', async () => {
    process.env.GEMINI_API_KEY = 'mock-key';

    vi.spyOn(GeminiService as any, 'getClient').mockReturnValue({
      getGenerativeModel: () => ({
        generateContentStream: async () => ({
          stream: (async function* () {
            throw new Error('Streaming connection reset');
          })(),
        }),
      }),
    });

    const stream = await GeminiService.streamChat(
      'Test query',
      'Delhi NCR',
      100,
      'pm25',
      50,
      'en'
    );

    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let raw = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      raw += decoder.decode(value);
    }
    expect(raw).toContain('Stream completed');
  });

  it('covers live SDK model initialization throwing exception', async () => {
    process.env.GEMINI_API_KEY = 'mock-key';

    vi.spyOn(GeminiService as any, 'getClient').mockReturnValue({
      getGenerativeModel: () => {
        throw new Error('Model init failed');
      },
    });

    const stream = await GeminiService.streamChat(
      'Test query',
      'Delhi NCR',
      100,
      'pm25',
      50,
      'en'
    );

    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let raw = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      raw += decoder.decode(value);
    }
    const text = extractChunks(raw);
    expect(text).toContain('Delhi NCR');
  });
});
