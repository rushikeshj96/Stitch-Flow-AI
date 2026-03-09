const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

// All AI routes require authentication
router.use(protect);

/* ── Core AI features ───────────────────────────── */
router.post('/design', ctrl.generateDesign);      // POST /api/ai/design
router.post('/parse-order', ctrl.parseOrder);          // POST /api/ai/parse-order
router.post('/measurements', ctrl.predictMeasurements); // POST /api/ai/measurements
router.post('/suggestions', ctrl.getSuggestions);      // POST /api/ai/suggestions

/* ── Saved designs (db) ─────────────────────────── */
router.get('/designs', ctrl.getDesigns);       // GET  /api/ai/designs
router.delete('/designs/:id', ctrl.deleteDesign);     // DEL  /api/ai/designs/:id
router.patch('/designs/:id/favourite', ctrl.toggleFavourite);  // PATCH /api/ai/designs/:id/favourite

module.exports = router;
