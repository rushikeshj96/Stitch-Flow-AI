const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adminBookingController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All admin booking routes require token

// Services Management
router.get('/services', ctrl.getAllAdminServices);
router.post('/services', ctrl.createService);
router.put('/services/:id', ctrl.updateService);
router.delete('/services/:id', ctrl.deleteService);

// Appointments Management
router.get('/appointments', ctrl.getAllAppointments);
router.patch('/appointments/:id', ctrl.updateAppointmentStatus);
router.delete('/appointments/:id', ctrl.deleteAppointment);

// Reviews Moderation
router.get('/reviews', ctrl.getAllReviews);
router.patch('/reviews/:id', ctrl.updateReviewStatus);
router.delete('/reviews/:id', ctrl.deleteReview);

module.exports = router;
