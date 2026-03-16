const express = require('express');
const multer = require('multer');
const ctrl = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { productUpload } = require('../middleware/productUpload');

const router = express.Router();

router.get('/categories', ctrl.getProductCategories);
router.get('/', ctrl.getProducts);
router.get('/:id', ctrl.getProductById);

router.post('/', protect, productUpload.array('productImages', 8), ctrl.createProduct);
router.put('/:id', protect, productUpload.array('productImages', 8), ctrl.updateProduct);
router.delete('/:id', protect, ctrl.deleteProduct);

router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ success: false, message: 'Image size must be 5MB or less' });
        }
        return res.status(400).json({ success: false, message: err.message });
    }
    return next(err);
});

module.exports = router;
