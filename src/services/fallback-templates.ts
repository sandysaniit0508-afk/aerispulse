/**
 * Localized Action Plan Strategy Templates
 * Modular trilingual action dictionaries for the deterministic fallback engine.
 */

import { ActionPlanItem, SupportedLanguage } from '../domain/types';

// Re-export health, community, and summary strategies
export * from './fallback-strategies';

/**
 * Generates indoor HEPA recirculation or natural ventilation advisory.
 */
export function getIndoorStrategy(
  isHighOrExtreme: boolean,
  aqi: number,
  language: SupportedLanguage
): ActionPlanItem {
  if (isHighOrExtreme) {
    return {
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
    };
  }

  return {
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
        ? 'மதியம் 12 மணி முதல் மாலை 4 மணி வரை மட்டுமே ஜன்னல்களைத் திறந்து காற்றோட்டம் ஏற்படுத்தவும்.'
        : language === 'hi'
        ? 'दोपहर 12 से शाम 4 बजे के बीच ही खिड़कियां खोलें जब सतही ओजोन और पार्टिकुलेट कम हों।'
        : 'Ventilate living quarters strictly during midday thermal inversion lift windows (12 PM - 4 PM).',
    impactMetric:
      language === 'ta'
        ? 'இயற்கை காற்று சுழற்சி'
        : language === 'hi'
        ? 'प्राकृतिक वायु संचलन'
        : 'Passive VOC Dilution',
  };
}

/**
 * Generates commute transit and respirator protective strategy.
 */
export function getCommuteStrategy(
  isHighOrExtreme: boolean,
  language: SupportedLanguage
): ActionPlanItem {
  if (isHighOrExtreme) {
    return {
      category: 'commute',
      priority: 'high',
      title:
        language === 'ta'
          ? 'சான்றளிக்கப்பட்ட N95 முகமூடி அணியுங்கள்'
          : language === 'hi'
          ? 'प्रमाणित N95 मास्क पहनें'
          : 'Don NIOSH-Certified N95 Respirators',
      action:
        language === 'ta'
          ? 'இருசக்கர வாகனம் மற்றும் நடைபயணத்தைத் தவிர்த்து, ஏசி பொருத்தப்பட்ட மெட்ரோ அல்லது பேருந்தில் செல்லவும்.'
          : language === 'hi'
          ? 'दोपहिया वाहन और पैदल यात्रा से बचें। वातानुकूलित मेट्रो या कैब में N95 मास्क लगाकर यात्रा करें।'
          : 'Equip fitted N95/FFP2 respirators during transit. Shift commute modality to climate-controlled metro coaches or closed AC vehicles.',
      impactMetric:
        language === 'ta'
          ? 'சுவாசத்தில் 95% துகள் வடிகட்டல்'
          : language === 'hi'
          ? '95% पार्टिकुलेट निस्यंदन'
          : '95% Commute Inhaled Dose Abatement',
    };
  }

  return {
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
  };
}
