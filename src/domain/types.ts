/**
 * AerisPulse Domain Types & Interfaces
 * Pure domain models with zero external framework dependencies.
 */

export type AirQualityCategory =
  | 'Good'
  | 'Moderate'
  | 'Unhealthy for Sensitive Groups'
  | 'Unhealthy'
  | 'Very Unhealthy'
  | 'Hazardous';

export type SafetyElevationLevel = 'NORMAL' | 'ELEVATED' | 'CRITICAL';

export type SupportedLanguage = 'en' | 'ta' | 'hi';

export interface PollutantReadings {
  pm25: number;   // µg/m³
  pm10: number;   // µg/m³
  no2: number;    // µg/m³
  so2: number;    // µg/m³
  o3: number;     // µg/m³
  co: number;     // µg/m³
}

export interface TelemetryData {
  cityId: string;
  cityName: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  pollutants: PollutantReadings;
  usAqi: number;
  europeanAqi: number;
  category: AirQualityCategory;
  dominantPollutant: keyof PollutantReadings;
  confidenceScore: number; // 0 - 100%
  validationStatus: 'VERIFIED' | 'DISCREPANCY_DETECTED' | 'ELEVATED_RISK';
  source: string;
}

export interface MultiSourceValidation {
  modelAqi: number;
  stationAqi: number;
  deltaPercentage: number;
  safetyElevationLevel: SafetyElevationLevel;
  isDiscrepant: boolean;
  discrepancyMessage: string;
  confidenceScore: number;
}

export interface CalculationMetrics {
  inhaledDosageUg: number;
  chronicExposureIndex: number;
  relativeRiskIncreasePercent: number;
  commuteCarbonKg: number;
  monthlyHealthSavingsInr: number;
  monthlyHealthSavingsUsd: number;
  cleanAirEquivalenceDays: number;
}

export type ActionPlanCategory = 'indoor' | 'commute' | 'health' | 'community';
export type ActionPriority = 'critical' | 'high' | 'moderate' | 'low';

export interface ActionPlanItem {
  category: ActionPlanCategory;
  priority: ActionPriority;
  title: string;
  action: string;
  impactMetric: string;
}

export interface ActionPlan {
  summary: string;
  compositeRiskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
  generatedAt: string;
  items: ActionPlanItem[];
  isFallback: boolean;
  modelUsed: string;
}

export type CommuteMode = 'car' | 'twoWheeler' | 'metro' | 'bicycle';
export type MaskGrade = 'none' | 'cloth' | 'n95';

export interface SimulatorInputs {
  commuteMode: CommuteMode;
  commuteDistanceKm: number;
  maskGrade: MaskGrade;
  hepaFilterEnabled: boolean;
  outdoorExerciseHours: number;
}

export interface SimulatorOutputs {
  dailyInhaledUg: number;
  baselineInhaledUg: number;
  inhaledReductionPercent: number;
  dailyCarbonSavedKg: number;
  monthlySavingsInr: number;
  healthSafetyScore: number;
}

export interface CityPreset {
  id: string;
  name: string;
  nameTa: string;
  nameHi: string;
  state: string;
  latitude: number;
  longitude: number;
  description: string;
  microclimateTag: string;
  typicalDominantPollutant: keyof PollutantReadings;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  groundedTelemetryAqi?: number;
}
