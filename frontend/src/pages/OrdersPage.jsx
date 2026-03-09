import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlinePlus, HiOutlineSearch, HiOutlineFilter } from 'react-icons/hi';

import { orderService } from '../services/orderService.js';
import OrderTable from '../components/orders/OrderTable.jsx';
import OrderForm from '../components/orders/OrderForm.jsx';
import Modal from '../components/common/Modal.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import { usePagination } from '../hooks/usePagination.js';
import toast from 'react-hot-toast';

const STATUSES = ['', 'pending', 'confirmed', 'in-progress', 'ready', 'delivered', 'cancelled'];

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formOpen, setFormOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [statusFilter, setStatusFilter] = useState('');
    const [saveLoading, setSaveLoading] = useState(false);
    const [delLoading, setDelLoading] = useState(false);

    const { page, total, setTotal, nextPage, prevPage, totalPages } = usePagination(10);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, ...(statusFilter && { status: statusFilter }) };
            const { data } = await orderService.getAll(params);
            setOrders(data.data.orders);
            setTotal(data.data.pagination.total);
        } catch { /**/ }
        finally { setLoading(false); }
    }, [page, statusFilter]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const handleCreate = async (formData) => {
        setSaveLoading(true);
        try {
            await orderService.create(formData);
            toast.success('Order created!');
            setFormOpen(false);
            fetchOrders();
        } catch (err) { toast.error(err?.message || 'Failed to create order'); }
        finally { setSaveLoading(false); }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await orderService.updateStatus(orderId, newStatus);
            toast.success(`Order marked as ${newStatus}`);
            fetchOrders();
        } catch { toast.error('Status update failed'); }
    };

    const handleDelete = async () => {
        setDelLoading(true);
        try {
            await orderService.delete(deleteTarget._id);
            toast.success('Order deleted');
            setDeleteTarget(null);
            fetchOrders();
        } finally { setDelLoading(false); }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-display font-bold text-white">Orders</h1>
                    <p className="text-slate-400 text-sm">{total} total orders</p>
                </div>
                <button id="add-order-btn" className="btn-primary" onClick={() => setFormOpen(true)}>
                    <HiOutlinePlus className="w-5 h-5" /> New Order
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                {STATUSES.map(s => (
                    <button key={s || 'all'}
                        onClick={() => setStatusFilter(s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                    ${statusFilter === s
                                ? 'bg-primary-500/30 text-primary-300 border border-primary-500/40'
                                : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                            }`}>
                        {s || 'All'}
                    </button>
                ))}
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
            ) : orders.length === 0 ? (
                <EmptyState icon="🧵" title="No orders yet"
                    description="Create your first order for a customer and start tracking."
                    action={() => setFormOpen(true)} actionLabel="Create Order" />
            ) : (
                <>
                    <OrderTable
                        orders={orders}
                        onStatusChange={handleStatusChange}
                        onDelete={setDeleteTarget}
                    />
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-3 pt-2">
                            <button className="btn-secondary px-4" onClick={prevPage} disabled={page === 1}>← Prev</button>
                            <span className="text-slate-400 text-sm">Page {page} of {totalPages}</span>
                            <button className="btn-secondary px-4" onClick={nextPage} disabled={page === totalPages}>Next →</button>
                        </div>
                    )}
                </>
            )}

            {/* New Order Modal */}
            <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title="Create New Order" size="xl">
                <OrderForm onSubmit={handleCreate} onCancel={() => setFormOpen(false)} loading={saveLoading} />
            </Modal>

            {/* Delete Confirm */}
            <ConfirmDialog
                isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete} loading={delLoading}
                title={`Delete order ${deleteTarget?.orderNumber}?`}
                message="This order will be permanently deleted."
                confirmLabel="Delete Order"
            />
        </div>
    );
}
