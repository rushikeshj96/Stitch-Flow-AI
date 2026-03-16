import React, { useState } from 'react';
import { HiOutlineCurrencyRupee, HiX } from 'react-icons/hi';
import { orderService } from '../../services/orderService.js';
import { formatCurrency } from '../../utils/helpers.js';
import toast from 'react-hot-toast';

const METHODS = ['Cash', 'UPI', 'Card', 'Bank Transfer', 'Other'];

/**
 * PaymentModal — records a new payment entry.
 * Fully inherits design tokens: .card, .input, .btn-*, .label, .error-msg,
 * t-primary, t-secondary, t-tertiary, --surface/--border CSS vars.
 *
 * Props:
 *   isOpen    boolean
 *   onClose   () => void
 *   order     { _id, orderNumber, totalAmount, paidAmount, balanceDue }
 *   onSuccess (updatedOrder) => void
 */
export default function PaymentModal({ isOpen, onClose, order, onSuccess }) {
    const [form, setForm] = useState({
        amount: '',
        method: 'Cash',
        date: new Date().toISOString().slice(0, 10),
        notes: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen || !order) return null;

    const balanceDue = order.balanceDue ?? (order.totalAmount - (order.paidAmount || 0));

    const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const amt = Number(form.amount);
        if (!amt || amt <= 0) { setError('Please enter a valid amount greater than 0.'); return; }
        if (amt > balanceDue + 0.01) { setError(`Amount exceeds the balance due of ${formatCurrency(balanceDue)}.`); return; }

        setLoading(true);
        try {
            const { data } = await orderService.addPayment(order._id, { ...form, amount: amt });
            toast.success(data.message || 'Payment recorded!');
            onSuccess?.(data.data.order);
            // reset
            setForm({ amount: '', method: 'Cash', date: new Date().toISOString().slice(0, 10), notes: '' });
            onClose();
        } catch (err) {
            const msg = err?.response?.data?.message || 'Failed to record payment.';
            setError(msg);
            toast.error(msg);
        } finally { setLoading(false); }
    };

    return (
        /* ── backdrop ── */
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-modal-title"
        >
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* ── panel (uses .card geometry + CSS var colours) ── */}
            <div className="relative w-full max-w-md animate-slide-up card p-0 overflow-hidden">

                {/* header */}
                <div
                    className="flex items-center justify-between px-5 py-4"
                    style={{ borderBottom: '1px solid rgb(var(--border))' }}
                >
                    <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-500/15 flex items-center justify-center">
                            <HiOutlineCurrencyRupee className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        </span>
                        <div>
                            <h2
                                id="payment-modal-title"
                                className="text-sm font-display font-semibold t-primary"
                            >
                                Add Payment
                            </h2>
                            <p className="text-xs t-tertiary mt-0.5">Order {order.orderNumber}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="btn-ghost p-1.5 rounded-lg"
                        aria-label="Close"
                    >
                        <HiX className="w-4 h-4" />
                    </button>
                </div>

                {/* summary strip — card-elevated */}
                <div
                    className="grid grid-cols-3 divide-x"
                    style={{
                        backgroundColor: 'rgb(var(--surface-raised))',
                        borderBottom: '1px solid rgb(var(--border))',
                        borderColor: 'rgb(var(--border))',
                    }}
                >
                    {[
                        { label: 'Total', value: order.totalAmount, accent: false },
                        { label: 'Paid', value: order.paidAmount || 0, accent: false },
                        { label: 'Balance', value: balanceDue, accent: balanceDue > 0 },
                    ].map(({ label, value, accent }) => (
                        <div key={label} className="py-3 text-center">
                            <p className="text-[11px] font-medium t-tertiary uppercase tracking-wider">{label}</p>
                            <p className={`text-sm font-display font-bold mt-0.5 ${accent ? 'text-red-600 dark:text-red-400' : 't-primary'}`}>
                                {formatCurrency(value)}
                            </p>
                        </div>
                    ))}
                </div>

                {/* form body */}
                <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">

                    {/* Amount */}
                    <div>
                        <label htmlFor="pay-amount" className="label">
                            Amount <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <span
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium t-tertiary pointer-events-none"
                            >₹</span>
                            <input
                                id="pay-amount"
                                type="number"
                                min="1"
                                max={balanceDue}
                                step="0.01"
                                value={form.amount}
                                onChange={set('amount')}
                                placeholder={`Max ${formatCurrency(balanceDue)}`}
                                className="input pl-8"
                                required
                            />
                        </div>
                        {/* quick-fill */}
                        {balanceDue > 0 && (
                            <button
                                type="button"
                                onClick={() => setForm(f => ({ ...f, amount: String(balanceDue) }))}
                                className="mt-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline focus:underline outline-none"
                            >
                                Pay full balance ({formatCurrency(balanceDue)})
                            </button>
                        )}
                    </div>

                    {/* Method selector */}
                    <div>
                        <p className="label">Payment Method</p>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                            {METHODS.map(m => (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => setForm(f => ({ ...f, method: m }))}
                                    className={`py-2 rounded-[var(--radius)] text-xs font-medium transition-all duration-150 border
                                        ${form.method === m
                                            ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                                            : 'border-[rgb(var(--border))] t-secondary hover:border-primary-400 dark:hover:border-primary-500 hover:t-primary'
                                        }`}
                                    style={form.method !== m ? { backgroundColor: 'rgb(var(--surface-raised))' } : {}}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Date */}
                    <div>
                        <label htmlFor="pay-date" className="label">Date</label>
                        <input
                            id="pay-date"
                            type="date"
                            value={form.date}
                            onChange={set('date')}
                            className="input"
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <label htmlFor="pay-notes" className="label">Notes <span className="t-tertiary font-normal">(optional)</span></label>
                        <input
                            id="pay-notes"
                            type="text"
                            value={form.notes}
                            onChange={set('notes')}
                            placeholder="e.g. UPI Ref #123456, customer receipt"
                            className="input"
                        />
                    </div>

                    {/* error */}
                    {error && <p className="error-msg">{error}</p>}

                    {/* actions */}
                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={onClose} className="btn-secondary flex-1">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary flex-1"
                        >
                            {loading
                                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
                                : 'Record Payment'
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
