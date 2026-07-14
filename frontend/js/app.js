/* =============================================
   EsperaRojo ULima — App Router
   SPA Navigation + Auth Guard
   ============================================= */

const App = (() => {
  const screens = {
    login: { module: Auth, requiresAuth: false },
    home: { module: Home, requiresAuth: true },
    mapa: { module: Mapa, requiresAuth: true },
    rutas: { module: Rutas, requiresAuth: true },
    planes: { module: Planes, requiresAuth: true }
  };

  let currentScreen = null;

  function start() {
    // Ocultar splash después de la animación
    setTimeout(() => {
      const splash = document.getElementById('splash-screen');
      if (splash) {
        splash.classList.add('hidden');
      }
      document.getElementById('app').style.display = '';
    }, 2200);

    // Escuchar cambios de hash
    window.addEventListener('hashchange', navigate);

    // Logout
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        Auth.logout();
      });
    }

    // Navegación inicial
    navigate();
  }

  function navigate() {
    const hash = window.location.hash.replace('#', '') || 'login';
    const screen = screens[hash];

    if (!screen) {
      window.location.hash = '#login';
      return;
    }

    // Auth guard
    if (screen.requiresAuth && !Auth.isAuthenticated()) {
      window.location.hash = '#login';
      return;
    }

    // Si ya está autenticado y va a login, redirigir a home
    if (hash === 'login' && Auth.isAuthenticated()) {
      window.location.hash = '#home';
      return;
    }

    // Destruir mapa si estamos saliendo de esa pantalla
    if (currentScreen === 'mapa' && hash !== 'mapa') {
      Mapa.destroy();
    }

    currentScreen = hash;

    // Renderizar pantalla
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = screen.module.render();

    // Re-trigger fade animation
    mainContent.style.animation = 'none';
    mainContent.offsetHeight; // reflow
    mainContent.style.animation = '';

    // Inicializar módulo
    if (screen.module.init) {
      screen.module.init();
    }

    // Actualizar UI (nav, header)
    updateNav(hash);
    updateHeader(hash);
  }

  function updateNav(hash) {
    const nav = document.getElementById('bottom-nav');
    const logoutBtn = document.getElementById('btn-logout');

    if (hash === 'login') {
      nav.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = 'none';
    } else {
      nav.style.display = '';
      if (logoutBtn) logoutBtn.style.display = '';

      // Marcar tab activo
      nav.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.screen === hash);
      });
    }
  }

  function updateHeader(hash) {
    const header = document.getElementById('app-header');
    if (hash === 'login') {
      header.style.display = 'none';
    } else {
      header.style.display = '';
    }
  }

  // Bind navegación del bottom nav
  document.addEventListener('DOMContentLoaded', () => {
    const nav = document.getElementById('bottom-nav');
    if (nav) {
      nav.addEventListener('click', (e) => {
        const item = e.target.closest('.nav-item');
        if (item) {
          window.location.hash = `#${item.dataset.screen}`;
        }
      });
    }
  });

  return { start };
})();

// Iniciar la app cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  App.start();
});
