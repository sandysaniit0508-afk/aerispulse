/**
 * Deterministic Rules-Based Action Plan Fallback Service
 * Provides zero-downtime resilience when GenAI API is offline, throttled, or unconfigured.
 * Formulates scientifically grounded recommendations based on meteorological telemetry.
 */

import { ActionPlan, ActionPlanItem, PollutantReadings, SupportedLanguage } from '../domain/types';
import {
  getIndoorStrategy,
  getCommuteStrategy,
  getHealthStrategy,
  getCommunityStrategy,
  getSummaryText,
} from './fallback-templates';

export class FallbackActionPlanService {
  /**
   * Generates a fully grounded deterministic clinical action plan without external GenAI dependencies.
   * 
   * @param cityName - Target metropolitan locality
   * @param aqi - Numerical Air Quality Index (US EPA scale)
   * @param dominantPollutant - Governing critical air pollutant
   * @param pollutants - Object containing full breakdown of ambient pollutant concentrations
   * @param language - Target localization language ('en' | 'ta' | 'hi')
   * @returns Structured ActionPlan satisfying strict schema constraints
   */
  public static generatePlan(
    cityName: string,
    aqi: number,
    dominantPollutant: keyof PollutantReadings,
    pollutants: PollutantReadings,
    language: SupportedLanguage = 'en'
  ): ActionPlan {
    const isExtreme = aqi > 300;
    const isHigh = aqi > 150;
    const isModerate = aqi > 100;
    const isHighOrExtreme = isHigh || isExtreme;

    const riskLevel: ActionPlan['compositeRiskLevel'] = isExtreme
      ? 'EXTREME'
      : isHigh
      ? 'HIGH'
      : isModerate
      ? 'MODERATE'
      : 'LOW';

    const dominantConcentration = pollutants[dominantPollutant];

    const items: ActionPlanItem[] = [
      getIndoorStrategy(isHighOrExtreme, aqi, language),
      getCommuteStrategy(isHighOrExtreme, language),
      getHealthStrategy(isHighOrExtreme, dominantPollutant, dominantConcentration, language),
      getCommunityStrategy(isHigh, language),
    ];

    const summaryText = getSummaryText(
      cityName,
      aqi,
      dominantPollutant,
      dominantConcentration,
      language
    );

    return {
      summary: summaryText,
      compositeRiskLevel: riskLevel,
      generatedAt: new Date().toISOString(),
      items,
      isFallback: true,
      modelUsed: 'AerisPulse Deterministic Rules Engine (Zero-Downtime Fallback)',
    };
  }
}
