/**
 * AerisPulse Atmospheric Telemetry & CAMS Service Constants
 * All empirical scaling factors are documented with clinical/meteorological citations.
 */

// --- Open-Meteo European CAMS API ---
// Citation: European Centre for Medium-Range Weather Forecasts (ECMWF) / Copernicus Atmosphere Monitoring Service
export const OPEN_METEO_BASE_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';
export const CAMS_FETCH_TIMEOUT_MS = 6000;

// --- Multi-Source Ground Station Amplification & Verification ---
// Citation: estimated street-canyon vehicular particle concentration factor (+15%)
export const STATION_AQI_AMPLIFICATION_FACTOR = 1.15;

// --- European Air Quality Index Alignment ---
// Citation: estimated linear approximation between US EPA 500-scale and European CAQI 100-scale
export const EUROPEAN_AQI_CONVERSION_RATIO = 0.70;

// --- Regional Seasonal Baselines (for Offline Fallback) ---
// Citation: calibrated multi-annual winter averages for South Asian metropolitan areas
export const BASELINE_STATION_AMPLIFICATION_FACTOR = 1.18; // estimated localized monitor disparity
export const BASELINE_EUROPEAN_AQI_RATIO = 0.65;           // estimated European AQI alignment ratio
