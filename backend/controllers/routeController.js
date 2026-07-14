const routeModel = require('../models/routeModel');

async function getRoutes(req, res, next) {
  try {
    const direccion = req.query.direccion || 'todas';
    const routes = await routeModel.findAll(direccion);

    res.json({
      success: true,
      data: routes
    });
  } catch (error) {
    next(error);
  }
}

async function getRouteStops(req, res, next) {
  try {
    const routeId = parseInt(req.params.id, 10);

    if (isNaN(routeId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de ruta inválido'
      });
    }

    const route = await routeModel.findById(routeId);
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
      });
    }

    const stops = await routeModel.findStopsByRouteId(routeId);

    if (stops.length === 0) {
      return res.json({
        success: true,
        data: { route, stops: [] },
        message: 'Sin información de paraderos disponible para esta ruta'
      });
    }

    res.json({
      success: true,
      data: { route, stops }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getRoutes, getRouteStops };
