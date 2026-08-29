/**
 * WeatherGPT - Interactive District & Radar Map Service
 * Smooth pan/zoom to selected areas, live radar overlays, and interactive click-to-weather
 */

class MapService {
  constructor() {
    this.map = null;
    this.radarLayer = null;
    this.marker = null;
    this.radiusCircle = null;
    this.currentLat = 28.6139;
    this.currentLon = 77.2090;
    this.currentName = "New Delhi";
  }

  /**
   * Initialize Leaflet map instance on container
   */
  initMap(containerId = "weather-map", lat = 28.6139, lon = 77.2090, cityName = "New Delhi", weatherData = null) {
    if (typeof L === "undefined") {
      console.warn("Leaflet library not loaded yet.");
      return;
    }

    const container = document.getElementById(containerId);
    if (!container) return;

    this.currentLat = lat;
    this.currentLon = lon;
    this.currentName = cityName;

    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    // Initialize Map with dark theme tiles
    this.map = L.map(containerId, {
      center: [lat, lon],
      zoom: 9,
      zoomControl: true,
      attributionControl: false
    });

    // Add High-Contrast Dark Matter Tile Layer (CartoDB Dark Matter)
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      subdomains: "abcd"
    }).addTo(this.map);

    // Add Location Marker & District Radius Circle
    this.addLocationMarker(lat, lon, cityName, weatherData);

    // Load Live Rain Radar Layer
    this.loadRadarLayer();

    // Add Click listener: Click anywhere on map to fetch weather for that location!
    this.map.on("click", async (e) => {
      const clickedLat = e.latlng.lat;
      const clickedLon = e.latlng.lng;
      if (typeof window.loadWeatherByCoords === "function") {
        await window.loadWeatherByCoords(clickedLat, clickedLon);
      }
    });
  }

  /**
   * Add custom animated marker & district radius
   */
  addLocationMarker(lat, lon, cityName, weatherData) {
    if (!this.map) return;

    if (this.marker) this.map.removeLayer(this.marker);
    if (this.radiusCircle) this.map.removeLayer(this.radiusCircle);

    // Glowing District Radius Circle
    this.radiusCircle = L.circle([lat, lon], {
      color: '#38bdf8',
      fillColor: '#0284c7',
      fillOpacity: 0.12,
      weight: 1.5,
      radius: 12000 // 12km district radius
    }).addTo(this.map);

    // Custom Styled Pulsing Pin
    const tempStr = weatherData ? `${weatherData.current.temp}°C` : "";
    const iconStr = weatherData ? weatherData.current.icon : "📍";
    
    const customIcon = L.divIcon({
      className: "custom-map-pin",
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 rounded-full bg-sky-500/30 animate-ping"></div>
          <div class="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 border-2 border-white shadow-[0_0_15px_#38bdf8] flex items-center justify-center text-xs">
            ${iconStr}
          </div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const popupContent = `
      <div class="p-2 text-slate-900 font-sans min-w-[150px]">
        <div class="font-bold text-sm text-slate-900">${cityName}</div>
        <div class="text-xs text-slate-600 mt-0.5">${tempStr} • Selected District</div>
        <div class="text-[10px] text-sky-700 font-semibold mt-1">📍 Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}</div>
      </div>
    `;

    this.marker = L.marker([lat, lon], { icon: customIcon }).addTo(this.map)
      .bindPopup(popupContent)
      .openPopup();
  }

  /**
   * Fetch RainViewer real-time weather radar frames
   */
  async loadRadarLayer() {
    if (!this.map) return;
    try {
      const res = await fetch("https://api.rainviewer.com/public/weather-maps.json");
      if (res.ok) {
        const data = await res.json();
        if (data.radar && data.radar.past && data.radar.past.length > 0) {
          const latestFrame = data.radar.past[data.radar.past.length - 1];
          const radarUrl = `https://tilecache.rainviewer.com/v2/radar/${latestFrame.time}/256/{z}/{x}/{y}/2/1_1.png`;

          if (this.radarLayer) {
            this.map.removeLayer(this.radarLayer);
          }

          this.radarLayer = L.tileLayer(radarUrl, {
            opacity: 0.7,
            zIndex: 10
          }).addTo(this.map);
        }
      }
    } catch (err) {
      console.warn("RainViewer radar tile load skipped:", err);
    }
  }

  /**
   * Smooth fly-to animation when location is updated
   */
  updateLocation(lat, lon, cityName, weatherData = null) {
    this.currentLat = lat;
    this.currentLon = lon;
    this.currentName = cityName;

    if (!this.map) {
      this.initMap("weather-map", lat, lon, cityName, weatherData);
      return;
    }

    this.map.flyTo([lat, lon], 9, {
      animate: true,
      duration: 1.2
    });

    this.addLocationMarker(lat, lon, cityName, weatherData);
  }
}

window.mapService = new MapService();
