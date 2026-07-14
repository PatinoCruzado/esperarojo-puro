/* =============================================
   EsperaRojo ULima — Home Module (HU-02, HU-07)
   Pantalla principal con resumen
   ============================================= */

const Home = (() => {
  let summaryData = null;

  function render() {
    const user = Auth.getUser();
    const nombre = user ? user.nombre.split(' ')[0] : 'Usuario';

    return `
      <div class="home-screen">
        <div class="home-greeting">
          <h1>Hola, ${nombre} 👋</h1>
          <p>Información del Corredor Rojo</p>
        </div>

        <div id="aforo-widget-container">
          <div class="loading-state">
            <div class="loading-spinner"></div>
            <div class="loading-text">Cargando información...</div>
          </div>
        </div>

        <div id="next-bus-container"></div>

        <h2 class="section-title">📍 Paraderos cercanos</h2>
        <div id="nearby-stops-container">
          <div class="loading-state">
            <div class="loading-spinner"></div>
            <div class="loading-text">Buscando paraderos cercanos...</div>
          </div>
        </div>
      </div>
    `;
  }

  async function init() {
    requestGeolocation();
  }

  function requestGeolocation() {
    if (!navigator.geolocation) {
      loadSummary(null, null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        loadSummary(position.coords.latitude, position.coords.longitude);
      },
      () => {
        // Si no hay permiso, cargamos sin coordenadas
        loadSummary(null, null);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }

  async function loadSummary(lat, lng) {
    try {
      let url = '/api/home/summary';
      if (lat !== null && lng !== null) {
        url += `?lat=${lat}&lng=${lng}`;
      }

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${Auth.getToken()}` }
      });

      if (!response.ok) {
        throw new Error('Error al cargar datos');
      }

      const result = await response.json();
      summaryData = result.data;

      renderAforo();
      renderNextBus();
      renderNearbyStops();
    } catch (error) {
      renderError();
    }
  }

  function renderAforo() {
    const container = document.getElementById('aforo-widget-container');
    if (!container) return;

    if (!summaryData || !summaryData.aforo) {
      container.innerHTML = `
        <div class="aforo-widget">
          <div class="aforo-widget-title">Aforo del Corredor</div>
          <div class="aforo-display">
            <span class="aforo-number">--</span>
            <span class="aforo-percent">%</span>
          </div>
          <div class="aforo-meta">
            <span>Información no disponible temporalmente</span>
          </div>
        </div>
      `;
      return;
    }

    const aforo = summaryData.aforo;
    const porcentaje = aforo.promedio;
    const colorClass = porcentaje <= 50 ? 'badge-green' : porcentaje <= 75 ? 'badge-yellow' : 'badge-red';
    const statusText = porcentaje <= 50 ? 'Disponible' : porcentaje <= 75 ? 'Moderado' : 'Lleno';

    container.innerHTML = `
      <div class="aforo-widget">
        <div class="aforo-widget-title">Aforo del Corredor</div>
        <div class="aforo-display">
          <span class="aforo-number">${porcentaje}</span>
          <span class="aforo-percent">%</span>
        </div>
        <div class="aforo-bar">
          <div class="aforo-bar-fill" style="width: ${porcentaje}%"></div>
        </div>
        <div class="aforo-meta">
          <span>${aforo.buses_activos} buses activos</span>
          <span class="card-badge ${colorClass}">${statusText}</span>
        </div>
      </div>
    `;
  }

  function renderNextBus() {
    const container = document.getElementById('next-bus-container');
    if (!container) return;

    if (!summaryData || !summaryData.proximo_bus) {
      container.innerHTML = '';
      return;
    }

    const bus = summaryData.proximo_bus;
    const aforoText = bus.aforo_porcentaje <= 50 ? 'Disponible' : bus.aforo_porcentaje <= 75 ? 'Moderado' : 'Lleno';
    const badgeClass = bus.aforo_porcentaje <= 50 ? 'badge-green' : bus.aforo_porcentaje <= 75 ? 'badge-yellow' : 'badge-red';

    container.innerHTML = `
      <div class="next-bus-card">
        <div class="section-title">🚌 Próximo bus</div>
        <div class="next-bus-header">
          <div class="next-bus-route">${bus.ruta_numero}</div>
          <div class="next-bus-info">
            <div class="next-bus-label">Ruta ${bus.ruta_numero} · ${bus.ruta_direccion}</div>
            <div class="next-bus-destination">→ ${bus.ruta_destino || 'Destino'}</div>
          </div>
          <span class="card-badge ${badgeClass}">${bus.aforo_porcentaje}%</span>
        </div>
      </div>
    `;
  }

  function renderNearbyStops() {
    const container = document.getElementById('nearby-stops-container');
    if (!container) return;

    if (!summaryData || !summaryData.paraderos_cercanos || summaryData.paraderos_cercanos.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📍</div>
          <div class="empty-state-text">
            ${summaryData && summaryData.mensaje ? summaryData.mensaje : 'Activa tu ubicación para ver paraderos cercanos'}
          </div>
        </div>
      `;
      return;
    }

    const stopsHTML = summaryData.paraderos_cercanos.map(stop => {
      const distancia = stop.distancia_km < 1
        ? `${Math.round(stop.distancia_km * 1000)} m`
        : `${stop.distancia_km.toFixed(1)} km`;

      return `
        <div class="nearby-card">
          <div class="card-icon red">📍</div>
          <div class="nearby-info">
            <div class="nearby-name">${stop.nombre}</div>
            <div class="nearby-address">${stop.direccion_texto || ''}</div>
          </div>
          <div class="nearby-distance">${distancia}</div>
        </div>
      `;
    }).join('');

    container.innerHTML = `<div class="nearby-list">${stopsHTML}</div>`;
  }

  function renderError() {
    const container = document.getElementById('aforo-widget-container');
    if (container) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">⚠️</div>
          <div class="empty-state-text">Información no disponible temporalmente</div>
        </div>
      `;
    }
    const nearby = document.getElementById('nearby-stops-container');
    if (nearby) nearby.innerHTML = '';
  }

  return { render, init };
})();
