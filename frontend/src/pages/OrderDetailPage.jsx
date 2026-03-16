import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlinePencil, HiOutlineClock, HiOutlinePlus, HiOutlineCheckCircle } from 'react-icons/hi';
import { orderService } from '../services/orderService.js';
import Badge from '../components/common/Badge.jsx';
import Modal from '../components/common/Modal.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ReceiptActions from '../components/orders/ReceiptActions.jsx';
import PaymentModal from '../components/payments/PaymentModal.jsx';
import PaymentHistoryTable from '../components/payments/PaymentHistoryTable.jsx';
import PaymentStatusBadge from '../components/payments/PaymentStatusBadge.jsx';
import PaymentReminderButton from '../components/payments/PaymentReminderButton.jsx';
import { formatDate, formatCurrency, getInitials, avatarColor } from '../utils/helpers.js';
import toast from 'react-hot-toast';

const STATUSES = ['pending', 'confirmed', 'in-progress', 'ready', 'delivered', 'cancelled'];

export default function OrderDetailPage() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statusOpen, setStatusOpen] = useState(false);
    const [paymentOpen, setPaymentOpen] = useState(false);

    const fetchOrder = async () => {
        try {
            const { data } = await orderService.getById(id);
            setOrder(data.data.order);
        } catch { toast.error('Order not found'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchOrder(); }, [id]);

    const handleStatus = async (status) => {
        try {
            await orderService.updateStatus(id, status);
            toast.success(`Status updated to ${status}`);
            setStatusOpen(false);
            fetchOrder();
        } catch { toast.error('Update failed'); }
    };

    if (loading) return <div className="flex justify-center py-32"><LoadingSpinner size="lg" /></div>;
    if (!order) return <div className="text-center py-32 text-slate-400">Order not found</div>;

    const pastDue = new Date(order.dueDate) < new Date() && order.status !== 'delivered';

    return (
        <div className="space-y-6 animate-fade-in">
            {/* ── Top Section: Actions ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-transparent">
                <Link to="/orders" className="btn-ghost gap-2 text-slate-400 px-0 hover:bg-transparent">
                    <HiOutlineArrowLeft className="w-5 h-5" /> Back to Orders
                </Link>
                <button className="btn-secondary gap-2 w-full sm:w-auto" onClick={() => setStatusOpen(true)}>
                    <HiOutlinePencil className="w-4 h-4" /> Update Status
                </button>
            </div>

            {/* ── Top Section: Order Summary ── */}
            <div className="card p-6 flex flex-col sm:flex-row sm:items-center gap-5">
                <div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-2xl font-display font-bold text-neutral-700 dark:text-neutral-200">{order.orderNumber}</h1>
                        <Badge label={order.status} variant={order.status} />
                        <Badge label={order.priority} variant={order.priority === 'urgent' ? 'danger' : order.priority === 'high' ? 'warning' : 'info'} />
                    </div>
                    <p className="text-slate-400 text-sm mt-1">Created {formatDate(order.createdAt, 'long')}</p>
                </div>
                <div className="sm:ml-auto flex gap-4">
                    <div className="text-right">
                        <p className="text-sm text-slate-400">Total</p>
                        <p className="text-xl font-display font-bold text-neutral-700 dark:text-neutral-200">{formatCurrency(order.totalAmount)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-slate-400">Balance Due</p>
                        <p className={`text-xl font-display font-bold ${order.balanceDue > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {formatCurrency(order.balanceDue)}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Middle Section: Info & Details ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Side: Customer, Delivery, Notes */}
                <div className="space-y-6 lg:col-span-1">
                    {/* Customer */}
                    <div className="card p-5">
                        <h2 className="font-display font-semibold text-neutral-700 dark:text-neutral-200 mb-4">Customer Information</h2>
                        {order.customer ? (
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                                    style={{ backgroundColor: avatarColor(order.customer.name) }}>
                                    {getInitials(order.customer.name)}
                                </div>
                                <div>
                                    <Link to={`/customers/${order.customer._id}`}
                                        className="text-primary-400 hover:underline font-medium text-sm">
                                        {order.customer.name}
                                    </Link>
                                    <p className="text-xs text-slate-500">{order.customer.phone}</p>
                                </div>
                            </div>
                        ) : <p className="text-slate-500 text-sm">—</p>}
                    </div>

                    {/* Due Date / Delivery */}
                    <div className="card p-5">
                        <h2 className="font-display font-semibold text-neutral-700 dark:text-neutral-200 mb-3">Delivery Information</h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Due Date</span>
                                <span className={pastDue ? 'text-red-400 font-medium' : 'text-slate-200'}>
                                    {formatDate(order.dueDate, 'long')} {pastDue && '⚠️'}
                                </span>
                            </div>
                            {order.deliveredDate && (
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Delivered</span>
                                    <span className="text-emerald-400">{formatDate(order.deliveredDate, 'long')}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Notes */}
                    {order.notes && (
                        <div className="card p-5">
                            <h2 className="font-display font-semibold text-neutral-700 dark:text-neutral-200 mb-2">Notes</h2>
                            <p className="text-slate-400 text-sm">{order.notes}</p>
                        </div>
                    )}
                </div>

                {/* Right Side: Items & Status Timeline */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Items */}
                    <div className="card p-5">
                        <h2 className="font-display font-semibold text-neutral-700 dark:text-neutral-200 mb-4">Order Details</h2>
                        <div className="table-wrapper">
                            <table className="table">
                                <thead><tr><th>Garment</th><th>Fabric</th><th>Qty</th><th>Unit Price</th><th>Subtotal</th></tr></thead>
                                <tbody>
                                    {order.items.map((item, i) => (
                                        <tr key={i}>
                                            <td>
                                                <p className="font-medium text-slate-700 dark:text-slate-200">{item.garmentType}</p>
                                                {item.description && <p className="text-xs text-slate-500">{item.description}</p>}
                                            </td>
                                            <td className="text-neutral-500 dark:text-slate-400">{item.fabric || '—'}</td>
                                            <td className="text-neutral-600 dark:text-slate-300">{item.quantity}</td>
                                            <td className="text-neutral-600 dark:text-slate-300">{formatCurrency(item.unitPrice)}</td>
                                            <td className="text-neutral-800 dark:text-white font-medium">{formatCurrency(item.quantity * item.unitPrice)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Status History */}
                    {order.statusHistory?.length > 0 && (
                        <div className="card p-5">
                            <h2 className="font-display font-semibold text-neutral-700 dark:text-neutral-200 mb-4 flex items-center gap-2">
                                <HiOutlineClock className="w-5 h-5 text-primary-400" /> Status Timeline
                            </h2>
                            <div className="space-y-3">
                                {[...order.statusHistory].reverse().map((h, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-primary-500 shrink-0" />
                                        <Badge label={h.status} variant={h.status} />
                                        <span className="text-xs text-slate-500 ml-auto">{formatDate(h.changedAt, 'relative')}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Bottom Section: Payment & Receipt ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Payment Information */}
                <div className="space-y-6">
                    {/* Payment Summary */}
                    <div className="card p-5">
                        <h2 className="font-display font-semibold text-neutral-700 dark:text-neutral-200 mb-3">Payment Summary</h2>
                        <div className="space-y-2 text-sm">
                            {[
                                ['Subtotal', formatCurrency(order.subtotal || order.totalAmount), 'text-slate-300'],
                                ...(order.gstAmount > 0 ? [['GST (' + (order.gstRate * 100).toFixed(0) + '%)', formatCurrency(order.gstAmount), 'text-slate-400']] : []),
                                ['Total Amount', formatCurrency(order.totalAmount), 'text-white'],
                                ['Advance Paid', formatCurrency(order.advancePaid), 'text-emerald-400'],
                                ['Balance Due', formatCurrency(order.balanceDue), order.balanceDue > 0 ? 'text-amber-400' : 'text-emerald-400'],
                            ].map(([label, value, cls]) => (
                                <div key={label} className="flex justify-between">
                                    <span className="text-slate-400">{label}</span>
                                    {/* BUG-05 fix: text-white replaced with theme-aware class */}
                                    <span className={(cls === 'text-white' ? 'text-neutral-800 dark:text-white' : cls) + ' font-medium'}>{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Payment Tracking Panel */}
                    <div className="card p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-display font-semibold t-primary">Payment Tracking Ledger</h2>
                            <PaymentStatusBadge status={order.paymentStatus || 'pending'} size="md" />
                        </div>

                        {/* 3-column summary strip */}
                        <div
                            className="grid grid-cols-3 divide-x rounded-[var(--radius)] overflow-hidden"
                            style={{ backgroundColor: 'rgb(var(--surface-raised))', borderColor: 'rgb(var(--border))', border: '1px solid rgb(var(--border))' }}
                        >
                            {[
                                { label: 'Total', value: order.totalAmount, accent: false },
                                { label: 'Paid', value: order.paidAmount || 0, accent: false },
                                { label: 'Balance', value: order.balanceDue || 0, accent: order.balanceDue > 0 },
                            ].map(({ label, value, accent }) => (
                                <div key={label} className="py-3 text-center" style={{ borderColor: 'rgb(var(--border))' }}>
                                    <p className="text-[11px] font-medium t-tertiary uppercase tracking-wide">{label}</p>
                                    <p className={`text-sm font-display font-bold mt-0.5 ${accent ? 'text-red-600 dark:text-red-400' : 't-primary'}`}>
                                        {formatCurrency(value)}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* full payment ledger */}
                        <PaymentHistoryTable
                            orderId={id}
                            payments={order.paymentHistory || []}
                            onRefresh={fetchOrder}
                        />

                        {/* action buttons */}
                        {order.paymentStatus !== 'paid' ? (
                            <div className="flex flex-col sm:flex-row gap-2 pt-1">
                                <button
                                    onClick={() => setPaymentOpen(true)}
                                    className="btn-primary flex-1 gap-2 justify-center"
                                >
                                    <HiOutlinePlus className="w-4 h-4" />
                                    Add Payment
                                </button>
                                <PaymentReminderButton
                                    orderId={id}
                                    order={order}
                                    onSent={fetchOrder}
                                />
                            </div>
                        ) : (
                            <p className="flex items-center justify-center gap-2 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                <HiOutlineCheckCircle className="w-5 h-5" />
                                This order is fully paid
                            </p>
                        )}
                    </div>
                </div>

                {/* Receipt Information */}
                <div>
                    <ReceiptActions orderId={id} order={order} onRefresh={fetchOrder} />
                </div>
            </div>

            {/* Status Update Modal */}
            <Modal isOpen={statusOpen} onClose={() => setStatusOpen(false)} title="Update Order Status" size="sm">
                <div className="space-y-2 py-2">
                    {STATUSES.map(s => (
                        <button key={s} onClick={() => handleStatus(s)}
                            disabled={order.status === s}
                            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all
                      ${order.status === s
                                    ? 'bg-primary-500/30 text-primary-300 border border-primary-500/40 opacity-60 cursor-not-allowed'
                                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-transparent'
                                }`}>
                            <Badge label={s} variant={s} />
                            {order.status === s && <span className="ml-2 text-xs text-primary-400">← current</span>}
                        </button>
                    ))}
                </div>
            </Modal>

            {/* Payment Modal */}
            <PaymentModal
                isOpen={paymentOpen}
                onClose={() => setPaymentOpen(false)}
                order={order}
                onSuccess={() => { fetchOrder(); }}
            />
        </div>
    );
}
