/**
 * AerisPulse Mathematical & Epidemiological Calculation Engine
 * Peer-reviewed formulations cited in docs/METHODOLOGY.md.
 * Principle: The LLM explains; code calculates.
 */

import {
  CalculationMetrics,
  PollutantReadings,
} from '../domain/types';
import {
  RESTING_VENTILATION_RATE_M3_HR,
  LIGHT_ACTIVITY_VENTILATION_RATE_M3_HR,
  WHO_PM25_COUNTERFACTUAL_UG_M3,
  BURNETT_GEMM_BETA_COEFFICIENT,
  CREI_PM25_NORMALIZATION_UG_M3,
  CREI_PM25_WEIGHT_PERCENT,
  CREI_NO2_NORMALIZATION_UG_M3,
  CREI_NO2_WEIGHT_PERCENT,
} from './calculator-constants';
import { calculateCommuteCarbon, calculateHealthSavings } from './simulation-calculator';

// Re-export EPA AQI breakpoints and sub-index engine
export * from './aqi-calculator';

// Re-export lifestyle simulation engine
export * from './simulation-calculator';

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
