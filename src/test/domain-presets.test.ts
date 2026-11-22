import { describe, it, expect } from 'vitest';
import { METRO_PRESETS } from '../domain/presets';

describe('Domain Presets: 4 Metro Hubs', () => {
  it('contains exactly 4 pre-configured metro presets', () => {
    expect(METRO_PRESETS.length).toBe(4);
  });

  it('contains Delhi NCR with valid coordinates and state', () => {
    const delhi = METRO_PRESETS.find((p) => p.id === 'delhi-ncr');
    expect(delhi).toBeDefined();
    expect(delhi?.state).toBe('Delhi');
    expect(delhi?.latitude).toBeCloseTo(28.61, 1);
    expect(delhi?.longitude).toBeCloseTo(77.20, 1);
    expect(delhi?.nameTa).toBeDefined();
    expect(delhi?.nameHi).toBeDefined();
  });

  it('contains Mumbai Coastal with valid coordinates and state', () => {
    const mumbai = METRO_PRESETS.find((p) => p.id === 'mumbai-coastal');
    expect(mumbai).toBeDefined();
    expect(mumbai?.state).toBe('Maharashtra');
    expect(mumbai?.latitude).toBeCloseTo(18.92, 1);
    expect(mumbai?.longitude).toBeCloseTo(72.83, 1);
  });

  it('contains Bengaluru Corridor with valid coordinates and state', () => {
    const blr = METRO_PRESETS.find((p) => p.id === 'bengaluru-corridor');
    expect(blr).toBeDefined();
    expect(blr?.state).toBe('Karnataka');
    expect(blr?.latitude).toBeCloseTo(12.97, 1);
    expect(blr?.longitude).toBeCloseTo(77.59, 1);
  });

  it('contains Chennai Industrial with valid coordinates and state', () => {
    const chennai = METRO_PRESETS.find((p) => p.id === 'chennai-industrial');
    expect(chennai).toBeDefined();
    expect(chennai?.state).toBe('Tamil Nadu');
    expect(chennai?.latitude).toBeCloseTo(13.08, 1);
    expect(chennai?.longitude).toBeCloseTo(80.27, 1);
  });

  it('ensures all presets have unique IDs', () => {
    const ids = METRO_PRESETS.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('ensures all presets have microclimate tags and descriptions', () => {
    METRO_PRESETS.forEach((preset) => {
      expect(preset.microclimateTag.length).toBeGreaterThan(5);
      expect(preset.description.length).toBeGreaterThan(10);
    });
  });
});
