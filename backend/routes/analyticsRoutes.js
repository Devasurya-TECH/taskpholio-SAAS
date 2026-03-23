const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { moderateUserLimiter } = require('../middleware/rateLimiter');
const { getAdvancedAnalytics } = require('../controllers/analyticsController');

router.use(requireAuth);
router.use(moderateUserLimiter);
router.get('/', getAdvancedAnalytics);

module.exports = router;
