import React, { useState, useEffect, useCallback } from 'react';
import {
    HiOutlineDocumentDownload,
    HiOutlineRefresh,
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlinePhone,
} from 'react-icons/hi';
import { orderService } from '../../services/orderService.js';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';

// ─── WhatsApp SVG icon ────────────────────────────────────
const WhatsAppIcon = () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
);

/**
 * Payment status badge
 */
function PaymentBadge({ status }) {
    const map = {
        paid: { cls: 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400', label: '✓ Paid' },
        partial: { cls: 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400', label: '◑ Partial' },
        pending: { cls: 'bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-400', label: '○ Pending' },
    };
    const s = map[status] || map.pending;
    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.cls}`}>
            {s.label}
        </span>
    );
}

/**
 * ReceiptActions — full receipt management panel for OrderDetailPage.
 * Props: orderId (string), order (object with receiptUrl, receiptNumber, paymentStatus, whatsappSent)
 *        onRefresh (fn) — called after state changes to re-fetch order
 */
export default function ReceiptActions({ orderId, order, onRefresh }) {
    const [genLoading, setGenLoading] = useState(false);
    const [waLoading, setWaLoading] = useState(false);
    const [paidLoading, setPaidLoading] = useState(false);

    const hasReceipt = Boolean(order?.receiptUrl);
    const isPaid = order?.paymentStatus === 'paid';
    const receiptUrl = hasReceipt ? `${API_BASE}${order.receiptUrl}` : null;

    // ── Generate / Re-generate receipt ──────────────────────
    const handleGenerate = async () => {
        setGenLoading(true);
        try {
            await orderService.generateReceipt(orderId);
            toast.success('Receipt generated successfully!');
            onRefresh?.();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to generate receipt');
        } finally { setGenLoading(false); }
    };

    // ── Download receipt PDF ─────────────────────────────────
    const handleDownload = () => {
        if (!receiptUrl) return;
        const a = document.createElement('a');
        a.href = receiptUrl;
        a.download = `Receipt-${order.receiptNumber || orderId}.pdf`;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    // ── Send via WhatsApp ────────────────────────────────────
    const handleWhatsApp = async () => {
        setWaLoading(true);
        try {
            const { data } = await orderService.sendWhatsApp(orderId);
            const { whatsappUrl } = data.data;
            window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
            toast.success('WhatsApp opened — send the message to the customer!', { duration: 5000 });
            onRefresh?.();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to prepare WhatsApp message');
        } finally { setWaLoading(false); }
    };

    // ── Mark payment received ────────────────────────────────
    const handleMarkPaid = async () => {
        if (isPaid) return;
        setPaidLoading(true);
        try {
            await orderService.markPaid(orderId);
            toast.success('Payment marked as received!');
            onRefresh?.();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to update payment');
        } finally { setPaidLoading(false); }
    };

    return (
        <div className="card p-5 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="font-display font-semibold text-neutral-700 dark:text-white text-base flex items-center gap-2">
                    <HiOutlineDocumentDownload className="w-5 h-5 text-primary-500" />
                    Receipt &amp; Payment
                </h2>
                <PaymentBadge status={order?.paymentStatus || 'pending'} />
            </div>

            {/* Receipt info row */}
            {hasReceipt && (
                <div className="rounded-xl bg-primary-50 dark:bg-primary-500/10 border border-primary-200 dark:border-primary-500/20 px-4 py-3 flex items-center justify-between gap-3">
                    <div>
                        <p className="text-xs text-primary-600 dark:text-primary-300 font-semibold uppercase tracking-wider">Receipt Ready</p>
                        <p className="text-sm font-mono font-bold text-primary-700 dark:text-primary-200 mt-0.5">
                            {order.receiptNumber || 'RCP-' + orderId.slice(-6).toUpperCase()}
                        </p>
                    </div>
                    {order.whatsappSent && (
                        <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                            <HiOutlineCheckCircle className="w-4 h-4" />
                            WhatsApp Sent
                        </span>
                    )}
                </div>
            )}

            {/* Action buttons */}
            <div className="grid grid-cols-1 gap-2">

                {/* Download */}
                {hasReceipt ? (
                    <button
                        onClick={handleDownload}
                        className="btn-primary gap-2 w-full justify-center"
                    >
                        <HiOutlineDocumentDownload className="w-4 h-4" />
                        Download Receipt PDF
                    </button>
                ) : (
                    <button
                        onClick={handleGenerate}
                        disabled={genLoading}
                        className="btn-primary gap-2 w-full justify-center"
                    >
                        {genLoading
                            ? <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block" /> Generating…</>
                            : <><HiOutlineDocumentDownload className="w-4 h-4" /> Generate Receipt</>
                        }
                    </button>
                )}

                {/* Re-generate */}
                {hasReceipt && (
                    <button
                        onClick={handleGenerate}
                        disabled={genLoading}
                        className="btn-secondary gap-2 w-full justify-center text-sm"
                    >
                        <HiOutlineRefresh className={`w-4 h-4 ${genLoading ? 'animate-spin' : ''}`} />
                        {genLoading ? 'Re-generating…' : 'Re-generate Receipt'}
                    </button>
                )}

                {/* WhatsApp */}
                <button
                    onClick={handleWhatsApp}
                    disabled={waLoading}
                    className="w-full flex items-center justify-center gap-2 rounded-[var(--radius)] px-4 py-2.5 text-sm font-medium
                               bg-[#25D366] hover:bg-[#128C7E] active:bg-[#075E54] text-white transition-all duration-150
                               disabled:opacity-50 disabled:pointer-events-none"
                >
                    {waLoading
                        ? <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Opening WhatsApp…</>
                        : <><WhatsAppIcon /> Send via WhatsApp</>
                    }
                </button>

                {/* Mark Paid */}
                {!isPaid && (
                    <button
                        onClick={handleMarkPaid}
                        disabled={paidLoading}
                        className="w-full flex items-center justify-center gap-2 rounded-[var(--radius)] px-4 py-2.5 text-sm font-medium
                                   bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-150
                                   disabled:opacity-50 disabled:pointer-events-none"
                    >
                        {paidLoading
                            ? <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Updating…</>
                            : <><HiOutlineCheckCircle className="w-4 h-4" /> Mark Payment Received</>
                        }
                    </button>
                )}

                {isPaid && (
                    <div className="flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        <HiOutlineCheckCircle className="w-5 h-5" />
                        Payment fully received
                    </div>
                )}
            </div>

            {/* WhatsApp hint */}
            {!hasReceipt && (
                <p className="text-xs text-center t-tertiary">
                    💡 Receipt will be auto-generated when you create an order
                </p>
            )}
        </div>
    );
}
