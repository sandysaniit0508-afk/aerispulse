/**
 * Health and Community Strategy Generators for Fallback Action Plans
 */

import { ActionPlanItem, SupportedLanguage } from '../domain/types';

/**
 * Generates respiratory cardiopulmonary cardio advice.
 */
export function getHealthStrategy(
  isHighOrExtreme: boolean,
  dominantPollutant: string,
  pollutantConcentration: number,
  language: SupportedLanguage
): ActionPlanItem {
  if (isHighOrExtreme) {
    return {
      category: 'health',
      priority: 'high',
      title:
        language === 'ta'
          ? 'வெளிப்புற உடற்பயிற்சியைத் தவிர்க்கவும்'
          : language === 'hi'
          ? 'बाहरी शारीरिक व्यायाम स्थगित करें'
          : 'Postpone High-Ventilation Outdoor Cardio',
      action:
        language === 'ta'
          ? `பிரதான மாசு (${dominantPollutant.toUpperCase()} = ${pollutantConcentration} µg/m³). வெளிப்புற ஓட்டப்பயிற்சியைத் தவிர்த்து உட்புற யோகா செய்யவும்.`
          : language === 'hi'
          ? `प्रमुख प्रदूषक (${dominantPollutant.toUpperCase()} = ${pollutantConcentration} µg/m³)। आउटडोर रनिंग के बजाय इनडोर स्ट्रेचिंग या योग करें।`
          : `Primary pollutant ${dominantPollutant.toUpperCase()} concentration is ${pollutantConcentration} µg/m³. Shift cardio to filtered indoor environments to prevent deep alveolar deposition.`,
      impactMetric:
        language === 'ta'
          ? 'நுரையீரல் அழற்சி 60% குறைப்பு'
          : language === 'hi'
          ? 'फेफड़ों के तनाव में 60% कमी'
          : '60% Pulmonary Stress Reduction',
    };
  }

  return {
    category: 'health',
    priority: 'low',
    title:
      language === 'ta'
        ? 'வழக்கமான உடற்பயிற்சி தொடரலாம்'
        : language === 'hi'
        ? 'सामान्य शारीरिक गतिविधि'
        : 'Safe Outdoor Physical Activity',
    action:
      language === 'ta'
        ? 'காலை வேளையில் பூங்காக்களில் நடைபயிற்சி செய்ய உகந்த சூழல் நிலவுகிறது.'
        : language === 'hi'
        ? 'सुबह के समय पार्कों में जॉगिंग या टहलना सुरक्षित है।'
        : 'Safe conditions for outdoor activities and light aerobic exercises.',
    impactMetric:
      language === 'ta'
        ? 'உகந்த சுவாச ஆரோக்கியம்'
        : language === 'hi'
        ? 'सामान्य फेफड़े की कार्यप्रणाली'
        : 'Baseline Cardiorespiratory Health',
  };
}

/**
 * Generates community civic emission violation reporting directive.
 */
export function getCommunityStrategy(
  isHigh: boolean,
  language: SupportedLanguage
): ActionPlanItem {
  return {
    category: 'community',
    priority: isHigh ? 'high' : 'low',
    title:
      language === 'ta'
        ? 'குப்பை எரிப்பதை உடனடியாக புகாரளிக்கவும்'
        : language === 'hi'
        ? 'कचरा जलाने की तुरंत शिकायत करें'
        : 'Report Open Waste Combustion',
    action:
      language === 'ta'
        ? 'உங்கள் பகுதியில் திறந்தவெளியில் குப்பை எரிப்பதை கண்டால் நகராட்சி கட்டுப்பாட்டு அறைக்கு தெரியப்படுத்தவும்.'
        : language === 'hi'
        ? 'स्थानीय क्षेत्र में बायोमास या कचरा जलाने पर तुरंत नगर निगम ऐप पर रिपोर्ट करें।'
        : 'Log any localized biomass, leaf, or construction dust violations on municipal portal hotlines.',
    impactMetric:
      language === 'ta'
        ? 'உள்ளூர் புகை கட்டுப்பாடு'
        : language === 'hi'
        ? 'स्थानीय उत्सर्जन में कमी'
        : 'Neighborhood Air Basin Protection',
  };
}

/**
 * Generates localized high-level executive meteorology summary.
 */
export function getSummaryText(
  cityName: string,
  aqi: number,
  dominantPollutant: string,
  pollutantConcentration: number,
  language: SupportedLanguage
): string {
  if (language === 'ta') {
    return `${cityName} நகரில் தற்போதைய காற்று தரம் ${aqi} AQI ஆக உள்ளது. பிரதான காரணி ${dominantPollutant.toUpperCase()}. எச்சரிக்கையுடன் செயல்படுமாறு பரிந்துரைக்கப்படுகிறது.`;
  }
  if (language === 'hi') {
    return `${cityName} में वर्तमान वायु गुणवत्ता ${aqi} AQI है। मुख्य प्रदूषक ${dominantPollutant.toUpperCase()} है। सुरक्षा दिशा-निर्देशों का पालन करें।`;
  }
  return `Meteorological advisory for ${cityName}: Current composite index is ${aqi} AQI governed by ${dominantPollutant.toUpperCase()} (${pollutantConcentration} µg/m³). Precautionary protections recommended.`;
}
