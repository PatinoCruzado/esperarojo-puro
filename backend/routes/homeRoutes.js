const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/summary', verifyToken, homeController.getSummary);

module.exports = router;
