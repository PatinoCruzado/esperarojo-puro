import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

const INITIAL_BUSES = [
  { id: 'B-991', ruta: '201', tiempoEstimado: 3, aforo: 45 },
  { id: 'B-992', ruta: '204', tiempoEstimado: 7, aforo: 85 },
  { id: 'B-993', ruta: '206', tiempoEstimado: 12, aforo: 20 },
  { id: 'B-994', ruta: '209', tiempoEstimado: 5, aforo: 95 }
];

export default function App() {
  // Inicialización segura del usuario
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sessionUser');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      localStorage.removeItem('sessionUser'); // Limpia si está corrupto
      return null;
    }
  });

  // Inicialización segura de los buses
  const [buses, setBuses] = useState(() => {
    try {
      const saved = localStorage.getItem('er_buses');
      return saved ? JSON.parse(saved) : INITIAL_BUSES;
    } catch (error) {
      localStorage.removeItem('er_buses'); // Limpia si está corrupto
      return INITIAL_BUSES;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('er_buses', JSON.stringify(buses));
    } catch (error) {
      console.error("Error guardando en localStorage", error);
    }
  }, [buses]);

  const handleLogin = (email, password) => {
    const isStudent = email === '20232182@aloe.ulima.edu.pe' && password === 'ulima2026';
    const isAdmin = email === 'admin@ulima.edu.pe' && password === 'admin2026';

    if (isStudent || isAdmin) {
      const userData = { email, isAdmin };
      setUser(userData);
      localStorage.setItem('sessionUser', JSON.stringify(userData));
      return { success: true };
    }

    try {
      const registrados = JSON.parse(localStorage.getItem('usuarios_registrados') || '[]');
      const encontrado = registrados.find(u => u.email === email && u.password === password);
      
      if (encontrado) {
        const userData = { email: encontrado.email, isAdmin: false };
        setUser(userData);
        localStorage.setItem('sessionUser', JSON.stringify(userData));
        return { success: true };
      }
    } catch (e) {
      localStorage.removeItem('usuarios_registrados');
    }

    return { success: false, error: 'Credenciales inválidas.' };
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('sessionUser');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0b0f19', color: '#f8fafc', fontFamily: 'sans-serif' }}>
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Dashboard user={user} onLogout={handleLogout} buses={buses} setBuses={setBuses} />
      )}
    </div>
  );
}