/* =============================================
   EsperaRojo ULima — Mapa Module (HU-03, HU-05)
   Mapa interactivo con Leaflet
   ============================================= */

const Mapa = (() => {
  let map = null;
  let userMarker = null;
  let stopMarkers = [];
  let routePolyline = null;
  let selectedRouteId = null;
  let routesList = [];

  function render() {
    return `
      <div class="map-container">
        <div class="map-overlay">
          <div class="map-route-selector">
            <label for="map-route-select">Ruta:</label>
            <select id="map-route-select">
              <option value="">Cargando rutas...</option>
            </select>
          </div>
        </div>
        <div id="map"></div>
        <div id="map-error-msg" class="map-error" style="display:none;"></div>
      </div>
    `;
  }

  async function init() {
    // Esperar un tick para que el DOM se renderice
    await new Promise(resolve => setTimeout(resolve, 50));

    initMap();
    await loadRoutes();
    requestUserLocation();
  }

  function initMap() {
    if (map) {
      map.remove();
      map = null;
    }

    // Centro de Lima
    map = L.map('map', {
      zoomControl: false,
      attributionControl: true
    }).setView([-12.0464, -77.0428], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);
  }

  function requestUserLocation() {
    if (!navigator.geolocation) {
      showMapError('Tu navegador no soporta geolocalización');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        showUserPosition(latitude, longitude);
      },
      (error) => {
        let message = '';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Permiso de ubicación denegado. Activa la ubicación en la configuración de tu navegador para ver tu posición en el mapa.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'No se pudo obtener tu ubicación. Verifica tu GPS.';
            break;
          case error.TIMEOUT:
            message = 'Tiempo de espera agotado al obtener ubicación.';
            break;
          default:
            message = 'Error desconocido al obtener ubicación.';
        }
        showMapError(message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }

  function showUserPosition(lat, lng) {
    if (userMarker) {
      map.removeLayer(userMarker);
    }

    const userIcon = L.divIcon({
      className: 'user-marker',
      html: `<div style="
        width: 16px; height: 16px;
        background: #3B82F6;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(59,130,246,0.5), 0 0 0 6px rgba(59,130,246,0.15);
      "></div>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });

    userMarker = L.marker([lat, lng], { icon: userIcon })
      .addTo(map)
      .bindPopup('<div class="popup-title">📍 Tu ubicación</div>');

    // Seguimiento en tiempo real
    navigator.geolocation.watchPosition(
      (pos) => {
        userMarker.setLatLng([pos.coords.latitude, pos.coords.longitude]);
      },
      null,
      { enableHighAccuracy: true, maximumAge: 30000 }
    );
  }

  async function loadRoutes() {
    try {
      const response = await fetch('/api/routes', {
        headers: { 'Authorization': `Bearer ${Auth.getToken()}` }
      });

      if (!response.ok) throw new Error('Error cargando rutas');

      const result = await response.json();
      routesList = result.data;

      const select = document.getElementById('map-route-select');
      if (!select) return;

      select.innerHTML = '<option value="">Selecciona una ruta</option>';
      routesList.forEach(route => {
        const option = document.createElement('option');
        option.value = route.id;
        option.textContent = `Ruta ${route.numero} (${route.direccion}) — ${route.paradero_inicial} → ${route.paradero_final}`;
        select.appendChild(option);
      });

      select.addEventListener('change', (e) => {
        const routeId = parseInt(e.target.value, 10);
        if (routeId) {
          loadRouteStops(routeId);
        } else {
          clearRouteDisplay();
        }
      });

      // Si hay una ruta preseleccionada (navegación desde rutas)
      if (selectedRouteId) {
        select.value = selectedRouteId;
        loadRouteStops(selectedRouteId);
      }
    } catch (error) {
      console.error('Error cargando rutas:', error);
    }
  }

  async function loadRouteStops(routeId) {
    clearRouteDisplay();

    try {
      const response = await fetch(`/api/routes/${routeId}/stops`, {
        headers: { 'Authorization': `Bearer ${Auth.getToken()}` }
      });

      if (!response.ok) throw new Error('Error cargando paraderos');

      const result = await response.json();
      const stops = result.data.stops;

      if (!stops || stops.length === 0) {
        showMapError('Sin información de paraderos disponible para esta ruta');
        return;
      }

      // Marker icon rojo para paraderos
      const stopIcon = L.divIcon({
        className: 'stop-marker',
        html: `<div style="
          width: 12px; height: 12px;
          background: #DC2626;
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(220,38,38,0.4);
        "></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      const latlngs = [];

      stops.forEach(stop => {
        const lat = parseFloat(stop.latitud);
        const lng = parseFloat(stop.longitud);
        latlngs.push([lat, lng]);

        const marker = L.marker([lat, lng], { icon: stopIcon })
          .addTo(map)
          .bindPopup(`
            <div class="popup-title">${stop.nombre}</div>
            <div class="popup-address">${stop.direccion_texto || ''}</div>
            <div class="popup-order">Parada #${stop.orden}</div>
          `);

        stopMarkers.push(marker);
      });

      // Dibujar polyline de la ruta
      if (latlngs.length > 1) {
        routePolyline = L.polyline(latlngs, {
          color: '#DC2626',
          weight: 4,
          opacity: 0.7,
          smoothFactor: 1
        }).addTo(map);

        // Ajustar vista al bounds de la ruta
        map.fitBounds(routePolyline.getBounds(), { padding: [40, 40] });
      }

      hideMapError();
    } catch (error) {
      showMapError('Error al cargar los paraderos de esta ruta');
    }
  }

  function clearRouteDisplay() {
    stopMarkers.forEach(m => map.removeLayer(m));
    stopMarkers = [];

    if (routePolyline) {
      map.removeLayer(routePolyline);
      routePolyline = null;
    }

    hideMapError();
  }

  function showMapError(msg) {
    const el = document.getElementById('map-error-msg');
    if (el) {
      el.textContent = msg;
      el.style.display = 'block';
    }
  }

  function hideMapError() {
    const el = document.getElementById('map-error-msg');
    if (el) el.style.display = 'none';
  }

  function setSelectedRoute(routeId) {
    selectedRouteId = routeId;
  }

  function destroy() {
    if (map) {
      map.remove();
      map = null;
    }
    stopMarkers = [];
    routePolyline = null;
    userMarker = null;
  }

  return { render, init, setSelectedRoute, destroy };
})();
