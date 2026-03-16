const mongoose = require('mongoose');

const ORDER_STATUSES = ['pending', 'confirmed', 'in-progress', 'ready', 'delivered', 'cancelled'];
const PAYMENT_METHODS = ['Cash', 'UPI', 'Card', 'Bank Transfer', 'Other'];

// ── Order item ─────────────────────────────────────────────
const orderItemSchema = new mongoose.Schema({
    garmentType: { type: String, required: true },
    description: String,
    quantity: { type: Number, default: 1, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    fabric: String,
    measurements: { type: mongoose.Schema.Types.ObjectId, ref: 'Measurement' },
    aiDesignId: String,
}, { _id: false });

// ── Payment history entry ──────────────────────────────────
const paymentEntrySchema = new mongoose.Schema({
    amount: { type: Number, required: true, min: 0 },
    method: { type: String, enum: PAYMENT_METHODS, default: 'Cash' },
    date: { type: Date, default: Date.now },
    notes: { type: String, default: '' },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { _id: true });

// ── Order ──────────────────────────────────────────────────
const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    orderNumber: { type: String, unique: true },
    items: [orderItemSchema],
    status: { type: String, enum: ORDER_STATUSES, default: 'pending' },

    // ── Financial fields ──────────────────────────────────
    subtotal: { type: Number, required: true, min: 0 },
    gstRate: { type: Number, default: 0 },
    gstAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    advancePaid: { type: Number, default: 0 },   // kept for compatibility
    paidAmount: { type: Number, default: 0 },   // running total of all payments
    balanceDue: { type: Number, default: 0 },   // totalAmount - paidAmount

    paymentStatus: {
        type: String,
        enum: ['pending', 'partial', 'paid', 'overdue'],
        default: 'pending',
    },
    paymentHistory: [paymentEntrySchema],         // full payment ledger

    dueDate: { type: Date, required: true },
    deliveredDate: Date,
    notes: String,
    priority: { type: String, enum: ['normal', 'high', 'urgent'], default: 'normal' },

    statusHistory: [{
        status: String,
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    }],

    // ── Receipt & WhatsApp ──
    receiptNumber: String,
    receiptUrl: String,
    whatsappSent: { type: Boolean, default: false },
    whatsappSentAt: Date,
}, { timestamps: true });

// ── Helper: auto-compute paymentStatus ────────────────────
function computePaymentStatus(paid, total, dueDate) {
    if (paid >= total && total > 0) return 'paid';
    if (paid > 0 && paid < total) return 'partial';
    if (paid === 0 && dueDate && new Date(dueDate) < new Date()) return 'overdue';
    return 'pending';
}

// ── pre-save hook ──────────────────────────────────────────
orderSchema.pre('save', async function (next) {
    // Generate order number on first save
    if (this.isNew) {
        const count = await mongoose.model('Order').countDocuments();
        this.orderNumber = `SF-${String(count + 1).padStart(5, '0')}`;

        // Bootstrap paidAmount from advancePaid
        if (this.advancePaid > 0 && this.paidAmount === 0) {
            this.paidAmount = this.advancePaid;
            this.paymentHistory.push({
                amount: this.advancePaid,
                method: 'Cash',
                notes: 'Advance payment at order creation',
            });
        }
    }

    // Tax Calculations 
    // Subtotal: recalculate based on items if available, or assume passed subtotal
    if (this.items && this.items.length > 0) {
        this.subtotal = this.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    }

    // GST Rule: <= 1000 is 5%, > 1000 is 12%
    if (this.subtotal <= 1000) {
        this.gstRate = 0.05;
    } else {
        this.gstRate = 0.12;
    }

    this.gstAmount = this.subtotal * this.gstRate;
    this.totalAmount = this.subtotal + this.gstAmount;

    // Keep balanceDue + paymentStatus always in sync
    this.balanceDue = Math.max(0, this.totalAmount - this.paidAmount);
    this.paymentStatus = computePaymentStatus(this.paidAmount, this.totalAmount, this.dueDate);
    next();
});

orderSchema.index({ user: 1, status: 1 });
orderSchema.index({ user: 1, paymentStatus: 1 });
orderSchema.index({ customer: 1 });

module.exports = mongoose.model('Order', orderSchema);
