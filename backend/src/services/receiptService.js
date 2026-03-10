'use strict';

const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const Order = require('../models/Order');

// ─── Ensure upload directory exists ───────────────────────
const RECEIPTS_DIR = path.join(process.cwd(), 'uploads', 'receipts');
if (!fs.existsSync(RECEIPTS_DIR)) fs.mkdirSync(RECEIPTS_DIR, { recursive: true });

// ─── Helpers ──────────────────────────────────────────────
const INR = (n) => `Rs. ${Number(n || 0).toLocaleString('en-IN')}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

// ─── Color palette ────────────────────────────────────────
const C = {
    primary: '#6B21A8',   // deep purple
    accent: '#A855F7',   // light purple
    dark: '#1e1b2e',
    text: '#1F2937',
    muted: '#6B7280',
    light: '#F3F4F6',
    white: '#FFFFFF',
    border: '#E5E7EB',
    green: '#059669',
    red: '#DC2626',
};

/**
 * Generate UPI QR code as a PNG Buffer
 */
async function generateUPIQR(amount, orderId) {
    const upiId = process.env.UPI_ID || 'stitchflow@upi';
    const shopName = (process.env.SHOP_NAME || 'StitchFlow').replace(/\s+/g, '%20');
    const upiUrl = `upi://pay?pa=${upiId}&pn=${shopName}&am=${amount}&cu=INR&tn=Order-${orderId}`;
    return QRCode.toBuffer(upiUrl, {
        type: 'png',
        width: 160,
        margin: 1,
        color: { dark: C.dark, light: C.white },
    });
}

/**
 * Main entry — generate receipt PDF for an order, save it, update DB record.
 * @returns {{ receiptUrl: string, receiptNumber: string }}
 */
async function generateReceipt(orderId, user) {
    // ── 1. Fetch order with customer populated ─────────────
    const order = await Order.findById(orderId).populate('customer', 'name phone email address');
    if (!order) throw new Error('Order not found');

    const customer = order.customer;
    const shopName = user?.boutiqueName || process.env.SHOP_NAME || 'StitchFlow Boutique';
    const shopPhone = user?.phone || process.env.SHOP_PHONE || '';
    const shopAddr = user?.address || process.env.SHOP_ADDRESS || '';

    // ── 2. Receipt number & file path ─────────────────────
    const receiptNumber = order.receiptNumber || `RCP-${order.orderNumber}`;
    const fileName = `${order._id}.pdf`;
    const filePath = path.join(RECEIPTS_DIR, fileName);
    const receiptUrl = `/uploads/receipts/${fileName}`;

    // ── 3. Generate UPI QR buffer ─────────────────────────
    const qrBuffer = await generateUPIQR(order.balanceDue || order.totalAmount, order.orderNumber);

    // ── 4. Build PDF ───────────────────────────────────────
    await new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: 'A4', margin: 0, info: { Title: `Receipt ${receiptNumber}` } });
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);
        stream.on('finish', resolve);
        stream.on('error', reject);

        const W = 595.28;  // A4 width pts
        const margin = 40;
        const col2 = W / 2;

        // ── HEADER BAND ────────────────────────────────────
        doc.rect(0, 0, W, 110).fill(C.primary);

        // Logo / Shop name
        doc.font('Helvetica-Bold').fontSize(22).fillColor(C.white)
            .text(shopName, margin, 28, { width: W - margin * 2 });

        doc.font('Helvetica').fontSize(9).fillColor('#d8b4fe')
            .text('TAILORING & BOUTIQUE MANAGEMENT', margin, 54, { characterSpacing: 1.5 });

        if (shopAddr) {
            doc.font('Helvetica').fontSize(8).fillColor('#e9d5ff')
                .text(shopAddr, margin, 68);
        }
        if (shopPhone) {
            doc.font('Helvetica').fontSize(8).fillColor('#e9d5ff')
                .text(`📞 ${shopPhone}`, margin, shopAddr ? 80 : 68);
        }

        // RECEIPT label top-right
        doc.font('Helvetica-Bold').fontSize(24).fillColor(C.white)
            .text('RECEIPT', W - 160, 30, { width: 120, align: 'right' });
        doc.font('Helvetica').fontSize(9).fillColor('#d8b4fe')
            .text(receiptNumber, W - 160, 60, { width: 120, align: 'right' });
        doc.font('Helvetica').fontSize(8).fillColor('#e9d5ff')
            .text(`Date: ${fmtDate(order.createdAt)}`, W - 160, 75, { width: 120, align: 'right' });

        let y = 130;

        // ── META BAND — two columns ─────────────────────────
        // Customer
        doc.font('Helvetica-Bold').fontSize(7).fillColor(C.muted)
            .text('BILL TO', margin, y, { characterSpacing: 1.2 });
        doc.font('Helvetica-Bold').fontSize(11).fillColor(C.text)
            .text(customer.name, margin, y + 12);
        doc.font('Helvetica').fontSize(9).fillColor(C.muted)
            .text(customer.phone, margin, y + 26);
        if (customer.email)
            doc.text(customer.email, margin, y + 38);

        // Order info right col
        doc.font('Helvetica-Bold').fontSize(7).fillColor(C.muted)
            .text('ORDER DETAILS', col2 + 20, y, { characterSpacing: 1.2 });

        const meta = [
            ['Order #', order.orderNumber],
            ['Due Date', fmtDate(order.dueDate)],
            ['Priority', order.priority?.toUpperCase()],
            ['Payment Status', order.paymentStatus?.toUpperCase() || 'PENDING'],
        ];
        meta.forEach(([lbl, val], i) => {
            doc.font('Helvetica').fontSize(8.5).fillColor(C.muted)
                .text(lbl, col2 + 20, y + 12 + i * 14);
            doc.font('Helvetica-Bold').fontSize(8.5).fillColor(C.text)
                .text(val || '—', col2 + 110, y + 12 + i * 14);
        });

        y += 90;

        // ── ITEMS TABLE ────────────────────────────────────
        // Header row
        const cols = [margin, 170, 290, 370, 455];
        const colW = [125, 115, 75, 80, 100];
        const headers = ['Garment', 'Fabric / Description', 'Qty', 'Unit Price', 'Subtotal'];

        doc.rect(margin, y, W - margin * 2, 22).fill(C.primary);
        headers.forEach((h, i) => {
            doc.font('Helvetica-Bold').fontSize(8).fillColor(C.white)
                .text(h, cols[i] + 4, y + 7, { width: colW[i], align: i >= 2 ? 'right' : 'left' });
        });
        y += 22;

        // Item rows
        order.items.forEach((item, idx) => {
            const rowH = 22;
            if (idx % 2 === 0) doc.rect(margin, y, W - margin * 2, rowH).fill('#FAF5FF');
            else doc.rect(margin, y, W - margin * 2, rowH).fill(C.white);

            const desc = [item.description].filter(Boolean).join(' · ');
            doc.font('Helvetica-Bold').fontSize(8.5).fillColor(C.text)
                .text(item.garmentType, cols[0] + 4, y + 7, { width: colW[0] - 4 });
            doc.font('Helvetica').fontSize(8).fillColor(C.muted)
                .text(item.fabric || desc || '—', cols[1] + 4, y + 7, { width: colW[1] - 4 });
            doc.font('Helvetica').fontSize(8.5).fillColor(C.text)
                .text(String(item.quantity), cols[2] + 4, y + 7, { width: colW[2], align: 'right' });
            doc.text(INR(item.unitPrice), cols[3] + 4, y + 7, { width: colW[3], align: 'right' });
            doc.font('Helvetica-Bold').fillColor(C.primary)
                .text(INR(item.quantity * item.unitPrice), cols[4] + 4, y + 7, { width: colW[4] - 4, align: 'right' });
            y += rowH;
        });

        // Bottom border of table
        doc.moveTo(margin, y).lineTo(W - margin, y).strokeColor(C.border).lineWidth(1).stroke();
        y += 16;

        // ── PAYMENT SUMMARY + QR CODE ──────────────────────
        // Left: QR code box
        const qrX = margin, qrY = y;
        doc.rect(qrX, qrY, 175, 175).fill('#FAF5FF').stroke();
        doc.image(qrBuffer, qrX + 7, qrY + 7, { width: 160, height: 160 });
        doc.font('Helvetica-Bold').fontSize(7.5).fillColor(C.primary)
            .text('Scan to Pay via UPI', qrX, qrY + 168, { width: 175, align: 'center' });

        // UPI ID below QR
        const upiId = process.env.UPI_ID || 'stitchflow@upi';
        doc.font('Helvetica').fontSize(7).fillColor(C.muted)
            .text(`UPI: ${upiId}`, qrX, qrY + 180, { width: 175, align: 'center' });

        // Right: Payment breakdown
        const sumX = col2 + 20, sumW = W - sumX - margin;
        const rows = [
            { label: 'Sub Total', value: INR(order.totalAmount), bold: false },
            { label: 'Advance Paid', value: INR(order.advancePaid), bold: false, color: C.green },
        ];
        let sumY = qrY + 10;
        rows.forEach(r => {
            doc.font('Helvetica').fontSize(9.5).fillColor(C.muted)
                .text(r.label, sumX, sumY, { width: sumW / 2 });
            doc.font(r.bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(9.5).fillColor(r.color || C.text)
                .text(r.value, sumX + sumW / 2, sumY, { width: sumW / 2, align: 'right' });
            sumY += 20;
        });

        // Divider
        doc.moveTo(sumX, sumY).lineTo(sumX + sumW, sumY)
            .strokeColor(C.border).lineWidth(0.5).stroke();
        sumY += 8;

        // Balance Due (big)
        const isDui = order.balanceDue > 0;
        doc.rect(sumX, sumY, sumW, 42).fill(isDui ? '#FEF2F2' : '#ECFDF5');
        doc.font('Helvetica').fontSize(8).fillColor(C.muted)
            .text('BALANCE DUE', sumX + 8, sumY + 8);
        doc.font('Helvetica-Bold').fontSize(18).fillColor(isDui ? C.red : C.green)
            .text(INR(order.balanceDue), sumX + 8, sumY + 18, { width: sumW - 16, align: 'right' });
        sumY += 54;

        // Notes
        if (order.notes) {
            sumY += 8;
            doc.font('Helvetica-Bold').fontSize(8).fillColor(C.muted)
                .text('NOTES', sumX, sumY, { characterSpacing: 1 });
            doc.font('Helvetica').fontSize(8.5).fillColor(C.text)
                .text(order.notes, sumX, sumY + 12, { width: sumW });
        }

        // ── FOOTER ────────────────────────────────────────
        const footerY = 780;
        doc.rect(0, footerY, W, 62).fill(C.dark);
        doc.font('Helvetica-Bold').fontSize(9).fillColor(C.white)
            .text('Thank you for choosing ' + shopName + '!', 0, footerY + 12, { width: W, align: 'center' });
        doc.font('Helvetica').fontSize(7.5).fillColor('#9CA3AF')
            .text('This is a computer-generated receipt and does not require a signature.', 0, footerY + 28, { width: W, align: 'center' });
        doc.font('Helvetica').fontSize(7).fillColor('#6B7280')
            .text(`Generated by StitchFlow AI  ·  ${receiptNumber}  ·  ${fmtDate(new Date())}`, 0, footerY + 44, { width: W, align: 'center' });

        doc.end();
    });

    // ── 5. Update DB record ────────────────────────────────
    await Order.findByIdAndUpdate(orderId, { receiptNumber, receiptUrl });

    return { receiptUrl, receiptNumber };
}

module.exports = { generateReceipt };
