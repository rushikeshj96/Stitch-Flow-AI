const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { deleteAccount } = require('../controllers/userController');

// All user routes are protected
router.use(protect);

router.delete('/delete-account', deleteAccount);

module.exports = router;
