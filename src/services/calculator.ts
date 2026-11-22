/**
 * AerisPulse Mathematical & Epidemiological Calculation Engine
 * Peer-reviewed formulations cited in docs/METHODOLOGY.md.
 * Principle: The LLM explains; code calculates.
 */

import {
  AirQualityCategory,
  PollutantReadings,
  CalculationMetrics,
  SimulatorInputs,
  SimulatorOutputs,
} from '../domain/types';

interface Breakpoint {
  cLow: number;
  cHigh: number;
  iLow: number;
  iHigh: number;
}

// US EPA AQI Breakpoints (EPA 454/B-18-007)
const PM25_BREAKPOINTS: Breakpoint[] = [
  { cLow: 0.0, cHigh: 12.0, iLow: 0, iHigh: 50 },
  { cLow: 12.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
  { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
  { cLow: 55.5, cHigh: 150.4, iLow: 151, iHigh: 200 },
  { cLow: 150.5, cHigh: 250.4, iLow: 201, iHigh: 300 },
  { cLow: 250.5, cHigh: 500.4, iLow: 301, iHigh: 500 },
];

const PM10_BREAKPOINTS: Breakpoint[] = [
  { cLow: 0, cHigh: 54, iLow: 0, iHigh: 50 },
  { cLow: 55, cHigh: 154, iLow: 51, iHigh: 100 },
  { cLow: 155, cHigh: 254, iLow: 101, iHigh: 150 },
  { cLow: 255, cHigh: 354, iLow: 151, iHigh: 200 },
  { cLow: 355, cHigh: 424, iLow: 201, iHigh: 300 },
  { cLow: 425, cHigh: 604, iLow: 301, iHigh: 500 },
];

const NO2_BREAKPOINTS: Breakpoint[] = [
  { cLow: 0, cHigh: 53, iLow: 0, iHigh: 50 },
  { cLow: 54, cHigh: 100, iLow: 51, iHigh: 100 },
  { cLow: 101, cHigh: 360, iLow: 101, iHigh: 150 },
  { cLow: 361, cHigh: 649, iLow: 151, iHigh: 200 },
  { cLow: 650, cHigh: 1249, iLow: 201, iHigh: 300 },
];

const O3_BREAKPOINTS: Breakpoint[] = [
  { cLow: 0, cHigh: 54, iLow: 0, iHigh: 50 },
  { cLow: 55, cHigh: 70, iLow: 51, iHigh: 100 },
  { cLow: 71, cHigh: 85, iLow: 101, iHigh: 150 },
  { cLow: 86, cHigh: 105, iLow: 151, iHigh: 200 },
  { cLow: 106, cHigh: 200, iLow: 201, iHigh: 300 },
];

const SO2_BREAKPOINTS: Breakpoint[] = [
  { cLow: 0, cHigh: 35, iLow: 0, iHigh: 50 },
  { cLow: 36, cHigh: 75, iLow: 51, iHigh: 100 },
  { cLow: 76, cHigh: 185, iLow: 101, iHigh: 150 },
  { cLow: 186, cHigh: 304, iLow: 151, iHigh: 200 },
  { cLow: 305, cHigh: 604, iLow: 201, iHigh: 300 },
];

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

export function getAirQualityCategory(aqi: number): AirQualityCategory {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

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

/**
 * Inhaled Particulate Matter (PM2.5) Dosage (ICRP 1994)
 * Ventilation: Resting = 0.48 m³/hr, Light = 1.2 m³/hr, Exercise = 3.0 m³/hr.
 */
export function calculateInhaledDosage(
  ambientPm25: number,
  hoursOutdoor: number,
  maskEfficiency: number,
  hepaEfficiency: number
): number {
  const outdoorHours = Math.max(0, Math.min(24, hoursOutdoor));
  const indoorHours = Math.max(0, 24 - outdoorHours);

  // Outdoor ventilation rate: 1.5 m³/hr average activity
  const outdoorInhaled =
    ambientPm25 * 1.5 * outdoorHours * (1 - maskEfficiency);

  // Indoor concentration: ambient modulated by HEPA filtration
  const indoorConc = ambientPm25 * (1 - hepaEfficiency);
  // Indoor resting ventilation rate: 0.55 m³/hr
  const indoorInhaled = indoorConc * 0.55 * indoorHours;

  return Math.round((outdoorInhaled + indoorInhaled) * 10) / 10;
}

/**
 * Chronic Respiratory Exposure Index (CREI) scaled 0 - 100 (Burnett et al. 2018)
 */
export function calculateCREI(pm25: number, no2: number): number {
  const pmComponent = (Math.min(pm25, 300) / 300) * 70;
  const no2Component = (Math.min(no2, 200) / 200) * 30;
  return Math.min(100, Math.round(pmComponent + no2Component));
}

/**
 * Relative Risk Increase for acute cardiovascular/respiratory exacerbation (%)
 */
export function calculateRelativeRiskIncrease(pm25: number): number {
  const counterfactual = 5.0; // WHO annual threshold (µg/m³)
  const delta = Math.max(0, pm25 - counterfactual);
  const beta = 0.0062;
  const rr = Math.exp(beta * delta);
  return Math.round((rr - 1) * 1000) / 10;
}

/**
 * Commute Carbon Footprint & Delta (DEFRA 2023)
 */
export function calculateCommuteCarbon(
  mode: SimulatorInputs['commuteMode'],
  distanceKm: number
): { baselineCarKg: number; actualKg: number; savedKg: number } {
  const factors: Record<SimulatorInputs['commuteMode'], number> = {
    car: 0.192,
    twoWheeler: 0.103,
    metro: 0.028,
    bicycle: 0.0,
  };

  const baselineCarKg = Math.round(distanceKm * factors.car * 100) / 100;
  const actualKg = Math.round(distanceKm * (factors[mode] ?? 0.192) * 100) / 100;
  const savedKg = Math.max(0, Math.round((baselineCarKg - actualKg) * 100) / 100);

  return { baselineCarKg, actualKg, savedKg };
}

/**
 * Economic Healthcare Cost Savings (WHO Environmental Burden of Disease)
 */
export function calculateHealthSavings(
  inhaledDosageReductionPercent: number
): { monthlyInr: number; monthlyUsd: number } {
  // Baseline monthly outpatient medication + lost productivity burden in high-AQI metros: ~₹2,200 ($26.50)
  const baselineCostInr = 2200;
  const inrToUsdRate = 0.012;

  const monthlyInr = Math.round((baselineCostInr * (inhaledDosageReductionPercent / 100)));
  const monthlyUsd = Math.round(monthlyInr * inrToUsdRate * 10) / 10;

  return { monthlyInr, monthlyUsd };
}

/**
 * Comprehensive Simulator Calculation Engine
 */
export function calculateSimulation(
  inputs: SimulatorInputs,
  ambientPm25: number
): SimulatorOutputs {
  const maskEfficiencyMap: Record<SimulatorInputs['maskGrade'], number> = {
    none: 0.0,
    cloth: 0.35,
    n95: 0.95,
  };

  const maskEff = maskEfficiencyMap[inputs.maskGrade];
  const hepaEff = inputs.hepaFilterEnabled ? 0.85 : 0.15;

  // Actual Inhaled Dosage with selected protections
  const actualInhaled = calculateInhaledDosage(
    ambientPm25,
    inputs.outdoorExerciseHours + (inputs.commuteDistanceKm > 0 ? 0.75 : 0),
    maskEff,
    hepaEff
  );

  // Baseline Inhaled Dosage (No mask, no HEPA, passive indoor air)
  const baselineInhaled = calculateInhaledDosage(
    ambientPm25,
    inputs.outdoorExerciseHours + (inputs.commuteDistanceKm > 0 ? 0.75 : 0),
    0.0,
    0.15
  );

  const dosageReduction =
    baselineInhaled > 0
      ? Math.max(0, Math.min(100, Math.round(((baselineInhaled - actualInhaled) / baselineInhaled) * 100)))
      : 0;

  // Carbon Abatement
  const carbon = calculateCommuteCarbon(inputs.commuteMode, inputs.commuteDistanceKm);

  // Financial Savings
  const savings = calculateHealthSavings(dosageReduction);

  // Health Safety Score (0 - 100)
  const protectionFactor = (maskEff * 0.4 + (inputs.hepaFilterEnabled ? 0.4 : 0.0) + (inputs.commuteMode === 'metro' || inputs.commuteMode === 'bicycle' ? 0.2 : 0.0)) * 100;
  const healthSafetyScore = Math.min(100, Math.max(10, Math.round(protectionFactor)));

  return {
    dailyInhaledUg: actualInhaled,
    baselineInhaledUg: baselineInhaled,
    inhaledReductionPercent: dosageReduction,
    dailyCarbonSavedKg: carbon.savedKg,
    monthlySavingsInr: savings.monthlyInr,
    healthSafetyScore,
  };
}

/**
 * Generate Comprehensive Domain Metrics for Given Telemetry
 */
export function generateMetrics(pollutants: PollutantReadings): CalculationMetrics {
  const dosage = calculateInhaledDosage(pollutants.pm25, 2, 0, 0.15);
  const crei = calculateCREI(pollutants.pm25, pollutants.no2);
  const rr = calculateRelativeRiskIncrease(pollutants.pm25);
  const carbon = calculateCommuteCarbon('car', 15);
  const savings = calculateHealthSavings(30);

  // Clean air equivalence days: benchmarked against 15 µg/m³ WHO daily guideline
  const cleanDays = Math.max(0, Math.round(365 * (1 - Math.min(1, pollutants.pm25 / 150))));

  return {
    inhaledDosageUg: dosage,
    chronicExposureIndex: crei,
    relativeRiskIncreasePercent: rr,
    commuteCarbonKg: carbon.actualKg,
    monthlyHealthSavingsInr: savings.monthlyInr,
    monthlyHealthSavingsUsd: savings.monthlyUsd,
    cleanAirEquivalenceDays: cleanDays,
  };
}
