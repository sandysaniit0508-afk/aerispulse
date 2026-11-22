import { SupportedLanguage } from './types';

export interface Translations {
  appTitle: string;
  appSubtitle: string;
  metroPresets: string;
  liveTelemetry: string;
  actionEngine: string;
  simulatorTitle: string;
  assistantTitle: string;
  aqiStatus: string;
  dominantPollutant: string;
  confidenceScore: string;
  validationStatus: string;
  generatePlan: string;
  generatingPlan: string;
  simulatorSubtitle: string;
  commuteMode: string;
  commuteCar: string;
  commuteBike: string;
  commuteMetro: string;
  commuteCycle: string;
  distanceKm: string;
  maskType: string;
  maskNone: string;
  maskCloth: string;
  maskN95: string;
  hepaPurifier: string;
  outdoorHours: string;
  dailyDosage: string;
  dosageReduction: string;
  carbonAbated: string;
  costSaved: string;
  healthScore: string;
  chatPlaceholder: string;
  sendChat: string;
  discrepancyAlert: string;
  discrepancyDesc: string;
  methodologyLink: string;
  refreshTelemetry: string;
}

export const TRANSLATIONS: Record<SupportedLanguage, Translations> = {
  en: {
    appTitle: 'AerisPulse',
    appSubtitle: 'Urban Air Quality & Climate Health Intelligence System',
    metroPresets: 'Metro Presets',
    liveTelemetry: 'Live Atmospheric Telemetry',
    actionEngine: 'Structured GenAI Action Engine',
    simulatorTitle: 'Interactive What-If Lifestyle Simulator',
    assistantTitle: 'Grounded Real-Time Atmospheric Assistant',
    aqiStatus: 'Air Quality Status',
    dominantPollutant: 'Primary Pollutant',
    confidenceScore: 'Telemetry Confidence',
    validationStatus: 'Cross-Source Validation',
    generatePlan: 'Generate Personalized Action Plan',
    generatingPlan: 'Synthesizing Meteorological Plan...',
    simulatorSubtitle: 'Dynamic epidemiological dosage & carbon abatement model',
    commuteMode: 'Daily Commute Transit Mode',
    commuteCar: 'ICE Car',
    commuteBike: 'Two-Wheeler / Scooter',
    commuteMetro: 'Metro Rail / Electric Bus',
    commuteCycle: 'Bicycle / Walk',
    distanceKm: 'Round-Trip Commute Distance (km)',
    maskType: 'Respiratory Mask Grade',
    maskNone: 'None',
    maskCloth: 'Surgical / Cloth',
    maskN95: 'N95 / FFP2 Respirator',
    hepaPurifier: 'Indoor True HEPA Air Purifier Active',
    outdoorHours: 'Outdoor High-Ventilation Exercise (Hours/Day)',
    dailyDosage: 'Daily Inhaled PM2.5 Dosage',
    dosageReduction: 'Dosage Exposure Reduction',
    carbonAbated: 'Daily Carbon Abated',
    costSaved: 'Estimated Monthly Health Savings',
    healthScore: 'Personal Health Shield Score',
    chatPlaceholder: 'Ask regarding localized air quality, jogging safety, or masking advice...',
    sendChat: 'Send',
    discrepancyAlert: 'Elevated Sensor Discrepancy Detected',
    discrepancyDesc: 'Atmospheric satellite model differs from ground station telemetry by >25%. Safety elevation active.',
    methodologyLink: 'Peer-Reviewed Formulation Methodology',
    refreshTelemetry: 'Refresh Live Feeds',
  },
  ta: {
    appTitle: 'ஏரிஸ்பல்ஸ் (AerisPulse)',
    appSubtitle: 'நகர்ப்புற காற்றுத் தரம் மற்றும் காலநிலை சுகாதார நுண்ணறிவு அமைப்பு',
    metroPresets: 'பெருநகர தேர்வுகள்',
    liveTelemetry: 'நேரலை வளிமண்டல அளவீடுகள்',
    actionEngine: 'செயற்கை நுண்ணறிவு செயல்திட்டம்',
    simulatorTitle: 'ஊடாடும் வாழ்க்கை முறை உருவகப்படுத்துதல் (சிமுலேட்டர்)',
    assistantTitle: 'நிகழ்நேர காற்று சுகாதார உதவியாளர்',
    aqiStatus: 'காற்றுத் தர நிலை (AQI)',
    dominantPollutant: 'முக்கிய மாசு காரணி',
    confidenceScore: 'அளவீட்டு நம்பகத்தன்மை',
    validationStatus: 'பல மூல தரவு சரிபார்ப்பு',
    generatePlan: 'தனிப்பயனாக்கப்பட்ட செயல்திட்டம் பெறுக',
    generatingPlan: 'செயல்திட்டம் உருவாக்கப்படுகிறது...',
    simulatorSubtitle: 'தினசரி உள்ளிழுக்கும் துகள் மற்றும் கார்பன் குறைப்பு மாதிரி',
    commuteMode: 'தினசரி பயண முறை',
    commuteCar: 'எரிபொருள் கார்',
    commuteBike: 'இருசக்கர வாகனம் / ஸ்கூட்டர்',
    commuteMetro: 'மெட்ரோ ரயில் / மின்சார பேருந்து',
    commuteCycle: 'மிதிவண்டி / நடைபயிற்சி',
    distanceKm: 'தினசரி பயண தூரம் (கி.மீ)',
    maskType: 'சுவாச முகமூடி வகை',
    maskNone: 'முகமூடி இல்லை',
    maskCloth: 'துணி முகமூடி',
    maskN95: 'N95 / FFP2 உயர்தர முகமூடி',
    hepaPurifier: 'உட்புற HEPA காற்று சுத்திகரிப்பான் இயங்குகிறது',
    outdoorHours: 'வெளியில் உடற்பயிற்சி நேரம் (மணி/நாள்)',
    dailyDosage: 'உள்ளிழுக்கும் PM2.5 அளவு',
    dosageReduction: 'சுவாசப் பாதுகாப்பு குறைப்பு',
    carbonAbated: 'குறைக்கப்பட்ட கார்பன் அளவு',
    costSaved: 'மதிப்பிடப்பட்ட மாத மருத்துவ சேமிப்பு',
    healthScore: 'தனிநபர் சுகாதார பாதுகாப்பு மதிப்பீடு',
    chatPlaceholder: 'காற்றுத் தரம், நடைபயிற்சி அல்லது பாதுகாப்பு முகமூடி பற்றி கேட்கவும்...',
    sendChat: 'அனுப்பு',
    discrepancyAlert: 'சென்சார் வேறுபாடு கண்டறியப்பட்டது',
    discrepancyDesc: 'செயற்கைக்கோள் மாதிரிக்கும் தரைவழி நிலையத்திற்கும் இடையே 25% க்கும் மேல் வேறுபாடு உள்ளது.',
    methodologyLink: 'விஞ்ஞான வழிமுறை ஆவணம்',
    refreshTelemetry: 'தரவை புதுப்பிக்கவும்',
  },
  hi: {
    appTitle: 'एरिसपल्स (AerisPulse)',
    appSubtitle: 'शहरी वायु गुणवत्ता एवं जलवायु स्वास्थ्य बुद्धिमत्ता प्रणाली',
    metroPresets: 'प्रमुख शहर प्रीसेट',
    liveTelemetry: 'लाइव वायुमंडलीय टेलीमेट्री',
    actionEngine: 'एआई संचालित कार्य योजना',
    simulatorTitle: 'इंटरैक्टिव जीवनशैली प्रभाव सिम्युलेटर',
    assistantTitle: 'वास्तविक समय वायु स्वास्थ्य सहायक',
    aqiStatus: 'वायु गुणवत्ता सूचकांक (AQI)',
    dominantPollutant: 'प्रमुख प्रदूषक',
    confidenceScore: 'डेटा सटीकता स्कोर',
    validationStatus: 'बहु-स्रोत सत्यापन',
    generatePlan: 'व्यक्तिगत कार्य योजना तैयार करें',
    generatingPlan: 'कार्य योजना तैयार हो रही है...',
    simulatorSubtitle: 'गतिशील जोखिम खुराक एवं कार्बन बचत मॉडल',
    commuteMode: 'दैनिक आवागमन साधन',
    commuteCar: 'पेट्रोल/डीजल कार',
    commuteBike: 'दोपहिया / स्कूटर',
    commuteMetro: 'मेट्रो रेल / इलेक्ट्रिक बस',
    commuteCycle: 'साइकिल / पैदल',
    distanceKm: 'दैनिक यात्रा दूरी (किमी)',
    maskType: 'श्वसन मास्क का प्रकार',
    maskNone: 'कोई मास्क नहीं',
    maskCloth: 'कपड़े का मास्क',
    maskN95: 'N95 / FFP2 श्वसन मास्क',
    hepaPurifier: 'इंडोर HEPA एयर प्यूरीफायर सक्रिय',
    outdoorHours: 'बाहर शारीरिक व्यायाम (घंटे/दिन)',
    dailyDosage: 'दैनिक श्वसन में PM2.5 मात्रा',
    dosageReduction: 'प्रदूषण जोखिम में कमी',
    carbonAbated: 'दैनिक कार्बन बचत',
    costSaved: 'अनुमानित मासिक स्वास्थ्य बचत',
    healthScore: 'व्यक्तिगत स्वास्थ्य सुरक्षा स्कोर',
    chatPlaceholder: 'वायु गुणवत्ता, जॉगिंग सुरक्षा, या मास्क संबंधी सलाह पूछें...',
    sendChat: 'भेजें',
    discrepancyAlert: 'सेंसर में महत्वपूर्ण अंतर पाया गया',
    discrepancyDesc: 'मॉडल डेटा और स्टेशन टेलीमेट्री में 25% से अधिक अंतर है। सुरक्षा चेतावनी सक्रिय।',
    methodologyLink: 'वैज्ञानिक कार्यप्रणाली दस्तावेज़',
    refreshTelemetry: 'टेलीमेट्री ताज़ा करें',
  },
};
