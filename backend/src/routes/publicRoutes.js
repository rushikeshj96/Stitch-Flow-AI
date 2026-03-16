const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/publicController');

// All endpoints here DO NOT require authentication so customers can browse freely

// Services
router.get('/services', ctrl.getPublicServices);
router.get('/services/:id', ctrl.getPublicServiceById);

// Appointments
router.post('/appointments', ctrl.bookAppointment);
router.post('/appointments/pay/initialize', ctrl.initializePayment);
router.post('/appointments/pay/verify', ctrl.verifyPayment);

// Reviews
router.post('/reviews', ctrl.submitReview);

module.exports = router;
