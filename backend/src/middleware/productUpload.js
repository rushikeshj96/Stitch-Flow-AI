const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AppError = require('../utils/AppError');

const PRODUCTS_UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'products');
if (!fs.existsSync(PRODUCTS_UPLOAD_DIR)) {
    fs.mkdirSync(PRODUCTS_UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, PRODUCTS_UPLOAD_DIR),
    filename: (req, file, cb) => {
        const safeBaseName = path
            .parse(file.originalname)
            .name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${Date.now()}-${safeBaseName || 'product'}${ext}`);
    },
});

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(new AppError('Only JPG, PNG, and WEBP images are allowed', 400));
    }
    cb(null, true);
};

const productUpload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = { productUpload, PRODUCTS_UPLOAD_DIR };
