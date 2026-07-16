const pool = require('../config/db');

// Mapeo de números de ruta a zona para el filtro HU-04
const ROUTE_ZONES = { 201: 'norte', 204: 'sur', 206: 'este', 209: 'este' };

async function findAll(zona) {
  let query = `
    SELECT r.id, r.numero, r.direccion,
           si.nombre AS paradero_inicial, sf.nombre AS paradero_final,
           r.cantidad_paraderos, r.tiempo_estimado_min
    FROM routes r
    LEFT JOIN stops si ON r.paradero_inicial_id = si.id
    LEFT JOIN stops sf ON r.paradero_final_id = sf.id
  `;
  const params = [];

  if (zona && zona !== 'todas') {
    const numeros = Object.entries(ROUTE_ZONES)
      .filter(([, z]) => z === zona)
      .map(([num]) => parseInt(num, 10));

    if (numeros.length === 0) {
      return [];
    }
    const placeholders = numeros.map(() => '?').join(',');
    query += ` WHERE r.numero IN (${placeholders})`;
    params.push(...numeros);
  }

  query += ' ORDER BY r.numero, r.direccion';
  const [rows] = await pool.execute(query, params);
  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute(
    `SELECT r.id, r.numero, r.direccion,
            si.nombre AS paradero_inicial, sf.nombre AS paradero_final,
            r.cantidad_paraderos, r.tiempo_estimado_min
     FROM routes r
     LEFT JOIN stops si ON r.paradero_inicial_id = si.id
     LEFT JOIN stops sf ON r.paradero_final_id = sf.id
     WHERE r.id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function findStopsByRouteId(routeId) {
  const [rows] = await pool.execute(
    `SELECT s.id, s.nombre, s.latitud, s.longitud, s.direccion_texto, rs.orden
     FROM route_stops rs
     JOIN stops s ON rs.stop_id = s.id
     WHERE rs.route_id = ?
     ORDER BY rs.orden`,
    [routeId]
  );
  return rows;
}

async function findNearbyStops(lat, lng, limitCount) {
  const [rows] = await pool.query(
    `SELECT s.id, s.nombre, s.latitud, s.longitud, s.direccion_texto,
            (6371 * ACOS(
              COS(RADIANS(?)) * COS(RADIANS(s.latitud)) *
              COS(RADIANS(s.longitud) - RADIANS(?)) +
              SIN(RADIANS(?)) * SIN(RADIANS(s.latitud))
            )) AS distancia_km
     FROM stops s
     HAVING distancia_km IS NOT NULL
     ORDER BY distancia_km
     LIMIT ?`,
    [lat, lng, lat, limitCount]
  );
  return rows;
}

module.exports = { findAll, findById, findStopsByRouteId, findNearbyStops, ROUTE_ZONES };
