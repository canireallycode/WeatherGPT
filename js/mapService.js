/* =========================================================
   WeatherGPT - Map Service
   OpenStreetMap + Leaflet
   ========================================================= */

(function () {
  "use strict";

  let map = null;
  let fullMap = null;

  let marker = null;
  let fullMarker = null;

  let accuracyCircle = null;
  let fullAccuracyCircle = null;

  let radarLayer = null;

  const DEFAULT_LOCATION = {
    name: "New Delhi",
    state: "Delhi",
    lat: 28.6139,
    lon: 77.2090
  };

  /*
   * Official OpenStreetMap tile server.
   * Visible attribution is required.
   */
  const OSM_TILE_URL =
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

  const OSM_ATTRIBUTION =
    '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>';

  /* =========================================================
     CREATE BASE MAP
     ========================================================= */

  function createMap(containerId, lat, lon, zoom) {

    const container = document.getElementById(containerId);

    if (!container) {
      console.warn(`Map container #${containerId} not found.`);
      return null;
    }

    // Prevent Leaflet from initializing twice on the same element
    if (container._leaflet_id) {
      return null;
    }

    const newMap = L.map(containerId, {
      center: [lat, lon],
      zoom: zoom,
      zoomControl: true,
      attributionControl: true
    });

    /*
     * Real OpenStreetMap tiles
     */
    L.tileLayer(OSM_TILE_URL, {
      maxZoom: 19,
      attribution: OSM_ATTRIBUTION
    }).addTo(newMap);

    return newMap;
  }

  /* =========================================================
     CREATE WEATHER MARKER
     ========================================================= */

  function createWeatherMarker(targetMap, lat, lon, name, temperature) {

    if (!targetMap) return null;

    const weatherIcon = L.divIcon({
      className: "weather-map-marker",

      html: `
        <div style="
          width:42px;
          height:42px;
          border-radius:50%;
          background:linear-gradient(135deg,#38bdf8,#2563eb);
          border:3px solid white;
          box-shadow:
            0 0 0 5px rgba(56,189,248,0.18),
            0 0 25px rgba(56,189,248,0.65);
          display:flex;
          align-items:center;
          justify-content:center;
          font-size:20px;
        ">
          🌤️
        </div>
      `,

      iconSize: [42, 42],
      iconAnchor: [21, 21],
      popupAnchor: [0, -22]
    });

    const newMarker = L.marker(
      [lat, lon],
      { icon: weatherIcon }
    ).addTo(targetMap);

    newMarker.bindPopup(`
      <div style="
        min-width:180px;
        font-family:Arial,sans-serif;
      ">
        <h3 style="
          margin:0 0 6px;
          font-size:18px;
          font-weight:700;
          color:#0f172a;
        ">
          ${escapeHTML(name)}
        </h3>

        <div style="
          font-size:14px;
          color:#475569;
          margin-bottom:6px;
        ">
          ${temperature !== undefined ? `${temperature}°C` : "Weather Station"}
        </div>

        <div style="
          font-size:13px;
          color:#0284c7;
          font-weight:600;
        ">
          📍 Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}
        </div>
      </div>
    `);

    return newMarker;
  }

  /* =========================================================
     LOAD MAIN MAP
     ========================================================= */

  function initializeMainMap() {

    if (map) {
      return;
    }

    map = createMap(
      "weather-map",
      DEFAULT_LOCATION.lat,
      DEFAULT_LOCATION.lon,
      9
    );

    if (!map) return;

    marker = createWeatherMarker(
      map,
      DEFAULT_LOCATION.lat,
      DEFAULT_LOCATION.lon,
      DEFAULT_LOCATION.name,
      33
    );

    /*
     * District inspection.
     * Click anywhere on the map to show coordinates.
     */
    map.on("click", function (event) {

      const lat = event.latlng.lat;
      const lon = event.latlng.lng;

      L.popup()
        .setLatLng(event.latlng)
        .setContent(`
          <div style="
            font-family:Arial,sans-serif;
            min-width:170px;
          ">
            <strong>Selected Location</strong>
            <br><br>
            📍 Latitude: ${lat.toFixed(4)}
            <br>
            📍 Longitude: ${lon.toFixed(4)}
          </div>
        `)
        .openOn(map);
    });
  }

  /* =========================================================
     LOAD FULL RADAR MAP
     ========================================================= */

  function initializeFullMap() {

    if (fullMap) {
      return;
    }

    fullMap = createMap(
      "weather-map-full",
      DEFAULT_LOCATION.lat,
      DEFAULT_LOCATION.lon,
      8
    );

    if (!fullMap) return;

    fullMarker = createWeatherMarker(
      fullMap,
      DEFAULT_LOCATION.lat,
      DEFAULT_LOCATION.lon,
      DEFAULT_LOCATION.name,
      33
    );
  }

  /* =========================================================
     UPDATE LOCATION
     ========================================================= */

  function updateLocation(
    name,
    state,
    lat,
    lon,
    temperature
  ) {

    if (!lat || !lon) return;

    const location = {
      name: name || "Selected Location",
      state: state || "",
      lat: Number(lat),
      lon: Number(lon)
    };

    /*
     * MAIN MAP
     */

    if (map) {

      map.setView(
        [location.lat, location.lon],
        10,
        {
          animate: true
        }
      );

      if (marker) {
        map.removeLayer(marker);
      }

      marker = createWeatherMarker(
        map,
        location.lat,
        location.lon,
        location.name,
        temperature
      );
    }

    /*
     * FULL MAP
     */

    if (fullMap) {

      fullMap.setView(
        [location.lat, location.lon],
        10,
        {
          animate: true
        }
      );

      if (fullMarker) {
        fullMap.removeLayer(fullMarker);
      }

      fullMarker = createWeatherMarker(
        fullMap,
        location.lat,
        location.lon,
        location.name,
        temperature
      );
    }

    /*
     * Update coordinate badge in HTML
     */

    const coordinateBadge =
      document.getElementById("map-coord-badge");

    if (coordinateBadge) {

      coordinateBadge.textContent =
        `${location.lat.toFixed(2)}° N, ` +
        `${location.lon.toFixed(2)}° E`;
    }
  }

  /* =========================================================
     GPS LOCATION
     ========================================================= */

  function locateUser() {

    if (!navigator.geolocation) {

      alert(
        "Geolocation is not supported by this browser."
      );

      return;
    }

    navigator.geolocation.getCurrentPosition(

      function (position) {

        const lat =
          position.coords.latitude;

        const lon =
          position.coords.longitude;

        updateLocation(
          "Your Location",
          "",
          lat,
          lon
        );

        /*
         * Accuracy circle
         */

        if (map) {

          if (accuracyCircle) {
            map.removeLayer(accuracyCircle);
          }

          accuracyCircle =
            L.circle(
              [lat, lon],
              {
                radius:
                  position.coords.accuracy || 100,
                color: "#38bdf8",
                fillColor: "#38bdf8",
                fillOpacity: 0.12,
                weight: 2
              }
            ).addTo(map);
        }

        if (fullMap) {

          if (fullAccuracyCircle) {
            fullMap.removeLayer(
              fullAccuracyCircle
            );
          }

          fullAccuracyCircle =
            L.circle(
              [lat, lon],
              {
                radius:
                  position.coords.accuracy || 100,
                color: "#38bdf8",
                fillColor: "#38bdf8",
                fillOpacity: 0.12,
                weight: 2
              }
            ).addTo(fullMap);
        }

      },

      function (error) {

        console.error(
          "GPS error:",
          error
        );

        alert(
          "Unable to access your location. " +
          "Please allow location permission."
        );
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  }

  /* =========================================================
     RADAR LAYER
     ========================================================= */

  function loadRadarLayer() {

    /*
     * This is optional.
     *
     * The normal OpenStreetMap layer above
     * remains the actual geographic map.
     */

    const targetMap = fullMap || map;

    if (!targetMap) {
      console.warn(
        "Map is not initialized yet."
      );
      return;
    }

    /*
     * Remove previous radar layer
     */

    if (radarLayer) {

      targetMap.removeLayer(
        radarLayer
      );

      radarLayer = null;
    }

    /*
     * RainViewer radar API
     */

    fetch(
      "https://api.rainviewer.com/public/weather-maps.json"
    )

      .then(response => {

        if (!response.ok) {
          throw new Error(
            "Radar request failed"
          );
        }

        return response.json();
      })

      .then(data => {

        if (
          !data ||
          !data.radar ||
          !data.radar.past ||
          data.radar.past.length === 0
        ) {

          console.warn(
            "No radar frames available."
          );

          return;
        }

        /*
         * Get latest available radar frame
         */

        const latest =
          data.radar.past[
            data.radar.past.length - 1
          ];

        const timestamp =
          latest.time;

        /*
         * RainViewer radar tile
         */

        const radarURL =
          `https://tilecache.rainviewer.com` +
          `/${timestamp}/256/{z}/{x}/{y}/2/1_1.png`;

        radarLayer =
          L.tileLayer(
            radarURL,
            {
              opacity: 0.55,
              maxZoom: 19,
              attribution:
                'Radar © <a href="https://www.rainviewer.com/" target="_blank" rel="noopener noreferrer">RainViewer</a>'
            }
          );

        radarLayer.addTo(
          targetMap
        );

      })

      .catch(error => {

        console.error(
          "Radar error:",
          error
        );

        alert(
          "Radar data is temporarily unavailable."
        );
      });
  }

  /* =========================================================
     REMOVE RADAR
     ========================================================= */

  function removeRadarLayer() {

    const targetMap =
      fullMap || map;

    if (
      targetMap &&
      radarLayer
    ) {

      targetMap.removeLayer(
        radarLayer
      );

      radarLayer = null;
    }
  }

  /* =========================================================
     HTML ESCAPE
     ========================================================= */

  function escapeHTML(value) {

    return String(value)
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
     PUBLIC API
     ========================================================= */

  window.mapService = {

    initialize: initializeMainMap,

    initializeFullMap:
      initializeFullMap,

    updateLocation:
      updateLocation,

    locateUser:
      locateUser,

    loadRadarLayer:
      loadRadarLayer,

    removeRadarLayer:
      removeRadarLayer
  };

  /* =========================================================
     START MAPS AFTER PAGE LOAD
     ========================================================= */

  document.addEventListener(
    "DOMContentLoaded",
    function () {

      initializeMainMap();

      /*
       * Full radar map is created only when
       * its container exists.
       */

      if (
        document.getElementById(
          "weather-map-full"
        )
      ) {

        initializeFullMap();
      }

    }
  );

})();
