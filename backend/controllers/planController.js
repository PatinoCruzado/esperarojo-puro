const planModel = require('../models/planModel');

async function getPlans(req, res, next) {
  try {
    const plans = await planModel.findAllPlans();
    res.json({ success: true, data: plans });
  } catch (error) {
    next(error);
  }
}

async function createSubscription(req, res, next) {
  try {
    const userId = req.user.id;
    const { plan_id } = req.body;

    if (!plan_id) {
      return res.status(400).json({
        success: false,
        message: 'Debes seleccionar un plan'
      });
    }

    const plan = await planModel.findPlanById(plan_id);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan no encontrado'
      });
    }

    const subscription = await planModel.createSubscription(userId, plan_id);

    res.status(201).json({
      success: true,
      message: `Suscripción al plan ${subscription.plan_nombre} registrada exitosamente`,
      data: subscription
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getPlans, createSubscription };
