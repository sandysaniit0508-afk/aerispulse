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
import {
  RESTING_VENTILATION_RATE_M3_HR,
  LIGHT_ACTIVITY_VENTILATION_RATE_M3_HR,
  MASK_EFFICIENCY_NONE,
  MASK_EFFICIENCY_CLOTH,
  MASK_EFFICIENCY_N95,
  HEPA_FILTER_ACTIVE_EFFICIENCY,
  HEPA_FILTER_PASSIVE_EFFICIENCY,
  WHO_PM25_COUNTERFACTUAL_UG_M3,
  BURNETT_GEMM_BETA_COEFFICIENT,
  CREI_PM25_NORMALIZATION_UG_M3,
  CREI_PM25_WEIGHT_PERCENT,
  CREI_NO2_NORMALIZATION_UG_M3,
  CREI_NO2_WEIGHT_PERCENT,
  DEFRA_CAR_EMISSION_FACTOR,
  DEFRA_TWO_WHEELER_EMISSION_FACTOR,
  DEFRA_METRO_EMISSION_FACTOR,
  DEFRA_BICYCLE_EMISSION_FACTOR,
  BASELINE_MONTHLY_HEALTH_BURDEN_INR,
  INR_TO_USD_EXCHANGE_RATE,
} from './calculator-constants';

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

/**
 * Estimates human inhaled PM2.5 dosage mass using International Commission on Radiological Protection equations.
 * 
 * @param ambientPm25 - Ambient fine particulate concentration in µg/m³
 * @param hoursOutdoor - Total exposure duration spent in unconditioned outdoor ambient air
 * @param maskEfficiency - Fractional filtration efficiency of personal respirator (0.0 to 0.95)
 * @param hepaEfficiency - Fractional filtration efficiency of indoor air purifier (0.0 to 0.85)
 * @returns Estimated total deposited PM2.5 mass in micrograms (µg)
 * @see docs/METHODOLOGY.md - Section 2: Inhaled Particulate Matter Dosage Formulation
 */
export function calculateInhaledDosage(
  ambientPm25: number,
  hoursOutdoor: number,
  maskEfficiency: number,
  hepaEfficiency: number
): number {
  const outdoorHours = Math.max(0, Math.min(24, hoursOutdoor));
  const indoorHours = Math.max(0, 24 - outdoorHours);

  // Outdoor ventilation rate: light activity average
  const outdoorInhaled =
    ambientPm25 * LIGHT_ACTIVITY_VENTILATION_RATE_M3_HR * outdoorHours * (1 - maskEfficiency);

  // Indoor concentration: ambient modulated by HEPA filtration
  const indoorConc = ambientPm25 * (1 - hepaEfficiency);
  // Indoor resting ventilation rate
  const indoorInhaled = indoorConc * RESTING_VENTILATION_RATE_M3_HR * indoorHours;

  return Math.round((outdoorInhaled + indoorInhaled) * 10) / 10;
}

/**
 * Calculates Chronic Respiratory Exposure Index (CREI) scaled from 0 to 100.
 * 
 * @param pm25 - Ambient fine particulate concentration in µg/m³
 * @param no2 - Ambient nitrogen dioxide concentration in µg/m³
 * @returns Normalized health exposure index between 0 and 100
 * @see docs/METHODOLOGY.md - Section 3: Epidemiological Relative Risk & Chronic Respiratory Exposure Index (CREI)
 */
export function calculateCREI(pm25: number, no2: number): number {
  const pmComponent = (Math.min(pm25, CREI_PM25_NORMALIZATION_UG_M3) / CREI_PM25_NORMALIZATION_UG_M3) * CREI_PM25_WEIGHT_PERCENT;
  const no2Component = (Math.min(no2, CREI_NO2_NORMALIZATION_UG_M3) / CREI_NO2_NORMALIZATION_UG_M3) * CREI_NO2_WEIGHT_PERCENT;
  return Math.min(100, Math.round(pmComponent + no2Component));
}

/**
 * Computes acute cardiovascular and respiratory exacerbation relative risk increase (%).
 * 
 * @param pm25 - Ambient fine particulate concentration in µg/m³
 * @returns Percentage increase in acute cardiopulmonary exacerbation probability
 * @see docs/METHODOLOGY.md - Section 3: Epidemiological Relative Risk & Chronic Respiratory Exposure Index (CREI)
 */
export function calculateRelativeRiskIncrease(pm25: number): number {
  const delta = Math.max(0, pm25 - WHO_PM25_COUNTERFACTUAL_UG_M3);
  const rr = Math.exp(BURNETT_GEMM_BETA_COEFFICIENT * delta);
  return Math.round((rr - 1) * 1000) / 10;
}

/**
 * Computes commute modal carbon emission footprint and savings relative to passenger car baseline.
 * 
 * @param mode - Selected transit modality ('car' | 'twoWheeler' | 'metro' | 'bicycle')
 * @param distanceKm - Round-trip daily commute distance in kilometers
 * @returns Object containing baseline carbon, actual emissions, and avoided carbon mass in kg
 * @see docs/METHODOLOGY.md - Section 4: Modal Commute Carbon Emission Abatement
 */
export function calculateCommuteCarbon(
  mode: SimulatorInputs['commuteMode'],
  distanceKm: number
): { baselineCarKg: number; actualKg: number; savedKg: number } {
  const factors: Record<SimulatorInputs['commuteMode'], number> = {
    car: DEFRA_CAR_EMISSION_FACTOR,
    twoWheeler: DEFRA_TWO_WHEELER_EMISSION_FACTOR,
    metro: DEFRA_METRO_EMISSION_FACTOR,
    bicycle: DEFRA_BICYCLE_EMISSION_FACTOR,
  };

  const baselineCarKg = Math.round(distanceKm * factors.car * 100) / 100;
  const actualKg = Math.round(distanceKm * (factors[mode] ?? DEFRA_CAR_EMISSION_FACTOR) * 100) / 100;
  const savedKg = Math.max(0, Math.round((baselineCarKg - actualKg) * 100) / 100);

  return { baselineCarKg, actualKg, savedKg };
}

/**
 * Calculates monthly healthcare cost savings from inhaled particulate exposure reduction.
 * 
 * @param inhaledDosageReductionPercent - Percentage reduction in inhaled particulate deposition
 * @returns Estimated monthly economic savings in INR and USD
 * @see docs/METHODOLOGY.md - Section 5: Economic Health Savings & Acute Symptom Mitigation
 */
export function calculateHealthSavings(
  inhaledDosageReductionPercent: number
): { monthlyInr: number; monthlyUsd: number } {
  const monthlyInr = Math.round((BASELINE_MONTHLY_HEALTH_BURDEN_INR * (inhaledDosageReductionPercent / 100)));
  const monthlyUsd = Math.round(monthlyInr * INR_TO_USD_EXCHANGE_RATE * 10) / 10;

  return { monthlyInr, monthlyUsd };
}

/**
 * Evaluates lifestyle and protective behavior permutations in real-time.
 * 
 * @param inputs - User-selected transit mode, commute distance, mask grade, and HEPA filter status
 * @param ambientPm25 - Current ambient PM2.5 level in µg/m³
 * @returns Quantified multi-dimensional impact metrics
 * @see docs/METHODOLOGY.md - Sections 2, 4, and 5
 */
export function calculateSimulation(
  inputs: SimulatorInputs,
  ambientPm25: number
): SimulatorOutputs {
  const maskEfficiencyMap: Record<SimulatorInputs['maskGrade'], number> = {
    none: MASK_EFFICIENCY_NONE,
    cloth: MASK_EFFICIENCY_CLOTH,
    n95: MASK_EFFICIENCY_N95,
  };

  const maskEff = maskEfficiencyMap[inputs.maskGrade];
  const hepaEff = inputs.hepaFilterEnabled ? HEPA_FILTER_ACTIVE_EFFICIENCY : HEPA_FILTER_PASSIVE_EFFICIENCY;

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
 * Generates an aggregated suite of physiological and environmental metrics for active telemetry.
 * 
 * @param pollutants - Object containing current ambient pollutant readings
 * @returns Comprehensive calculation metrics suite
 * @see docs/METHODOLOGY.md - Sections 1 through 5
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
