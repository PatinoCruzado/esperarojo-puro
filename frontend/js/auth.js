/* =============================================
   EsperaRojo ULima — Auth Module (HU-01)
   Login + Registro
   ============================================= */

const Auth = (() => {
  const API_BASE = '/api/auth';
  let isRegistering = false;

  function render() {
    const registerFields = isRegistering ? `
      <div class="form-group">
        <label for="auth-name">Nombre completo</label>
        <input type="text" id="auth-name" class="form-input" placeholder="Tu nombre" autocomplete="name">
      </div>
    ` : '';

    const registerConfirm = isRegistering ? `
      <div class="form-group">
        <label for="auth-password-confirm">Confirmar contraseña</label>
        <input type="password" id="auth-password-confirm" class="form-input" placeholder="Repite tu contraseña">
      </div>
    ` : '';

    return `
      <div class="login-screen">
        <div class="login-card">
          <div class="login-header">
            <div class="login-logo">🚍</div>
            <h2>${isRegistering ? 'Crear cuenta' : 'Bienvenido'}</h2>
            <p>${isRegistering ? 'Regístrate para comenzar' : 'Inicia sesión en EsperaRojo'}</p>
          </div>

          <div id="auth-alert" class="alert"></div>

          <form id="auth-form">
            ${registerFields}
            <div class="form-group">
              <label for="auth-email">Correo electrónico</label>
              <input type="email" id="auth-email" class="form-input" placeholder="usuario@ulima.edu.pe" autocomplete="email" required>
            </div>
            <div class="form-group">
              <label for="auth-password">Contraseña</label>
              <input type="password" id="auth-password" class="form-input" placeholder="Tu contraseña" autocomplete="current-password" required>
            </div>
            ${registerConfirm}
            <button type="submit" id="auth-submit" class="btn-primary">
              ${isRegistering ? 'Registrarse' : 'Iniciar sesión'}
            </button>
          </form>

          <div class="login-toggle">
            ${isRegistering
              ? '¿Ya tienes cuenta? <a id="toggle-auth">Inicia sesión</a>'
              : '¿No tienes cuenta? <a id="toggle-auth">Regístrate</a>'}
          </div>
        </div>
      </div>
    `;
  }

  function init() {
    const form = document.getElementById('auth-form');
    const toggleBtn = document.getElementById('toggle-auth');

    if (form) {
      form.addEventListener('submit', handleSubmit);
    }

    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        isRegistering = !isRegistering;
        document.getElementById('main-content').innerHTML = render();
        init();
      });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const alert = document.getElementById('auth-alert');
    const submitBtn = document.getElementById('auth-submit');

    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;

    if (!email || !password) {
      showAlert(alert, 'Completa todos los campos', 'error');
      return;
    }

    if (isRegistering) {
      const nombre = document.getElementById('auth-name').value.trim();
      const passwordConfirm = document.getElementById('auth-password-confirm').value;

      if (!nombre) {
        showAlert(alert, 'Ingresa tu nombre', 'error');
        return;
      }

      if (password !== passwordConfirm) {
        showAlert(alert, 'Las contraseñas no coinciden', 'error');
        return;
      }

      if (password.length < 6) {
        showAlert(alert, 'La contraseña debe tener al menos 6 caracteres', 'error');
        return;
      }
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Cargando...';

    try {
      const endpoint = isRegistering ? `${API_BASE}/register` : `${API_BASE}/login`;
      const body = isRegistering
        ? { nombre: document.getElementById('auth-name').value.trim(), email, password }
        : { email, password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        showAlert(alert, data.message, 'error');
        return;
      }

      // Guardar token y datos del usuario
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      // Navegar al home
      window.location.hash = '#home';
    } catch (error) {
      showAlert(alert, 'Error de conexión. Intenta de nuevo.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = isRegistering ? 'Registrarse' : 'Iniciar sesión';
    }
  }

  function showAlert(el, message, type) {
    el.textContent = message;
    el.className = `alert alert-${type} show`;
  }

  function getToken() {
    return localStorage.getItem('token');
  }

  function getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.hash = '#login';
  }

  function isAuthenticated() {
    return !!getToken();
  }

  return { render, init, getToken, getUser, logout, isAuthenticated };
})();
