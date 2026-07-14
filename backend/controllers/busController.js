const busModel = require('../models/busModel');

async function getAforo(req, res, next) {
  try {
    const rutaId = parseInt(req.params.rutaId, 10);

    if (isNaN(rutaId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de ruta inválido'
      });
    }

    const aforo = await busModel.getAforoByRouteId(rutaId);

    if (!aforo || aforo.buses_activos === 0) {
      return res.json({
        success: true,
        data: { aforo_porcentaje: null, buses_activos: 0 },
        message: 'No hay buses activos en esta ruta actualmente'
      });
    }

    res.json({
      success: true,
      data: {
        aforo_porcentaje: Math.round(aforo.aforo_promedio),
        buses_activos: aforo.buses_activos
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAforo };
