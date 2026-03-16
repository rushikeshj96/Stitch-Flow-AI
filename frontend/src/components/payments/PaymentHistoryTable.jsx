import React, { useState } from 'react';
import { HiOutlineTrash, HiOutlineReceiptTax } from 'react-icons/hi';
import { orderService } from '../../services/orderService.js';
import { formatCurrency, formatDate } from '../../utils/helpers.js';
import toast from 'react-hot-toast';

const METHOD_EMOJI = {
    Cash: '💵',
    UPI: '📱',
    Card: '💳',
    'Bank Transfer': '🏦',
    Other: '📝',
};

/**
 * PaymentHistoryTable
 * Uses the project's .table, .table-wrapper, .skeleton, .btn-ghost classes
 * and CSS vars for colours — fully theme-aware.
 *
 * Props:
 *   orderId   string
 *   payments  PaymentEntry[]
 *   onRefresh () => void
 *   canDelete boolean (default true)
 *   loading   boolean — show loading skeletons
 */
export default function PaymentHistoryTable({
    orderId,
    payments = [],
    onRefresh,
    canDelete = true,
    loading = false,
}) {
    const [deletingId, setDeletingId] = useState(null);

    const handleDelete = async (paymentId) => {
        if (!window.confirm('Remove this payment entry? The paid amount will be adjusted.')) return;
        setDeletingId(paymentId);
        try {
            await orderService.deletePayment(orderId, paymentId);
            toast.success('Payment entry removed.');
            onRefresh?.();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to remove payment entry.');
        } finally { setDeletingId(null); }
    };

    /* ── loading skeleton ── */
    if (loading) {
        return (
            <div className="space-y-2 py-2">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="skeleton h-10 rounded-[var(--radius)]" />
                ))}
            </div>
        );
    }

    /* ── empty state ── */
    if (!payments.length) {
        return (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
                <HiOutlineReceiptTax className="w-9 h-9 t-tertiary opacity-50" />
                <p className="text-sm t-secondary">No payments recorded yet.</p>
                <p className="text-xs t-tertiary">Use "Add Payment" to record a payment.</p>
            </div>
        );
    }

    return (
        <div className="table-wrapper">
            <table className="table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Method</th>
                        <th className="text-right">Amount</th>
                        <th className="hidden sm:table-cell">Notes</th>
                        {canDelete && <th className="w-10 text-center">
                            <span className="sr-only">Actions</span>
                        </th>}
                    </tr>
                </thead>
                <tbody>
                    {payments.map((p) => (
                        <tr key={p._id} className="group">
                            {/* Date */}
                            <td className="whitespace-nowrap">
                                <span className="text-sm font-medium t-primary">{formatDate(p.date)}</span>
                            </td>

                            {/* Method */}
                            <td>
                                <span className="inline-flex items-center gap-1.5 text-sm t-secondary">
                                    <span aria-hidden="true">{METHOD_EMOJI[p.method] || '💰'}</span>
                                    {p.method}
                                </span>
                            </td>

                            {/* Amount — green accent like revenue figures in the app */}
                            <td className="text-right whitespace-nowrap">
                                <span className="text-sm font-display font-semibold text-emerald-600 dark:text-emerald-400">
                                    +{formatCurrency(p.amount)}
                                </span>
                            </td>

                            {/* Notes — hidden on mobile */}
                            <td className="hidden sm:table-cell max-w-[180px]">
                                <span className="text-xs t-tertiary truncate block" title={p.notes || ''}>
                                    {p.notes || <span className="opacity-40">—</span>}
                                </span>
                            </td>

                            {/* Delete — reveal on row-hover */}
                            {canDelete && (
                                <td className="text-center">
                                    <button
                                        onClick={() => handleDelete(p._id)}
                                        disabled={deletingId === p._id}
                                        aria-label="Remove payment"
                                        className="btn-ghost p-1.5 rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100
                                                   hover:text-red-600 dark:hover:text-red-400
                                                   hover:bg-red-50 dark:hover:bg-red-500/10
                                                   transition-opacity disabled:opacity-50"
                                    >
                                        {deletingId === p._id
                                            ? <span className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin inline-block" />
                                            : <HiOutlineTrash className="w-3.5 h-3.5" />
                                        }
                                    </button>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
