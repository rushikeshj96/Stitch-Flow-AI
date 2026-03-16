import React, { useEffect, useState } from 'react';
import { adminBookingService } from '../../services/bookingService.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencilAlt, HiOutlineTrash } from 'react-icons/hi';
import Modal from '../../components/common/Modal.jsx';

export default function AdminServicesPage() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    
    // Form state
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '', description: '', category: 'Women', 
        priceMin: '', priceMax: '', estimatedTime: '', isActive: true
    });
    const [saving, setSaving] = useState(false);

    const fetchServices = () => {
        setLoading(true);
        adminBookingService.getServices()
            .then(res => setServices(res.data.data))
            .catch(() => toast.error('Failed to load services'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchServices(); }, []);

    const handleOpenForm = (service = null) => {
        if (service) {
            setEditingId(service._id);
            setFormData({
                name: service.name,
                description: service.description,
                category: service.category,
                priceMin: service.priceRange?.min || '',
                priceMax: service.priceRange?.max || '',
                estimatedTime: service.estimatedTime,
                isActive: service.isActive
            });
        } else {
            setEditingId(null);
            setFormData({ name: '', description: '', category: 'Women', priceMin: '', priceMax: '', estimatedTime: '', isActive: true });
        }
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        
        const payload = {
            ...formData,
            priceRange: { 
                min: Number(formData.priceMin), 
                max: formData.priceMax ? Number(formData.priceMax) : undefined 
            }
        };

        try {
            if (editingId) {
                await adminBookingService.updateService(editingId, payload);
                toast.success('Service updated');
            } else {
                await adminBookingService.createService(payload);
                toast.success('Service created');
            }
            setModalOpen(false);
            fetchServices();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save service');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this service permanently?')) return;
        try {
            await adminBookingService.deleteService(id);
            toast.success('Service deleted');
            fetchServices();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete service');
        }
    };

    if (loading && services.length === 0) return <div className="py-32 flex justify-center"><LoadingSpinner size="lg" /></div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="page-title">Service Catalog</h1>
                    <p className="text-slate-400 text-sm mt-1">Manage public tailoring services and pricing</p>
                </div>
                <button className="btn-primary" onClick={() => handleOpenForm()}>
                    <HiOutlinePlus className="w-5 h-5" /> New Service
                </button>
            </div>

            {services.length === 0 ? (
                <EmptyState icon="📋" title="No Services Defined" description="Add your first tailoring service to display it on the public booking website." action={() => handleOpenForm()} actionLabel="Add Service" />
            ) : (
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 font-medium border-b border-neutral-200 dark:border-neutral-800">
                            <tr>
                                <th className="px-6 py-4">Service Name</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Price Range (₹)</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                            {services.map(s => (
                                <tr key={s._id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-neutral-900 dark:text-white">{s.name}</td>
                                    <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400">{s.category}</td>
                                    <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400">
                                        {s.priceRange.min} {s.priceRange.max && `- ${s.priceRange.max}`}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${s.isActive ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'}`}>
                                            {s.isActive ? 'Active' : 'Hidden'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-3">
                                        <button onClick={() => handleOpenForm(s)} className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors">
                                            <HiOutlinePencilAlt className="w-5 h-5 inline" />
                                        </button>
                                        <button onClick={() => handleDelete(s._id)} className="text-red-500 hover:text-red-700 transition-colors">
                                            <HiOutlineTrash className="w-5 h-5 inline" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Service' : 'Add New Service'} size="lg">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Service Name *</label>
                            <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input" />
                        </div>
                        <div>
                            <label className="label">Category *</label>
                            <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="input">
                                <option>Women</option><option>Men</option><option>Alteration</option><option>Custom Stitching</option><option>Bridal</option>
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label className="label">Description *</label>
                        <textarea required rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="input resize-none" />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="label">Min Price (₹) *</label>
                            <input type="number" required value={formData.priceMin} onChange={e => setFormData({...formData, priceMin: e.target.value})} className="input" />
                        </div>
                        <div>
                            <label className="label">Max Price (₹)</label>
                            <input type="number" value={formData.priceMax} onChange={e => setFormData({...formData, priceMax: e.target.value})} className="input" placeholder="Optional" />
                        </div>
                        <div>
                            <label className="label">Est. Time *</label>
                            <input required value={formData.estimatedTime} onChange={e => setFormData({...formData, estimatedTime: e.target.value})} className="input" placeholder="e.g. 5-7 Days" />
                        </div>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer pt-2">
                        <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4 text-primary-600 rounded" />
                        <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">Active (Visible to public)</span>
                    </label>

                    <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                        <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Service'}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
