import React, { useState } from 'react';
import './Dashboard.css';

export default function Dashboard({ user, onLogout, buses, setBuses }) {
  const [activeTab, setActiveTab] = useState('buses');
  const [adminBusId, setAdminBusId] = useState('B-991');
  const [adminAforo, setAdminAforo] = useState(50);
  const [adminTiempo, setAdminTiempo] = useState(5);

  const handleAdminUpdate = (e) => {
    e.preventDefault();
    setBuses(prev => prev.map(b => b.id === adminBusId ? { ...b, aforo: parseInt(adminAforo), tiempoEstimado: parseInt(adminTiempo) } : b));
    alert(`Unidad ${adminBusId} actualizada con éxito.`);
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <h3>🚌 MoveSync</h3>
        <nav>
          <button className={activeTab === 'buses' ? 'active' : ''} onClick={() => setActiveTab('buses')}>📊 Tiempos y Aforo</button>
          {user.isAdmin && (
            <button className={activeTab === 'admin' ? 'active admin-btn' : 'admin-btn'} onClick={() => setActiveTab('admin')}>🛠️ Simulador Admin</button>
          )}
        </nav>
        <div className="user-badge">
          <p className="email">{user.email}</p>
          <button onClick={onLogout} className="btn-logout">Cerrar Sesión 🚪</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {activeTab === 'buses' && (
          <div>
            <h2>Monitoreo en Tiempo Real (Paradero U. de Lima)</h2>
            <p className="desc">Listado interactivo de los próximos buses del Corredor Rojo.</p>
            
            <div className="bus-list">
              {[...buses].sort((a,b) => a.tiempoEstimado - b.tiempoEstimado).map(b => {
                let color = '#10b981'; // Verde
                if (b.aforo > 80) color = '#ef4444'; // Rojo
                else if (b.aforo > 50) color = '#f59e0b'; // Ámbar

                return (
                  <div key={b.id} className="bus-card">
                    <div className="bus-info">
                      <span className="bus-route">Línea {b.ruta}</span>
                      <span className="bus-id">ID: {b.id}</span>
                    </div>
                    
                    <div className="bus-capacity">
                      <div className="cap-label">Ocupación: {b.aforo}%</div>
                      <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{ width: `${b.aforo}%`, backgroundColor: color }}></div>
                      </div>
                    </div>

                    <div className="bus-time">
                      <div className="time-lbl">Llegada estimada</div>
                      <div className="time-val">{b.tiempoEstimado} min</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'admin' && user.isAdmin && (
          <div className="admin-section">
            <h2>🛠️ Panel de Simulación (Exclusivo Docente/Admin)</h2>
            <p className="desc">Modifica los datos en vivo para demostrarle al profesor la reactividad del sistema.</p>

            <form onSubmit={handleAdminUpdate} className="admin-form">
              <div className="form-group">
                <label>Seleccionar Bus</label>
                <select value={adminBusId} onChange={e => setAdminBusId(e.target.value)}>
                  {buses.map(b => <option key={b.id} value={b.id}>Bus {b.id} - Ruta {b.ruta}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Modificar Aforo ({adminAforo}%)</label>
                <input type="range" min="0" max="100" value={adminAforo} onChange={e => setAdminAforo(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Tiempo de Espera (minutos)</label>
                <input type="number" min="1" value={adminTiempo} onChange={e => setAdminTiempo(e.target.value)} />
              </div>
              <button type="submit" className="btn-admin-submit">Inyectar Cambios ⚡</button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}