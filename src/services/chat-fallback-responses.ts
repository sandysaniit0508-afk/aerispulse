/**
 * Grounded Deterministic Chat Fallback Engine
 * Generates trilingual clinical pulmonology responses when offline or during quota failovers.
 */

import { SupportedLanguage } from '../domain/types';

/**
 * Formulates deterministic advice grounded in current atmospheric telemetry.
 * 
 * @param query - Sanitized user input string
 * @param cityName - Target metropolitan locality
 * @param aqi - Numerical Air Quality Index
 * @param dominantPollutant - Governing critical pollutant identifier
 * @param pm25 - Fine particulate concentration in µg/m³
 * @param language - Target localization language ('en' | 'ta' | 'hi')
 * @returns Grounded scientific pulmonology advisory response
 */
export function generateDeterministicChatResponse(
  query: string,
  cityName: string,
  aqi: number,
  dominantPollutant: string,
  pm25: number,
  language: SupportedLanguage
): string {
  const isExerciseQuery = /jog|run|exercise|walk|outdoor|cycle|morning|दौड़|व्यायाम|ஓட்டம்|உடற்பயிற்சி/i.test(query);
  const isMaskQuery = /mask|n95|cloth|filter|wear|मास्क|முகமூடி/i.test(query);
  const isChildQuery = /child|kid|baby|elderly|asthma|pregnant|बच्च|बुजुर्ग|குழந்தை|முதியவர்/i.test(query);

  if (language === 'ta') {
    if (isExerciseQuery) {
      return aqi > 150
        ? `${cityName} நகரில் தற்போதைய AQI ${aqi} (PM2.5: ${pm25} µg/m³). வெளிப்புற ஓட்டப்பயிற்சி அல்லது கடுமையான உடற்பயிற்சிகளை உடனடியாக தவிர்க்கவும். உடற்பயிற்சியின் போது அதிக காற்று உள்ளிழுக்கப்படுவதால் நுரையீரல் பாதிப்பு அதிகரிக்கும். வீட்டிற்குள் யோகா அல்லது லேசான உடற்பயிற்சி செய்யவும்.`
        : `${cityName} நகரில் தற்போதைய AQI ${aqi}. லேசான உடற்பயிற்சி செய்யலாம், ஆனால் காலை வேளையில் மாசு கூடும் போது எச்சரிக்கையாக இருக்கவும்.`;
    }
    if (isMaskQuery) {
      return `தற்போதைய காற்றில் ${dominantPollutant.toUpperCase()} மாசு (${pm25} µg/m³ PM2.5) அதிகமாக உள்ளது. சாதாரண துணி முகமூடிகள் நுண் துகள்களை தடுக்காது. குறைந்தது N95 அல்லது FFP2 சான்றளிக்கப்பட்ட முகமூடியை முகத்தில் இடைவெளியின்றி அணியவும்.`;
    }
    if (isChildQuery) {
      return `குழந்தைகள் மற்றும் முதியவர்களின் சுவாசக்குழாய் மிகவும் மென்மையானது. தற்போதைய ${aqi} AQI சூழலில் அவர்களை தேவையின்றி வெளியே அழைத்துச் செல்வதை தவிர்க்கவும். அறையில் HEPA ஏர் பியூரிபையர் பயன்படுத்துவது நலம்.`;
    }
    return `${cityName} பகுதிக்கான தற்போதைய காற்று தரம் ${aqi} AQI. முக்கிய காரணி ${dominantPollutant.toUpperCase()} ஆகும். வெளியே செல்லும் போது N95 முகமூடி அணிந்து, உட்புறங்களில் காற்று சுத்திகரிப்பானை இயக்கவும்.`;
  }

  if (language === 'hi') {
    if (isExerciseQuery) {
      return aqi > 150
        ? `${cityName} में वर्तमान वायु गुणवत्ता सूचकांक ${aqi} (PM2.5: ${pm25} µg/m³) है। इस समय बाहर दौड़ना या भारी कसरत करना फेफड़ों के लिए गंभीर रूप से हानिकारक है। घर के अंदर योग या स्ट्रेचिंग को प्राथमिकता दें।`
        : `${cityName} में वर्तमान AQI ${aqi} है। हल्की सैर सुरक्षित है, किंतु व्यस्त सड़कों और सुबह के धुंधले समय से बचें।`;
    }
    if (isMaskQuery) {
      return `वर्तमान स्थिति में ${pm25} µg/m³ PM2.5 कण मौजूद हैं। कपड़े का सामान्य मास्क केवल बड़े धूल कण रोकता है। श्वसन सुरक्षा हेतु केवल N95 या FFP2 प्रमाणित मास्क का ही उपयोग करें।`;
    }
    if (isChildQuery) {
      return `बच्चों और बुजुर्गों के लिए ${aqi} AQI पर बाहर निकलना जोखिम भरा है। उन्हें घर के अंदर रखें और खिड़कियां बंद करके HEPA प्यूरीफायर चालू रखें।`;
    }
    return `${cityName} में वर्तमान AQI ${aqi} है और प्रमुख प्रदूषक ${dominantPollutant.toUpperCase()} है। स्वास्थ्य सुरक्षा हेतु आवश्यक होने पर ही N95 मास्क पहनकर बाहर निकलें।`;
  }

  // English Default
  if (isExerciseQuery) {
    return aqi > 150
      ? `In ${cityName}, the composite AQI is currently ${aqi} with PM2.5 at ${pm25} µg/m³. Outdoor cardio is strongly discouraged because elevated minute ventilation (>3.0 m³/hr) drives fine particulates deep into alveolar tissue. Shift workouts indoors.`
      : `Conditions in ${cityName} are currently moderate (AQI ${aqi}). Outdoor light workouts are acceptable, though early morning thermal inversions should be avoided.`;
  }
  if (isMaskQuery) {
    return `Given current PM2.5 levels of ${pm25} µg/m³ in ${cityName}, standard cloth or surgical masks provide only 20-35% filtration. Fitted N95 or FFP2 respirators are essential to achieve 95% particulate protection.`;
  }
  if (isChildQuery) {
    return `Pediatric and sensitive populations have higher ventilation-to-body-mass ratios. At AQI ${aqi}, outdoor playtime should be restricted, and indoor HEPA air filtration should be continuously maintained.`;
  }
  return `In ${cityName}, air quality is currently recorded at AQI ${aqi}, primarily driven by ${dominantPollutant.toUpperCase()} (${pm25} µg/m³ PM2.5). Maintain sealed indoor spaces and utilize N95 protection during transit.`;
}
