const fs = require('fs');
const path = require('path');
const { Product, PRODUCT_CATEGORIES } = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const toNumber = (value) => (value === undefined || value === null || value === '' ? undefined : Number(value));

const parseArrayField = (value) => {
    if (value === undefined || value === null) return undefined;
    if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return [];
        if (trimmed.startsWith('[')) {
            try {
                const parsed = JSON.parse(trimmed);
                return Array.isArray(parsed) ? parsed.map((item) => String(item).trim()).filter(Boolean) : [];
            } catch (error) {
                return trimmed.split(',').map((item) => item.trim()).filter(Boolean);
            }
        }
        return trimmed.split(',').map((item) => item.trim()).filter(Boolean);
    }
    return [];
};

const deleteLocalImageIfExists = (imageUrl) => {
    if (!imageUrl || !imageUrl.startsWith('/uploads/')) return;

    const relativePath = imageUrl.replace(/^\/uploads\/?/, '');
    const absolutePath = path.join(process.cwd(), 'uploads', relativePath);

    if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
    }
};

const ensureValidCategory = (category) => {
    if (!PRODUCT_CATEGORIES.includes(category)) {
        throw new AppError(`Category must be one of: ${PRODUCT_CATEGORIES.join(', ')}`, 400);
    }
};

const mapPayload = (body) => ({
    name: body.productName ?? body.name,
    description: body.productDescription ?? body.description,
    price: toNumber(body.price),
    discountPrice: toNumber(body.discountPrice),
    category: body.category,
    stockQuantity: toNumber(body.stockQuantity),
    sizes: parseArrayField(body.sizes),
});

exports.createProduct = asyncHandler(async (req, res) => {
    const payload = mapPayload(req.body);

    if (!payload.name || !payload.description || payload.price === undefined || !payload.category || payload.stockQuantity === undefined) {
        throw new AppError('Please provide all required fields', 400);
    }
    if (Number.isNaN(payload.price) || Number.isNaN(payload.stockQuantity)) {
        throw new AppError('Price and stock quantity must be valid numbers', 400);
    }

    ensureValidCategory(payload.category);

    if (payload.discountPrice !== undefined && Number.isNaN(payload.discountPrice)) {
        throw new AppError('Discount price must be a valid number', 400);
    }

    const imageUrls = (req.files || []).map((file) => `/uploads/products/${file.filename}`);
    if (imageUrls.length === 0) {
        throw new AppError('At least one product image is required', 400);
    }

    const product = await Product.create({
        ...payload,
        imageUrls,
    });

    res.status(201).json({ success: true, data: product });
});

exports.getProducts = asyncHandler(async (req, res) => {
    const { category, search, minPrice, maxPrice, size, availability } = req.query;
    const query = {};

    if (category) query.category = category;
    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice !== undefined) query.price.$gte = Number(minPrice);
        if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
    }
    if (size) query.sizes = size;
    if (availability === 'in-stock') query.stockQuantity = { $gt: 0 };
    if (availability === 'out-of-stock') query.stockQuantity = { $lte: 0 };
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
        ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: products.length, data: products });
});

exports.getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) throw new AppError('Product not found', 404);

    res.json({ success: true, data: product });
});

exports.updateProduct = asyncHandler(async (req, res) => {
    const existing = await Product.findById(req.params.id);
    if (!existing) throw new AppError('Product not found', 404);

    const updates = mapPayload(req.body);
    if (updates.price !== undefined && Number.isNaN(updates.price)) {
        throw new AppError('Price must be a valid number', 400);
    }
    if (updates.stockQuantity !== undefined && Number.isNaN(updates.stockQuantity)) {
        throw new AppError('Stock quantity must be a valid number', 400);
    }
    if (updates.discountPrice !== undefined && Number.isNaN(updates.discountPrice)) {
        throw new AppError('Discount price must be a valid number', 400);
    }
    if (updates.category !== undefined) {
        ensureValidCategory(updates.category);
    }

    if (req.files?.length) {
        updates.imageUrls = req.files.map((file) => `/uploads/products/${file.filename}`);
        (existing.imageUrls || []).forEach(deleteLocalImageIfExists);
    }

    Object.keys(updates).forEach((key) => {
        if (updates[key] === undefined || updates[key] === null || updates[key] === '') {
            delete updates[key];
        }
    });

    const product = await Product.findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true,
    });

    res.json({ success: true, data: product });
});

exports.deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) throw new AppError('Product not found', 404);

    (product.imageUrls || []).forEach(deleteLocalImageIfExists);

    res.json({ success: true, message: 'Product deleted successfully' });
});

exports.getProductCategories = (req, res) => {
    res.json({ success: true, data: PRODUCT_CATEGORIES });
};
