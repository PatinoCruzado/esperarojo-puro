const pool = require('../config/db');

async function findAllPlans() {
  const [rows] = await pool.execute(
    'SELECT id, nombre, precio, descripcion, duracion_dias FROM subscription_plans ORDER BY precio'
  );
  return rows;
}

async function findPlanById(id) {
  const [rows] = await pool.execute(
    'SELECT id, nombre, precio, descripcion, duracion_dias FROM subscription_plans WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

async function createSubscription(userId, planId) {
  const plan = await findPlanById(planId);
  if (!plan) return null;

  const fechaInicio = new Date();
  const fechaFin = new Date();
  fechaFin.setDate(fechaFin.getDate() + plan.duracion_dias);

  const [result] = await pool.execute(
    `INSERT INTO user_subscriptions (user_id, plan_id, estado, fecha_inicio, fecha_fin)
     VALUES (?, ?, 'activa', ?, ?)`,
    [userId, planId, fechaInicio.toISOString().split('T')[0], fechaFin.toISOString().split('T')[0]]
  );

  return {
    id: result.insertId,
    user_id: userId,
    plan_id: planId,
    plan_nombre: plan.nombre,
    estado: 'activa',
    fecha_inicio: fechaInicio.toISOString().split('T')[0],
    fecha_fin: fechaFin.toISOString().split('T')[0]
  };
}

async function findUserSubscriptions(userId) {
  const [rows] = await pool.execute(
    `SELECT us.id, us.estado, us.fecha_inicio, us.fecha_fin,
            sp.nombre AS plan_nombre, sp.precio, sp.descripcion
     FROM user_subscriptions us
     JOIN subscription_plans sp ON us.plan_id = sp.id
     WHERE us.user_id = ?
     ORDER BY us.fecha_inicio DESC`,
    [userId]
  );
  return rows;
}

module.exports = { findAllPlans, findPlanById, createSubscription, findUserSubscriptions };
