const express = require('express');
const router = express.Router();
const busController = require('../controllers/busController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/:rutaId/aforo', verifyToken, busController.getAforo);

module.exports = router;
