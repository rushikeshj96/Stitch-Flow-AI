const mongoose = require('mongoose');

const STORE_ORDER_STATUSES = ['Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled'];
const STORE_PAYMENT_STATUSES = ['Pending', 'Paid', 'Failed', 'Refunded'];

const storeOrderItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    size: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    totalPrice: { type: Number, required: true, min: 0 },
}, { _id: false });

const storeOrderSchema = new mongoose.Schema({
    orderId: { type: String, unique: true },
    customerName: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    shippingAddress: { type: String, required: true, trim: true },
    products: {
        type: [storeOrderItemSchema],
        validate: [(value) => value.length > 0, 'At least one product is required'],
    },
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentProvider: { type: String, enum: ['Razorpay', 'Stripe'], default: 'Razorpay' },
    paymentReference: { type: String, default: '' },
    paymentStatus: { type: String, enum: STORE_PAYMENT_STATUSES, default: 'Pending' },
    orderStatus: { type: String, enum: STORE_ORDER_STATUSES, default: 'Pending' },
}, { timestamps: { createdAt: true, updatedAt: true } });

storeOrderSchema.pre('save', async function generateOrderId(next) {
    if (!this.isNew || this.orderId) return next();
    const count = await mongoose.model('StoreOrder').countDocuments();
    this.orderId = `SFO-${String(count + 1).padStart(6, '0')}`;
    return next();
});

storeOrderSchema.index({ createdAt: -1 });
storeOrderSchema.index({ email: 1, phoneNumber: 1 });
storeOrderSchema.index({ orderStatus: 1, paymentStatus: 1 });

module.exports = {
    StoreOrder: mongoose.model('StoreOrder', storeOrderSchema),
    STORE_ORDER_STATUSES,
    STORE_PAYMENT_STATUSES,
};
