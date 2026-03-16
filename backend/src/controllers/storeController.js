const mongoose = require('mongoose');
const { Product } = require('../models/Product');
const { StoreOrder, STORE_ORDER_STATUSES, STORE_PAYMENT_STATUSES } = require('../models/StoreOrder');
const paymentService = require('../services/paymentService');
const { sendStoreOrderConfirmation } = require('../services/storeNotificationService');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const sanitizeQty = (value) => {
    const qty = Number(value);
    if (!Number.isInteger(qty) || qty <= 0) return 0;
    return qty;
};

const getUnitPrice = (product) => {
    if (typeof product.discountPrice === 'number' && product.discountPrice >= 0 && product.discountPrice <= product.price) {
        return product.discountPrice;
    }
    return product.price;
};

const validateCheckoutDetails = ({ customerName, phoneNumber, email, shippingAddress, products }) => {
    if (!customerName || !phoneNumber || !email || !shippingAddress) {
        throw new AppError('Name, phone number, email, and shipping address are required', 400);
    }
    if (!Array.isArray(products) || products.length === 0) {
        throw new AppError('At least one cart item is required', 400);
    }
};

exports.initializeStorePayment = asyncHandler(async (req, res) => {
    const { amount, provider = 'Razorpay', metadata = {} } = req.body;
    if (!amount || Number(amount) <= 0) throw new AppError('A valid amount is required', 400);

    const intent = await paymentService.createPaymentIntent(Number(amount), 'INR', {
        ...metadata,
        provider,
        scope: 'store',
    });

    res.json({ success: true, data: intent });
});

exports.placeStoreOrder = asyncHandler(async (req, res) => {
    const {
        customerName,
        phoneNumber,
        email,
        shippingAddress,
        products,
        paymentProvider = 'Razorpay',
        paymentReference = '',
        paymentStatus = 'Pending',
    } = req.body;

    validateCheckoutDetails({ customerName, phoneNumber, email, shippingAddress, products });

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        let subtotal = 0;
        let discount = 0;

        const orderProducts = [];

        for (const item of products) {
            const productId = item.productId || item._id;
            const quantity = sanitizeQty(item.quantity);
            if (!productId || quantity < 1) {
                throw new AppError('Each cart item must include productId and valid quantity', 400);
            }

            const product = await Product.findById(productId).session(session);
            if (!product) throw new AppError('One or more products no longer exist', 404);
            if (product.stockQuantity < quantity) {
                throw new AppError(`Not enough stock for ${product.name}`, 400);
            }

            const fullPrice = product.price;
            const unitPrice = getUnitPrice(product);
            const itemTotal = unitPrice * quantity;
            subtotal += fullPrice * quantity;
            discount += (fullPrice - unitPrice) * quantity;

            if (item.size && Array.isArray(product.sizes) && product.sizes.length > 0 && !product.sizes.includes(item.size)) {
                throw new AppError(`Size ${item.size} is not available for ${product.name}`, 400);
            }

            product.stockQuantity -= quantity;
            await product.save({ session });

            orderProducts.push({
                productId: product._id,
                productName: product.name,
                imageUrl: product.imageUrls?.[0] || '',
                size: item.size || '',
                price: fullPrice,
                discountPrice: product.discountPrice,
                quantity,
                totalPrice: itemTotal,
            });
        }

        const totalAmount = Math.max(0, subtotal - discount);

        const storeOrder = await StoreOrder.create([{
            customerName,
            phoneNumber,
            email,
            shippingAddress,
            products: orderProducts,
            subtotal,
            discount,
            totalAmount,
            paymentProvider,
            paymentReference,
            paymentStatus: STORE_PAYMENT_STATUSES.includes(paymentStatus) ? paymentStatus : 'Pending',
            orderStatus: paymentStatus === 'Paid' ? 'Paid' : 'Pending',
        }], { session });

        await session.commitTransaction();
        session.endSession();

        const order = storeOrder[0];
        const notifications = await sendStoreOrderConfirmation(order);

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            data: { order, notifications },
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
});

exports.getCustomerStoreOrders = asyncHandler(async (req, res) => {
    const { email, phoneNumber } = req.query;
    if (!email && !phoneNumber) {
        throw new AppError('Email or phone number is required', 400);
    }

    const filter = {};
    if (email) filter.email = String(email).toLowerCase().trim();
    if (phoneNumber) filter.phoneNumber = String(phoneNumber).trim();

    const orders = await StoreOrder.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, data: orders });
});

exports.getStoreOrderById = asyncHandler(async (req, res) => {
    const order = await StoreOrder.findById(req.params.id);
    if (!order) throw new AppError('Order not found', 404);
    res.json({ success: true, data: order });
});

exports.getAdminStoreOrders = asyncHandler(async (req, res) => {
    const { status, paymentStatus } = req.query;
    const query = {};
    if (status) query.orderStatus = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const orders = await StoreOrder.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, data: orders });
});

exports.updateAdminStoreOrder = asyncHandler(async (req, res) => {
    const updates = {};
    if (req.body.orderStatus) {
        if (!STORE_ORDER_STATUSES.includes(req.body.orderStatus)) {
            throw new AppError('Invalid order status', 400);
        }
        updates.orderStatus = req.body.orderStatus;
    }
    if (req.body.paymentStatus) {
        if (!STORE_PAYMENT_STATUSES.includes(req.body.paymentStatus)) {
            throw new AppError('Invalid payment status', 400);
        }
        updates.paymentStatus = req.body.paymentStatus;
    }

    const order = await StoreOrder.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!order) throw new AppError('Order not found', 404);

    res.json({ success: true, data: order });
});
