/**
 * AerisPulse Lifestyle Simulation Engine
 * Implements commute carbon footprinting (UK DEFRA 2023) and health cost savings.
 */

import { SimulatorInputs, SimulatorOutputs } from '../domain/types';
import {
  MASK_EFFICIENCY_NONE,
  MASK_EFFICIENCY_CLOTH,
  MASK_EFFICIENCY_N95,
  HEPA_FILTER_ACTIVE_EFFICIENCY,
  HEPA_FILTER_PASSIVE_EFFICIENCY,
  DEFRA_CAR_EMISSION_FACTOR,
  DEFRA_TWO_WHEELER_EMISSION_FACTOR,
  DEFRA_METRO_EMISSION_FACTOR,
  DEFRA_BICYCLE_EMISSION_FACTOR,
  BASELINE_MONTHLY_HEALTH_BURDEN_INR,
  INR_TO_USD_EXCHANGE_RATE,
} from './calculator-constants';
import { calculateInhaledDosage } from './calculator';

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
