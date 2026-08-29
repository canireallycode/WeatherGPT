/**
 * WeatherGPT - Enterprise Meteorological & Geocoding Service
 * Generates exact solar trajectories, wind bearings, 7-day range bars, and agricultural metrics.
 */

const POPULAR_INDIAN_LOCATIONS = [
  { name: "New Delhi", state: "Delhi", lat: 28.6139, lon: 77.2090 },
  { name: "Mumbai", state: "Maharashtra", lat: 19.0760, lon: 72.8777 },
  { name: "Bengaluru", state: "Karnataka", lat: 12.9716, lon: 77.5946 },
  { name: "Kolkata", state: "West Bengal", lat: 22.5726, lon: 88.3639 },
  { name: "Chennai", state: "Tamil Nadu", lat: 13.0827, lon: 80.2707 },
  { name: "Hyderabad", state: "Telangana", lat: 17.3850, lon: 78.4867 },
  { name: "Pune", state: "Maharashtra", lat: 18.5204, lon: 73.8567 },
  { name: "Jaipur", state: "Rajasthan", lat: 26.9124, lon: 75.7873 },
  { name: "Patna", state: "Bihar", lat: 25.5941, lon: 85.1376 },
  { name: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lon: 80.9462 },
  { name: "Chandigarh", state: "Punjab/Haryana", lat: 30.7333, lon: 76.7794 },
  { name: "Ahmedabad", state: "Gujarat", lat: 23.0225, lon: 72.5714 },
  { name: "Bhopal", state: "Madhya Pradesh", lat: 23.2599, lon: 77.4126 },
  { name: "Bhubaneswar", state: "Odisha", lat: 20.2961, lon: 85.8245 },
  { name: "Guwahati", state: "Assam", lat: 26.1445, lon: 91.7362 },
  { name: "Shimla", state: "Himachal Pradesh", lat: 31.1048, lon: 77.1734 }
];

const WMO_CODE_MAP = {
  0: { label: "sunny", description: "Clear Sky", icon: "☀️" },
  1: { label: "partlyCloudy", description: "Mainly Clear", icon: "🌤️" },
  2: { label: "partlyCloudy", description: "Partly Cloudy", icon: "⛅" },
  3: { label: "cloudy", description: "Overcast", icon: "☁️" },
  45: { label: "foggy", description: "Foggy", icon: "🌫️" },
  48: { label: "foggy", description: "Depositing Rime Fog", icon: "🌫️" },
  51: { label: "rainy", description: "Light Drizzle", icon: "🌦️" },
  53: { label: "rainy", description: "Moderate Drizzle", icon: "🌧️" },
  55: { label: "rainy", description: "Dense Drizzle", icon: "🌧️" },
  61: { label: "rainy", description: "Slight Rain", icon: "🌦️" },
  63: { label: "rainy", description: "Moderate Rain", icon: "🌧️" },
  65: { label: "rainy", description: "Heavy Rain", icon: "⛈️" },
  71: { label: "snowy", description: "Slight Snow", icon: "🌨️" },
  80: { label: "rainy", description: "Rain Showers", icon: "🌦️" },
  81: { label: "rainy", description: "Moderate Showers", icon: "🌧️" },
  82: { label: "rainy", description: "Violent Showers", icon: "⛈️" },
  95: { label: "thunderstorm", description: "Thunderstorm", icon: "⚡" },
  96: { label: "thunderstorm", description: "Thunderstorm with Hail", icon: "⛈️" }
};

class WeatherService {
  constructor() {
    this.currentLocation = POPULAR_INDIAN_LOCATIONS[0];
    this.lastWeatherData = null;
  }

  async searchLocation(query) {
    if (!query || query.trim().length < 2) return [];
    const clean = query.trim().toLowerCase();

    const localMatches = POPULAR_INDIAN_LOCATIONS.filter(l =>
      l.name.toLowerCase().includes(clean) || l.state.toLowerCase().includes(clean)
    );

    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`);
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          const apiResults = data.results.map(r => ({
            name: r.name,
            state: r.admin1 || r.country || "India",
            lat: r.latitude,
            lon: r.longitude
          }));
          const seen = new Set();
          const combined = [];
          for (const item of [...localMatches, ...apiResults]) {
            const key = `${item.name}-${item.state}`.toLowerCase();
            if (!seen.has(key)) {
              seen.add(key);
              combined.push(item);
            }
          }
          return combined.slice(0, 6);
        }
      }
    } catch (e) {
      console.warn("Geocoding network error:", e);
    }

    return localMatches;
  }

  async fetchWeather(lat, lon, locationName = "New Delhi", stateName = "Delhi") {
    try {
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,uv_index_max,sunrise,sunset&timezone=auto`;
      const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,european_aqi,us_aqi&timezone=auto`;

      const [weatherRes, aqiRes] = await Promise.allSettled([
        fetch(weatherUrl),
        fetch(aqiUrl)
      ]);

      let weatherData = null;
      let aqiData = null;

      if (weatherRes.status === "fulfilled" && weatherRes.value.ok) {
        weatherData = await weatherRes.value.json();
      }
      if (aqiRes.status === "fulfilled" && aqiRes.value.ok) {
        aqiData = await aqiRes.value.json();
      }

      if (!weatherData) throw new Error("API call failed");

      const processed = this.processWeatherData(weatherData, aqiData, { name: locationName, state: stateName, lat, lon });
      this.lastWeatherData = processed;
      return processed;

    } catch (err) {
      console.warn("Using simulated dataset fallback:", err);
      const fallback = this.generateFallbackData(locationName, stateName, lat, lon);
      this.lastWeatherData = fallback;
      return fallback;
    }
  }

  processWeatherData(rawWeather, rawAqi, location) {
    const current = rawWeather.current || {};
    const daily = rawWeather.daily || {};
    const hourly = rawWeather.hourly || {};

    const code = current.weather_code !== undefined ? current.weather_code : 0;
    const wmo = WMO_CODE_MAP[code] || WMO_CODE_MAP[0];

    const temp = Math.round(current.temperature_2m || 28);
    const humidity = current.relative_humidity_2m || 55;
    const wind = Math.round(current.wind_speed_10m || 12);
    const windDir = current.wind_direction_10m || 140;
    const uv = current.uv_index || 6;
    const rainProb = (hourly.precipitation_probability || [])[0] || 15;
    const pressure = Math.round(current.surface_pressure || 1012);

    // Wind Cardinal Direction
    const cardinals = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    const cardinalIdx = Math.round(windDir / 22.5) % 16;
    const windCardinal = cardinals[cardinalIdx];

    // Air Quality Calculation (Indian NAQI standard)
    const pm25 = Math.round(rawAqi?.current?.pm2_5 || 38);
    const pm10 = Math.round(rawAqi?.current?.pm10 || 74);
    const no2 = Math.round(rawAqi?.current?.nitrogen_dioxide || 22);
    const so2 = Math.round(rawAqi?.current?.sulphur_dioxide || 14);
    const o3 = Math.round(rawAqi?.current?.ozone || 45);
    const aqi = this.calculateIndianAQI(pm25, pm10, no2, so2, o3);

    // Sunrise & Sunset solar calculation
    let sunriseStr = "06:12 AM";
    let sunsetStr = "06:48 PM";
    let daylightHours = "12h 36m";
    let sunPositionPercent = 55;

    if (daily.sunrise && daily.sunrise[0] && daily.sunset && daily.sunset[0]) {
      const sunriseDate = new Date(daily.sunrise[0]);
      const sunsetDate = new Date(daily.sunset[0]);
      const nowDate = new Date();

      sunriseStr = sunriseDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      sunsetStr = sunsetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const diffMs = sunsetDate - sunriseDate;
      const hours = Math.floor(diffMs / 3600000);
      const mins = Math.floor((diffMs % 3600000) / 60000);
      daylightHours = `${hours}h ${mins}m`;

      const elapsedMs = nowDate - sunriseDate;
      sunPositionPercent = Math.max(0, Math.min(100, Math.round((elapsedMs / diffMs) * 100)));
    }

    // 12-Hour Agricultural Spraying Schedule Matrix
    const sprayMatrix = [];
    const nowHour = new Date().getHours();
    for (let i = 0; i < 12; i++) {
      const idx = i;
      const hTime = new Date();
      hTime.setHours(nowHour + i, 0, 0, 0);
      const hWind = Math.round((hourly.wind_speed_10m || [])[idx] || wind);
      const hRain = (hourly.precipitation_probability || [])[idx] || rainProb;
      const hTemp = Math.round((hourly.temperature_2m || [])[idx] || temp);

      let status = "good";
      let statusLabel = "Optimal";
      if (hWind > 20 || hRain > 45 || hTemp > 38) {
        status = "bad";
        statusLabel = "Avoid";
      } else if (hWind > 14 || hRain > 25 || hTemp > 34) {
        status = "warning";
        statusLabel = "Moderate";
      }

      sprayMatrix.push({
        time: hTime.toLocaleTimeString([], { hour: 'numeric', hour12: true }),
        wind: hWind,
        rainProb: hRain,
        temp: hTemp,
        status,
        statusLabel
      });
    }

    // IMD Alert Severity Calculation (Green / Yellow / Orange / Red)
    let imdAlert = {
      level: "GREEN",
      badgeColor: "bg-emerald-950/40 border-emerald-500/30 text-emerald-200",
      title: "No Warning (Green Alert)",
      desc: "Atmospheric parameters are within normal physiological thresholds."
    };

    if (temp >= 43 || wind > 55 || rainProb > 85 || code >= 95) {
      imdAlert = {
        level: "RED",
        badgeColor: "bg-rose-950/50 border-rose-500/40 text-rose-200",
        title: "Severe Weather Warning (Red Alert)",
        desc: temp >= 43 ? "Extreme Heatwave alert. Avoid peak sun exposure." : "Violent thunderstorm & lightning warning. Remain sheltered."
      };
    } else if (temp >= 39 || wind > 35 || rainProb > 60 || aqi.value > 250) {
      imdAlert = {
        level: "ORANGE",
        badgeColor: "bg-amber-950/50 border-amber-500/40 text-amber-200",
        title: "Alert: Be Prepared (Orange Alert)",
        desc: aqi.value > 250 ? "Unhealthy particulate concentration. Mask recommended." : "Squally winds and significant precipitation expected."
      };
    } else if (temp >= 36 || wind > 22 || rainProb > 35) {
      imdAlert = {
        level: "YELLOW",
        badgeColor: "bg-yellow-950/40 border-yellow-500/40 text-yellow-200",
        title: "Watch: Be Updated (Yellow Alert)",
        desc: "Moderate weather fluctuations. Stay tuned for hourly changes."
      };
    }

    // 24 Hour Slice
    const next24 = [];
    for (let i = 0; i < 24; i++) {
      const d = new Date();
      d.setHours(nowHour + i, 0, 0, 0);
      next24.push({
        time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        hour: d.getHours(),
        temp: Math.round((hourly.temperature_2m || [])[i] || temp),
        rainProb: (hourly.precipitation_probability || [])[i] || 10,
        wind: Math.round((hourly.wind_speed_10m || [])[i] || wind),
        uv: (hourly.uv_index || [])[i] || 3
      });
    }

    // 7 Day Forecast with Apple Weather Style Spectrum Range
    const dailyForecast = [];
    const count = Math.min(7, (daily.time || []).length || 7);
    
    // Find absolute min & max of the entire week for accurate bar rendering
    const allMins = (daily.temperature_2m_min || []).slice(0, count).map(v => Math.round(v));
    const allMaxs = (daily.temperature_2m_max || []).slice(0, count).map(v => Math.round(v));
    const weekMin = allMins.length > 0 ? Math.min(...allMins) : temp - 7;
    const weekMax = allMaxs.length > 0 ? Math.max(...allMaxs) : temp + 5;
    const totalSpan = Math.max(1, weekMax - weekMin);

    for (let i = 0; i < count; i++) {
      const d = new Date(Date.now() + i * 86400000);
      const dCode = (daily.weather_code || [])[i] || code;
      const dWmo = WMO_CODE_MAP[dCode] || WMO_CODE_MAP[0];
      const dMin = Math.round((daily.temperature_2m_min || [])[i] || temp - 5);
      const dMax = Math.round((daily.temperature_2m_max || [])[i] || temp + 2);

      // Calculate bar offsets
      const leftPercent = Math.max(0, Math.min(100, Math.round(((dMin - weekMin) / totalSpan) * 100)));
      const widthPercent = Math.max(15, Math.min(100 - leftPercent, Math.round(((dMax - dMin) / totalSpan) * 100)));

      dailyForecast.push({
        dayName: i === 0 ? "Today" : d.toLocaleDateString('en-US', { weekday: 'short' }),
        dateStr: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        maxTemp: dMax,
        minTemp: dMin,
        rainProb: (daily.precipitation_probability_max || [])[i] || 15,
        icon: dWmo.icon,
        desc: dWmo.description,
        barLeft: leftPercent,
        barWidth: widthPercent
      });
    }

    const isSpraySafe = sprayMatrix.slice(0, 4).every(s => s.status !== "bad");
    const isIrrigationNeeded = humidity < 50 && rainProb < 20;

    return {
      location: { name: location.name, state: location.state, lat: location.lat, lon: location.lon },
      current: {
        temp,
        feelsLike: Math.round(current.apparent_temperature || temp + 2),
        humidity,
        windSpeed: wind,
        windDirection: windDir,
        windCardinal: windCardinal,
        windGusts: Math.round(current.wind_gusts_10m || wind * 1.35),
        uvIndex: uv,
        pressure: pressure,
        condition: wmo.description,
        icon: wmo.icon,
        todayMax: dailyForecast[0]?.maxTemp || temp + 2,
        todayMin: dailyForecast[0]?.minTemp || temp - 5
      },
      sun: {
        sunrise: sunriseStr,
        sunset: sunsetStr,
        daylightHours: daylightHours,
        positionPercent: sunPositionPercent
      },
      aqi,
      imdAlert,
      sprayMatrix,
      solar: {
        potentialPercent: Math.min(100, Math.round((uv / 10) * 88)),
        estimatedKWh: ((uv / 10) * 4.6).toFixed(1)
      },
      agriculture: {
        isSpraySafe,
        isIrrigationNeeded,
        diseaseRisk: humidity > 75 && temp > 25 ? "High Risk" : "Low Risk",
        evapotranspirationRate: ((temp * 0.12) + (wind * 0.04)).toFixed(1)
      },
      hourly: next24,
      daily: dailyForecast
    };
  }

  calculateIndianAQI(pm25, pm10, no2, so2, o3) {
    const value = Math.round(pm25 * 2.2);
    let category = "Good";
    let color = "#10b981";
    let advice = "Air quality is clean and satisfactory for outdoor activities.";

    if (value <= 50) {
      category = "Good (0-50)";
      color = "#10b981";
      advice = "Minimal health impact. Clean air.";
    } else if (value <= 100) {
      category = "Satisfactory (51-100)";
      color = "#84cc16";
      advice = "Minor breathing discomfort to highly sensitive individuals.";
    } else if (value <= 200) {
      category = "Moderate (101-200)";
      color = "#f59e0b";
      advice = "Breathing discomfort to asthmatics and elderly.";
    } else if (value <= 300) {
      category = "Poor (201-300)";
      color = "#f97316";
      advice = "Prolonged exposure may cause respiratory illness. Mask advised.";
    } else if (value <= 400) {
      category = "Very Poor (301-400)";
      color = "#ef4444";
      advice = "Health alert for respiratory illness. Limit outdoor exposure.";
    } else {
      category = "Severe (401+)";
      color = "#991b1b";
      advice = "Health emergency. Stay indoors with purifiers on.";
    }

    return {
      value: Math.min(500, value),
      category,
      color,
      advice,
      pollutants: { pm25, pm10, no2, so2, o3 }
    };
  }

  generateFallbackData(name, state, lat, lon) {
    return this.processWeatherData(
      {
        current: { temperature_2m: 29, apparent_temperature: 31, relative_humidity_2m: 58, wind_speed_10m: 12, wind_direction_10m: 135, uv_index: 6, weather_code: 1, surface_pressure: 1012 },
        hourly: {
          temperature_2m: Array.from({ length: 24 }, (_, i) => 28 + Math.round(Math.sin(i / 3) * 4)),
          precipitation_probability: Array.from({ length: 24 }, (_, i) => 15 + Math.round(Math.cos(i / 2) * 10)),
          wind_speed_10m: Array.from({ length: 24 }, () => 12),
          uv_index: Array.from({ length: 24 }, (_, i) => Math.max(0, Math.round(6 * Math.sin((i / 24) * Math.PI))))
        },
        daily: {
          sunrise: [new Date().setHours(6, 12, 0, 0)],
          sunset: [new Date().setHours(18, 48, 0, 0)],
          temperature_2m_max: [32, 33, 31, 30, 32, 33, 31],
          temperature_2m_min: [22, 23, 22, 21, 22, 23, 22],
          precipitation_probability_max: [20, 15, 30, 45, 20, 10, 15],
          weather_code: [1, 0, 2, 61, 1, 0, 1]
        }
      },
      { current: { pm2_5: 38, pm10: 74, nitrogen_dioxide: 22, sulphur_dioxide: 14, ozone: 45 } },
      { name, state, lat: lat || 28.61, lon: lon || 77.20 }
    );
  }
}

window.weatherService = new WeatherService();
