/**
 * WeatherGPT - Enterprise Application Coordinator
 *
 * IMPORTANT:
 * Weather data logic lives in weatherService.js.
 * Map logic lives in mapService.js.
 * AI logic lives in gptEngine.js.
 *
 * This file ONLY coordinates the application UI.
 *
 * DO NOT declare:
 *   - POPULAR_INDIAN_LOCATIONS
 *   - WMO_CODE_MAP
 *   - WeatherService
 *   - map implementation
 *   - GPT implementation
 */

const appState = {
  currentLocation: {
    name: "New Delhi",
    state: "Delhi",
    lat: 28.6139,
    lon: 77.2090
  },

  weatherData: null,

  activePersona: "kisan",

  currentLang: "en",

  activeTab: "overview",

  chartInstance: null
};


/* =========================================================
   APPLICATION START
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initApp();
});


async function initApp() {

  try {

    setupEventListeners();

    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }


    /* -------------------------------------------------------
       WEATHER SERVICE CHECK
       ------------------------------------------------------- */

    if (!window.weatherService) {

      console.error(
        "WeatherService is not available."
      );

      showNotification(
        "Weather service failed to load.",
        "error"
      );

      return;
    }


    /* -------------------------------------------------------
       LOAD INITIAL WEATHER
       ------------------------------------------------------- */

    await loadWeather(
      appState.currentLocation.lat,
      appState.currentLocation.lon,
      appState.currentLocation.name,
      appState.currentLocation.state
    );


    /* -------------------------------------------------------
       INITIALIZE / SYNCHRONIZE MAP
       ------------------------------------------------------- */

    syncMapToCurrentLocation();


    /* -------------------------------------------------------
       INITIAL COPILOT MESSAGE
       ------------------------------------------------------- */

    renderInitialCopilotMessage();

  }

  catch (error) {

    console.error(
      "WeatherGPT initialization failed:",
      error
    );

    showNotification(
      "Application initialization failed.",
      "error"
    );
  }
}


/* =========================================================
   MAP SYNCHRONIZATION
   ========================================================= */

/**
 * IMPORTANT:
 *
 * mapService.js exposes:
 *
 *   initialize()
 *   initializeFullMap()
 *   updateLocation(name, state, lat, lon, temperature)
 *
 * It does NOT expose initMap().
 *
 * This helper keeps app.js connected to the actual map API.
 */

function syncMapToCurrentLocation() {

  if (!window.mapService) {

    console.warn(
      "mapService is not available."
    );

    return;
  }


  const location =
    appState.currentLocation;

  const weather =
    appState.weatherData;


  const temperature =
    weather?.current?.temp;


  try {

    /* -------------------------------------------------------
       MAIN MAP
       ------------------------------------------------------- */

    if (
      typeof window.mapService.initialize ===
      "function"
    ) {

      window.mapService.initialize();
    }


    /*
     * mapService.updateLocation signature:
     *
     * updateLocation(
     *   name,
     *   state,
     *   lat,
     *   lon,
     *   temperature
     * )
     */

    if (
      typeof window.mapService.updateLocation ===
      "function"
    ) {

      window.mapService.updateLocation(
        location.name,
        location.state,
        location.lat,
        location.lon,
        temperature
      );
    }


    /* -------------------------------------------------------
       FULL / RADAR MAP
       ------------------------------------------------------- */

    if (
      typeof window.mapService.initializeFullMap ===
      "function"
    ) {

      const fullMapElement =
        document.getElementById(
          "weather-map-full"
        );

      /*
       * Only initialize the full map if the element
       * actually exists.
       */

      if (fullMapElement) {

        window.mapService.initializeFullMap();
      }
    }

  }

  catch (error) {

    console.warn(
      "Map synchronization failed:",
      error
    );
  }
}


/**
 * Synchronize both maps after a location change.
 */
function updateMapsForLocation() {

  if (!window.mapService) {
    return;
  }


  const location =
    appState.currentLocation;

  const weather =
    appState.weatherData;


  const temperature =
    weather?.current?.temp;


  try {

    if (
      typeof window.mapService.initialize ===
      "function"
    ) {

      window.mapService.initialize();
    }


    if (
      typeof window.mapService.updateLocation ===
      "function"
    ) {

      /*
       * CORRECT ARGUMENT ORDER
       *
       * name
       * state
       * lat
       * lon
       * temperature
       */

      window.mapService.updateLocation(
        location.name,
        location.state,
        location.lat,
        location.lon,
        temperature
      );
    }


    /*
     * If the radar/full map exists, initialize it too.
     */

    const fullMapElement =
      document.getElementById(
        "weather-map-full"
      );

    if (
      fullMapElement &&
      typeof window.mapService.initializeFullMap ===
      "function"
    ) {

      window.mapService.initializeFullMap();

      /*
       * updateLocation updates both mainMap and fullMap
       * inside mapService.js.
       */

      if (
        typeof window.mapService.updateLocation ===
        "function"
      ) {

        window.mapService.updateLocation(
          location.name,
          location.state,
          location.lat,
          location.lon,
          temperature
        );
      }
    }

  }

  catch (error) {

    console.warn(
      "Map location update failed:",
      error
    );
  }
}


/* =========================================================
   EVENT LISTENERS
   ========================================================= */

function setupEventListeners() {


  /* =======================================================
     TAB SWITCHING
     ======================================================= */

  const tabs =
    document.querySelectorAll(
      ".tab-pill"
    );


  tabs.forEach(tab => {

    tab.addEventListener(
      "click",
      () => {

        tabs.forEach(t => {

          t.classList.remove(
            "active"
          );

        });


        tab.classList.add(
          "active"
        );


        const tabId =
          tab.getAttribute(
            "data-tab"
          );


        appState.activeTab =
          tabId;


        document
          .querySelectorAll(
            ".tab-panel"
          )
          .forEach(panel => {

            panel.classList.add(
              "hidden"
            );

          });


        const targetPanel =
          document.getElementById(
            `tab-${tabId}`
          );


        if (targetPanel) {

          targetPanel.classList.remove(
            "hidden"
          );
        }


        /* -------------------------------------------------
           RADAR MAP
           ------------------------------------------------- */

        if (
          tabId === "radar" &&
          window.mapService
        ) {

          setTimeout(
            () => {

              try {

                if (
                  typeof window.mapService.initializeFullMap ===
                  "function"
                ) {

                  window.mapService.initializeFullMap();
                }


                updateMapsForLocation();


                /*
                 * Leaflet sometimes needs a size refresh
                 * after its container becomes visible.
                 */

                if (
                  typeof window.mapService.invalidateSize ===
                  "function"
                ) {

                  window.mapService.invalidateSize();
                }

              }

              catch (error) {

                console.warn(
                  "Radar map initialization failed:",
                  error
                );
              }

            },
            150
          );
        }


        /* -------------------------------------------------
           OVERVIEW MAP
           ------------------------------------------------- */

        else if (
          tabId === "overview" &&
          window.mapService
        ) {

          setTimeout(
            () => {

              try {

                if (
                  typeof window.mapService.initialize ===
                  "function"
                ) {

                  window.mapService.initialize();
                }


                updateMapsForLocation();


                if (
                  typeof window.mapService.invalidateSize ===
                  "function"
                ) {

                  window.mapService.invalidateSize();
                }

              }

              catch (error) {

                console.warn(
                  "Overview map initialization failed:",
                  error
                );
              }

            },
            150
          );
        }


        if (
          typeof lucide !== "undefined"
        ) {

          lucide.createIcons();
        }

      }
    );

  });


  /* =======================================================
     LANGUAGE SWITCHER
     ======================================================= */

  const langSelect =
    document.getElementById(
      "lang-select"
    );


  if (langSelect) {

    langSelect.addEventListener(
      "change",
      event => {

        appState.currentLang =
          event.target.value;


        if (
          typeof setLanguage ===
          "function"
        ) {

          setLanguage(
            appState.currentLang
          );
        }


        if (
          appState.weatherData
        ) {

          updateWeatherUI(
            appState.weatherData
          );
        }

      }
    );

  }


  /* =======================================================
     PERSONA SWITCHER
     ======================================================= */

  const personaChips =
    document.querySelectorAll(
      ".persona-chip"
    );


  personaChips.forEach(chip => {

    chip.addEventListener(
      "click",
      () => {

        personaChips.forEach(button => {

          button.classList.remove(
            "active"
          );

        });


        chip.classList.add(
          "active"
        );


        const persona =
          chip.getAttribute(
            "data-persona"
          );


        appState.activePersona =
          persona;


        if (
          window.gptEngine &&
          typeof window.gptEngine.setPersona ===
          "function"
        ) {

          try {

            window.gptEngine.setPersona(
              persona
            );

          }

          catch (error) {

            console.warn(
              "Could not update GPT persona:",
              error
            );
          }

        }


        triggerPersonaContextUpdate(
          persona
        );

      }
    );

  });


  /* =======================================================
     LOCATION SEARCH
     ======================================================= */

  const searchInput =
    document.getElementById(
      "search-input"
    );


  const dropdown =
    document.getElementById(
      "autocomplete-dropdown"
    );


  let debounceTimer =
    null;


  if (searchInput) {

    searchInput.addEventListener(
      "input",
      event => {

        clearTimeout(
          debounceTimer
        );


        const value =
          event.target.value.trim();


        if (
          value.length < 2
        ) {

          if (dropdown) {

            dropdown.classList.add(
              "hidden"
            );
          }

          return;
        }


        debounceTimer =
          setTimeout(
            async () => {

              try {

                if (
                  !window.weatherService ||
                  typeof window.weatherService.searchLocation !==
                  "function"
                ) {

                  console.warn(
                    "Location search service unavailable."
                  );

                  return;
                }


                const results =
                  await window.weatherService.searchLocation(
                    value
                  );


                renderAutocomplete(
                  results
                );

              }

              catch (error) {

                console.error(
                  "Location search failed:",
                  error
                );

                if (dropdown) {

                  dropdown.classList.add(
                    "hidden"
                  );
                }

              }

            },
            250
          );

      }
    );

  }


  /* =======================================================
     SEARCH ENTER KEY
     ======================================================= */

  if (searchInput) {

    searchInput.addEventListener(
      "keydown",
      event => {

        if (
          event.key !== "Enter"
        ) {

          return;
        }


        event.preventDefault();


        const firstResult =
          document.querySelector(
            "#autocomplete-dropdown .autocomplete-item"
          );


        /*
         * If autocomplete has a result,
         * select the first one.
         */

        if (firstResult) {

          firstResult.click();

          return;
        }


        /*
         * Otherwise try a direct location search.
         */

        const value =
          searchInput.value.trim();


        if (
          value.length >= 2 &&
          window.weatherService &&
          typeof window.weatherService.searchLocation ===
          "function"
        ) {

          searchLocationAndLoad(
            value
          );
        }

      }
    );

  }


  /* =======================================================
     GEOLOCATION
     ======================================================= */

  const geoBtn =
    document.getElementById(
      "geolocate-btn"
    );


  if (geoBtn) {

    geoBtn.addEventListener(
      "click",
      handleGeolocation
    );
  }


  /* =======================================================
     CHAT FORM
     ======================================================= */

  const chatForm =
    document.getElementById(
      "chat-form"
    );


  const chatInput =
    document.getElementById(
      "chat-input"
    );


  if (
    chatForm &&
    chatInput
  ) {

    chatForm.addEventListener(
      "submit",
      event => {

        event.preventDefault();


        const value =
          chatInput.value.trim();


        if (!value) {

          return;
        }


        handleUserChatMessage(
          value
        );


        chatInput.value =
          "";

      }
    );

  }


  /* =======================================================
     VOICE BUTTON
     ======================================================= */

  const voiceBtn =
    document.getElementById(
      "voice-btn"
    );


  if (voiceBtn) {

    voiceBtn.addEventListener(
      "click",
      () => {

        toggleVoiceInput(
          chatInput
        );

      }
    );

  }


  /* =======================================================
     QUICK QUESTIONS
     ======================================================= */

  document
    .querySelectorAll(
      ".quick-chip"
    )
    .forEach(chip => {

      chip.addEventListener(
        "click",
        () => {

          const question =
            chip.textContent.trim();


          if (question) {

            handleUserChatMessage(
              question
            );
          }

        }
      );

    });


  /* =======================================================
     DOSSIER MODAL
     ======================================================= */

  const dossierBtn =
    document.getElementById(
      "export-dossier-btn"
    );


  const dossierModal =
    document.getElementById(
      "dossier-modal"
    );


  const closeDossierBtn =
    document.getElementById(
      "close-dossier-btn"
    );


  if (
    dossierBtn &&
    dossierModal
  ) {

    dossierBtn.addEventListener(
      "click",
      () => {

        renderDossierContent();

        dossierModal.classList.remove(
          "hidden"
        );

      }
    );

  }


  if (
    closeDossierBtn &&
    dossierModal
  ) {

    closeDossierBtn.addEventListener(
      "click",
      () => {

        dossierModal.classList.add(
          "hidden"
        );

      }
    );

  }


  /* =======================================================
     SETTINGS MODAL
     ======================================================= */

  const settingsModal =
    document.getElementById(
      "settings-modal"
    );


  const openSettings = () => {

    if (settingsModal) {

      settingsModal.classList.remove(
        "hidden"
      );
    }

  };


  const closeSettings = () => {

    if (settingsModal) {

      settingsModal.classList.add(
        "hidden"
      );
    }

  };


  document
    .getElementById(
      "settings-btn"
    )
    ?.addEventListener(
      "click",
      openSettings
    );


  document
    .getElementById(
      "settings-btn-mob"
    )
    ?.addEventListener(
      "click",
      openSettings
    );


  document
    .getElementById(
      "close-settings-btn"
    )
    ?.addEventListener(
      "click",
      closeSettings
    );


  /* =======================================================
     SAVE AI SETTINGS
     ======================================================= */

  const saveSettingsBtn =
    document.getElementById(
      "save-settings-btn"
    );


  if (saveSettingsBtn) {

    saveSettingsBtn.addEventListener(
      "click",
      () => {

        if (
          !window.gptEngine ||
          typeof window.gptEngine.setApiConfig !==
          "function"
        ) {

          showNotification(
            "AI engine is unavailable.",
            "error"
          );

          return;
        }


        const provider =
          document.getElementById(
            "provider-select"
          )?.value || "";


        const apiKey =
          document.getElementById(
            "api-key-input"
          )?.value.trim() || "";


        try {

          window.gptEngine.setApiConfig(
            provider,
            apiKey
          );


          closeSettings();


          showNotification(
            "Settings saved successfully."
          );

        }

        catch (error) {

          console.error(
            "Saving AI settings failed:",
            error
          );


          showNotification(
            "Could not save AI settings.",
            "error"
          );
        }

      }
    );

  }

}


/* =========================================================
   SEARCH LOCATION AND LOAD
   ========================================================= */

async function searchLocationAndLoad(
  query
) {

  try {

    if (
      !window.weatherService ||
      typeof window.weatherService.searchLocation !==
      "function"
    ) {

      throw new Error(
        "Location search service unavailable."
      );
    }


    const results =
      await window.weatherService.searchLocation(
        query
      );


    if (
      !results ||
      results.length === 0
    ) {

      showNotification(
        "No matching location found.",
        "error"
      );

      return;
    }


    const location =
      results[0];


    const lat =
      Number(location.lat);


    const lon =
      Number(location.lon);


    const name =
      location.name ||
      query;


    const state =
      location.state ||
      location.admin1 ||
      "";


    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lon)
    ) {

      throw new Error(
        "Search returned invalid coordinates."
      );
    }


    await loadWeather(
      lat,
      lon,
      name,
      state
    );

  }

  catch (error) {

    console.error(
      "Direct location search failed:",
      error
    );


    showNotification(
      "Could not load that location.",
      "error"
    );
  }
}


/* =========================================================
   CITY LOADING
   ========================================================= */

window.loadCity =
  async function (
    name,
    state,
    lat,
    lon
  ) {

    const numericLat =
      Number(lat);


    const numericLon =
      Number(lon);


    if (
      !Number.isFinite(numericLat) ||
      !Number.isFinite(numericLon)
    ) {

      console.error(
        "Invalid city coordinates:",
        {
          name,
          state,
          lat,
          lon
        }
      );

      showNotification(
        "Invalid location coordinates.",
        "error"
      );

      return;
    }


    const searchInput =
      document.getElementById(
        "search-input"
      );


    if (searchInput) {

      searchInput.value =
        `${name}, ${state}`;
    }


    await loadWeather(
      numericLat,
      numericLon,
      name,
      state
    );
  };


/* =========================================================
   LOAD WEATHER BY COORDINATES
   ========================================================= */

window.loadWeatherByCoords =
  async function (
    lat,
    lon
  ) {

    const numericLat =
      Number(lat);


    const numericLon =
      Number(lon);


    if (
      !Number.isFinite(numericLat) ||
      !Number.isFinite(numericLon)
    ) {

      showNotification(
        "Invalid coordinates.",
        "error"
      );

      return;
    }


    let name =
      `District (${numericLat.toFixed(2)}°, ${numericLon.toFixed(2)}°)`;


    let state =
      "India";


    /*
     * Open-Meteo geocoding attempt.
     *
     * NOTE:
     * This is only a best-effort lookup.
     */

    try {

      const url =
        `https://geocoding-api.open-meteo.com/v1/search` +
        `?name=${encodeURIComponent(
          `${numericLat.toFixed(2)},${numericLon.toFixed(2)}`
        )}` +
        `&count=1` +
        `&language=en` +
        `&format=json`;


      const response =
        await fetch(url);


      if (response.ok) {

        const data =
          await response.json();


        if (
          data.results &&
          data.results[0]
        ) {

          name =
            data.results[0].name ||
            name;


          state =
            data.results[0].admin1 ||
            data.results[0].country ||
            "India";
        }
      }

    }

    catch (error) {

      console.warn(
        "Coordinate geocoding unavailable:",
        error
      );
    }


    const searchInput =
      document.getElementById(
        "search-input"
      );


    if (searchInput) {

      searchInput.value =
        `${name}, ${state}`;
    }


    await loadWeather(
      numericLat,
      numericLon,
      name,
      state
    );
  };


/* =========================================================
   GEOLOCATION
   ========================================================= */

function handleGeolocation() {

  if (
    !navigator.geolocation
  ) {

    showNotification(
      "Geolocation is not supported by this browser.",
      "error"
    );

    return;
  }


  const geoBtn =
    document.getElementById(
      "geolocate-btn"
    );


  if (geoBtn) {

    geoBtn.classList.add(
      "opacity-50"
    );

    geoBtn.disabled =
      true;
  }


  navigator.geolocation.getCurrentPosition(

    async position => {

      if (geoBtn) {

        geoBtn.classList.remove(
          "opacity-50"
        );

        geoBtn.disabled =
          false;
      }


      await loadWeather(
        position.coords.latitude,
        position.coords.longitude,
        "Your Location",
        "Local Area"
      );

    },


    error => {

      if (geoBtn) {

        geoBtn.classList.remove(
          "opacity-50"
        );

        geoBtn.disabled =
          false;
      }


      console.warn(
        "Geolocation error:",
        error
      );


      showNotification(
        "Could not retrieve your location.",
        "error"
      );

    },


    {
      enableHighAccuracy:
        true,

      timeout:
        10000,

      maximumAge:
        300000
    }

  );
}


/* =========================================================
   MAIN WEATHER LOADER
   ========================================================= */

async function loadWeather(
  lat,
  lon,
  name,
  state
) {

  showLoader(
    true
  );


  try {

    const numericLat =
      Number(lat);


    const numericLon =
      Number(lon);


    if (
      !Number.isFinite(numericLat) ||
      !Number.isFinite(numericLon)
    ) {

      throw new Error(
        "Invalid latitude/longitude."
      );
    }


    if (
      !window.weatherService
    ) {

      throw new Error(
        "WeatherService is unavailable."
      );
    }


    if (
      typeof window.weatherService.fetchWeather !==
      "function"
    ) {

      throw new Error(
        "weatherService.fetchWeather() is unavailable."
      );
    }


    /* -------------------------------------------------------
       FETCH WEATHER
       ------------------------------------------------------- */

    const data =
      await window.weatherService.fetchWeather(
        numericLat,
        numericLon,
        name,
        state
      );


    if (!data) {

      throw new Error(
        "No weather data returned."
      );
    }


    /* -------------------------------------------------------
       UPDATE APP STATE
       ------------------------------------------------------- */

    appState.weatherData =
      data;


    appState.currentLocation = {

      name:
        name ||
        data.location?.name ||
        "Selected Location",

      state:
        state ||
        data.location?.state ||
        "",

      lat:
        numericLat,

      lon:
        numericLon
    };


    /* -------------------------------------------------------
       UPDATE SEARCH BAR
       ------------------------------------------------------- */

    const searchInput =
      document.getElementById(
        "search-input"
      );


    if (searchInput) {

      searchInput.value =
        `${appState.currentLocation.name}, ${appState.currentLocation.state}`;
    }


    /* -------------------------------------------------------
       UPDATE WEATHER UI
       ------------------------------------------------------- */

    updateWeatherUI(
      data
    );


    /* -------------------------------------------------------
       UPDATE MAP
       ------------------------------------------------------- */

    updateMapsForLocation();


  }

  catch (error) {

    console.error(
      "Load weather failed:",
      error
    );


    /*
     * Keep the previous weather data if a new request fails.
     */

    showNotification(
      "Error updating weather observations.",
      "error"
    );

  }

  finally {

    showLoader(
      false
    );
  }
}


/* =========================================================
   SEARCH AUTOCOMPLETE
   ========================================================= */

function renderAutocomplete(
  results
) {

  const dropdown =
    document.getElementById(
      "autocomplete-dropdown"
    );


  if (!dropdown) {

    return;
  }


  if (
    !results ||
    results.length === 0
  ) {

    dropdown.classList.add(
      "hidden"
    );

    return;
  }


  dropdown.innerHTML =
    results
      .map(location => {

        const name =
          escapeHtml(
            location.name
          );


        const state =
          escapeHtml(
            location.state ||
            location.admin1 ||
            location.country ||
            ""
          );


        const lat =
          Number(
            location.lat
          );


        const lon =
          Number(
            location.lon
          );


        return `
          <div
            class="autocomplete-item"
            data-lat="${lat}"
            data-lon="${lon}"
            data-name="${name}"
            data-state="${state}"
          >

            <div>

              <span
                class="font-bold text-white text-xs sm:text-sm"
              >
                ${name}
              </span>

              ${
                state
                  ? `
                    <span
                      class="text-xs text-slate-400 ml-1"
                    >
                      (${state})
                    </span>
                  `
                  : ""
              }

            </div>

            <span
              class="text-xs text-sky-400 font-semibold"
            >
              Select →
            </span>

          </div>
        `;
      })
      .join("");


  dropdown
    .querySelectorAll(
      ".autocomplete-item"
    )
    .forEach(item => {

      item.addEventListener(
        "click",
        async () => {

          const lat =
            Number(
              item.dataset.lat
            );


          const lon =
            Number(
              item.dataset.lon
            );


          const name =
            item.dataset.name ||
            "Selected Location";


          const state =
            item.dataset.state ||
            "";


          if (
            !Number.isFinite(lat) ||
            !Number.isFinite(lon)
          ) {

            console.error(
              "Autocomplete item contains invalid coordinates:",
              {
                lat,
                lon
              }
            );

            showNotification(
              "Selected location has invalid coordinates.",
              "error"
            );

            return;
          }


          const searchInput =
            document.getElementById(
              "search-input"
            );


          if (searchInput) {

            searchInput.value =
              `${name}, ${state}`;
          }


          dropdown.classList.add(
            "hidden"
          );


          /*
           * THIS IS THE IMPORTANT CONNECTION:
           *
           * Search result
           *      ↓
           * coordinates
           *      ↓
           * loadWeather()
           *      ↓
           * appState.currentLocation
           *      ↓
           * updateMapsForLocation()
           *      ↓
           * Leaflet map moves
           */

          await loadWeather(
            lat,
            lon,
            name,
            state
          );

        }
      );

    });


  dropdown.classList.remove(
    "hidden"
  );
}


/* =========================================================
   CLOSE AUTOCOMPLETE WHEN CLICKING OUTSIDE
   ========================================================= */

document.addEventListener(
  "click",
  event => {

    const dropdown =
      document.getElementById(
        "autocomplete-dropdown"
      );


    const searchInput =
      document.getElementById(
        "search-input"
      );


    if (
      dropdown &&
      !dropdown.contains(
        event.target
      ) &&
      event.target !== searchInput
    ) {

      dropdown.classList.add(
        "hidden"
      );
    }

  }
);


/* =========================================================
   WEATHER UI
   ========================================================= */

function updateWeatherUI(
  data
) {

  if (!data) {

    return;
  }


  const setText =
    (
      id,
      value
    ) => {

      const element =
        document.getElementById(
          id
        );


      if (element) {

        element.textContent =
          value;
      }

    };


  /* =======================================================
     HERO
     ======================================================= */

  setText(
    "loc-name",
    data.location?.name || "--"
  );


  setText(
    "loc-state",
    data.location?.state || "--"
  );


  setText(
    "current-temp",
    `${data.current?.temp ?? "--"}°C`
  );


  setText(
    "val-feels-like",
    `${data.current?.feelsLike ?? "--"}°C`
  );


  setText(
    "val-today-max",
    `${data.current?.todayMax ?? "--"}°`
  );


  setText(
    "val-today-min",
    `${data.current?.todayMin ?? "--"}°`
  );


  setText(
    "current-condition",
    data.current?.condition || "--"
  );


  setText(
    "current-icon",
    data.current?.icon || "🌤️"
  );


  /* =======================================================
     MAIN METRICS
     ======================================================= */

  setText(
    "val-humidity",
    `${data.current?.humidity ?? "--"}%`
  );


  setText(
    "val-wind",
    `${data.current?.windSpeed ?? "--"}`
  );


  setText(
    "val-uv",
    `${data.current?.uvIndex ?? "--"}`
  );


  setText(
    "val-aqi",
    data.aqi?.value ?? "--"
  );


  /* =======================================================
     WIND ROSE
     ======================================================= */

  const needle =
    document.getElementById(
      "compass-needle"
    );


  if (
    needle &&
    Number.isFinite(
      Number(
        data.current?.windDirection
      )
    )
  ) {

    needle.style.transform =
      `rotate(${data.current.windDirection}deg)`;
  }


  setText(
    "val-wind-cardinal",
    data.current?.windCardinal || "--"
  );


  setText(
    "val-wind-speed-main",
    data.current?.windSpeed ?? "--"
  );


  setText(
    "val-wind-gusts",
    `${data.current?.windGusts ?? "--"} km/h`
  );


  setText(
    "val-wind-deg",
    `${data.current?.windDirection ?? "--"}°`
  );


  setText(
    "val-pressure-num",
    `${data.current?.pressure ?? "--"} hPa`
  );


  setText(
    "val-barometer-trend",
    data.current?.pressure != null
      ? `${data.current.pressure} hPa Steady`
      : "--"
  );


  /* =======================================================
     RAIN
     ======================================================= */

  const rainProbability =
    data.hourly?.[0]?.rainProb ?? 0;


  setText(
    "val-rain-prob",
    `${rainProbability}%`
  );


  /* =======================================================
     SUN
     ======================================================= */

  setText(
    "val-sunrise-time",
    data.sun?.sunrise || "--"
  );


  setText(
    "val-sunset-time",
    data.sun?.sunset || "--"
  );


  setText(
    "val-daylight-dur",
    data.sun?.daylightHours
      ? `${data.sun.daylightHours} Sun`
      : "--"
  );


  const sunMarker =
    document.getElementById(
      "sun-arc-marker"
    );


  if (
    sunMarker &&
    data.sun
  ) {

    const p =
      Math.max(
        0,
        Math.min(
          1,
          Number(
            data.sun.positionPercent || 0
          ) / 100
        )
      );


    const cx =
      15 +
      p *
      (185 - 15);


    const cy =
      70 -
      4 *
      p *
      (1 - p) *
      60;


    sunMarker.setAttribute(
      "cx",
      cx.toFixed(1)
    );


    sunMarker.setAttribute(
      "cy",
      cy.toFixed(1)
    );
  }


  /* =======================================================
     MAP COORDINATES
     ======================================================= */

  const coordBadge =
    document.getElementById(
      "map-coord-badge"
    );


  if (
    coordBadge &&
    data.location
  ) {

    const latitude =
      Number(
        data.location.lat
      );


    const longitude =
      Number(
        data.location.lon
      );


    if (
      Number.isFinite(latitude) &&
      Number.isFinite(longitude)
    ) {

      const latDir =
        latitude >= 0
          ? "N"
          : "S";


      const lonDir =
        longitude >= 0
          ? "E"
          : "W";


      coordBadge.textContent =
        `${Math.abs(latitude).toFixed(2)}° ${latDir}, ` +
        `${Math.abs(longitude).toFixed(2)}° ${lonDir}`;
    }

  }


  /* =======================================================
     IMD ALERT
     ======================================================= */

  const ribbon =
    document.getElementById(
      "imd-alert-ribbon"
    );


  const alertTitle =
    document.getElementById(
      "alert-title"
    );


  const alertDesc =
    document.getElementById(
      "alert-desc"
    );


  if (
    ribbon &&
    alertTitle &&
    alertDesc &&
    data.imdAlert
  ) {

    alertTitle.textContent =
      `IMD Status: ${data.imdAlert.title || "Normal"}`;


    alertDesc.textContent =
      data.imdAlert.desc || "";


    ribbon.className =
      `mb-5 p-4 rounded-2xl border ` +
      `flex items-center justify-between gap-3 ` +
      `${data.imdAlert.badgeColor || ""}`;
  }


  /* =======================================================
     SPRAY BADGE
     ======================================================= */

  const badgeSpray =
    document.getElementById(
      "badge-spray"
    );


  if (
    badgeSpray &&
    data.agriculture
  ) {

    if (
      data.agriculture.isSpraySafe
    ) {

      badgeSpray.innerHTML =
        `
          <i
            data-lucide="check-circle-2"
            class="w-3.5 h-3.5"
          ></i>

          <span>
            Spraying Safe
          </span>
        `;


      badgeSpray.className =
        "text-xs font-semibold px-3 py-1.5 rounded-full " +
        "bg-emerald-500/20 text-emerald-300 " +
        "border border-emerald-500/40 " +
        "flex items-center gap-1.5";

    }

    else {

      badgeSpray.innerHTML =
        `
          <i
            data-lucide="alert-circle"
            class="w-3.5 h-3.5"
          ></i>

          <span>
            Avoid Spraying
          </span>
        `;


      badgeSpray.className =
        "text-xs font-semibold px-3 py-1.5 rounded-full " +
        "bg-rose-500/20 text-rose-300 " +
        "border border-rose-500/40 " +
        "flex items-center gap-1.5";
    }
  }


  /* =======================================================
     IRRIGATION
     ======================================================= */

  setText(
    "val-irrigation",
    data.agriculture?.isIrrigationNeeded
      ? "Irrigation Recommended"
      : "Irrigation Not Needed"
  );


  /* =======================================================
     SPRAY MATRIX
     ======================================================= */

  const sprayGrid =
    document.getElementById(
      "spray-matrix-grid"
    );


  if (
    sprayGrid &&
    Array.isArray(
      data.sprayMatrix
    )
  ) {

    sprayGrid.innerHTML =
      data.sprayMatrix
        .map(slot => {

          return `
            <div
              class="spray-slot ${escapeHtml(
                slot.status
              )}"
            >

              <span
                class="font-bold text-[11px]"
              >
                ${escapeHtml(slot.time)}
              </span>

              <span
                class="text-xs font-extrabold my-1 font-num"
              >
                ${slot.temp ?? "--"}°C
              </span>

              <div
                class="text-[10px] opacity-80 flex flex-col items-center"
              >

                <span>
                  💨 ${slot.wind ?? "--"}km/h
                </span>

                <span>
                  💧 ${slot.rainProb ?? "--"}%
                </span>

              </div>

              <span
                class="text-[10px] font-bold mt-1 uppercase tracking-tight"
              >
                ${escapeHtml(
                  slot.statusLabel
                )}
              </span>

            </div>
          `;

        })
        .join("");
  }


  /* =======================================================
     AGRICULTURE
     ======================================================= */

  setText(
    "val-evapo",
    data.agriculture?.evapotranspirationRate ??
      "--"
  );


  setText(
    "val-disease-risk",
    data.agriculture?.diseaseRisk ??
      "--"
  );


  /* =======================================================
     AQI / POLLUTANTS
     ======================================================= */

  if (
    data.aqi?.pollutants
  ) {

    setText(
      "val-pm25",
      data.aqi.pollutants.pm25 ?? "--"
    );


    setText(
      "val-pm10",
      data.aqi.pollutants.pm10 ?? "--"
    );


    setText(
      "val-no2",
      data.aqi.pollutants.no2 ?? "--"
    );


    setText(
      "val-so2",
      data.aqi.pollutants.so2 ?? "--"
    );


    setText(
      "val-o3",
      data.aqi.pollutants.o3 ?? "--"
    );
  }


  setText(
    "val-aqi-full-advice",
    data.aqi?.advice || ""
  );


  /* =======================================================
     SOLAR
     ======================================================= */

  setText(
    "val-solar-potential",
    `${data.solar?.potentialPercent ?? 0}%`
  );


  setText(
    "val-solar-kwh",
    `${data.solar?.estimatedKWh ?? "0.0"} kWh`
  );


  /* =======================================================
     7-DAY FORECAST
     ======================================================= */

  render7DaySpectrum(
    data.daily
  );


  /* =======================================================
     24-HOUR CHART
     ======================================================= */

  render24hChart(
    data.hourly
  );


  if (
    typeof lucide !== "undefined"
  ) {

    lucide.createIcons();
  }
}


/* =========================================================
   7-DAY SPECTRUM
   ========================================================= */

function render7DaySpectrum(
  days
) {

  const container =
    document.getElementById(
      "forecast-7d-spectrum"
    );


  if (
    !container ||
    !Array.isArray(days)
  ) {

    return;
  }


  container.innerHTML =
    days
      .map(day => {

        return `
          <div
            class="flex items-center justify-between gap-3 text-xs py-1 border-b border-slate-800/40 last:border-0"
          >

            <span
              class="font-bold text-slate-300 w-16"
            >
              ${escapeHtml(
                day.dayName
              )}
            </span>


            <span
              class="text-xl w-7 text-center"
            >
              ${escapeHtml(
                day.icon
              )}
            </span>


            <div
              class="flex items-center gap-1 text-[11px] text-sky-400 w-12"
            >

              <span>
                💧
              </span>

              <span>
                ${day.rainProb ?? 0}%
              </span>

            </div>


            <div
              class="temp-bar-container"
            >

              <span
                class="font-mono text-slate-400 text-[11px] w-6 text-right"
              >
                ${day.minTemp ?? "--"}°
              </span>


              <div
                class="temp-bar-bg"
              >

                <div
                  class="temp-bar-fill"
                  style="
                    left: ${Number(
                      day.barLeft ?? 0
                    )}%;
                    width: ${Number(
                      day.barWidth ?? 0
                    )}%;
                  "
                ></div>

              </div>


              <span
                class="font-mono text-white font-bold text-[11px] w-6 text-left"
              >
                ${day.maxTemp ?? "--"}°
              </span>

            </div>

          </div>
        `;

      })
      .join("");
}


/* =========================================================
   24-HOUR CHART
   ========================================================= */

function render24hChart(
  hourly
) {

  const canvas =
    document.getElementById(
      "forecastChart"
    );


  if (
    !canvas ||
    !Array.isArray(hourly)
  ) {

    return;
  }


  if (
    typeof Chart ===
    "undefined"
  ) {

    console.warn(
      "Chart.js is not loaded. 24-hour chart skipped."
    );

    return;
  }


  if (
    appState.chartInstance
  ) {

    try {

      appState.chartInstance.destroy();

    }

    catch (error) {

      console.warn(
        "Previous chart could not be destroyed:",
        error
      );
    }


    appState.chartInstance =
      null;
  }


  const ctx =
    canvas.getContext(
      "2d"
    );


  if (!ctx) {

    return;
  }


  const gradient =
    ctx.createLinearGradient(
      0,
      0,
      0,
      220
    );


  gradient.addColorStop(
    0,
    "rgba(56, 189, 248, 0.4)"
  );


  gradient.addColorStop(
    1,
    "rgba(56, 189, 248, 0.0)"
  );


  appState.chartInstance =
    new Chart(
      ctx,
      {

        type:
          "line",


        data: {

          labels:
            hourly.map(
              item =>
                item.time
            ),


          datasets: [

            {

              label:
                "Temperature (°C)",


              data:
                hourly.map(
                  item =>
                    item.temp
                ),


              borderColor:
                "#38bdf8",


              backgroundColor:
                gradient,


              fill:
                true,


              tension:
                0.35,


              pointRadius:
                2,


              pointHoverRadius:
                5,


              pointBackgroundColor:
                "#7dd3fc",


              yAxisID:
                "y"

            },


            {

              type:
                "bar",


              label:
                "Rain Probability (%)",


              data:
                hourly.map(
                  item =>
                    item.rainProb
                ),


              backgroundColor:
                "rgba(99, 102, 241, 0.4)",


              borderRadius:
                4,


              yAxisID:
                "y1"

            }

          ]

        },


        options: {

          responsive:
            true,


          maintainAspectRatio:
            false,


          interaction: {

            mode:
              "index",

            intersect:
              false

          },


          plugins: {

            legend: {

              labels: {

                color:
                  "#94a3b8",

                font: {

                  size:
                    10,

                  family:
                    "Plus Jakarta Sans"

                }

              }

            },


            tooltip: {

              backgroundColor:
                "rgba(15, 23, 42, 0.95)",

              borderColor:
                "rgba(255, 255, 255, 0.15)",

              borderWidth:
                1,

              padding:
                10,

              titleFont: {

                size:
                  12,

                weight:
                  "bold"

              }

            }

          },


          scales: {

            x: {

              ticks: {

                color:
                  "#64748b",

                font: {

                  size:
                    9

                },

                maxTicksLimit:
                  8

              },


              grid: {

                color:
                  "rgba(255,255,255,0.03)"

              }

            },


            y: {

              ticks: {

                color:
                  "#94a3b8",

                font: {

                  size:
                    10

                }

              },


              grid: {

                color:
                  "rgba(255,255,255,0.04)"

              }

            },


            y1: {

              position:
                "right",

              min:
                0,

              max:
                100,


              ticks: {

                color:
                  "#818cf8",

                font: {

                  size:
                    10

                }

              },


              grid: {

                drawOnChartArea:
                  false

              }

            }

          }

        }

      }
    );
}


/* =========================================================
   CHAT
   ========================================================= */

async function handleUserChatMessage(
  userText
) {

  const chatMessages =
    document.getElementById(
      "chat-messages"
    );


  if (!chatMessages) {

    return;
  }


  appendMessage(
    "user",
    userText
  );


  const typingId =
    appendTypingIndicator();


  try {

    /* -------------------------------------------------------
       GPT ENGINE CHECK
       ------------------------------------------------------- */

    if (
      !window.gptEngine
    ) {

      throw new Error(
        "window.gptEngine is not available."
      );
    }


    if (
      typeof window.gptEngine.generateResponse !==
      "function"
    ) {

      throw new Error(
        "gptEngine.generateResponse() is not available."
      );
    }


    if (
      !appState.weatherData
    ) {

      throw new Error(
        "Weather data is not available for the AI request."
      );
    }


    /* -------------------------------------------------------
       GENERATE RESPONSE
       ------------------------------------------------------- */

    const response =
      await window.gptEngine.generateResponse(
        userText,
        appState.weatherData,
        appState.currentLang
      );


    removeTypingIndicator(
      typingId
    );


    if (
      !response
    ) {

      throw new Error(
        "GPT engine returned an empty response."
      );
    }


    appendMessage(
      "ai",
      response
    );

  }

  catch (error) {

    console.error(
      "AI response failed:",
      error
    );


    removeTypingIndicator(
      typingId
    );


    /*
     * Keep the user-facing message clean,
     * but expose the real error in console.
     */

    appendMessage(
      "ai",
      "⚠️ Advisory desk is momentarily updating records. Please try again."
    );

  }
}


/* =========================================================
   PERSONA CONTEXT
   ========================================================= */

function triggerPersonaContextUpdate(
  persona
) {

  const promptMap = {

    kisan:
      "Provide agricultural field advisory on current moisture, 12-hour spray window, irrigation and crop health.",

    disaster:
      "Assess current weather hazard levels and provide practical safety guidance.",

    health:
      "Provide public health guidance based on current weather and air-quality conditions.",

    commute:
      "Provide a practical commute advisory based on rainfall, wind and possible waterlogging."

  };


  handleUserChatMessage(
    promptMap[persona] ||
    promptMap.kisan
  );
}


/* =========================================================
   INITIAL COPILOT MESSAGE
   ========================================================= */

function renderInitialCopilotMessage() {

  const chatMessages =
    document.getElementById(
      "chat-messages"
    );


  if (!chatMessages) {

    return;
  }


  if (
    chatMessages.dataset.initialized ===
    "true"
  ) {

    return;
  }


  chatMessages.dataset.initialized =
    "true";


  appendMessage(
    "ai",
    `### ⛅ WeatherGPT Operational

Ready to analyze **hyperlocal observations** across Agriculture, Disaster Safety, Health, and Mobility.

Select an inquiry topic or ask any practical question:

- *"What is the safest hour to spray today?"*
- *"What is the current air quality?"*
- *"Will rain affect my commute?"*`
  );
}


/* =========================================================
   CHAT MESSAGE RENDERER
   ========================================================= */

function appendMessage(
  sender,
  text
) {

  const chatMessages =
    document.getElementById(
      "chat-messages"
    );


  if (!chatMessages) {

    return;
  }


  const div =
    document.createElement(
      "div"
    );


  div.className =
    sender === "user"
      ? "chat-bubble-user"
      : "chat-bubble-ai";


  if (
    sender === "user"
  ) {

    div.textContent =
      text;

  }

  else {

    let formatted =
      String(
        text || ""
      );


    /*
     * Headers
     */

    formatted =
      formatted.replace(
        /^### (.*$)/gim,
        '<h3><i data-lucide="zap" class="w-4 h-4 text-sky-400"></i> $1</h3>'
      );


    formatted =
      formatted.replace(
        /^#### (.*$)/gim,
        "<h4>$1</h4>"
      );


    /*
     * Bold
     */

    formatted =
      formatted.replace(
        /\*\*(.*?)\*\*/g,
        "<strong>$1</strong>"
      );


    /*
     * List items
     */

    formatted =
      formatted.replace(
        /^\- (.*$)/gim,
        "<li>$1</li>"
      );


    /*
     * Paragraph spacing
     */

    formatted =
      formatted.replace(
        /\n\n/g,
        "<p></p>"
      );


    /*
     * Line breaks
     */

    formatted =
      formatted.replace(
        /\n/g,
        "<br/>"
      );


    /*
     * Wrap list items.
     */

    formatted =
      formatted.replace(
        /((?:<li>.*?<\/li><br\/>?)+)/gis,
        "<ul>$1</ul>"
      );


    formatted =
      formatted.replace(
        /(<li>.*?<\/li>)/gis,
        "<ul>$1</ul>"
      );


    div.innerHTML =
      formatted;


    /* -------------------------------------------------------
       ACTION TOOLBAR
       ------------------------------------------------------- */

    const actionsDiv =
      document.createElement(
        "div"
      );


    actionsDiv.className =
      "flex items-center gap-3 mt-3 pt-2 border-t border-slate-700/40 text-[11px] font-semibold text-slate-400";


    /* -------------------------------------------------------
       AUDIO
       ------------------------------------------------------- */

    const speakBtn =
      document.createElement(
        "button"
      );


    speakBtn.className =
      "hover:text-sky-300 flex items-center gap-1 transition-colors";


    speakBtn.innerHTML =
      `
        <i
          data-lucide="volume-2"
          class="w-3.5 h-3.5 text-sky-400"
        ></i>

        <span>
          Audio
        </span>
      `;


    speakBtn.onclick =
      () => {

        if (
          window.voiceManager &&
          typeof window.voiceManager.speakText ===
          "function"
        ) {

          window.voiceManager.speakText(
            text,
            appState.currentLang
          );

        }

        else {

          showNotification(
            "Voice manager unavailable.",
            "error"
          );
        }

      };


    /* -------------------------------------------------------
       COPY
       ------------------------------------------------------- */

    const copyBtn =
      document.createElement(
        "button"
      );


    copyBtn.className =
      "hover:text-sky-300 flex items-center gap-1 transition-colors";


    copyBtn.innerHTML =
      `
        <i
          data-lucide="copy"
          class="w-3.5 h-3.5 text-slate-400"
        ></i>

        <span>
          Copy
        </span>
      `;


    copyBtn.onclick =
      async () => {

        try {

          await navigator.clipboard.writeText(
            text
          );


          showNotification(
            "Advisory copied to clipboard!"
          );

        }

        catch (error) {

          console.error(
            "Clipboard error:",
            error
          );


          showNotification(
            "Could not copy advisory.",
            "error"
          );
        }

      };


    /* -------------------------------------------------------
       WHATSAPP
       ------------------------------------------------------- */

    const waBtn =
      document.createElement(
        "button"
      );


    waBtn.className =
      "hover:text-emerald-300 flex items-center gap-1 transition-colors text-emerald-400";


    waBtn.innerHTML =
      `
        <i
          data-lucide="share-2"
          class="w-3.5 h-3.5"
        ></i>

        <span>
          WhatsApp
        </span>
      `;


    waBtn.onclick =
      () => {

        const message =
          `🌾 WeatherGPT Advisory for ${appState.currentLocation.name}:\n\n${text}`;


        const waUrl =
          `https://api.whatsapp.com/send?text=${encodeURIComponent(
            message
          )}`;


        window.open(
          waUrl,
          "_blank",
          "noopener,noreferrer"
        );
      };


    actionsDiv.appendChild(
      speakBtn
    );


    actionsDiv.appendChild(
      copyBtn
    );


    actionsDiv.appendChild(
      waBtn
    );


    div.appendChild(
      actionsDiv
    );

  }


  chatMessages.appendChild(
    div
  );


  chatMessages.scrollTop =
    chatMessages.scrollHeight;


  if (
    typeof lucide !== "undefined"
  ) {

    lucide.createIcons();
  }
}


/* =========================================================
   TYPING INDICATOR
   ========================================================= */

function appendTypingIndicator() {

  const chatMessages =
    document.getElementById(
      "chat-messages"
    );


  if (!chatMessages) {

    return null;
  }


  const id =
    `typing-${Date.now()}`;


  const div =
    document.createElement(
      "div"
    );


  div.id =
    id;


  div.className =
    "chat-bubble-ai flex items-center gap-2 text-slate-400 text-xs italic";


  div.innerHTML =
    `
      <div
        class="w-3 h-3 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"
      ></div>

      <span>
        Reviewing meteorological data points...
      </span>
    `;


  chatMessages.appendChild(
    div
  );


  chatMessages.scrollTop =
    chatMessages.scrollHeight;


  return id;
}


function removeTypingIndicator(
  id
) {

  if (!id) {

    return;
  }


  document
    .getElementById(id)
    ?.remove();
}


/* =========================================================
   VOICE INPUT
   ========================================================= */

function toggleVoiceInput(
  targetInput
) {

  const waveIndicator =
    document.getElementById(
      "voice-indicator"
    );


  const btnText =
    document.getElementById(
      "voice-btn-text"
    );


  if (
    !window.voiceManager
  ) {

    showNotification(
      "Voice manager unavailable.",
      "error"
    );

    return;
  }


  if (
    window.voiceManager.isListening
  ) {

    window.voiceManager.stopListening();


    waveIndicator
      ?.classList.add(
        "hidden"
      );


    if (btnText) {

      btnText.textContent =
        "Voice Query";
    }


    return;
  }


  waveIndicator
    ?.classList.remove(
      "hidden"
    );


  if (btnText) {

    btnText.textContent =
      "Listening...";
  }


  window.voiceManager.startListening(

    appState.currentLang,


    transcript => {

      if (
        targetInput
      ) {

        targetInput.value =
          transcript;
      }


      handleUserChatMessage(
        transcript
      );


      if (
        targetInput
      ) {

        targetInput.value =
          "";
      }

    },


    () => {

      waveIndicator
        ?.classList.add(
          "hidden"
        );


      if (btnText) {

        btnText.textContent =
          "Voice Query";
      }

    },


    error => {

      waveIndicator
        ?.classList.add(
          "hidden"
        );


      if (btnText) {

        btnText.textContent =
          "Voice Query";
      }


      showNotification(
        error ||
        "Voice input failed.",
        "error"
      );

    }

  );
}


/* =========================================================
   DOSSIER
   ========================================================= */

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


  content.innerHTML =
    `
      <div
        class="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-3"
      >

        <div
          class="flex items-center justify-between border-b border-slate-800 pb-2"
        >

          <div>

            <span
              class="text-sm font-bold text-white"
            >
              ${escapeHtml(
                d.location?.name || "--"
              )},
              ${escapeHtml(
                d.location?.state || "--"
              )}
            </span>


            <span
              class="text-slate-400 block text-[11px]"
            >
              Coordinates:
              ${Number(
                d.location?.lat || 0
              ).toFixed(4)}°,
              ${Number(
                d.location?.lon || 0
              ).toFixed(4)}°
            </span>

          </div>


          <span
            class="px-2.5 py-1 rounded bg-sky-950 text-sky-300 font-mono text-xs font-bold"
          >
            ${d.current?.temp ?? "--"}°C
            (${escapeHtml(
              d.current?.condition || "--"
            )})
          </span>

        </div>


        <div
          class="grid grid-cols-3 gap-2 text-center"
        >

          <div
            class="p-2 bg-slate-800/60 rounded"
          >

            <span
              class="text-slate-400 block"
            >
              Humidity
            </span>


            <span
              class="font-bold text-white"
            >
              ${d.current?.humidity ?? "--"}%
            </span>

          </div>


          <div
            class="p-2 bg-slate-800/60 rounded"
          >

            <span
              class="text-slate-400 block"
            >
              Wind Velocity
            </span>


            <span
              class="font-bold text-white"
            >
              ${d.current?.windSpeed ?? "--"}
              km/h
              (${escapeHtml(
                d.current?.windCardinal || "--"
              )})
            </span>

          </div>


          <div
            class="p-2 bg-slate-800/60 rounded"
          >

            <span
              class="text-slate-400 block"
            >
              Air Quality
            </span>


            <span
              class="font-bold text-amber-400"
            >
              ${d.aqi?.value ?? "--"}
              (${escapeHtml(
                d.aqi?.category || "--"
              )})
            </span>

          </div>

        </div>


        <div
          class="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-lg"
        >

          <span
            class="font-bold text-emerald-300 block mb-1"
          >
            🌾 Agricultural Advisory
          </span>


          <p>
            ${
              d.agriculture?.isSpraySafe
                ? "✅ Current conditions are suitable for spraying."
                : "⚠️ Current conditions are unfavorable for spraying."
            }
          </p>

        </div>


        <div
          class="p-3 bg-slate-800/50 rounded-lg"
        >

          <span
            class="font-bold text-sky-400 block mb-1"
          >
            ⚠️ Weather Hazard Assessment
          </span>


          <p>
            ${escapeHtml(
              d.imdAlert?.title || "No alert"
            )}
            -
            ${escapeHtml(
              d.imdAlert?.desc || ""
            )}
          </p>

        </div>

      </div>
    `;
}


/* =========================================================
   LOADER
   ========================================================= */

function showLoader(
  show
) {

  const element =
    document.getElementById(
      "loading-spinner"
    );


  if (element) {

    element.classList.toggle(
      "hidden",
      !show
    );
  }
}


/* =========================================================
   NOTIFICATION
   ========================================================= */

function showNotification(
  message,
  type = "info"
) {

  const toast =
    document.createElement(
      "div"
    );


  toast.className =
    `fixed bottom-5 right-5 z-50 ` +
    `px-4 py-2.5 rounded-xl text-xs ` +
    `font-bold shadow-2xl border transition-all ` +
    (
      type === "error"
        ? "bg-rose-950 border-rose-500 text-rose-200"
        : "bg-sky-950 border-sky-500 text-sky-200"
    );


  toast.textContent =
    message;


  document.body.appendChild(
    toast
  );


  setTimeout(
    () => {

      toast.style.opacity =
        "0";


      setTimeout(
        () => {

          toast.remove();

        },
        300
      );

    },
    3000
  );
}


/* =========================================================
   HTML ESCAPE HELPER
   ========================================================= */

function escapeHtml(
  value
) {

  return String(
    value ?? ""
  )

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );
}


/* =========================================================
   OPTIONAL GLOBAL ACCESS
   ========================================================= */

window.appState =
  appState;


window.updateWeatherUI =
  updateWeatherUI;


window.loadWeather =
  loadWeather;


window.syncMapToCurrentLocation =
  syncMapToCurrentLocation;


window.updateMapsForLocation =
  updateMapsForLocation;
