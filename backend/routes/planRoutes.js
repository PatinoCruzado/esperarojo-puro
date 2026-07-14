const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, planController.getPlans);

module.exports = router;
