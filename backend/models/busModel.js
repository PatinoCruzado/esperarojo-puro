const pool = require('../config/db');

async function findByRouteId(routeId) {
  const [rows] = await pool.execute(
    `SELECT id, route_id, aforo_porcentaje, estado
     FROM buses
     WHERE route_id = ? AND estado = 'activo'
     ORDER BY aforo_porcentaje ASC`,
    [routeId]
  );
  return rows;
}

async function getAforoByRouteId(routeId) {
  const [rows] = await pool.execute(
    `SELECT AVG(aforo_porcentaje) AS aforo_promedio,
            MIN(aforo_porcentaje) AS aforo_min,
            MAX(aforo_porcentaje) AS aforo_max,
            COUNT(*) AS buses_activos
     FROM buses
     WHERE route_id = ? AND estado = 'activo'`,
    [routeId]
  );
  return rows[0] || null;
}

async function getNextBus(routeId) {
  const [rows] = await pool.execute(
    `SELECT id, route_id, aforo_porcentaje, estado
     FROM buses
     WHERE route_id = ? AND estado = 'activo'
     ORDER BY aforo_porcentaje ASC
     LIMIT 1`,
    [routeId]
  );
  return rows[0] || null;
}

module.exports = { findByRouteId, getAforoByRouteId, getNextBus };
