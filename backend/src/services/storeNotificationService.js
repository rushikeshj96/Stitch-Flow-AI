const { sendEmail } = require('../utils/emailService');

const formatCurrency = (value) => `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;

function buildWhatsAppUrl(phoneNumber, message) {
    const digits = String(phoneNumber || '').replace(/\D/g, '');
    const normalized = digits.length === 10 ? `91${digits}` : digits;
    return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

async function sendStoreOrderConfirmation(order) {
    const message = [
        `Hello ${order.customerName},`,
        '',
        'Your order has been successfully placed.',
        '',
        `Order ID: ${order.orderId}`,
        `Total Amount: ${formatCurrency(order.totalAmount)}`,
        '',
        'Thank you for shopping with us.',
    ].join('\n');

    const whatsappUrl = buildWhatsAppUrl(order.phoneNumber, message);

    if (order.email) {
        const html = [
            `<p>Hello ${order.customerName},</p>`,
            '<p>Your order has been successfully placed.</p>',
            `<p><strong>Order ID:</strong> ${order.orderId}</p>`,
            `<p><strong>Total Amount:</strong> ${formatCurrency(order.totalAmount)}</p>`,
            '<p>Thank you for shopping with us.</p>',
        ].join('');

        try {
            await sendEmail({
                to: order.email,
                subject: `Order Confirmation - ${order.orderId}`,
                text: message,
                html,
            });
        } catch (error) {
            console.error('[StoreOrder] Email sending failed:', error.message);
        }
    }

    return { whatsappUrl, message };
}

module.exports = { sendStoreOrderConfirmation };
