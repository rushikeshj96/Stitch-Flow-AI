const express = require('express');
const ctrl = require('../controllers/storeController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/payments/initialize', ctrl.initializeStorePayment);
router.post('/orders', ctrl.placeStoreOrder);
router.get('/orders', ctrl.getCustomerStoreOrders);
router.get('/orders/:id', ctrl.getStoreOrderById);

router.get('/admin/orders', protect, ctrl.getAdminStoreOrders);
router.patch('/admin/orders/:id', protect, ctrl.updateAdminStoreOrder);

module.exports = router;
