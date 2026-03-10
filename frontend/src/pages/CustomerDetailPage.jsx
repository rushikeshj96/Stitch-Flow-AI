import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlinePencil, HiOutlinePhone, HiOutlineMail, HiOutlineLocationMarker } from 'react-icons/hi';

import { customerService } from '../services/customerService.js';
import { orderService } from '../services/orderService.js';
import { measurementService } from '../services/measurementService.js';
import Badge from '../components/common/Badge.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import Modal from '../components/common/Modal.jsx';
import CustomerForm from '../components/customer/CustomerForm.jsx';
import MeasurementForm from '../components/measurements/MeasurementForm.jsx';
import { formatDate, formatCurrency, getInitials, avatarColor } from '../utils/helpers.js';
import toast from 'react-hot-toast';

export default function CustomerDetailPage() {
    const { id } = useParams();

    const [customer, setCustomer] = useState(null);
    const [orders, setOrders] = useState([]);
    const [measurements, setMeasurements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editOpen, setEditOpen] = useState(false);
    const [mOpen, setMOpen] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);

    const fetchAll = async () => {
        try {
            const [cRes, oRes, mRes] = await Promise.all([
                customerService.getById(id),
                customerService.getOrders(id),
                measurementService.getByCustomer(id),
            ]);
            setCustomer(cRes.data.data.customer);
            setOrders(oRes.data.data.orders || []);
            setMeasurements(mRes.data.data.measurements || []);
        } catch { toast.error('Failed to load customer'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchAll(); }, [id]);

    const handleUpdateCustomer = async (formData) => {
        setSaveLoading(true);
        try {
            await customerService.update(id, formData);
            toast.success('Customer updated!');
            setEditOpen(false);
            fetchAll();
        } finally { setSaveLoading(false); }
    };

    const handleSaveMeasurement = async (mData) => {
        setSaveLoading(true);
        try {
            await measurementService.create({ ...mData, customer: id });
            toast.success('Measurements saved!');
            setMOpen(false);
            fetchAll();
        } finally { setSaveLoading(false); }
    };

    if (loading) return <div className="flex justify-center py-32"><LoadingSpinner size="lg" /></div>;
    if (!customer) return <div className="text-center py-32 text-slate-400">Customer not found</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Back + Edit */}
            <div className="flex items-center justify-between">
                <Link to="/customers" className="btn-ghost gap-2 text-slate-400">
                    <HiOutlineArrowLeft className="w-5 h-5" /> Back to Customers
                </Link>
                <button className="btn-secondary gap-2" onClick={() => setEditOpen(true)}>
                    <HiOutlinePencil className="w-4 h-4" /> Edit
                </button>
            </div>

            {/* Profile Card */}
            <div className="card p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0"
                    style={{ backgroundColor: avatarColor(customer.name) }}>
                    {getInitials(customer.name)}
                </div>
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-display font-bold text-neutral-800 dark:text-white">{customer.name}</h1>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-400">
                        <span className="flex items-center gap-1.5"><HiOutlinePhone className="w-4 h-4" /> {customer.phone}</span>
                        {customer.email && <span className="flex items-center gap-1.5"><HiOutlineMail className="w-4 h-4" /> {customer.email}</span>}
                        {customer.address?.city && (
                            <span className="flex items-center gap-1.5">
                                <HiOutlineLocationMarker className="w-4 h-4" />
                                {[customer.address.city, customer.address.state].filter(Boolean).join(', ')}
                            </span>
                        )}
                    </div>
                    {customer.tags?.length > 0 && (
                        <div className="flex gap-2 mt-2">
                            {customer.tags.map(t => <span key={t} className="badge badge-primary">{t}</span>)}
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-2 gap-4 text-center shrink-0">
                    <div className="card px-5 py-3">
                        <p className="text-2xl font-display font-bold text-neutral-800 dark:text-white">{customer.totalOrders}</p>
                        <p className="text-xs text-slate-400 mt-0.5">Orders</p>
                    </div>
                    <div className="card px-5 py-3">
                        <p className="text-2xl font-display font-bold text-neutral-800 dark:text-white">{formatCurrency(customer.totalSpent)}</p>
                        <p className="text-xs text-slate-400 mt-0.5">Spent</p>
                    </div>
                </div>
            </div>

            {/* Orders + Measurements */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Order History */}
                <div className="card p-5">
                    <h2 className="font-display font-semibold text-neutral-700 dark:text-white mb-4">Order History</h2>
                    {orders.length === 0 ? (
                        <p className="text-slate-500 text-sm text-center py-8">No orders yet</p>
                    ) : (
                        <div className="table-wrapper">
                            <table className="table">
                                <thead><tr>
                                    <th>Order #</th><th>Amount</th><th>Due Date</th><th>Status</th>
                                </tr></thead>
                                <tbody>
                                    {orders.map(o => (
                                        <tr key={o._id}>
                                            <td><Link to={`/orders/${o._id}`} className="text-primary-400 hover:underline">{o.orderNumber}</Link></td>
                                            <td>{formatCurrency(o.totalAmount)}</td>
                                            <td>{formatDate(o.dueDate)}</td>
                                            <td><Badge label={o.status} variant={o.status} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Measurements */}
                <div className="card p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-display font-semibold text-neutral-700 dark:text-white">Measurements</h2>
                        <button className="btn-primary text-xs py-1.5 px-3" onClick={() => setMOpen(true)}>+ Add</button>
                    </div>
                    {measurements.length === 0 ? (
                        <p className="text-slate-500 text-sm text-center py-8">No measurements recorded</p>
                    ) : (
                        <div className="space-y-3">
                            {measurements.map(m => (
                                <div key={m._id} className="card p-4">
                                    <div className="flex items-center justify-between">
                                        <p className="font-medium text-neutral-700 dark:text-white text-sm">{m.label}</p>
                                        <p className="text-xs text-slate-500">{m.unit} · {formatDate(m.createdAt)}</p>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                                        {[['Chest', m.chest], ['Waist', m.waist], ['Hips', m.hips],
                                        ['Shoulder', m.shoulder], ['Length', m.length], ['Sleeve', m.sleeveLength]]
                                            .filter(([, v]) => v).map(([lbl, val]) => (
                                                <div key={lbl} className="bg-neutral-100 dark:bg-white/5 rounded-lg p-2 text-center">
                                                    <p className="text-slate-400">{lbl}</p>
                                                    <p className="text-neutral-800 dark:text-white font-medium">{val}″</p>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Customer" size="lg">
                <CustomerForm initial={customer} onSubmit={handleUpdateCustomer}
                    onCancel={() => setEditOpen(false)} loading={saveLoading} />
            </Modal>

            {/* Measurement Modal */}
            <Modal isOpen={mOpen} onClose={() => setMOpen(false)} title="Add Measurements" size="lg">
                <MeasurementForm onSubmit={handleSaveMeasurement} onCancel={() => setMOpen(false)} loading={saveLoading} />
            </Modal>
        </div>
    );
}
