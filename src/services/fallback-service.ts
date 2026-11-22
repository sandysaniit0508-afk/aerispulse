/**
 * Deterministic Rules-Based Action Plan Fallback Service
 * Provides zero-downtime resilience when GenAI API is offline, throttled, or unconfigured.
 * Formulates scientifically grounded recommendations based on meteorological telemetry.
 */

import { ActionPlan, ActionPlanItem, PollutantReadings, SupportedLanguage } from '../domain/types';

export class FallbackActionPlanService {
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

    const riskLevel: ActionPlan['compositeRiskLevel'] = isExtreme
      ? 'EXTREME'
      : isHigh
      ? 'HIGH'
      : isModerate
      ? 'MODERATE'
      : 'LOW';

    const items: ActionPlanItem[] = [];

    // 1. Indoor Strategy
    if (isHigh || isExtreme) {
      items.push({
        category: 'indoor',
        priority: 'critical',
        title:
          language === 'ta'
            ? 'உட்புற HEPA வடிகட்டலை இயக்குங்கள்'
            : language === 'hi'
            ? 'इनडोर HEPA एयर प्यूरीफायर चालू करें'
            : 'Enact True HEPA Indoor Recirculation',
        action:
          language === 'ta'
            ? `தற்போதைய காற்று தரம் (${aqi} AQI) மிக மோசம். ஜன்னல்களை மூடி HEPA சுத்திகரிப்பானை அதிக வேகத்தில் இயக்கவும்.`
            : language === 'hi'
            ? `वर्तमान AQI (${aqi}) अत्यंत हानिकारक है। सभी खिड़कियां बंद रखें और एयर प्यूरीफायर को अधिकतम गति पर चलाएं।`
            : `Ambient AQI (${aqi}) is hazardous. Seal building envelope windows and set HEPA air purifiers to maximum continuous recirculation mode.`,
        impactMetric:
          language === 'ta'
            ? 'உட்புற துகள் சுமை 85% குறையும்'
            : language === 'hi'
            ? 'इनडोर PM2.5 में 85% की कमी'
            : '85% Indoor PM2.5 Deposition Reduction',
      });
    } else {
      items.push({
        category: 'indoor',
        priority: 'moderate',
        title:
          language === 'ta'
            ? 'காற்றோட்டத்தை கட்டுப்படுத்துங்கள்'
            : language === 'hi'
            ? 'हवादार स्थिति नियंत्रित रखें'
            : 'Controlled Natural Ventilation',
        action:
          language === 'ta'
            ? 'மாசு குறைவாக உள்ள மதிய வேளையில் மட்டும் சிறிது நேரம் ஜன்னல்களைத் திறக்கவும்.'
            : language === 'hi'
            ? 'केवल दोपहर के समय, जब प्रदूषण स्तर कम हो, संक्षेप में खिड़कियां खोलें।'
            : 'Maintain cross-ventilation during mid-day troughs when boundary layer height is maximized.',
        impactMetric:
          language === 'ta'
            ? 'இயற்கை காற்று புதுப்பிப்பு'
            : language === 'hi'
            ? 'संतुलित वायु संचार'
            : 'Safe Diurnal Air Exchange',
      });
    }

    // 2. Commute Strategy
    if (isHigh || isExtreme) {
      items.push({
        category: 'commute',
        priority: 'critical',
        title:
          language === 'ta'
            ? 'N95 முகமூடி கட்டாயம் & பொதுப்போக்குவரத்து'
            : language === 'hi'
            ? 'N95 मास्क एवं बंद सार्वजनिक परिवहन'
            : 'Mandatory N95 Respirator & Sealed Transit',
        action:
          language === 'ta'
            ? 'இருசக்கர வாகனப் பயணத்தைத் தவிர்த்து, ஏசி பொருத்தப்பட்ட மெட்ரோ அல்லது பேருந்தில் N95 முகமூடியுடன் செல்லவும்.'
            : language === 'hi'
            ? 'खुले दोपहिया वाहनों से बचें। N95 मास्क पहनकर वातानुकूलित मेट्रो या इलेक्ट्रिक बस का उपयोग करें।'
            : `Bypass two-wheeler and open rickshaw transit. Utilize sealed metro rail with tightly fitted N95/FFP2 respirators.`,
        impactMetric:
          language === 'ta'
            ? 'சுவாசத்தில் 95% துகள் வடிகட்டல்'
            : language === 'hi'
            ? '95% पार्टिकुलेट निस्यंदन'
            : '95% Commute Inhaled Dose Abatement',
      });
    } else {
      items.push({
        category: 'commute',
        priority: 'low',
        title:
          language === 'ta'
            ? 'சுற்றுச்சூழல் நட்பு பயணம்'
            : language === 'hi'
            ? 'हरित आवागमन प्राथमिकता'
            : 'Eco-Friendly Commute Shift',
        action:
          language === 'ta'
            ? 'குறைந்த தூர பயணங்களுக்கு மிதிவண்டி அல்லது நடைபயிற்சியைத் தேர்ந்தெடுங்கள்.'
            : language === 'hi'
            ? 'कम दूरी के लिए साइकिल या पैदल यात्रा का उपयोग करें।'
            : 'Transition short trips (<3km) to walking or cycling to prevent local tailpipe emissions.',
        impactMetric:
          language === 'ta'
            ? 'கார்பன் உமிழ்வு பூஜ்ஜியம்'
            : language === 'hi'
            ? 'शून्य टेलपाइप उत्सर्जन'
            : '0.19 kg CO₂/km Offset',
      });
    }

    // 3. Health & Exercise Strategy
    if (isHigh || isExtreme) {
      items.push({
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
            ? `பிரதான மாசு (${dominantPollutant.toUpperCase()} = ${pollutants[dominantPollutant]} µg/m³). வெளிப்புற ஓட்டப்பயிற்சியைத் தவிர்த்து உட்புற யோகா செய்யவும்.`
            : language === 'hi'
            ? `प्रमुख प्रदूषक (${dominantPollutant.toUpperCase()} = ${pollutants[dominantPollutant]} µg/m³)। आउटडोर रनिंग के बजाय इनडोर स्ट्रेचिंग या योग करें।`
            : `Primary pollutant ${dominantPollutant.toUpperCase()} concentration is ${pollutants[dominantPollutant]} µg/m³. Shift cardio to filtered indoor environments to prevent deep alveolar deposition.`,
        impactMetric:
          language === 'ta'
            ? 'நுரையீரல் அழற்சி 60% குறைப்பு'
            : language === 'hi'
            ? 'फेफड़ों के तनाव में 60% कमी'
            : '60% Pulmonary Stress Reduction',
      });
    } else {
      items.push({
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
      });
    }

    // 4. Community / Civic Action
    items.push({
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
    });

    const summaryText =
      language === 'ta'
        ? `${cityName} நகரில் தற்போதைய காற்று தரம் ${aqi} AQI ஆக உள்ளது. பிரதான காரணி ${dominantPollutant.toUpperCase()}. எச்சரிக்கையுடன் செயல்படுமாறு பரிந்துரைக்கப்படுகிறது.`
        : language === 'hi'
        ? `${cityName} में वर्तमान वायु गुणवत्ता ${aqi} AQI है। मुख्य प्रदूषक ${dominantPollutant.toUpperCase()} है। सुरक्षा दिशा-निर्देशों का पालन करें।`
        : `Meteorological advisory for ${cityName}: Current composite index is ${aqi} AQI governed by ${dominantPollutant.toUpperCase()} (${pollutants[dominantPollutant]} µg/m³). Precautionary protections recommended.`;

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
