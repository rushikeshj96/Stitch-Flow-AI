const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer, searchCustomers,
} = require('../controllers/customerController');

router.use(protect);

router.route('/')
    .get(getCustomers)
    .post(createCustomer);

// /search must be declared BEFORE /:id to avoid being caught as an id param
router.get('/search', searchCustomers);

router.route('/:id')
    .get(getCustomer)
    .put(updateCustomer)
    .delete(deleteCustomer);

module.exports = router;
