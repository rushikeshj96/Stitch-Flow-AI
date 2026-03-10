const mongoose = require('mongoose');

const ORDER_STATUSES = ['pending', 'confirmed', 'in-progress', 'ready', 'delivered', 'cancelled'];

const orderItemSchema = new mongoose.Schema({
    garmentType: { type: String, required: true },
    description: String,
    quantity: { type: Number, default: 1, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    fabric: String,
    measurements: { type: mongoose.Schema.Types.ObjectId, ref: 'Measurement' },
    aiDesignId: String,
}, { _id: false });

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    orderNumber: { type: String, unique: true },
    items: [orderItemSchema],
    status: { type: String, enum: ORDER_STATUSES, default: 'pending' },
    totalAmount: { type: Number, required: true, min: 0 },
    advancePaid: { type: Number, default: 0 },
    balanceDue: { type: Number, default: 0 },
    dueDate: { type: Date, required: true },
    deliveredDate: Date,
    notes: String,
    priority: { type: String, enum: ['normal', 'high', 'urgent'], default: 'normal' },
    statusHistory: [{
        status: String,
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    }],
    // ── Receipt & Payment ──
    receiptNumber: { type: String },
    receiptUrl: { type: String },
    paymentStatus: { type: String, enum: ['pending', 'partial', 'paid'], default: 'pending' },
    whatsappSent: { type: Boolean, default: false },
    whatsappSentAt: { type: Date },
}, { timestamps: true });

// Auto-generate order number
orderSchema.pre('save', async function (next) {
    if (this.isNew) {
        const count = await mongoose.model('Order').countDocuments();
        this.orderNumber = `SF-${String(count + 1).padStart(5, '0')}`;
        this.balanceDue = this.totalAmount - this.advancePaid;
    }
    next();
});

orderSchema.index({ user: 1, status: 1 });
orderSchema.index({ customer: 1 });

module.exports = mongoose.model('Order', orderSchema);
