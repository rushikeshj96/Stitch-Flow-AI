const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/measurementController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/customer/:customerId', ctrl.getByCustomer);
router.post('/', ctrl.create);
router.route('/:id')
    .get(ctrl.getById)
    .put(ctrl.update)
    .delete(ctrl.remove);

module.exports = router;
