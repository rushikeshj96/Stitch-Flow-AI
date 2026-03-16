import React, { useEffect, useState } from 'react';
import { measurementService } from '../services/measurementService.js';
import { customerService } from '../services/customerService.js';
import MeasurementForm from '../components/measurements/MeasurementForm.jsx';
import Modal from '../components/common/Modal.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import { formatDate } from '../utils/helpers.js';
import { HiOutlinePlus, HiOutlineUser } from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function MeasurementsPage() {
    const [customers, setCustomers] = useState([]);
    const [selected, setSelected] = useState('');
    const [measurements, setMeasurements] = useState([]);
    const [mLoading, setMLoading] = useState(false);
    const [formOpen, setFormOpen] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);

    useEffect(() => {
        customerService.getAll({ limit: 50 }).then(({ data }) => {
            setCustomers(data.data.customers || []);
        });
    }, []);

    useEffect(() => {
        if (!selected) return;
        setMLoading(true);
        measurementService.getByCustomer(selected)
            .then(({ data }) => setMeasurements(data.data.measurements || []))
            .catch(() => toast.error('Failed to fetch measurements'))
            .finally(() => setMLoading(false));
    }, [selected]);

    const handleSave = async (formData) => {
        setSaveLoading(true);
        try {
            await measurementService.create({ ...formData, customer: selected });
            toast.success('Measurements saved!');
            setFormOpen(false);
            const { data } = await measurementService.getByCustomer(selected);
            setMeasurements(data.data.measurements || []);
        } finally { setSaveLoading(false); }
    };

    const MEASURE_FIELDS = [
        ['Chest', 'chest'], ['Waist', 'waist'], ['Hips', 'hips'],
        ['Shoulder', 'shoulder'], ['Sleeve', 'sleeveLength'], ['Length', 'length'],
        ['Inseam', 'inseam'], ['Neck', 'neck'], ['Kurta L', 'kurta_length'],
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="page-title">Measurements</h1>
                    <p className="text-slate-400 text-sm mt-1">Customer body measurements for garment fitting</p>
                </div>
                <button className="btn-primary" disabled={!selected} onClick={() => setFormOpen(true)}>
                    <HiOutlinePlus className="w-5 h-5" /> Add Measurements
                </button>
            </div>

            {/* Customer selector */}
            <div className="card p-4 flex items-center gap-4">
                <HiOutlineUser className="w-5 h-5 text-primary-400 shrink-0" />
                <select value={selected} onChange={e => setSelected(e.target.value)} className="input flex-1">
                    <option value="">— Select a customer —</option>
                    {customers.map(c => (
                        <option key={c._id} value={c._id}>{c.name} · {c.phone}</option>
                    ))}
                </select>
            </div>

            {/* Measurements grid */}
            {!selected ? (
                <EmptyState icon="📏" title="Select a customer"
                    description="Choose a customer above to view or add their measurements." />
            ) : mLoading ? (
                <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
            ) : measurements.length === 0 ? (
                <EmptyState icon="📏" title="No measurements yet"
                    description="Add the first measurement profile for this customer."
                    action={() => setFormOpen(true)} actionLabel="Add Measurements" />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {measurements.map(m => (
                        <div key={m._id} className="card p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="font-semibold text-neutral-700 dark:text-white flex items-center gap-2">
                                        {m.label}
                                        {m.measurementSource === 'AI_IMAGE' && (
                                            <span className="bg-purple-500/10 text-purple-500 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">AI Generated</span>
                                        )}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5">{m.unit} · {formatDate(m.createdAt)}</p>
                                </div>
                                {m.notes && <p className="text-xs text-slate-500 italic max-w-xs text-right">{m.notes}</p>}
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {MEASURE_FIELDS.filter(([, k]) => m[k]).map(([label, key]) => (
                                    <div key={key} className="bg-neutral-100 dark:bg-white/5 rounded-xl p-3 text-center">
                                        <p className="text-xs text-slate-500">{label}</p>
                                        <p className="text-neutral-800 dark:text-white font-semibold">{m[key]}{m.unit === 'inch' ? '″' : 'cm'}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title="Add Measurements" size="lg">
                <MeasurementForm onSubmit={handleSave} onCancel={() => setFormOpen(false)} loading={saveLoading} />
            </Modal>
        </div>
    );
}
