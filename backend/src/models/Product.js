const mongoose = require('mongoose');

const PRODUCT_CATEGORIES = [
    'Men Clothing',
    'Women Clothing',
    'Wedding Wear',
    'Casual Wear',
    'Accessories',
];

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxlength: 120,
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        trim: true,
        maxlength: 2000,
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Price cannot be negative'],
    },
    discountPrice: {
        type: Number,
        min: [0, 'Discount price cannot be negative'],
        validate: {
            validator: function validator(value) {
                if (value === undefined || value === null) return true;
                return value <= this.price;
            },
            message: 'Discount price must be less than or equal to price',
        },
    },
    category: {
        type: String,
        enum: PRODUCT_CATEGORIES,
        required: [true, 'Product category is required'],
    },
    imageUrls: [{ type: String, trim: true }],
    stockQuantity: {
        type: Number,
        required: [true, 'Stock quantity is required'],
        min: [0, 'Stock quantity cannot be negative'],
        default: 0,
    },
    sizes: [{ type: String, trim: true }],
}, {
    timestamps: { createdAt: true, updatedAt: true },
});

productSchema.path('imageUrls').validate(
    (value) => Array.isArray(value) && value.length > 0,
    'At least one product image is required'
);

productSchema.virtual('imageUrl').get(function imageUrl() {
    return this.imageUrls?.[0] || '';
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

productSchema.index({ category: 1, createdAt: -1 });
productSchema.index({ stockQuantity: 1 });
productSchema.index({ name: 'text', description: 'text' });

module.exports = {
    Product: mongoose.model('Product', productSchema),
    PRODUCT_CATEGORIES,
};
