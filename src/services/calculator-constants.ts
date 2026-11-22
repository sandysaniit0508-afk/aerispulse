/**
 * AerisPulse Mathematical & Epidemiological Constants
 * All physical and epidemiological parameters cited directly from published literature.
 * Parameters without definitive clinical consensus are marked as 'estimated'.
 */

// --- Inhaled Particulate Matter Model (ICRP Publication 66) ---
// Citation: International Commission on Radiological Protection (ICRP). (1994).
// Human Respiratory Tract Model for Radiological Protection. ICRP Pub 66.
export const RESTING_VENTILATION_RATE_M3_HR = 0.55;       // Resting minute ventilation (m³/hr)
export const LIGHT_ACTIVITY_VENTILATION_RATE_M3_HR = 1.5; // Light activity outdoor ventilation (m³/hr)

// --- Mask Filtration Efficiencies ---
// Citation for N95: NIOSH 42 CFR Part 84 standard.
// Citation for Cloth: estimated based on US EPA aerosol evaluation literature.
export const MASK_EFFICIENCY_NONE = 0.0;
export const MASK_EFFICIENCY_CLOTH = 0.35; // estimated fractional reduction
export const MASK_EFFICIENCY_N95 = 0.95;   // NIOSH certified 95% particulate filtration

// --- Indoor HEPA & Envelope Filtration ---
// Citation: estimated based on US EPA indoor air filtration guidance and building envelope infiltration.
export const HEPA_FILTER_ACTIVE_EFFICIENCY = 0.85;  // 85% particulate reduction with active HEPA recirculation
export const HEPA_FILTER_PASSIVE_EFFICIENCY = 0.15; // 15% passive deposition via closed building envelope

// --- Epidemiological Exposure & Relative Risk (Burnett et al. GEMM 2018) ---
// Citation: Burnett, R., et al. (2018). PNAS, 115(38), 9592-9597.
export const WHO_PM25_COUNTERFACTUAL_UG_M3 = 5.0; // WHO annual air quality guideline baseline
export const BURNETT_GEMM_BETA_COEFFICIENT = 0.0062; // GEMM concentration-response beta coefficient

// --- Chronic Respiratory Exposure Index (CREI) Normalization ---
// Citation: estimated proportional risk scaling based on Burnett et al. (2018)
export const CREI_PM25_NORMALIZATION_UG_M3 = 300;
export const CREI_PM25_WEIGHT_PERCENT = 70;
export const CREI_NO2_NORMALIZATION_UG_M3 = 200;
export const CREI_NO2_WEIGHT_PERCENT = 30;

// --- Transport Carbon Emission Factors (DEFRA 2023) ---
// Citation: UK Department for Environment, Food & Rural Affairs (DEFRA). (2023).
// Government greenhouse gas conversion factors for company reporting.
export const DEFRA_CAR_EMISSION_FACTOR = 0.192;         // kg CO2e / km (average ICE passenger car)
export const DEFRA_TWO_WHEELER_EMISSION_FACTOR = 0.103; // kg CO2e / km (average 4-stroke motorbike)
export const DEFRA_METRO_EMISSION_FACTOR = 0.028;       // kg CO2e / passenger-km (electric rapid transit)
export const DEFRA_BICYCLE_EMISSION_FACTOR = 0.0;       // kg CO2e / km (zero-emission active transit)

// --- Economic Healthcare Savings ---
// Citation: estimated baseline outpatient consultation and lost-day burden
// informed by WHO Environmental Burden of Disease methodology.
export const BASELINE_MONTHLY_HEALTH_BURDEN_INR = 2200; // estimated monthly outpatient burden (INR)
export const INR_TO_USD_EXCHANGE_RATE = 0.012;          // estimated currency conversion rate
