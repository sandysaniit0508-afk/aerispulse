import { describe, it, expect } from 'vitest';
import { ValidationService } from '../services/validation-service';

describe('ValidationService: Multi-Source Anomaly Detection', () => {
  it('identifies high convergence when variance is low', () => {
    // 100 vs 110 (10 / 110 = 9% delta)
    const result = ValidationService.validate(100, 110);
    expect(result.isDiscrepant).toBe(false);
    expect(result.safetyElevationLevel).toBe('NORMAL');
    expect(result.deltaPercentage).toBe(9);
    expect(result.confidenceScore).toBeGreaterThanOrEqual(90);
  });

  it('detects moderate discrepancy when delta is between 25% and 50%', () => {
    // 100 vs 140 (40 / 140 = 29% delta)
    const result = ValidationService.validate(100, 140);
    expect(result.isDiscrepant).toBe(true);
    expect(result.safetyElevationLevel).toBe('ELEVATED');
    expect(result.deltaPercentage).toBe(29);
    expect(result.discrepancyMessage).toContain('Moderate telemetry discrepancy');
  });

  it('triggers critical safety elevation when delta exceeds 50%', () => {
    // 100 vs 220 (120 / 220 = 55% delta)
    const result = ValidationService.validate(100, 220);
    expect(result.isDiscrepant).toBe(true);
    expect(result.safetyElevationLevel).toBe('CRITICAL');
    expect(result.deltaPercentage).toBe(55);
    expect(result.discrepancyMessage).toContain('Critical telemetry divergence');
    expect(result.confidenceScore).toBeLessThan(70);
  });

  it('handles zero or near-zero AQI safely without divide-by-zero', () => {
    const result = ValidationService.validate(0, 0);
    expect(result.deltaPercentage).toBe(0);
    expect(result.safetyElevationLevel).toBe('NORMAL');
    expect(result.confidenceScore).toBe(100);
  });

  it('triggers ELEVATED when delta is exactly 25%', () => {
    // 75 vs 100 -> diff 25, max 100 -> 25%
    const result = ValidationService.validate(75, 100);
    expect(result.deltaPercentage).toBe(25);
    expect(result.safetyElevationLevel).toBe('ELEVATED');
    expect(result.isDiscrepant).toBe(true);
  });

  it('triggers CRITICAL when delta is 51%', () => {
    // 49 vs 100 -> diff 51, max 100 -> 51%
    const result = ValidationService.validate(49, 100);
    expect(result.deltaPercentage).toBe(51);
    expect(result.safetyElevationLevel).toBe('CRITICAL');
    expect(result.isDiscrepant).toBe(true);
  });

  it('handles station lower than model correctly', () => {
    // 200 model vs 100 station -> diff 100, max 200 -> 50% delta
    const result = ValidationService.validate(200, 100);
    expect(result.deltaPercentage).toBe(50);
    expect(result.safetyElevationLevel).toBe('ELEVATED');
  });

  it('handles minimal 5% delta with high confidence', () => {
    const result = ValidationService.validate(100, 95);
    expect(result.deltaPercentage).toBe(5);
    expect(result.safetyElevationLevel).toBe('NORMAL');
    expect(result.confidenceScore).toBeGreaterThanOrEqual(95);
  });

  it('handles negative inputs by clamping to positive integers', () => {
    const result = ValidationService.validate(-10, -20);
    expect(result.deltaPercentage).toBe(0);
    expect(result.confidenceScore).toBe(100);
  });
});
