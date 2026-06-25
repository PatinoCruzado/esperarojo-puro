import React, { useState } from 'react';
import './Login.css';

export default function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.endsWith('@ulima.edu.pe') && !email.endsWith('@aloe.ulima.edu.pe')) {
      setError('Solo se permiten correos de la Universidad de Lima.');
      return;
    }

    if (!isRegister) {
      const res = onLogin(email, password);
      if (!res.success) setError(res.error);
    } else {
      const registrados = JSON.parse(localStorage.getItem('usuarios_registrados') || '[]');
      if (registrados.some(u => u.email === email)) {
        setError('El usuario ya existe.');
        return;
      }
      registrados.push({ email, password });
      localStorage.setItem('usuarios_registrados', JSON.stringify(registrados));
      setSuccess('¡Cuenta creada! Ya puedes iniciar sesión.');
      setIsRegister(false);
      setPassword('');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>🏛️ EsperaRojo Ulima</h2>
        <p className="subtitle">MoveSync Enterprise</p>

        {error && <div className="alert error">❌ {error}</div>}
        {success && <div className="alert success">✅ {success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Correo Institucional</label>
            <input type="email" required placeholder="alumno@ulima.edu.pe" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input type="password" required placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary">
            {isRegister ? 'Registrarse 📝' : 'Ingresar 🚀'}
          </button>
        </form>
        <button className="btn-toggle" onClick={() => { setIsRegister(!isRegister); setError(''); setSuccess(''); }}>
          {isRegister ? '¿Ya tienes cuenta? Inicia Sesión' : '¿Eres nuevo? Crea una cuenta'}
        </button>
      </div>
    </div>
  );
}