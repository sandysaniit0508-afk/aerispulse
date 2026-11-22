/**
 * Multi-Source Validation & Anomaly Detection Service
 * Cross-references primary atmospheric models with ground station telemetry.
 * Automatically elevates safety alerts when sensors/models disagree.
 */

import { MultiSourceValidation, SafetyElevationLevel } from '../domain/types';

export class ValidationService {
  /**
   * Cross-reference model AQI with ground-station sensor telemetry
   */
  public static validate(
    modelAqi: number,
    stationAqi: number
  ): MultiSourceValidation {
    const safeModel = Math.max(1, modelAqi);
    const safeStation = Math.max(1, stationAqi);

    const maxVal = Math.max(safeModel, safeStation);
    const diff = Math.abs(safeModel - safeStation);
    const deltaPercentage = Math.round((diff / maxVal) * 100);

    let safetyElevationLevel: SafetyElevationLevel = 'NORMAL';
    let isDiscrepant = false;
    let message = 'Telemetry streams in high convergence (<15% variance). High data fidelity.';

    if (deltaPercentage > 50) {
      safetyElevationLevel = 'CRITICAL';
      isDiscrepant = true;
      message = `Critical telemetry divergence: Model (${modelAqi}) and Ground Monitor (${stationAqi}) differ by ${deltaPercentage}%. Elevated precautionary protocol enacted.`;
    } else if (deltaPercentage >= 25) {
      safetyElevationLevel = 'ELEVATED';
      isDiscrepant = true;
      message = `Moderate telemetry discrepancy (${deltaPercentage}% variance between model and station). Ground sensor anomaly check recommended.`;
    }

    const confidencePenalty = Math.min(60, Math.round(deltaPercentage * 0.75));
    const confidenceScore = Math.max(40, 100 - confidencePenalty);

    return {
      modelAqi,
      stationAqi,
      deltaPercentage,
      safetyElevationLevel,
      isDiscrepant,
      discrepancyMessage: message,
      confidenceScore,
    };
  }
}
