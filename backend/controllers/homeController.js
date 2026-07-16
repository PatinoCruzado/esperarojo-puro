const routeModel = require('../models/routeModel');
const busModel = require('../models/busModel');

async function getSummary(req, res, next) {
  try {
    let lat = parseFloat(req.query.lat);
    let lng = parseFloat(req.query.lng);

    // Si no hay coordenadas (GPS falló o denegado), usar Universidad de Lima por defecto
    if (isNaN(lat) || isNaN(lng)) {
      lat = -12.0847;
      lng = -76.9710;
    }

    // Paraderos cercanos (máximo 5)
    const paraderosCercanos = await routeModel.findNearbyStops(lat, lng, 5);

    // Buscar la ruta más relevante (la del paradero más cercano)
    let proximoBus = null;
    let aforo = null;

    if (paraderosCercanos.length > 0) {
      const paraderoCercano = paraderosCercanos[0];

      // Encontrar las rutas que pasan por el paradero más cercano
      const routes = await routeModel.findAll('todas');

      for (const route of routes) {
        const stops = await routeModel.findStopsByRouteId(route.id);
        const pasaPorParadero = stops.some(s => s.id === paraderoCercano.id);

        if (pasaPorParadero) {
          proximoBus = await busModel.getNextBus(route.id);
          aforo = await busModel.getAforoByRouteId(route.id);

          if (proximoBus) {
            proximoBus.ruta_numero = route.numero;
            proximoBus.ruta_direccion = route.direccion;
            proximoBus.ruta_destino = route.paradero_final;
          }
          break;
        }
      }
    }

    const hayDatos = paraderosCercanos.length > 0;

    res.json({
      success: true,
      data: {
        paraderos_cercanos: paraderosCercanos,
        proximo_bus: proximoBus,
        aforo: aforo ? {
          promedio: Math.round(aforo.aforo_promedio),
          min: aforo.aforo_min,
          max: aforo.aforo_max,
          buses_activos: aforo.buses_activos
        } : null,
        mensaje: hayDatos ? null : 'Información no disponible temporalmente'
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getSummary };
