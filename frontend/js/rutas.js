/* =============================================
   EsperaRojo ULima — Rutas Module (HU-04)
   Consultar rutas disponibles
   ============================================= */

const Rutas = (() => {
  let allRoutes = [];
  let currentFilter = 'todas';

  function render() {
    return `
      <div class="routes-screen">
        <div class="routes-header">
          <h1>Rutas del Corredor Rojo</h1>
          <p>Selecciona una ruta para ver su recorrido</p>
        </div>

        <div class="filter-tabs" id="filter-tabs">
          <button class="filter-tab active" data-filter="todas">Todas</button>
          <button class="filter-tab" data-filter="norte">Norte</button>
          <button class="filter-tab" data-filter="sur">Sur</button>
          <button class="filter-tab" data-filter="este">Este</button>
        </div>

        <div id="routes-list">
          <div class="loading-state">
            <div class="loading-spinner"></div>
            <div class="loading-text">Cargando rutas...</div>
          </div>
        </div>
      </div>
    `;
  }

  async function init() {
    setupFilters();
    await loadRoutes('todas');
  }

  function setupFilters() {
    const tabs = document.getElementById('filter-tabs');
    if (!tabs) return;

    tabs.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-tab');
      if (!btn) return;

      const filter = btn.dataset.filter;
      currentFilter = filter;

      // Actualizar tabs activos
      tabs.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');

      loadRoutes(filter);
    });
  }

  async function loadRoutes(filter) {
    const container = document.getElementById('routes-list');
    if (!container) return;

    container.innerHTML = `
      <div class="loading-state">
        <div class="loading-spinner"></div>
        <div class="loading-text">Cargando rutas...</div>
      </div>
    `;

    try {
      const response = await fetch(`/api/routes?direccion=${filter}`, {
        headers: { 'Authorization': `Bearer ${Auth.getToken()}` }
      });

      if (!response.ok) throw new Error('Error cargando rutas');

      const result = await response.json();
      allRoutes = result.data;

      renderRoutes(allRoutes);
    } catch (error) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">⚠️</div>
          <div class="empty-state-text">Error al cargar las rutas. Intenta de nuevo.</div>
        </div>
      `;
    }
  }

  function renderRoutes(routes) {
    const container = document.getElementById('routes-list');
    if (!container) return;

    if (routes.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <div class="empty-state-text">No se encontraron rutas para esta zona</div>
        </div>
      `;
      return;
    }

    container.innerHTML = routes.map(route => `
      <div class="route-card" data-route-id="${route.id}">
        <div class="route-card-header">
          <div class="route-number">${route.numero}</div>
          <div class="route-info">
            <div class="route-name">${route.paradero_inicial} → ${route.paradero_final}</div>
            <div class="route-direction-label">
              <span>${route.direccion === 'ida' ? '➡️' : '⬅️'}</span>
              <span>${route.direccion.charAt(0).toUpperCase() + route.direccion.slice(1)}</span>
            </div>
          </div>
        </div>
        <div class="route-card-details">
          <div class="route-detail">
            <span class="route-detail-icon">📍</span>
            <div>
              <div class="route-detail-text">Paraderos</div>
              <div class="route-detail-value">${route.cantidad_paraderos}</div>
            </div>
          </div>
          <div class="route-detail">
            <span class="route-detail-icon">⏱️</span>
            <div>
              <div class="route-detail-text">Tiempo est.</div>
              <div class="route-detail-value">${route.tiempo_estimado_min ? route.tiempo_estimado_min + ' min' : 'N/D'}</div>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    // Click en ruta → ir al mapa con esa ruta
    container.querySelectorAll('.route-card').forEach(card => {
      card.addEventListener('click', () => {
        const routeId = parseInt(card.dataset.routeId, 10);
        Mapa.setSelectedRoute(routeId);
        window.location.hash = '#mapa';
      });
    });
  }

  return { render, init };
})();
