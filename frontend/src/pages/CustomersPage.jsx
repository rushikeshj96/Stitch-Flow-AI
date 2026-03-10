import React, { useEffect, useState, useCallback } from 'react';
import { HiOutlinePlus, HiOutlineSearch, HiOutlineRefresh } from 'react-icons/hi';

import { customerService } from '../services/customerService.js';
import CustomerCard from '../components/customer/CustomerCard.jsx';
import CustomerForm from '../components/customer/CustomerForm.jsx';
import Modal from '../components/common/Modal.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import { usePagination } from '../hooks/usePagination.js';
import toast from 'react-hot-toast';

export default function CustomersPage() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [formOpen, setFormOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [delLoading, setDelLoading] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);

    const { page, total, setTotal, nextPage, prevPage, totalPages } = usePagination(12);

    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await customerService.getAll({ page, q: search || undefined });
            setCustomers(data.data.customers);
            setTotal(data.data.pagination.total);
        } catch { /* interceptor handles */ }
        finally { setLoading(false); }
    }, [page, search]);

    useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

    const handleSave = async (formData) => {
        setSaveLoading(true);
        try {
            if (editTarget) {
                await customerService.update(editTarget._id, formData);
                toast.success('Customer updated!');
            } else {
                await customerService.create(formData);
                toast.success('Customer added!');
            }
            setFormOpen(false);
            setEditTarget(null);
            fetchCustomers();
        } catch (err) { toast.error(err?.message || 'Save failed'); }
        finally { setSaveLoading(false); }
    };

    const handleDelete = async () => {
        setDelLoading(true);
        try {
            await customerService.delete(deleteTarget._id);
            toast.success('Customer removed');
            setDeleteTarget(null);
            fetchCustomers();
        } catch { toast.error('Delete failed'); }
        finally { setDelLoading(false); }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="page-title">Customers</h1>
                    <p className="text-slate-400 text-sm">{total} total customers</p>
                </div>
                <button id="add-customer-btn" className="btn-primary"
                    onClick={() => { setEditTarget(null); setFormOpen(true); }}>
                    <HiOutlinePlus className="w-5 h-5" /> Add Customer
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input id="customer-search"
                    value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name, phone, email…"
                    className="input pl-10" />
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <LoadingSpinner size="lg" />
                </div>
            ) : customers.length === 0 ? (
                <EmptyState
                    icon="👥" title="No customers yet"
                    description="Add your first customer to start managing orders and measurements."
                    action={() => setFormOpen(true)} actionLabel="Add First Customer"
                />
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {customers.map(c => (
                            <CustomerCard
                                key={c._id} customer={c}
                                onEdit={cust => { setEditTarget(cust); setFormOpen(true); }}
                                onDelete={setDeleteTarget}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-3 pt-4">
                            <button className="btn-secondary px-4" onClick={prevPage} disabled={page === 1}>← Prev</button>
                            <span className="text-slate-400 text-sm">Page {page} of {totalPages}</span>
                            <button className="btn-secondary px-4" onClick={nextPage} disabled={page === totalPages}>Next →</button>
                        </div>
                    )}
                </>
            )}

            {/* Add/Edit Modal */}
            <Modal
                isOpen={formOpen}
                onClose={() => { setFormOpen(false); setEditTarget(null); }}
                title={editTarget ? 'Edit Customer' : 'Add New Customer'}
                size="lg"
            >
                <CustomerForm
                    initial={editTarget}
                    onSubmit={handleSave}
                    onCancel={() => { setFormOpen(false); setEditTarget(null); }}
                    loading={saveLoading}
                />
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                loading={delLoading}
                title={`Delete ${deleteTarget?.name}?`}
                message="This customer and their data will be deactivated. Orders will be preserved."
                confirmLabel="Delete"
            />
        </div>
    );
}
