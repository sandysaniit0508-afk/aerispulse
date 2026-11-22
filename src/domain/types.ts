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

/**
 * Base Domain Error class adhering to Clean Architecture principles.
 */
export class DomainError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code = 'DOMAIN_ERROR', statusCode = 400) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Raised when external atmospheric telemetry retrieval or cross-validation fails.
 */
export class TelemetryServiceError extends DomainError {
  constructor(message: string, code = 'TELEMETRY_FETCH_ERROR') {
    super(message, code, 502);
    this.name = 'TelemetryServiceError';
  }
}

/**
 * Raised when schema or parameter input validation fails.
 */
export class SchemaValidationError extends DomainError {
  constructor(message: string, code = 'VALIDATION_ERROR') {
    super(message, code, 422);
    this.name = 'SchemaValidationError';
  }
}

/**
 * Raised when sliding window rate limits are exceeded.
 */
export class RateLimitExceededError extends DomainError {
  constructor(message = 'Rate limit exceeded. Please throttle requests.') {
    super(message, 'RATE_LIMIT_EXCEEDED', 429);
    this.name = 'RateLimitExceededError';
  }
}
