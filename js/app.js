/**
 * WeatherGPT - Enterprise Application Coordinator
 * Controls Bento Grid Widgets, Apple-style Range Bars, Wind Rose, Solar Arc, and Copilot
 */

let appState = {
  currentLocation: { name: "New Delhi", state: "Delhi", lat: 28.6139, lon: 77.2090 },
  weatherData: null,
  activePersona: "kisan",
  currentLang: "en",
  activeTab: "overview",
  chartInstance: null
};

document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

async function initApp() {
  setupEventListeners();
  if (typeof lucide !== "undefined") lucide.createIcons();

  await loadWeather(
    appState.currentLocation.lat,
    appState.currentLocation.lon,
    appState.currentLocation.name,
    appState.currentLocation.state
  );

  if (window.mapService) {
    window.mapService.initMap(
      "weather-map",
      appState.currentLocation.lat,
      appState.currentLocation.lon,
      appState.currentLocation.name,
      appState.weatherData
    );
  }

  renderInitialCopilotMessage();
}

function setupEventListeners() {
  // Tab Switching
  const tabs = document.querySelectorAll(".tab-pill");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      const tabId = tab.getAttribute("data-tab");
      appState.activeTab = tabId;

      document.querySelectorAll(".tab-panel").forEach(p => {
        p.classList.add("hidden");
      });

      const targetPanel = document.getElementById(`tab-${tabId}`);
      if (targetPanel) targetPanel.classList.remove("hidden");

      if (tabId === "radar" && window.mapService) {
        setTimeout(() => {
          window.mapService.initMap(
            "weather-map-full",
            appState.currentLocation.lat,
            appState.currentLocation.lon,
            appState.currentLocation.name,
            appState.weatherData
          );
        }, 100);
      } else if (tabId === "overview" && window.mapService) {
        setTimeout(() => {
          window.mapService.initMap(
            "weather-map",
            appState.currentLocation.lat,
            appState.currentLocation.lon,
            appState.currentLocation.name,
            appState.weatherData
          );
        }, 100);
      }

      if (typeof lucide !== "undefined") lucide.createIcons();
    });
  });

  // Language Switcher
  const langSelect = document.getElementById("lang-select");

  if (langSelect) {
    langSelect.addEventListener("change", e => {
      appState.currentLang = e.target.value;

      if (typeof setLanguage === "function") {
        setLanguage(appState.currentLang);
      }
    });
  }

  // Persona / Domain Switcher
  const personaChips = document.querySelectorAll(".persona-chip");

  personaChips.forEach(chip => {
    chip.addEventListener("click", () => {
      personaChips.forEach(b => b.classList.remove("active"));
      chip.classList.add("active");

      const persona = chip.getAttribute("data-persona");
      appState.activePersona = persona;

      window.gptEngine.setPersona(persona);
      triggerPersonaContextUpdate(persona);
    });
  });

  // Search & Autocomplete
  const searchInput = document.getElementById("search-input");
  const dropdown = document.getElementById("autocomplete-dropdown");
  let debounceTimer = null;

  if (searchInput) {
    searchInput.addEventListener("input", e => {
      clearTimeout(debounceTimer);

      const val = e.target.value;

      if (val.length < 2) {
        if (dropdown) dropdown.classList.add("hidden");
        return;
      }

      debounceTimer = setTimeout(async () => {
        const results = await window.weatherService.searchLocation(val);
        renderAutocomplete(results);
      }, 200);
    });
  }

  // Geolocation
  const geoBtn = document.getElementById("geolocate-btn");

  if (geoBtn) {
    geoBtn.addEventListener("click", handleGeolocation);
  }

  // Chat Form
  const chatForm = document.getElementById("chat-form");
  const chatInput = document.getElementById("chat-input");

  if (chatForm && chatInput) {
    chatForm.addEventListener("submit", e => {
      e.preventDefault();

      const val = chatInput.value.trim();

      if (!val) return;

      handleUserChatMessage(val);
      chatInput.value = "";
    });
  }

  // Voice Query
  const voiceBtn = document.getElementById("voice-btn");

  if (voiceBtn) {
    voiceBtn.addEventListener("click", () => {
      toggleVoiceInput(chatInput);
    });
  }

  // Quick inquiry chips
  document.querySelectorAll(".quick-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      handleUserChatMessage(chip.textContent.trim());
    });
  });

  // Dossier Export Modal
  const dossierBtn = document.getElementById("export-dossier-btn");
  const dossierModal = document.getElementById("dossier-modal");
  const closeDossierBtn = document.getElementById("close-dossier-btn");

  if (dossierBtn && dossierModal) {
    dossierBtn.addEventListener("click", () => {
      renderDossierContent();
      dossierModal.classList.remove("hidden");
    });
  }

  if (closeDossierBtn && dossierModal) {
    closeDossierBtn.addEventListener("click", () => {
      dossierModal.classList.add("hidden");
    });
  }

  // Settings Modal
  const settingsModal = document.getElementById("settings-modal");

  const openSettings = () => settingsModal.classList.remove("hidden");
  const closeSettings = () => settingsModal.classList.add("hidden");

  document.getElementById("settings-btn")?.addEventListener("click", openSettings);
  document.getElementById("settings-btn-mob")?.addEventListener("click", openSettings);
  document.getElementById("close-settings-btn")?.addEventListener("click", closeSettings);

  document.getElementById("save-settings-btn")?.addEventListener("click", () => {
    const prov = document.getElementById("provider-select").value;
    const key = document.getElementById("api-key-input").value.trim();

    window.gptEngine.setApiConfig(prov, key);

    closeSettings();

    showNotification("Settings Saved Successfully!");
  });
}

window.loadCity = async function(name, state, lat, lon) {
  const searchInput = document.getElementById("search-input");

  if (searchInput) {
    searchInput.value = `${name}, ${state}`;
  }

  await loadWeather(lat, lon, name, state);
};

window.loadWeatherByCoords = async function(lat, lon) {
  let name = `District (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`;
  let state = "India";

  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${lat.toFixed(2)},${lon.toFixed(2)}&count=1`
    );

    if (res.ok) {
      const data = await res.json();

      if (data.results && data.results[0]) {
        name = data.results[0].name;
        state = data.results[0].admin1 || data.results[0].country || "India";
      }
    }
  } catch (e) {}

  const searchInput = document.getElementById("search-input");

  if (searchInput) {
    searchInput.value = `${name}, ${state}`;
  }

  await loadWeather(lat, lon, name, state);
};

function handleGeolocation() {
  if (!navigator.geolocation) {
    showNotification("Geolocation unsupported by your browser", "error");
    return;
  }

  const geoBtn = document.getElementById("geolocate-btn");

  if (geoBtn) {
    geoBtn.classList.add("opacity-50");
  }

  navigator.geolocation.getCurrentPosition(
    async pos => {
      if (geoBtn) {
        geoBtn.classList.remove("opacity-50");
      }

      await loadWeather(
        pos.coords.latitude,
        pos.coords.longitude,
        "Your Location",
        "Local Area"
      );
    },
    err => {
      if (geoBtn) {
        geoBtn.classList.remove("opacity-50");
      }

      showNotification("Could not retrieve GPS location", "error");
    },
    { timeout: 8000 }
  );
}

async function loadWeather(lat, lon, name, state) {
  showLoader(true);

  try {
    const data = await window.weatherService.fetchWeather(
      lat,
      lon,
      name,
      state
    );

    appState.weatherData = data;

    appState.currentLocation = {
      name,
      state,
      lat,
      lon
    };

    updateWeatherUI(data);

    if (window.mapService) {
      window.mapService.updateLocation(
        lat,
        lon,
        name,
        data
      );
    }
  } catch (err) {
    console.error("Load weather failed:", err);
    showNotification(
      "Error updating weather observations",
      "error"
    );
  } finally {
    showLoader(false);
  }
}

function renderAutocomplete(results) {
  const dropdown = document.getElementById("autocomplete-dropdown");

  if (!dropdown) return;

  if (!results || results.length === 0) {
    dropdown.classList.add("hidden");
    return;
  }

  dropdown.innerHTML = results
    .map(
      loc => `
    <div
      class="autocomplete-item"
      data-lat="${loc.lat}"
      data-lon="${loc.lon}"
      data-name="${loc.name}"
      data-state="${loc.state}"
    >
      <div>
        <span class="font-bold text-white text-xs sm:text-sm">
          ${loc.name}
        </span>

        <span class="text-xs text-slate-400 ml-1">
          (${loc.state})
        </span>
      </div>

      <span class="text-xs text-sky-400 font-semibold">
        Select ➔
      </span>
    </div>
  `
    )
    .join("");

  dropdown
    .querySelectorAll(".autocomplete-item")
    .forEach(item => {
      item.addEventListener("click", () => {
        const lat = parseFloat(
          item.getAttribute("data-lat")
        );

        const lon = parseFloat(
          item.getAttribute("data-lon")
        );

        const name = item.getAttribute("data-name");
        const state = item.getAttribute("data-state");

        document.getElementById("search-input").value =
          `${name}, ${state}`;

        dropdown.classList.add("hidden");

        loadWeather(lat, lon, name, state);
      });
    });

  dropdown.classList.remove("hidden");
}

document.addEventListener("click", e => {
  const dropdown = document.getElementById(
    "autocomplete-dropdown"
  );

  const searchInput =
    document.getElementById("search-input");

  if (
    dropdown &&
    !dropdown.contains(e.target) &&
    e.target !== searchInput
  ) {
    dropdown.classList.add("hidden");
  }
});

function updateWeatherUI(data) {
  // Hero Values
  document.getElementById("loc-name").textContent =
    data.location.name;

  document.getElementById("loc-state").textContent =
    data.location.state;

  document.getElementById("current-temp").textContent =
    `${data.current.temp}°C`;

  document.getElementById("val-feels-like").textContent =
    `${data.current.feelsLike}°C`;

  document.getElementById("val-today-max").textContent =
    `${data.current.todayMax}°`;

  document.getElementById("val-today-min").textContent =
    `${data.current.todayMin}°`;

  document.getElementById("current-condition").textContent =
    data.current.condition;

  document.getElementById("current-icon").textContent =
    data.current.icon;

  document.getElementById("val-humidity").textContent =
    data.current.humidity;

  document.getElementById("val-wind").textContent =
    data.current.windSpeed;

  document.getElementById("val-uv").textContent =
    data.current.uvIndex;

  document.getElementById("val-aqi").textContent =
    data.aqi.value;

  // Wind Rose Widget
  const needle = document.getElementById(
    "compass-needle"
  );

  if (needle) {
    needle.style.transform =
      `rotate(${data.current.windDirection}deg)`;
  }

  if (document.getElementById("val-wind-cardinal")) {
    document.getElementById("val-wind-cardinal").textContent =
      data.current.windCardinal;
  }

  if (document.getElementById("val-wind-speed-main")) {
    document.getElementById("val-wind-speed-main").textContent =
      data.current.windSpeed;
  }

  if (document.getElementById("val-wind-gusts")) {
    document.getElementById("val-wind-gusts").textContent =
      `${data.current.windGusts} km/h`;
  }

  if (document.getElementById("val-wind-deg")) {
    document.getElementById("val-wind-deg").textContent =
      `${data.current.windDirection}°`;
  }

  if (document.getElementById("val-pressure-num")) {
    document.getElementById("val-pressure-num").textContent =
      `${data.current.pressure} hPa`;
  }

  if (document.getElementById("val-barometer-trend")) {
    document.getElementById("val-barometer-trend").textContent =
      `${data.current.pressure} hPa Steady`;
  }

  // Solar Trajectory Arc Widget
  if (document.getElementById("val-sunrise-time")) {
    document.getElementById("val-sunrise-time").textContent =
      data.sun.sunrise;
  }

  if (document.getElementById("val-sunset-time")) {
    document.getElementById("val-sunset-time").textContent =
      data.sun.sunset;
  }

  if (document.getElementById("val-daylight-dur")) {
    document.getElementById("val-daylight-dur").textContent =
      `${data.sun.daylightHours} Sun`;
  }

  const sunMarker =
    document.getElementById("sun-arc-marker");

  if (sunMarker) {
    const p = data.sun.positionPercent / 100;

    const cx = 15 + p * (185 - 15);

    const cy =
      70 - 4 * p * (1 - p) * 60;

    sunMarker.setAttribute(
      "cx",
      cx.toFixed(1)
    );

    sunMarker.setAttribute(
      "cy",
      cy.toFixed(1)
    );
  }

  // Map Coordinates Badge
  const coordBadge =
    document.getElementById("map-coord-badge");

  if (coordBadge) {
    const latDir =
      data.location.lat >= 0 ? "N" : "S";

    const lonDir =
      data.location.lon >= 0 ? "E" : "W";

    coordBadge.textContent =
      `${Math.abs(data.location.lat).toFixed(2)}° ${latDir}, ${Math.abs(data.location.lon).toFixed(2)}° ${lonDir}`;
  }

  // IMD Alert Ribbon
  const ribbon =
    document.getElementById("imd-alert-ribbon");

  const alertTitle =
    document.getElementById("alert-title");

  const alertDesc =
    document.getElementById("alert-desc");

  if (ribbon && alertTitle && alertDesc) {
    alertTitle.textContent =
      `IMD Status: ${data.imdAlert.title}`;

    alertDesc.textContent =
      data.imdAlert.desc;

    ribbon.className =
      `mb-5 p-4 rounded-2xl border flex items-center justify-between gap-3 ${data.imdAlert.badgeColor}`;
  }

  // Quick Badges
  const badgeSpray =
    document.getElementById("badge-spray");

  if (badgeSpray) {
    badgeSpray.innerHTML =
      data.agriculture.isSpraySafe
        ? `<i data-lucide="check-circle-2" class="w-3.5 h-3.5 text-emerald-400"></i> <span>Spraying Safe</span>`
        : `<i data-lucide="alert-circle" class="w-3.5 h-3.5 text-rose-400"></i> <span>Avoid Spraying</span>`;

    badgeSpray.className =
      data.agriculture.isSpraySafe
        ? "text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5"
        : "text-xs font-semibold px-3 py-1.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5";
  }

  // Spray Matrix Grid
  const sprayGrid =
    document.getElementById("spray-matrix-grid");

  if (sprayGrid && data.sprayMatrix) {
    sprayGrid.innerHTML =
      data.sprayMatrix
        .map(
          s => `
      <div class="spray-slot ${s.status}">
        <span class="font-bold text-[11px]">
          ${s.time}
        </span>

        <span class="text-xs font-extrabold my-1 font-num">
          ${s.temp}°C
        </span>

        <div class="text-[10px] opacity-80 flex flex-col items-center">
          <span>💨 ${s.wind}km/h</span>
          <span>💧 ${s.rainProb}%</span>
        </div>

        <span class="text-[10px] font-bold mt-1 uppercase tracking-tight">
          ${s.statusLabel}
        </span>
      </div>
    `
        )
        .join("");
  }

  // Evapotranspiration & Disease
  if (document.getElementById("val-evapo")) {
    document.getElementById("val-evapo").textContent =
      data.agriculture.evapotranspirationRate;
  }

  if (document.getElementById("val-disease-risk")) {
    document.getElementById("val-disease-risk").textContent =
      data.agriculture.diseaseRisk;
  }

  // Pollutants
  if (data.aqi?.pollutants) {
    if (document.getElementById("val-pm25")) {
      document.getElementById("val-pm25").textContent =
        data.aqi.pollutants.pm25;
    }

    if (document.getElementById("val-pm10")) {
      document.getElementById("val-pm10").textContent =
        data.aqi.pollutants.pm10;
    }

    if (document.getElementById("val-no2")) {
      document.getElementById("val-no2").textContent =
        data.aqi.pollutants.no2;
    }

    if (document.getElementById("val-so2")) {
      document.getElementById("val-so2").textContent =
        data.aqi.pollutants.so2;
    }

    if (document.getElementById("val-o3")) {
      document.getElementById("val-o3").textContent =
        data.aqi.pollutants.o3;
    }
  }

  if (document.getElementById("val-aqi-full-advice")) {
    document.getElementById(
      "val-aqi-full-advice"
    ).textContent = data.aqi.advice;
  }

  // Render Apple Weather Style 7-Day Spectrum
  render7DaySpectrum(data.daily);

  // Render 24-Hour Trend Chart
  render24hChart(data.hourly);

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

/**
 * Render Apple Weather-Style 7-Day Temperature Range Bar Spectrum
 */
function render7DaySpectrum(days) {
  const container =
    document.getElementById("forecast-7d-spectrum");

  if (!container || !days) return;

  container.innerHTML =
    days
      .map(
        day => `
    <div class="flex items-center justify-between gap-3 text-xs py-1 border-b border-slate-800/40 last:border-0">
      <span class="font-bold text-slate-300 w-16">
        ${day.dayName}
      </span>

      <span class="text-xl w-7 text-center">
        ${day.icon}
      </span>

      <div class="flex items-center gap-1 text-[11px] text-sky-400 w-12">
        <span>💧</span>
        <span>${day.rainProb}%</span>
      </div>

      <div class="temp-bar-container">
        <span class="font-mono text-slate-400 text-[11px] w-6 text-right">
          ${day.minTemp}°
        </span>

        <div class="temp-bar-bg">
          <div
            class="temp-bar-fill"
            style="left: ${day.barLeft}%; width: ${day.barWidth}%;">
          </div>
        </div>

        <span class="font-mono text-white font-bold text-[11px] w-6 text-left">
          ${day.maxTemp}°
        </span>
      </div>
    </div>
  `
      )
      .join("");
}

function render24hChart(hourly) {
  const canvas =
    document.getElementById("forecastChart");

  if (!canvas || !hourly) return;

  if (appState.chartInstance) {
    appState.chartInstance.destroy();
  }

  const ctx = canvas.getContext("2d");

  const gradient =
    ctx.createLinearGradient(0, 0, 0, 220);

  gradient.addColorStop(
    0,
    "rgba(56, 189, 248, 0.4)"
  );

  gradient.addColorStop(
    1,
    "rgba(56, 189, 248, 0.0)"
  );

  appState.chartInstance = new Chart(ctx, {
    type: "line",

    data: {
      labels: hourly.map(h => h.time),

      datasets: [
        {
          label: "Temperature (°C)",
          data: hourly.map(h => h.temp),
          borderColor: "#38bdf8",
          backgroundColor: gradient,
          fill: true,
          tension: 0.35,
          pointRadius: 2,
          pointHoverRadius: 5,
          pointBackgroundColor: "#7dd3fc",
          yAxisID: "y"
        },

        {
          type: "bar",
          label: "Rain Probability (%)",
          data: hourly.map(h => h.rainProb),
          backgroundColor: "rgba(99, 102, 241, 0.4)",
          borderRadius: 4,
          yAxisID: "y1"
        }
      ]
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      interaction: {
        mode: "index",
        intersect: false
      },

      plugins: {
        legend: {
          labels: {
            color: "#94a3b8",
            font: {
              size: 10,
              family: "Plus Jakarta Sans"
            }
          }
        },

        tooltip: {
          backgroundColor: "rgba(15, 23, 42, 0.95)",
          borderColor: "rgba(255, 255, 255, 0.15)",
          borderWidth: 1,
          padding: 10,

          titleFont: {
            size: 12,
            weight: "bold"
          }
        }
      },

      scales: {
        x: {
          ticks: {
            color: "#64748b",
            font: {
              size: 9
            },
            maxTicksLimit: 8
          },

          grid: {
            color: "rgba(255,255,255,0.03)"
          }
        },

        y: {
          ticks: {
            color: "#94a3b8",
            font: {
              size: 10
            }
          },

          grid: {
            color: "rgba(255,255,255,0.04)"
          }
        },

        y1: {
          position: "right",
          min: 0,
          max: 100,

          ticks: {
            color: "#818cf8",
            font: {
              size: 10
            }
          },

          grid: {
            drawOnChartArea: false
          }
        }
      }
    }
  });
}

async function handleUserChatMessage(userText) {
  const chatMessages =
    document.getElementById("chat-messages");

  if (!chatMessages) return;

  appendMessage("user", userText);

  const typingId =
    appendTypingIndicator();

  try {
    const response =
      await window.gptEngine.generateResponse(
        userText,
        appState.weatherData,
        appState.currentLang
      );

    removeTypingIndicator(typingId);

    appendMessage("ai", response);
  } catch (err) {
    removeTypingIndicator(typingId);

    appendMessage(
      "ai",
      "⚠️ Advisory desk is momentarily updating records. Please try again."
    );
  }
}

function triggerPersonaContextUpdate(persona) {
  const promptMap = {
    kisan:
      "Provide agricultural field advisory on current moisture, 12-hour spray window, and crop health.",

    disaster:
      "Assess hazard levels and emergency safety protocols under current weather observations.",

    health:
      "Provide public health risk analysis for air quality and outdoor activity.",

    commute:
      "Provide a route travel advisory for expected rainfall and waterlogging risks."
  };

  handleUserChatMessage(
    promptMap[persona] || promptMap.kisan
  );
}

function renderInitialCopilotMessage() {
  appendMessage(
    "ai",
    `### ⛅ WeatherGPT Operational
Ready to analyze **hyperlocal observations** across Agriculture, Disaster Safety, Health, and Mobility.

Select an inquiry topic or ask any practical question:
- *"What is the safest hour to spray pesticide today?"*
- *"Is the air quality suitable for asthmatic children outdoors?"*
- *"Will evening commute routes experience rain waterlogging?"*`
  );
}

function appendMessage(sender, text) {
  const chatMessages =
    document.getElementById("chat-messages");

  if (!chatMessages) return;

  const div =
    document.createElement("div");

  div.className =
    sender === "user"
      ? "chat-bubble-user"
      : "chat-bubble-ai";

  if (sender === "user") {
    div.textContent = text;
  } else {
    let formatted = text
      .replace(
        /^### (.*$)/gim,
        '<h3><i data-lucide="zap" class="w-4 h-4 text-sky-400"></i> $1</h3>'
      )
      .replace(
        /^#### (.*$)/gim,
        "<h4>$1</h4>"
      )
      .replace(
        /\*\*(.*?)\*\*/g,
        "<strong>$1</strong>"
      )
      .replace(
        /^\- (.*$)/gim,
        "<li>$1</li>"
      )
      .replace(
        /\n\n/g,
        "<p></p>"
      )
      .replace(
        /\n/g,
        "<br/>"
      );

    formatted =
      formatted.replace(
        /(<li>.*<\/li>)/gis,
        "<ul>$1</ul>"
      );

    div.innerHTML = formatted;

    // Action Toolbar
    const actionsDiv =
      document.createElement("div");

    actionsDiv.className =
      "flex items-center gap-3 mt-3 pt-2 border-t border-slate-700/40 text-[11px] font-semibold text-slate-400";

    // Read Aloud
    const speakBtn =
      document.createElement("button");

    speakBtn.className =
      "hover:text-sky-300 flex items-center gap-1 transition-colors";

    speakBtn.innerHTML =
      `<i data-lucide="volume-2" class="w-3.5 h-3.5 text-sky-400"></i> <span>Audio</span>`;

    speakBtn.onclick = () =>
      window.voiceManager.speakText(
        text,
        appState.currentLang
      );

    // Copy
    const copyBtn =
      document.createElement("button");

    copyBtn.className =
      "hover:text-sky-300 flex items-center gap-1 transition-colors";

    copyBtn.innerHTML =
      `<i data-lucide="copy" class="w-3.5 h-3.5 text-slate-400"></i> <span>Copy</span>`;

    copyBtn.onclick = () => {
      navigator.clipboard.writeText(text);

      showNotification(
        "Advisory copied to clipboard!"
      );
    };

    // WhatsApp Share
    const waBtn =
      document.createElement("button");

    waBtn.className =
      "hover:text-emerald-300 flex items-center gap-1 transition-colors text-emerald-400";

    waBtn.innerHTML =
      `<i data-lucide="share-2" class="w-3.5 h-3.5"></i> <span>WhatsApp</span>`;

    waBtn.onclick = () => {
      const waUrl =
        `https://api.whatsapp.com/send?text=${encodeURIComponent(
          `🌾 *WeatherGPT Agricultural Advisory for ${appState.currentLocation.name}:*\n\n${text}`
        )}`;

      window.open(
        waUrl,
        "_blank"
      );
    };

    actionsDiv.appendChild(speakBtn);
    actionsDiv.appendChild(copyBtn);
    actionsDiv.appendChild(waBtn);

    div.appendChild(actionsDiv);
  }

  chatMessages.appendChild(div);

  chatMessages.scrollTop =
    chatMessages.scrollHeight;

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

function appendTypingIndicator() {
  const chatMessages =
    document.getElementById("chat-messages");

  const id =
    `typing-${Date.now()}`;

  const div =
    document.createElement("div");

  div.id = id;

  div.className =
    "chat-bubble-ai flex items-center gap-2 text-slate-400 text-xs italic";

  div.innerHTML =
    `<div class="w-3 h-3 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></div> <span>Reviewing meteorological data points...</span>`;

  chatMessages.appendChild(div);

  chatMessages.scrollTop =
    chatMessages.scrollHeight;

  return id;
}

function removeTypingIndicator(id) {
  document.getElementById(id)?.remove();
}

function toggleVoiceInput(targetInput) {
  const waveIndicator =
    document.getElementById("voice-indicator");

  const btnText =
    document.getElementById("voice-btn-text");

  if (window.voiceManager.isListening) {
    window.voiceManager.stopListening();

    waveIndicator?.classList.add("hidden");

    if (btnText) {
      btnText.textContent =
        "Voice Query";
    }
  } else {
    waveIndicator?.classList.remove("hidden");

    if (btnText) {
      btnText.textContent =
        "Listening...";
    }

    window.voiceManager.startListening(
      appState.currentLang,

      transcript => {
        if (targetInput) {
          targetInput.value = transcript;
        }

        handleUserChatMessage(
          transcript
        );

        if (targetInput) {
          targetInput.value = "";
        }
      },

      () => {
        waveIndicator?.classList.add("hidden");

        if (btnText) {
          btnText.textContent =
            "Voice Query";
        }
      },

      err => {
        waveIndicator?.classList.add("hidden");

        if (btnText) {
          btnText.textContent =
            "Voice Query";
        }

        showNotification(
          err,
          "error"
        );
      }
    );
  }
}

function renderDossierContent() {
  const content =
    document.getElementById(
      "dossier-content"
    );

  if (
    !content ||
    !appState.weatherData
  ) {
    return;
  }

  const d =
    appState.weatherData;

  content.innerHTML = `
    <div class="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-3">

      <div class="flex items-center justify-between border-b border-slate-800 pb-2">
        <div>
          <span class="text-sm font-bold text-white">
            ${d.location.name}, ${d.location.state}
          </span>

          <span class="text-slate-400 block text-[11px]">
            Coordinates:
            ${d.location.lat.toFixed(4)}°N,
            ${d.location.lon.toFixed(4)}°E
          </span>
        </div>

        <span class="px-2.5 py-1 rounded bg-sky-950 text-sky-300 font-mono text-xs font-bold">
          ${d.current.temp}°C (${d.current.condition})
        </span>
      </div>

      <div class="grid grid-cols-3 gap-2 text-center">

        <div class="p-2 bg-slate-800/60 rounded">
          <span class="text-slate-400 block">
            Humidity
          </span>

          <span class="font-bold text-white">
            ${d.current.humidity}%
          </span>
        </div>

        <div class="p-2 bg-slate-800/60 rounded">
          <span class="text-slate-400 block">
            Wind Velocity
          </span>

          <span class="font-bold text-white">
            ${d.current.windSpeed}
            km/h
            (${d.current.windCardinal})
          </span>
        </div>

        <div class="p-2 bg-slate-800/60 rounded">
          <span class="text-slate-400 block">
            Air Quality
          </span>

          <span class="font-bold text-amber-400">
            ${d.aqi.value}
            (${d.aqi.category})
          </span>
        </div>

      </div>

      <div class="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-lg">
        <span class="font-bold text-emerald-300 block mb-1">
          🌾 Agricultural Spraying & Crop Advisory:
        </span>

        <p>
          ${
            d.agriculture.isSpraySafe
              ? "✅ Safe spraying window active."
              : "⚠️ Unfavorable spraying conditions."
          }

          ${d.agriculture.sprayReason || ""}
        </p>
      </div>

      <div class="p-3 bg-slate-800/50 rounded-lg">
        <span class="font-bold text-sky-400 block mb-1">
          ⚠️ IMD Severe Hazard Assessment:
        </span>

        <p>
          ${d.imdAlert.title}
          -
          ${d.imdAlert.desc}
        </p>
      </div>

    </div>
  `;
}

function showLoader(show) {
  const el =
    document.getElementById(
      "loading-spinner"
    );

  if (el) {
    el.classList.toggle(
      "hidden",
      !show
    );
  }
}

function showNotification(
  msg,
  type = "info"
) {
  const toast =
    document.createElement("div");

  toast.className =
    `fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-xl text-xs font-bold shadow-2xl border transition-all ${
      type === "error"
        ? "bg-rose-950 border-rose-500 text-rose-200"
        : "bg-sky-950 border-sky-500 text-sky-200"
    }`;

  toast.textContent = msg;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";

    setTimeout(
      () => toast.remove(),
      300
    );
  }, 3000);
}
