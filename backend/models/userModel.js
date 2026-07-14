const pool = require('../config/db');

async function findByEmail(email) {
  const [rows] = await pool.execute(
    'SELECT id, nombre, email, password_hash, rol, created_at FROM users WHERE email = ?',
    [email]
  );
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await pool.execute(
    'SELECT id, nombre, email, rol, created_at FROM users WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

async function create({ nombre, email, passwordHash, rol }) {
  const [result] = await pool.execute(
    'INSERT INTO users (nombre, email, password_hash, rol) VALUES (?, ?, ?, ?)',
    [nombre, email, passwordHash, rol || 'estudiante']
  );
  return { id: result.insertId, nombre, email, rol: rol || 'estudiante' };
}

module.exports = { findByEmail, findById, create };
