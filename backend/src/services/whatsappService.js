'use strict';

/**
 * WhatsApp Service
 *
 * Strategy: WhatsApp Click-to-Chat (wa.me) link.
 * Works with any WhatsApp account — no paid API needed.
 * The link is returned to the frontend which opens it in a new tab.
 *
 * For production, swap buildWhatsAppLink() with Twilio / Cloud API calls.
 */

const Order = require('../models/Order');

/**
 * Encode a phone number to E.164 (strip leading 0, add +91 for Indian numbers).
 */
function toE164(phone = '') {
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('91') && digits.length === 12) return `+${digits}`;
    if (digits.length === 10) return `+91${digits}`;
    return `+${digits}`;
}

/**
 * Build a wa.me click-to-chat URL and the raw message text.
 */
function buildWhatsAppPayload(order, customer, receiptUrl) {
    const shopName = process.env.SHOP_NAME || 'StitchFlow Boutique';
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const fullUrl = receiptUrl.startsWith('http') ? receiptUrl : `${backendUrl}${receiptUrl}`;

    const message = [
        `Hello *${customer.name}* 👋`,
        '',
        `Your stitching order at *${shopName}* has been confirmed! 🧵`,
        '',
        `📋 *Order Details*`,
        `• Order ID:      ${order.orderNumber}`,
        `• Dress:         ${order.items.map(i => i.garmentType).join(', ')}`,
        `• Delivery Date: ${new Date(order.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`,
        `• Total Amount:  Rs. ${Number(order.totalAmount).toLocaleString('en-IN')}`,
        `• Balance Due:   Rs. ${Number(order.balanceDue).toLocaleString('en-IN')}`,
        '',
        `📄 *Download Your Receipt:*`,
        fullUrl,
        '',
        `💳 A UPI QR code is included in your receipt for easy payment.`,
        '',
        `Thank you for choosing *${shopName}*! 🙏`,
    ].join('\n');

    const phone = toE164(customer.phone);
    const encodedMsg = encodeURIComponent(message);
    const waLink = `https://wa.me/${phone.replace('+', '')}?text=${encodedMsg}`;

    return { whatsappUrl: waLink, message };
}

/**
 * Mark order as whatsapp sent (called after user clicks the link).
 */
async function markWhatsAppSent(orderId) {
    await Order.findByIdAndUpdate(orderId, {
        whatsappSent: true,
        whatsappSentAt: new Date(),
    });
}

/**
 * Prepare WhatsApp receipt payload for an order.
 */
async function prepareReceiptPayload(orderId) {
    const order = await Order.findById(orderId)
        .populate('customer', 'name phone email');

    if (!order) throw new Error('Order not found');
    if (!order.customer) throw new Error('Customer not linked to order');
    if (!order.receiptUrl) throw new Error('Receipt not generated yet. Generate receipt first.');

    const payload = buildWhatsAppPayload(order, order.customer, order.receiptUrl);
    return payload;
}

module.exports = { prepareReceiptPayload, markWhatsAppSent, buildWhatsAppPayload };
