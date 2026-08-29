/**
 * WeatherGPT - Multilingual Localization (i18n) Engine
 * Designed for SIH Hackathon to cater to rural, regional, and urban Indian citizens.
 */

const I18N_DATA = {
  en: {
    appTitle: "WeatherGPT",
    appTagline: "AI Hyperlocal Weather & Conversational Decision Copilot",
    searchPlaceholder: "Search city, district, or PIN code (e.g. Pune, Jaipur, Patna)...",
    currentLocationBtn: "Use My Location",
    personaTitle: "Select AI Persona",
    personaKisan: "🌾 Kisan Mitra (Agri AI)",
    personaDisaster: "⚠️ Disaster Sentinel",
    personaHealth: "😷 AQI & Health AI",
    personaCommute: "🚗 Commute & Travel",
    
    // Metrics
    feelsLike: "Feels Like",
    humidity: "Humidity",
    windSpeed: "Wind Speed",
    uvIndex: "UV Index",
    precipProb: "Rain Probability",
    aqiLevel: "Air Quality (AQI)",
    solarIndex: "Solar Potential",
    
    // Forecast
    forecast24h: "24-Hour Interactive Trend",
    forecast7d: "7-Day Meteorological Outlook",
    
    // AI Insights
    aiAdvisoryHeader: "AI Decision Intelligence",
    aiAdvisorySub: "Hyperlocal recommendations powered by real-time meteorological indicators",
    
    // Chat Copilot
    copilotTitle: "WeatherGPT Conversational Copilot",
    copilotPlaceholder: "Ask anything (e.g. 'Can I spray pesticide today?', 'Will it rain on my commute?')...",
    sendBtn: "Send",
    voiceBtnStart: "Voice Query",
    voiceBtnListening: "Listening...",
    clearChat: "Clear History",
    
    // Quick Questions
    quickQ1: "🌾 Sowing & irrigation advisory for current moisture",
    quickQ2: "🌧️ Rainfall & waterlogging risk for travel",
    quickQ3: "😷 Is it safe for children to play outside with current AQI?",
    quickQ4: "⚡ Expected solar panel efficiency today",
    
    // Alert Banner
    safeBanner: "✅ Normal Weather Conditions: No severe alerts active in your district.",
    warningBanner: "⚠️ Weather Advisory Active: Elevated conditions detected. Review AI guidance.",
    severeBanner: "🚨 Extreme Weather Alert: High-risk conditions present. Take immediate precautions.",
    
    // Status terms
    sunny: "Clear Sky / Sunny",
    partlyCloudy: "Partly Cloudy",
    cloudy: "Overcast Clouds",
    rainy: "Rain Showers",
    thunderstorm: "Thunderstorm & Lightning Risk",
    foggy: "Dense Fog / Mist",
    snowy: "Snowfall",
    
    // Agri specific
    sprayYes: "Safe for Pesticide/Fertilizer Spraying",
    sprayNo: "Avoid Spraying (High Wind/Rain Risk)",
    irrigateYes: "Irrigation Recommended (Low Soil Moisture)",
    irrigateNo: "Postpone Irrigation (Rain Expected)",
    
    poweredBy: "Built for SIH Hackathon | Open-Meteo & Generative Intelligence"
  },
  hi: {
    appTitle: "वेदर जीपीटी (WeatherGPT)",
    appTagline: "स्मार्ट मौसम विश्लेषण और कृत्रिम बुद्धिमत्ता आधारित निर्णय सहायक",
    searchPlaceholder: "शहर, जिला या पिन कोड खोजें (उदा. पटना, जयपुर, वाराणसी)...",
    currentLocationBtn: "मेरा स्थान खोजें",
    personaTitle: "एआई सलाहकार चुनें",
    personaKisan: "🌾 किसान मित्र (कृषि एआई)",
    personaDisaster: "⚠️ आपदा रक्षक (सुरक्षा एआई)",
    personaHealth: "😷 वायु गुणवत्ता और स्वास्थ्य",
    personaCommute: "🚗 यात्रा और आवागमन",
    
    feelsLike: "अनुभूत तापमान",
    humidity: "आर्द्रता (नमी)",
    windSpeed: "हवा की गति",
    uvIndex: "पराबैंगनी (UV) सूचकांक",
    precipProb: "वर्षा की संभावना",
    aqiLevel: "वायु गुणवत्ता (AQI)",
    solarIndex: "सौर ऊर्जा क्षमता",
    
    forecast24h: "अगले 24 घंटे का पूर्वानुमान ग्राफ",
    forecast7d: "7 दिवसीय मौसम पूर्वानुमान",
    
    aiAdvisoryHeader: "एआई मौसम सलाह और दिशा-निर्देश",
    aiAdvisorySub: "वर्तमान मौसमी आंकड़ों के आधार पर सटीक और उपयोगी परामर्श",
    
    copilotTitle: "वेदर जीपीटी वार्तालाप सहायक",
    copilotPlaceholder: "मौसम संबंधी कोई भी प्रश्न पूछें (उदा. 'क्या आज कीटनाशक छिड़कना ठीक है?')...",
    sendBtn: "पूछें",
    voiceBtnStart: "बोलकर पूछें",
    voiceBtnListening: "सुन रहा हूँ...",
    clearChat: "चैट साफ़ करें",
    
    quickQ1: "🌾 वर्तमान नमी के अनुसार फसलों में सिंचाई की सलाह",
    quickQ2: "🌧️ शाम के सफर में बारिश और जलभराव का खतरा",
    quickQ3: "😷 क्या वर्तमान प्रदूषण में बच्चों को बाहर खेलने देना सुरक्षित है?",
    quickQ4: "⚡ आज सोलर पैनल से कितनी बिजली बनने का अनुमान है?",
    
    safeBanner: "✅ मौसम सामान्य: आपके जिले में कोई गंभीर चेतावनी नहीं है।",
    warningBanner: "⚠️ मौसम चेतावनी: मौसमी बदलाव पर ध्यान दें और एआई सलाह पढ़ें।",
    severeBanner: "🚨 आपातकालीन मौसम चेतावनी: अत्यधिक जोखिम। तुरंत सुरक्षा उपाय करें।",
    
    sunny: "साफ आसमान / खिली धूप",
    partlyCloudy: "आंशिक रूप से बादल",
    cloudy: "बादल छाए रहेंगे",
    rainy: "बारिश की संभावना",
    thunderstorm: "आंधी-तूफान और आकाशीय बिजली का खतरा",
    foggy: "घना कोहरा / धुंध",
    snowy: "बर्फबारी",
    
    sprayYes: "कीटनाशक छिड़काव के लिए मौसम उपयुक्त है",
    sprayNo: "छिड़काव से बचें (तेज हवा / बारिश का खतरा)",
    irrigateYes: "सिंचाई की आवश्यकता है",
    irrigateNo: "सिंचाई टालें (बारिश की संभावना है)",
    
    poweredBy: "स्मार्ट इंडिया हैकाथॉन (SIH) के लिए विशेष रूप से निर्मित"
  },
  mr: {
    appTitle: "वेदर जीपीटी (WeatherGPT)",
    appTagline: "हवामान विश्लेषण आणि एआय आधारित कृषी व जनजीवन मार्गदर्शक",
    searchPlaceholder: "शहर किंवा जिल्हा शोधा (उदा. पुणे, नाशिक, नागपूर)...",
    currentLocationBtn: "माझे वर्तमान स्थान",
    personaTitle: "एआय मार्गदर्शक निवडा",
    personaKisan: "🌾 शेतकरी मित्र (कृषी एआई)",
    personaDisaster: "⚠️ आपत्ती रक्षक",
    personaHealth: "😷 हवा गुणवत्ता आणि आरोग्य",
    personaCommute: "🚗 प्रवास आणि वाहतूक",
    
    feelsLike: "जाणवणारे तापमान",
    humidity: "हवेतील आर्द्रता",
    windSpeed: "वाऱ्याचा वेग",
    uvIndex: "युव्ही (UV) निर्देशांक",
    precipProb: "पावसाची शक्यता",
    aqiLevel: "हवा गुणवत्ता (AQI)",
    solarIndex: "सौर ऊर्जा क्षमता",
    
    forecast24h: "२४ तासांचा हवामान आलेख",
    forecast7d: "७ दिवसांचा हवामान अंदाज",
    
    aiAdvisoryHeader: "एआय अचूक मार्गदर्शन",
    aiAdvisorySub: "थेट उपग्रहीय हवामान डेटावर आधारित शिफारसी",
    
    copilotTitle: "वेदर जीपीटी संवाद सहाय्यक",
    copilotPlaceholder: "कोणताही प्रश्न विचारा (उदा. 'आज फवारणी करावी का?')...",
    sendBtn: "पाठवा",
    voiceBtnStart: "आवाजाने विचारा",
    voiceBtnListening: "ऐकत आहे...",
    clearChat: "इतिहास पुसा",
    
    quickQ1: "🌾 पिकांना पाणी आणि खत व्यवस्थापनाचा सल्ला",
    quickQ2: "🌧️ प्रवासादरम्यान पावसाचा आणि वाहतुकीचा अंदाज",
    quickQ3: "😷 आजच्या हवेच्या गुणवत्तेनुसार बाहेर पडणे सुरक्षित आहे का?",
    quickQ4: "⚡ आजच्या सौर पॅनेलच्या उत्पादनाचा अंदाज",
    
    safeBanner: "✅ हवामान सामान्य: कोणतीही गंभीर चेतावणी नाही.",
    warningBanner: "⚠️ हवामान सल्ला: बदलत्या हवामानाकडे लक्ष द्या.",
    severeBanner: "🚨 अतिवृष्टी/वादळाचा इशारा: कृपया त्वरित सुरक्षिततेची काळजी घ्या.",
    
    sunny: "निरभ्र आकाश / कडक ऊन",
    partlyCloudy: "अंशतः ढगाळ",
    cloudy: "ढगाळ वातावरण",
    rainy: "पावसाची शक्यता",
    thunderstorm: "विजांचा कडकडाट आणि वादळी पाऊस",
    foggy: "दाट धुके",
    snowy: "हिमवृष्टी",
    
    sprayYes: "औषध फवारणीसाठी योग्य हवामान",
    sprayNo: "फवारणी टाळा (पाऊस/वाऱ्याची शक्यता)",
    irrigateYes: "पिकांना पाण्याची गरज आहे",
    irrigateNo: "पाणी देणे टाळा (पाऊस अपेक्षित आहे)",
    
    poweredBy: "स्मार्ट इंडिया हॅकाथॉन (SIH) साठी विकसित"
  },
  bn: {
    appTitle: "ওয়েদার জিপিটি (WeatherGPT)",
    appTagline: "কৃত্রিম বুদ্ধিমত্তা ভিত্তিক আবহাওয়া ও সিদ্ধান্ত গ্রহণ সহায়ক",
    searchPlaceholder: "শহর বা জেলা খুঁজুন (যেমন কলকাতা, বর্ধমান, শিলিগুড়ি)...",
    currentLocationBtn: "আমার অবস্থান নিন",
    personaTitle: "এআই সহকারী নির্বাচন করুন",
    personaKisan: "🌾 কৃষক বন্ধু (কৃষি এআই)",
    personaDisaster: "⚠️ দুর্যোগ সতর্কবার্তা",
    personaHealth: "😷 বায়ুর মান ও স্বাস্থ্য",
    personaCommute: "🚗 ভ্রমণ ও যাতায়াত",
    
    feelsLike: "অনুভূত তাপমাত্রা",
    humidity: "আর্দ্রতা",
    windSpeed: "বাতাসের গতি",
    uvIndex: "ইউভি (UV) সূচক",
    precipProb: "বৃষ্টির সম্ভাবনা",
    aqiLevel: "বায়ু মান সূচক (AQI)",
    solarIndex: "সৌর বিদ্যুৎ সম্ভাবনা",
    
    forecast24h: "২৪ ঘণ্টার আবহাওয়া ট্রেন্ড",
    forecast7d: "৭ দিনের পূর্বাভাস",
    
    aiAdvisoryHeader: "এআই তাৎক্ষণিক পরামর্শ",
    aiAdvisorySub: "রিয়েল-টাইম আবহাওয়া তথ্যের উপর ভিত্তি করে সিদ্ধান্ত",
    
    copilotTitle: "ওয়েদার জিপিটি আলাপচারিতা সহকারী",
    copilotPlaceholder: "প্রশ্ন করুন (যেমন 'আজ কি কীটনাশক স্প্রে করা যাবে?')...",
    sendBtn: "পাঠান",
    voiceBtnStart: "কথা বলে প্রশ্ন করুন",
    voiceBtnListening: "শুনছি...",
    clearChat: "ইতিহাস মুছুন",
    
    quickQ1: "🌾 আজকের আর্দ্রতায় ফসলে সেচের পরামর্শ",
    quickQ2: "🌧️ বাড়ি ফেরার পথে বৃষ্টির সম্ভাবনা",
    quickQ3: "😷 বর্তমান বায়ুদূষণে বাইরে যাওয়া কি নিরাপদ?",
    quickQ4: "⚡ আজকের সোলার প্যানেল কর্মক্ষমতা পূর্বাভাস",
    
    safeBanner: "✅ আবহাওয়া স্বাভাবিক: কোনো সতর্কবার্তা নেই।",
    warningBanner: "⚠️ আবহাওয়া সতর্কতা: আবহাওয়া পরিবর্তন লক্ষ্য রাখুন।",
    severeBanner: "🚨 চরম আবহাওয়া সতর্কতা: অবিলম্বে নিরাপদ স্থানে থাকুন।",
    
    sunny: "পরিষ্কার আকাশ / রৌদ্রোজ্জ্বল",
    partlyCloudy: "আংশিক মেঘলা",
    cloudy: "মেঘাচ্ছন্ন আকাশ",
    rainy: "বৃষ্টিপাত",
    thunderstorm: "বজ্রবিদ্যুৎ সহ ঝড়",
    foggy: "ঘন কুয়াশা",
    snowy: "তুষারপাত",
    
    sprayYes: "কীটনাশক স্প্রে করার অনুকূল আবহাওয়া",
    sprayNo: "স্প্রে এড়িয়ে চলুন (বৃষ্টির ঝুঁকি)",
    irrigateYes: "জমিতে সেচ দেওয়া দরকার",
    irrigateNo: "সেচ স্থগিত রাখুন (বৃষ্টির সম্ভাবনা)",
    
    poweredBy: "স্মার্ট ইন্ডিয়া হ্যাকাথনের জন্য তৈরি"
  },
  ta: {
    appTitle: "வெதர் ஜிபிடி (WeatherGPT)",
    appTagline: "செயற்கை நுண்ணறிவு அடிப்படையிலான வானிலை வழிகாட்டி",
    searchPlaceholder: "நகரம் அல்லது மாவட்டத்தைத் தேடுங்கள் (எ.கா. சென்னை, மதுரை)...",
    currentLocationBtn: "எனது இருப்பிடம்",
    personaTitle: "AI வழிகாட்டியைத் தேர்ந்தெடுக்கவும்",
    personaKisan: "🌾 உழவர் தோழன் (வேளாண் AI)",
    personaDisaster: "⚠️ பேரிடர் எச்சரிக்கை",
    personaHealth: "😷 காற்றின் தரம் மற்றும் உடல்நலம்",
    personaCommute: "🚗 பயணம் மற்றும் போக்குவரத்து",
    
    feelsLike: "உணரப்படும் வெப்பநிலை",
    humidity: "ஈரப்பதம்",
    windSpeed: "காற்றின் வேகம்",
    uvIndex: "புற ஊதா (UV) குறியீடு",
    precipProb: "மழைக்கான வாய்ப்பு",
    aqiLevel: "காற்றின் தரக் குறியீடு (AQI)",
    solarIndex: "சூரிய மின் ஆற்றல்",
    
    forecast24h: "24 மணி நேர வானிலை வரைபடம்",
    forecast7d: "7 நாள் வானிலை முன்னறிவிப்பு",
    
    aiAdvisoryHeader: "AI வானிலை வழிகாட்டுதல்",
    aiAdvisorySub: "நேரடி செயற்கைக்கோள் தரவு அடிப்படையிலான முடிவுகள்",
    
    copilotTitle: "வெதர் ஜிபிடி உரையாடல் வழிகாட்டி",
    copilotPlaceholder: "கேள்வி கேளுங்கள் (எ.கா. 'இன்று மருந்து தெளிக்கலாமா?')...",
    sendBtn: "அனுப்பு",
    voiceBtnStart: "குரல் மூலம் கேள்",
    voiceBtnListening: "கேட்கிறது...",
    clearChat: "அழி",
    
    quickQ1: "🌾 தற்போதைய ஈரப்பதத்தில் பயிர் பாசன ஆலோசனை",
    quickQ2: "🌧️ பயணத்தின் போது மழை பெய்யுமா?",
    quickQ3: "😷 தற்போதைய காற்றில் வெளியே செல்வது பாதுகாப்பானதா?",
    quickQ4: "⚡ இன்றைய சூரிய மின் உற்பத்தி எதிர்பார்ப்பு",
    
    safeBanner: "✅ வானிலை இயல்பானது: எந்த ஆபத்தும் இல்லை.",
    warningBanner: "⚠️ வானிலை எச்சரிக்கை: மாற்றங்களைக் கவனியுங்கள்.",
    severeBanner: "🚨 தீவிர வானிலை எச்சரிக்கை: உடனடியாகப் பாதுகாப்பு நடவடிக்கைகளை எடுக்கவும்.",
    
    sunny: "தெளிவான வானம் / வெயில்",
    partlyCloudy: "பகுதி மேகமூட்டம்",
    cloudy: "முழு மேகமூட்டம்",
    rainy: "மழைப்பொழிவு",
    thunderstorm: "இடி மின்னலுடன் கூடிய மழை",
    foggy: "அடர்ந்த பனிமூட்டம்",
    snowy: "பனிப்பொழிவு",
    
    sprayYes: "மருந்து தெளிக்க ஏற்ற சூழல்",
    sprayNo: "தெளிப்பதைத் தவிர்க்கவும் (மழை ஆபத்து)",
    irrigateYes: "பயிர்களுக்கு நீர்ப்பாசனம் தேவை",
    irrigateNo: "நீர்ப்பாசனத்தை ஒத்திவைக்கவும்",
    
    poweredBy: "ஸ்மார்ட் இந்தியா ஹேக்கத்தானுக்காக உருவாக்கப்பட்டது"
  },
  te: {
    appTitle: "వెదర్ జీపీటీ (WeatherGPT)",
    appTagline: "కృత్రిమ మేధస్సు ఆధారిత వాతావరణ మరియు నిర్ణయ సహాయకుడు",
    searchPlaceholder: "నగరం లేదా జిల్లా పేరు శోధించండి (ఉదా. హైదరాబాద్, విజయవాడ)...",
    currentLocationBtn: "నా ప్రస్తుత స్థానం",
    personaTitle: "AI సలహాదారుని ఎంచుకోండి",
    personaKisan: "🌾 రైతు మిత్ర (వ్యవసాయ AI)",
    personaDisaster: "⚠️ విపత్తు హెచ్చరిక",
    personaHealth: "😷 గాలి నాణ్యత & ఆరోగ్యం",
    personaCommute: "🚗 ప్రయాణం & రవాణా",
    
    feelsLike: "అనుభవమయ్యే ఉష్ణోగ్రత",
    humidity: "తేమ శాతం",
    windSpeed: "గాలి వేగం",
    uvIndex: "UV సూచిక",
    precipProb: "వర్షం పడే అవకాశం",
    aqiLevel: "గాలి నాణ్యత సూచిక (AQI)",
    solarIndex: "సౌర విద్యుత్ సామర్థ్యం",
    
    forecast24h: "24 గంటల వాతావరణ గ్రాఫ్",
    forecast7d: "7 రోజుల వాతావరణ అంచనా",
    
    aiAdvisoryHeader: "AI సూచనలు & సలహాలు",
    aiAdvisorySub: "ఖచ్చితమైన వాతావరణ సమాచారం ఆధారంగా చర్యలు",
    
    copilotTitle: "వెదర్ జీపీటీ సంభాషణ సహాయకుడు",
    copilotPlaceholder: "ఏదైనా ప్రశ్న అడగండి (ఉదా. 'ఈరోజు మందు పిచికారీ చేయవచ్చా?')...",
    sendBtn: "పంపు",
    voiceBtnStart: "వాయిస్ ద్వారా అడగండి",
    voiceBtnListening: "వింటున్నాను...",
    clearChat: "చాట్ క్లియర్ చేయండి",
    
    quickQ1: "🌾 ప్రస్తుత తేమ ప్రకారం పంటలకు నీటి పారుదల సలహా",
    quickQ2: "🌧️ ప్రయాణంలో వర్షం మరియు ట్రాఫిక్ ఇబ్బందుల అంచనా",
    quickQ3: "😷 ప్రస్తుత వాతావరణంలో పిల్లలు ఆడుకోవడం సురక్షితమేనా?",
    quickQ4: "⚡ నేటి సౌర విద్యుత్ ఉత్పత్తి అంచనా",
    
    safeBanner: "✅ సాధారణ వాతావరణం: ఎటువంటి ప్రమాదం లేదు.",
    warningBanner: "⚠️ వాతావరణ హెచ్చరిక: మార్పులను గమనించండి.",
    severeBanner: "🚨 తీవ్ర వాతావరణ హెచ్చరిక: తక్షణ జాగ్రత్తలు తీసుకోండి.",
    
    sunny: "నిర్మలమైన ఆకాశం / ఎండ",
    partlyCloudy: "పాక్షికంగా మేఘావృతం",
    cloudy: "మేఘావృతమైన ఆకాశం",
    rainy: "వర్షం కురిసే అవకాశం",
    thunderstorm: "ఉరుములు మెరుపులతో కూడిన వర్షం",
    foggy: "దట్టమైన పొగమంచు",
    snowy: "మంచు కురవడం",
    
    sprayYes: "మందు పిచికారీకి అనుకూలమైన వాతావరణం",
    sprayNo: "పిచికారీ చేయవద్దు (వర్షం ముప్పు)",
    irrigateYes: "పంటలకు నీరు అవసరం",
    irrigateNo: "నీరు పెట్టడం వాయిదా వేయండి",
    
    poweredBy: "స్మార్ట్ ఇండియా హ్యాకథాన్ కోసం రూపొందించబడింది"
  }
};

let currentLang = 'en';

function setLanguage(lang) {
  if (I18N_DATA[lang]) {
    currentLang = lang;
    updateDOMTranslations();
    return true;
  }
  return false;
}

function getTranslation(key) {
  const dict = I18N_DATA[currentLang] || I18N_DATA['en'];
  return dict[key] || I18N_DATA['en'][key] || key;
}

function updateDOMTranslations() {
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    const translated = getTranslation(key);
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      if (el.hasAttribute('placeholder')) {
        el.setAttribute('placeholder', translated);
      }
    } else {
      el.textContent = translated;
    }
  });
}
