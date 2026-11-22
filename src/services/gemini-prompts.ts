/**
 * Structured Gemini Prompt Templates
 * Standardized XML delimiter prompt engineering for action generation and chat grounding.
 */

import { PollutantReadings, SupportedLanguage } from '../domain/types';

/**
 * Builds structured JSON action plan generation prompt with XML boundary isolation.
 */
export function buildActionPlanPrompt(
  cityName: string,
  aqi: number,
  dominantPollutant: keyof PollutantReadings,
  pollutants: PollutantReadings,
  language: SupportedLanguage
): string {
  const langName =
    language === 'ta'
      ? 'Tamil (தமிழ்)'
      : language === 'hi'
      ? 'Hindi (हिंदी)'
      : 'English';

  return `
You are the AerisPulse Environmental & Clinical Action Engine.
Generate an actionable, scientifically grounded air quality protection plan strictly adhering to the JSON schema below.
Language requirement: Produce all titles, actions, and summary in ${langName}.

Telemetry Context:
<grounding_telemetry>
City: ${cityName}
Composite US AQI: ${aqi}
Dominant Pollutant: ${dominantPollutant.toUpperCase()} (${pollutants[dominantPollutant]} µg/m³)
Pollutant Breakdown:
- PM2.5: ${pollutants.pm25} µg/m³
- PM10: ${pollutants.pm10} µg/m³
- NO2: ${pollutants.no2} µg/m³
- SO2: ${pollutants.so2} µg/m³
- O3: ${pollutants.o3} µg/m³
- CO: ${pollutants.co} µg/m³
</grounding_telemetry>

Expected JSON Output Schema:
{
  "summary": "Concise 2-sentence meteorological summary of current exposure risks",
  "compositeRiskLevel": "LOW" | "MODERATE" | "HIGH" | "EXTREME",
  "items": [
    {
      "category": "indoor" | "commute" | "health" | "community",
      "priority": "critical" | "high" | "moderate" | "low",
      "title": "Action title",
      "action": "Specific scientific behavioral directive",
      "impactMetric": "Quantified physiological or exposure metric"
    }
  ]
}
`;
}

/**
 * Builds grounded streaming chat prompt isolated with XML boundary delimiters.
 */
export function buildChatPrompt(
  cityName: string,
  aqi: number,
  dominantPollutant: string,
  pm25: number,
  sanitizedQuery: string
): string {
  return `
<grounding_telemetry>
City: ${cityName}
Current US AQI: ${aqi}
Governing Pollutant: ${dominantPollutant.toUpperCase()}
Fine Particulate PM2.5: ${pm25} µg/m³
</grounding_telemetry>

<user_query>
${sanitizedQuery}
</user_query>
`;
}
