/**
 * WeatherGPT - Conversational Intelligence & Persona Reasoning Engine
 * Supports 4 distinct personas, multilingual AI responses, and optional Gemini/OpenAI API integration.
 */

class GPTEngine {
  constructor() {
    this.currentPersona = 'kisan'; // 'kisan' | 'disaster' | 'health' | 'commute'
    this.apiKey = localStorage.getItem('weathergpt_api_key') || '';
    this.provider = localStorage.getItem('weathergpt_provider') || 'simulated'; // 'simulated' | 'gemini' | 'openai'
  }

  setPersona(persona) {
    this.currentPersona = persona;
  }

  setApiConfig(provider, apiKey) {
    this.provider = provider;
    this.apiKey = apiKey;
    localStorage.setItem('weathergpt_provider', provider);
    localStorage.setItem('weathergpt_api_key', apiKey);
  }

  /**
   * Main entry point to process a user prompt with current meteorological context
   */
  async generateResponse(userPrompt, weatherData, lang = 'en') {
    // If live API key is set and provider is gemini/openai, attempt live LLM call
    if (this.provider === 'gemini' && this.apiKey) {
      try {
        return await this.callGeminiAPI(userPrompt, weatherData, lang);
      } catch (err) {
        console.warn("Live Gemini API call failed, falling back to local engine:", err);
      }
    } else if (this.provider === 'openai' && this.apiKey) {
      try {
        return await this.callOpenAIAPI(userPrompt, weatherData, lang);
      } catch (err) {
        console.warn("Live OpenAI API call failed, falling back to local engine:", err);
      }
    }

    // Local Domain Reasoning Engine (fast, offline-capable, hackathon robust)
    return this.generateSimulatedInsight(userPrompt, weatherData, lang);
  }

  /**
   * System Prompts tailored for SIH use cases
   */
  getPersonaSystemPrompt(persona, weatherData, lang) {
    const loc = `${weatherData.location.name}, ${weatherData.location.state}`;
    const curr = weatherData.current;
    const aqi = weatherData.aqi;

    const baseContext = `Location: ${loc}. Temp: ${curr.temp}°C (Feels like ${curr.feelsLike}°C), Humidity: ${curr.humidity}%, Wind: ${curr.windSpeed} km/h (Gusts: ${curr.windGusts} km/h), Conditions: ${curr.condition}, UV Index: ${curr.uvIndex}, AQI: ${aqi.value} (${aqi.category}).`;

    const personaInstructions = {
      kisan: "You are 'Kisan Mitra' (कृषि मित्र), an expert agricultural meteorologist and agronomist for Indian farmers. Provide practical, step-by-step advice on sowing, irrigation, pesticide spraying, fertilizer application, and crop disease prevention based on meteorological thresholds. Use encouraging, empathetic, and clear agricultural terms.",
      disaster: "You are 'Disaster Sentinel' (आपदा रक्षक), an emergency weather safety specialist for the National/State Disaster Management Authority. Provide precise hazard warnings, flood/lightning/heatwave safety protocols, evacuation guidance, and emergency dos and don'ts.",
      health: "You are 'Health & AQI Guardian' (स्वास्थ्य रक्षक), a public health and pulmonology AI consultant. Translate PM2.5, PM10, UV, humidity, and temperature into actionable health recommendations for children, elderly, asthmatics, and athletes.",
      commute: "You are 'Commute & Travel Navigator' (यात्रा सहायक), a smart urban mobility and travel advisory AI. Analyze rain probability, road waterlogging risks, fog visibility, and recommend best departure windows, routes, and protective gear."
    };

    return `${personaInstructions[persona] || personaInstructions.kisan}\n\nCurrent Weather Context: ${baseContext}\nRespond in language: ${lang}. Format with clean markdown, bullet points, and actionable takeaways.`;
  }

  /**
   * Gemini 1.5 / 2.0 API Direct Integration
   */
  async callGeminiAPI(userPrompt, weatherData, lang) {
    const systemPrompt = this.getPersonaSystemPrompt(this.currentPersona, weatherData, lang);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;

    const body = {
      contents: [
        {
          role: "user",
          parts: [
            { text: `${systemPrompt}\n\nUser Question: ${userPrompt}` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 600
      }
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      throw new Error(`Gemini API returned error code ${res.status}`);
    }

    const data = await res.json();
    return data.candidates[0].content.parts[0].text;
  }

  /**
   * OpenAI API Direct Integration
   */
  async callOpenAIAPI(userPrompt, weatherData, lang) {
    const systemPrompt = this.getPersonaSystemPrompt(this.currentPersona, weatherData, lang);
    const url = `https://api.openai.com/v1/chat/completions`;

    const body = {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.4,
      max_tokens: 600
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      throw new Error(`OpenAI API returned error code ${res.status}`);
    }

    const data = await res.json();
    return data.choices[0].message.content;
  }

  /**
   * Local Smart Domain Reasoning Simulator (Comprehensive Indian context)
   */
  generateSimulatedInsight(prompt, weatherData, lang) {
    const p = prompt.toLowerCase();
    const loc = weatherData.location.name;
    const curr = weatherData.current;
    const aqi = weatherData.aqi;
    const agri = weatherData.agriculture;
    const disaster = weatherData.disaster || {
  alertLevel: 'normal',
  alertMessage: 'No active weather alert.',
  floodRiskScore: 0,
  heatwaveRisk: 'Low'
};
  
   

    // Determine query intent
    const isSpray = p.includes('spray') || p.includes('pesticide') || p.includes('कीटनाशक') || p.includes('फवारणी') || p.includes('fertilizer') || p.includes('खाद');
    const isIrrigation = p.includes('irrigation') || p.includes('water') || p.includes('सिंचाई') || p.includes('पानी') || p.includes('पाणी');
    const isCommute = p.includes('travel') || p.includes('commute') || p.includes('traffic') || p.includes('rain') || p.includes('सफर') || p.includes('यात्रा') || p.includes('बारिश');
    const isHealth = p.includes('aqi') || p.includes('pollution') || p.includes('mask') || p.includes('health') || p.includes('play') || p.includes('प्रदूषण') || p.includes('हवा') || p.includes('दवा');
    const isSolar = p.includes('solar') || p.includes('energy') || p.includes('बिजली') || p.includes('सोलर') || p.includes('पैनल');

    // Language-specific responses
    if (lang === 'hi') {
      return this.getHindiSimulatedResponse(p, loc, curr, aqi, agri, disaster, isSpray, isIrrigation, isCommute, isHealth, isSolar);
    } else if (lang === 'mr') {
      return this.getMarathiSimulatedResponse(p, loc, curr, aqi, agri, disaster, isSpray, isIrrigation, isCommute, isHealth, isSolar);
    } else if (lang === 'bn') {
      return this.getBengaliSimulatedResponse(p, loc, curr, aqi, agri, disaster, isSpray, isIrrigation, isCommute, isHealth, isSolar);
    } else if (lang === 'ta') {
      return this.getTamilSimulatedResponse(p, loc, curr, aqi, agri, disaster, isSpray, isIrrigation, isCommute, isHealth, isSolar);
    } else if (lang === 'te') {
      return this.getTeluguSimulatedResponse(p, loc, curr, aqi, agri, disaster, isSpray, isIrrigation, isCommute, isHealth, isSolar);
    }

    // Default English Response
    if (this.currentPersona === 'kisan' || isSpray || isIrrigation) {
      return `### 🌾 Kisan Mitra Agri-Advisory for **${loc}**
- **Current Temperature:** ${curr.temp}°C | **Humidity:** ${curr.humidity}% | **Wind:** ${curr.windSpeed} km/h

#### 🧪 Pesticide & Fertilizer Spray Window:
${agri.isSpraySafe ? '✅ **Favorable Window:** Safe to spray today. Wind speed is gentle and wash-off risk is minimal.' : '⚠️ **Postpone Spraying:** High wind speed or impending rain may cause chemical drift and leaching.'}

#### 💧 Irrigation Recommendation:
${agri.isIrrigationNeeded ? '💧 **Irrigation Recommended:** Low soil moisture and dry weather ahead. Light to moderate drip/furrow irrigation is advised.' : '🚫 **Delay Irrigation:** Upcoming showers or existing high humidity will sustain root moisture.'}

#### 🛡️ Crop Protection Note:
- **Disease Alert:** ${agri.diseaseRisk}. If cultivating Paddy, Wheat, or Mustard, monitor lower leaves for fungal leaf spot.
- **Actionable Tip:** Ensure proper drainage in low-lying crop beds to prevent root rot.`;
    }

    if (this.currentPersona === 'disaster' || disaster.alertLevel === 'severe') {
      return `### ⚠️ Disaster Sentinel Weather Advisory for **${loc}**
- **Alert Status:** ${disaster.alertLevel.toUpperCase()}
- **Live Summary:** ${disaster.alertMessage}

#### 🚨 Key Risk Parameters:
- **Flood Risk Level:** ${disaster.floodRiskScore}
- **Heat / Cold Stress:** ${disaster.heatwaveRisk}
- **Wind Gust Impact:** Up to ${curr.windGusts} km/h

#### 📋 Emergency Protocol & Safety Checklist:
1. **Structural Safety:** Stay away from electric poles, tin sheds, and old trees during gusty spells.
2. **Mobility Advisory:** Avoid waterlogged underpasses and riverbanks.
3. **Emergency Numbers:** Keep local SDRF/NDRF & 112 emergency helpline ready.`;
    }

    if (this.currentPersona === 'health' || isHealth) {
      return `### 😷 Health & Air Quality Advisory for **${loc}**
- **Air Quality Index (AQI):** **${aqi.value}** (${aqi.category})
- **PM2.5:** ${aqi.pm25} µg/m³ | **UV Index:** ${curr.uvIndex}

#### 🩺 Health Impact & Vulnerability Matrix:
- **Asthma / Respiratory Patients:** ${aqi.value > 150 ? '⚠️ High risk of bronchospasm. Keep inhalers accessible and wear an N95 mask outdoors.' : '✅ Safe for normal outdoor movement with routine precautions.'}
- **Children & Elderly:** Limit intense outdoor cardiovascular exercises between 1:00 PM and 5:00 PM.
- **UV Protection:** ${curr.uvIndex >= 6 ? '☀️ High UV rays. Apply SPF 30+ sunscreen and wear sunglasses.' : 'Moderate UV levels.'}`;
    }

    if (this.currentPersona === 'commute' || isCommute) {
      return `### 🚗 Daily Commuter & Travel Guide for **${loc}**
- **Current Sky:** ${curr.condition} (${curr.temp}°C)
- **Precipitation Probability:** ${weatherData.hourly[0]?.rainProb || 15}%

#### 🚦 Travel Advisory & Recommendations:
- **Road Conditions:** ${curr.precipitation > 0 ? '🌧️ Wet roads and reduced tire traction. Maintain a 3-car safety distance.' : '🛣️ Clear roads and dry asphalt conditions.'}
- **Visibility:** ${curr.wmoKey === 'foggy' ? '🌫️ Low visibility. Use low-beam fog lamps.' : 'Good daylight visibility.'}
- **Recommended Gear:** ${weatherData.hourly[0]?.rainProb > 40 ? 'Carry an umbrella or raincoat.' : 'Standard commute gear is fine.'}`;
    }

    // General default answer
    return `### 🌤️ WeatherGPT Comprehensive Brief for **${loc}**
- **Temperature:** ${curr.temp}°C (Feels like ${curr.feelsLike}°C)
- **Atmospheric Status:** ${curr.condition}, Humidity at ${curr.humidity}%
- **Wind & Pressure:** ${curr.windSpeed} km/h, ${curr.pressure} hPa
- **Solar Energy Potential:** ${weatherData.solar.potentialPercent}% efficiency (${weatherData.solar.status})

**AI Takeaway:** Conditions in ${loc} are generally ${agri.isSpraySafe ? 'favorable for outdoor operations' : 'experiencing dynamic weather changes'}. You can ask specific questions by switching personas above!`;
  }

  getHindiSimulatedResponse(p, loc, curr, aqi, agri, disaster, isSpray, isIrrigation, isCommute, isHealth, isSolar) {
    if (this.currentPersona === 'kisan' || isSpray || isIrrigation) {
      return `### 🌾 **${loc}** के लिए किसान मित्र कृषि सलाह
- **वर्तमान तापमान:** ${curr.temp}°C | **आर्द्रता (नमी):** ${curr.humidity}% | **हवा की गति:** ${curr.windSpeed} किमी/घंटा

#### 🧪 कीटनाशक एवं खाद छिड़काव परामर्श:
${agri.isSpraySafe ? '✅ **अनुकूल समय:** आज छिड़काव के लिए मौसम उपयुक्त है। दवा बहने या उड़ने का खतरा कम है।' : '⚠️ **छिड़काव टालें:** तेज हवा या बारिश की आशंका के कारण कीटनाशक का प्रभाव कम हो सकता है।'}

#### 💧 सिंचाई प्रबंधन:
${agri.isIrrigationNeeded ? '💧 **सिंचाई की सलाह:** मिट्टी में नमी की कमी है, फसलों में हल्की सिंचाई अवश्य करें।' : '🚫 **सिंचाई स्थगित करें:** आगामी बारिश या उच्च नमी से खेत में पर्याप्त पानी बना रहेगा।'}

#### 🛡️ फसल सुरक्षा:
- फफूंद जनित रोगों (झुलसा, रतुआ) पर नजर रखें और खेत में जल निकासी की व्यवस्था दुरुस्त रखें।`;
    }

    if (this.currentPersona === 'disaster') {
      return `### ⚠️ **${loc}** के लिए आपदा रक्षक सुरक्षा निर्देश
- **चेतावनी स्तर:** ${disaster.alertLevel === 'severe' ? '🚨 गंभीर चेतावनी' : disaster.alertLevel === 'warning' ? '⚠️ सतर्कता परामर्श' : '✅ स्थिति सामान्य'}
- **स्थिति विवरण:** ${disaster.alertMessage}

#### 📋 आवश्यक सुरक्षा नियम:
1. तेज आंधी या बिजली कड़कने के दौरान पेड़ों और बिजली के खंभों के नीचे न खड़े हों।
2. जलभराव वाले रास्तों और नदी-नालों से सुरक्षित दूरी बनाए रखें।
3. आपातकालीन सहायता के लिए डायल 112 या स्थानीय आपदा प्रबंधन से संपर्क करें।`;
    }

    if (this.currentPersona === 'health' || isHealth) {
      return `### 😷 **${loc}** वायु गुणवत्ता और स्वास्थ्य परामर्श
- **वायु गुणवत्ता सूचकांक (AQI):** **${aqi.value}** (${aqi.category})
- **PM2.5 स्तर:** ${aqi.pm25} µg/m³ | **UV इंडेक्स:** ${curr.uvIndex}

#### 🩺 स्वास्थ्य दिशा-निर्देश:
- **अस्थमा व सांस के मरीज:** ${aqi.value > 150 ? '⚠️ बाहर जाते समय N95 मास्क अवश्य पहनें और इनहेलर साथ रखें।' : '✅ सामान्य सावधानी के साथ बाहर जा सकते हैं।'}
- **बुजुर्ग व बच्चे:** दोपहर के समय तेज धूप और प्रदूषण से बचें।`;
    }

    return `### 🌤️ **${loc}** के लिए वेदर जीपीटी मौसम रिपोर्ट
- **तापमान:** ${curr.temp}°C (महसूस: ${curr.feelsLike}°C)
- **आसमान:** ${curr.condition}, हवा ${curr.windSpeed} किमी/घंटा
- **सौर ऊर्जा क्षमता:** ${weatherData.solar.potentialPercent}% (${weatherData.solar.status})

कृषि, स्वास्थ्य या यात्रा संबंधित विशेष सलाह के लिए ऊपर दिए गए विकल्पों को चुनें।`;
  }

  getMarathiSimulatedResponse(p, loc, curr, aqi, agri, disaster) {
    return `### 🌾 **${loc}** साठी शेतकरी मित्र कृषी सल्ला
- **तापमान:** ${curr.temp}°C | **आर्द्रता:** ${curr.humidity}% | **वाऱ्याचा वेग:** ${curr.windSpeed} किमी/तास

#### 🧪 फवारणी व खत व्यवस्थापन:
${agri.isSpraySafe ? '✅ **योग्य वेळ:** आज कीटकनाशक फवारणीसाठी हवामान अनुकूल आहे.' : '⚠️ **फवारणी टाळा:** जोरदार वारे किंवा पावसाच्या शक्यतेमुळे औषध वाहून जाण्याचा धोका आहे.'}

#### 💧 सिंचन सल्ला:
${agri.isIrrigationNeeded ? '💧 **पाणी देण्याची गरज:** पिकांना हलके पाणी द्यावे.' : '🚫 **पाणी देणे टाळा:** जमिनीमध्ये पुरेशी ओल आहे.'}`;
  }

  getBengaliSimulatedResponse(p, loc, curr, aqi, agri, disaster) {
    return `### 🌾 **${loc}** এর জন্য কৃষক বন্ধু পরামর্শ
- **তাপমাত্রা:** ${curr.temp}°C | **আর্দ্রতা:** ${curr.humidity}% | **বাতাসের গতি:** ${curr.windSpeed} কিমি/ঘণ্টা

#### 🧪 কীটনাশক স্প্রে সংক্রান্ত পরামর্শ:
${agri.isSpraySafe ? '✅ **অনুকূল সময়:** আজ কীটনাশক স্প্রে করার জন্য আবহাওয়া উপযুক্ত।' : '⚠️ **স্প্রে স্থগিত রাখুন:** বৃষ্টির সম্ভাবনা বা বাতাসের কারণে ওষুধ নষ্ট হতে পারে।'}

#### 💧 সেচ পরামর্শ:
${agri.isIrrigationNeeded ? '💧 **সেচ দেওয়া প্রয়োজন:** মাটিতে আর্দ্রতা কম রয়েছে।' : '🚫 **সেচ স্থগিত রাখুন:** জমিতে পর্যাপ্ত রস বজায় রয়েছে।'}`;
  }

  getTamilSimulatedResponse(p, loc, curr, aqi, agri, disaster) {
    return `### 🌾 **${loc}** உழவர் தோழன் வேளாண் வழிகாட்டுதல்
- **வெப்பநிலை:** ${curr.temp}°C | **ஈரப்பதம்:** ${curr.humidity}% | **காற்றின் வேகம்:** ${curr.windSpeed} கி.மீ/மணி

#### 🧪 மருந்து தெளிக்கும் நேரம்:
${agri.isSpraySafe ? '✅ **ஏற்ற நேரம்:** மருந்து தெளிக்க இன்று சாதகமான வானிலை நிலவுகிறது.' : '⚠️ **ஒத்திவைக்கவும்:** மழை அல்லது காற்று காரணமாக மருந்து வீணாகலாம்.'}

#### 💧 பாசன ஆலோசனை:
${agri.isIrrigationNeeded ? '💧 **பாசனம் தேவை:** பயிர்களுக்கு நீர் பாய்ச்சவும்.' : '🚫 **பாசனம் தேவையில்லை:** மண்ணில் போதுமான ஈரப்பதம் உள்ளது.'}`;
  }

  getTeluguSimulatedResponse(p, loc, curr, aqi, agri, disaster) {
    return `### 🌾 **${loc}** రైతు మిత్ర వ్యవసాయ సూచనలు
- **ఉష్ణోగ్రత:** ${curr.temp}°C | **తేమ:** ${curr.humidity}% | **గాలి వేగం:** ${curr.windSpeed} కి.మీ/గం

#### 🧪 మందు పిచికారీ సూచన:
${agri.isSpraySafe ? '✅ **అనుకూల సమయం:** నేడు మందు పిచికారీ చేయడానికి వాతావరణం అనుకూలంగా ఉంది.' : '⚠️ **వాయిదా వేయండి:** గాలి వేగం లేదా వర్షం కారణంగా మందు కొట్టుకుపోయే ప్రమాదం ఉంది.'}

#### 💧 నీటి పారుదల:
${agri.isIrrigationNeeded ? '💧 **నీరు పెట్టండి:** తేమ తక్కువగా ఉన్నందున తేలికపాటి తడులు ఇవ్వండి.' : '🚫 **నీరు పెట్టవద్దు:** భూమిలో తగినంత తేమ ఉంది.'}`;
  }
}

window.gptEngine = new GPTEngine();
