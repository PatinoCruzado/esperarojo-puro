const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, routeController.getRoutes);
router.get('/:id/stops', verifyToken, routeController.getRouteStops);

module.exports = router;
