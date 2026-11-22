/**
 * AerisPulse Breakpoint & Sub-Index Engine (US EPA 454/B-18-007)
 * Implements piecewise linear interpolation for multi-pollutant AQI sub-indices.
 */

import { AirQualityCategory, PollutantReadings } from '../domain/types';

export interface Breakpoint {
  cLow: number;
  cHigh: number;
  iLow: number;
  iHigh: number;
}

// US EPA AQI Breakpoints (EPA 454/B-18-007)
export const PM25_BREAKPOINTS: Breakpoint[] = [
  { cLow: 0.0, cHigh: 12.0, iLow: 0, iHigh: 50 },
  { cLow: 12.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
  { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
  { cLow: 55.5, cHigh: 150.4, iLow: 151, iHigh: 200 },
  { cLow: 150.5, cHigh: 250.4, iLow: 201, iHigh: 300 },
  { cLow: 250.5, cHigh: 500.4, iLow: 301, iHigh: 500 },
];

export const PM10_BREAKPOINTS: Breakpoint[] = [
  { cLow: 0, cHigh: 54, iLow: 0, iHigh: 50 },
  { cLow: 55, cHigh: 154, iLow: 51, iHigh: 100 },
  { cLow: 155, cHigh: 254, iLow: 101, iHigh: 150 },
  { cLow: 255, cHigh: 354, iLow: 151, iHigh: 200 },
  { cLow: 355, cHigh: 424, iLow: 201, iHigh: 300 },
  { cLow: 425, cHigh: 604, iLow: 301, iHigh: 500 },
];

export const NO2_BREAKPOINTS: Breakpoint[] = [
  { cLow: 0, cHigh: 53, iLow: 0, iHigh: 50 },
  { cLow: 54, cHigh: 100, iLow: 51, iHigh: 100 },
  { cLow: 101, cHigh: 360, iLow: 101, iHigh: 150 },
  { cLow: 361, cHigh: 649, iLow: 151, iHigh: 200 },
  { cLow: 650, cHigh: 1249, iLow: 201, iHigh: 300 },
];

export const O3_BREAKPOINTS: Breakpoint[] = [
  { cLow: 0, cHigh: 54, iLow: 0, iHigh: 50 },
  { cLow: 55, cHigh: 70, iLow: 51, iHigh: 100 },
  { cLow: 71, cHigh: 85, iLow: 101, iHigh: 150 },
  { cLow: 86, cHigh: 105, iLow: 151, iHigh: 200 },
  { cLow: 106, cHigh: 200, iLow: 201, iHigh: 300 },
];

export const SO2_BREAKPOINTS: Breakpoint[] = [
  { cLow: 0, cHigh: 35, iLow: 0, iHigh: 50 },
  { cLow: 36, cHigh: 75, iLow: 51, iHigh: 100 },
  { cLow: 76, cHigh: 185, iLow: 101, iHigh: 150 },
  { cLow: 186, cHigh: 304, iLow: 151, iHigh: 200 },
  { cLow: 305, cHigh: 604, iLow: 201, iHigh: 300 },
];

/**
 * Calculates piecewise linear AQI sub-index for a single pollutant according to US EPA standards.
 * 
 * @param concentration - Truncated ambient pollutant concentration in µg/m³ (or mg/m³ for CO)
 * @param breakpoints - Breakpoint lookup table defining concentration and AQI bounds
 * @returns Computed AQI sub-index rounded to nearest integer
 * @see docs/METHODOLOGY.md - Section 1: Multi-Pollutant US EPA Air Quality Index (AQI) Calculation
 */
export function calculateSubIndex(concentration: number, breakpoints: Breakpoint[]): number {
  if (concentration <= 0) return 0;

  for (const bp of breakpoints) {
    if (concentration >= bp.cLow && concentration <= bp.cHigh) {
      const aqi =
        ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (concentration - bp.cLow) + bp.iLow;
      return Math.round(aqi);
    }
  }

  // Beyond highest breakpoint: extrapolate linearly based on final slope
  const lastBp = breakpoints[breakpoints.length - 1];
  if (!lastBp) return 500;
  if (concentration > lastBp.cHigh) {
    const slope = (lastBp.iHigh - lastBp.iLow) / (lastBp.cHigh - lastBp.cLow);
    return Math.min(500, Math.round(lastBp.iHigh + slope * (concentration - lastBp.cHigh)));
  }

  return 0;
}

/**
 * Maps numerical US AQI score to standardized EPA public health warning category bands.
 * 
 * @param aqi - Numerical Air Quality Index (0 - 500)
 * @returns Standard EPA descriptor category ('Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous')
 * @see docs/METHODOLOGY.md - Section 1: Multi-Pollutant US EPA Air Quality Index (AQI) Calculation
 */
export function getAirQualityCategory(aqi: number): AirQualityCategory {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

/**
 * Computes multi-pollutant composite AQI governed by the maximum critical pollutant sub-index.
 * 
 * @param pollutants - Object containing PM2.5, PM10, NO2, SO2, O3, and CO ambient concentrations
 * @returns Object containing the governing AQI, dominant pollutant identifier, and individual sub-indices
 * @see docs/METHODOLOGY.md - Section 1: Multi-Pollutant US EPA Air Quality Index (AQI) Calculation
 */
export function calculateCompositeAqi(pollutants: PollutantReadings): {
  aqi: number;
  dominantPollutant: keyof PollutantReadings;
  subIndices: Record<keyof PollutantReadings, number>;
} {
  const subIndices: Record<keyof PollutantReadings, number> = {
    pm25: calculateSubIndex(pollutants.pm25, PM25_BREAKPOINTS),
    pm10: calculateSubIndex(pollutants.pm10, PM10_BREAKPOINTS),
    no2: calculateSubIndex(pollutants.no2, NO2_BREAKPOINTS),
    o3: calculateSubIndex(pollutants.o3, O3_BREAKPOINTS),
    so2: calculateSubIndex(pollutants.so2, SO2_BREAKPOINTS),
    co: calculateSubIndex(pollutants.co / 1000, PM10_BREAKPOINTS), // CO mg/m³ normalized
  };

  let maxAqi = 0;
  let dominant: keyof PollutantReadings = 'pm25';

  (Object.keys(subIndices) as Array<keyof PollutantReadings>).forEach((pollutant) => {
    const val = subIndices[pollutant];
    if (val > maxAqi) {
      maxAqi = val;
      dominant = pollutant;
    }
  });

  return {
    aqi: maxAqi,
    dominantPollutant: dominant,
    subIndices,
  };
}
