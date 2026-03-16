const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getPaymentSummary } = require('../controllers/paymentController');

router.use(protect);

// GET /api/payments/summary — cross-order payment analytics
router.get('/summary', getPaymentSummary);

module.exports = router;
