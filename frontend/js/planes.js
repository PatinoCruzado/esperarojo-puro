/* =============================================
   EsperaRojo ULima — Planes Module (HU-06)
   Consultar y seleccionar plan de suscripción
   ============================================= */

const Planes = (() => {
  let plans = [];

  function render() {
    return `
      <div class="plans-screen">
        <div class="plans-header">
          <h1>Planes de Suscripción</h1>
          <p>Elige el plan que mejor se adapte a ti</p>
        </div>

        <div id="plans-list">
          <div class="loading-state">
            <div class="loading-spinner"></div>
            <div class="loading-text">Cargando planes...</div>
          </div>
        </div>
      </div>
    `;
  }

  async function init() {
    await loadPlans();
  }

  async function loadPlans() {
    const container = document.getElementById('plans-list');
    if (!container) return;

    try {
      const response = await fetch('/api/plans', {
        headers: { 'Authorization': `Bearer ${Auth.getToken()}` }
      });

      if (!response.ok) throw new Error('Error cargando planes');

      const result = await response.json();
      plans = result.data;

      renderPlans();
    } catch (error) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">⚠️</div>
          <div class="empty-state-text">Error al cargar los planes. Intenta de nuevo.</div>
        </div>
      `;
    }
  }

  function renderPlans() {
    const container = document.getElementById('plans-list');
    if (!container) return;

    container.innerHTML = plans.map((plan, index) => {
      const features = plan.descripcion.split('. ').filter(f => f.trim());
      const isFeatured = index === 1; // Premium es el plan destacado
      const precio = parseFloat(plan.precio);

      return `
        <div class="plan-card ${isFeatured ? 'featured' : ''}">
          <div class="plan-name">${plan.nombre}</div>
          <div class="plan-price">
            <span class="plan-price-currency">S/</span>
            <span class="plan-price-amount">${precio === 0 ? 'Gratis' : precio.toFixed(2)}</span>
            ${precio > 0 ? '<span class="plan-price-period">/mes</span>' : ''}
          </div>
          <ul class="plan-features">
            ${features.map(f => `<li>${f.trim().replace(/\.$/, '')}</li>`).join('')}
          </ul>
          <button class="btn-plan ${isFeatured ? 'btn-plan-primary' : 'btn-plan-secondary'}"
                  data-plan-id="${plan.id}"
                  data-plan-name="${plan.nombre}"
                  data-plan-price="${precio}">
            ${precio === 0 ? 'Plan actual' : 'Seleccionar plan'}
          </button>
        </div>
      `;
    }).join('');

    // Event listeners para seleccionar plan
    container.querySelectorAll('.btn-plan').forEach(btn => {
      btn.addEventListener('click', () => {
        const planId = parseInt(btn.dataset.planId, 10);
        const planName = btn.dataset.planName;
        const planPrice = parseFloat(btn.dataset.planPrice);

        if (planPrice === 0) {
          showToast('Ya cuentas con el plan Básico gratuito');
          return;
        }

        showConfirmModal(planId, planName, planPrice);
      });
    });
  }

  function showConfirmModal(planId, planName, planPrice) {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    const features = plan.descripcion.split('. ').filter(f => f.trim());

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-content">
        <div class="modal-handle"></div>
        <div class="modal-title">Confirmar suscripción</div>
        <div class="modal-subtitle">Estás a punto de suscribirte al plan ${planName}</div>

        <div style="background: var(--slate-50); border-radius: var(--radius-md); padding: 16px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <span style="font-weight: 600; color: var(--slate-800);">Plan ${planName}</span>
            <span style="font-weight: 800; color: var(--red-500); font-size: 1.25rem;">S/ ${planPrice.toFixed(2)}/mes</span>
          </div>
          <ul class="plan-features">
            ${features.map(f => `<li>${f.trim().replace(/\.$/, '')}</li>`).join('')}
          </ul>
        </div>

        <p style="font-size: 0.75rem; color: var(--slate-500); text-align: center;">
          Duración: ${plan.duracion_dias} días. Puedes cancelar en cualquier momento.
        </p>

        <div class="modal-actions">
          <button class="btn-secondary" id="modal-cancel">Cancelar</button>
          <button class="btn-primary" id="modal-confirm">Confirmar</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Cerrar modal
    document.getElementById('modal-cancel').addEventListener('click', () => {
      overlay.remove();
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });

    // Confirmar suscripción
    document.getElementById('modal-confirm').addEventListener('click', async () => {
      const confirmBtn = document.getElementById('modal-confirm');
      confirmBtn.disabled = true;
      confirmBtn.textContent = 'Procesando...';

      try {
        const response = await fetch('/api/subscriptions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Auth.getToken()}`
          },
          body: JSON.stringify({ plan_id: planId })
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message);
        }

        overlay.remove();
        showToast(`✅ Suscripción al plan ${planName} registrada exitosamente`);
      } catch (error) {
        confirmBtn.disabled = false;
        confirmBtn.textContent = 'Confirmar';
        showToast(`❌ Error: ${error.message}`);
      }
    });
  }

  function showToast(message) {
    // Eliminar toasts anteriores
    document.querySelectorAll('.toast').forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
  }

  return { render, init };
})();
