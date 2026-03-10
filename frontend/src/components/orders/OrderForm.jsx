import React, { useState, useEffect } from 'react';
import { HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi';
import { customerService } from '../../services/customerService.js';
import { useSearch } from '../../hooks/useSearch.js';
import toast from 'react-hot-toast';

const EMPTY_ITEM = { garmentType: '', description: '', quantity: 1, unitPrice: '', fabric: '' };

const GARMENT_TYPES = [
    'Salwar Kameez', 'Lehenga', 'Saree Blouse', 'Kurti', 'Anarkali',
    'Sherwani', 'Kurta Pajama', 'Suit', 'Blazer', 'Trousers', 'Shirt', 'Other',
];

export default function OrderForm({ onSubmit, onCancel, loading }) {
    const [customerId, setCustomerId] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [items, setItems] = useState([{ ...EMPTY_ITEM }]);
    const [dueDate, setDueDate] = useState('');
    const [advancePaid, setAdvancePaid] = useState('');
    const [priority, setPriority] = useState('normal');
    const [notes, setNotes] = useState('');

    const { query: cSearch, setQuery: setCSearch, results: customers, loading: cLoading } =
        useSearch(q => customerService.search(q).then(r => r.data.data?.customers ?? []), 300);

    const totalAmount = items.reduce((sum, i) => sum + (i.quantity * (parseFloat(i.unitPrice) || 0)), 0);

    const handleItemChange = (idx, field, value) => {
        setItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it));
    };
    const addItem = () => setItems(prev => [...prev, { ...EMPTY_ITEM }]);
    const removeItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx));

    const handleSubmit = (e) => {
        e.preventDefault();
        // BUG-06 fix: use toast instead of native alert()
        if (!customerId) { toast.error('Please select a customer'); return; }
        // BUG-02 frontend fix: validate advance paid <= total
        if (Number(advancePaid) > totalAmount) {
            toast.error('Advance paid cannot exceed total amount (₹' + totalAmount.toLocaleString('en-IN') + ')');
            return;
        }
        onSubmit({
            customer: customerId,
            items: items.map(it => ({ ...it, quantity: Number(it.quantity), unitPrice: Number(it.unitPrice) })),
            totalAmount,
            advancePaid: Number(advancePaid) || 0,
            dueDate, priority, notes,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Picker */}
            <div className="relative">
                <label className="label">Customer *</label>
                <input
                    value={customerId ? customerName : cSearch}
                    onChange={e => { if (!customerId) { setCSearch(e.target.value); setShowDropdown(true); } }}
                    onClick={() => { if (customerId) { setCustomerId(''); setCustomerName(''); setCSearch(''); } setShowDropdown(true); }}
                    placeholder="Search customer by name or phone…"
                    className="input" required
                    readOnly={!!customerId}
                />
                {customerId && (
                    <button type="button" onClick={() => { setCustomerId(''); setCustomerName(''); }}
                        className="absolute right-3 top-9 text-slate-500 hover:text-white text-sm">✕</button>
                )}
                {showDropdown && !customerId && customers.length > 0 && (
                    // BUG-14 fix: use theme-aware card class instead of dark-only classes
                    <ul className="absolute z-20 top-full mt-1 w-full card rounded-xl shadow-2xl overflow-hidden">
                        {customers.map(c => (
                            <li key={c._id}
                                className="px-4 py-2.5 hover:bg-neutral-100 dark:hover:bg-white/5 cursor-pointer text-sm"
                                onClick={() => { setCustomerId(c._id); setCustomerName(c.name); setShowDropdown(false); }}>
                                <span className="font-medium text-neutral-800 dark:text-slate-200">{c.name}</span>
                                <span className="text-slate-500 ml-2">{c.phone}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Order Items */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <label className="label mb-0">Order Items *</label>
                    <button type="button" onClick={addItem}
                        className="btn-ghost text-xs gap-1 text-primary-400">
                        <HiOutlinePlus className="w-4 h-4" /> Add Item
                    </button>
                </div>
                <div className="space-y-3">
                    {items.map((item, idx) => (
                        <div key={idx} className="card-elevated p-4 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="label text-xs">Garment Type *</label>
                                    <select value={item.garmentType}
                                        onChange={e => handleItemChange(idx, 'garmentType', e.target.value)}
                                        className="input" required>
                                        <option value="">Select garment…</option>
                                        {GARMENT_TYPES.map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="label text-xs">Fabric</label>
                                    <input value={item.fabric}
                                        onChange={e => handleItemChange(idx, 'fabric', e.target.value)}
                                        className="input" placeholder="e.g. Silk, Cotton" />
                                </div>
                                <div>
                                    <label className="label text-xs">Quantity</label>
                                    <input type="number" min="1" value={item.quantity}
                                        onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                                        className="input" />
                                </div>
                                <div>
                                    <label className="label text-xs">Unit Price (₹) *</label>
                                    <input type="number" min="0" value={item.unitPrice}
                                        onChange={e => handleItemChange(idx, 'unitPrice', e.target.value)}
                                        className="input" placeholder="0" required />
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <input value={item.description}
                                    onChange={e => handleItemChange(idx, 'description', e.target.value)}
                                    className="input text-sm flex-1 mr-3" placeholder="Description (optional)" />
                                {items.length > 1 && (
                                    <button type="button" onClick={() => removeItem(idx)}
                                        className="btn-ghost p-2 text-red-400 shrink-0">
                                        <HiOutlineTrash className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Payment & Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                    <label className="label">Total Amount</label>
                    <div className="input bg-surface-card cursor-not-allowed text-white font-semibold">
                        ₹{totalAmount.toLocaleString('en-IN')}
                    </div>
                </div>
                <div>
                    <label className="label">Advance Paid (₹)</label>
                    <input type="number" min="0" value={advancePaid}
                        onChange={e => setAdvancePaid(e.target.value)}
                        className="input" placeholder="0" />
                </div>
                <div>
                    <label className="label">Due Date *</label>
                    <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                        className="input" required min={new Date().toISOString().split('T')[0]} />
                </div>
            </div>

            {/* Priority */}
            <div className="flex gap-3">
                {['normal', 'high', 'urgent'].map(p => (
                    <button key={p} type="button"
                        onClick={() => setPriority(p)}
                        className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all
                    ${priority === p
                                ? p === 'urgent' ? 'bg-red-500/30 border-red-500/50 text-red-300'
                                    : p === 'high' ? 'bg-amber-500/30 border-amber-500/50 text-amber-300'
                                        : 'bg-primary-500/30 border-primary-500/50 text-primary-300'
                                : 'bg-white/5 border-white/5 text-slate-400'
                            }`}>
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                ))}
            </div>

            {/* Notes */}
            <div>
                <label className="label">Notes</label>
                <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)}
                    className="input resize-none" placeholder="Special instructions, design references…" />
            </div>

            {/* Balance Summary */}
            <div className="card-elevated p-4 flex justify-between items-center">
                <div className="text-sm text-slate-400">Balance Due</div>
                <div className="text-lg font-display font-bold text-amber-400">
                    ₹{Math.max(0, totalAmount - (Number(advancePaid) || 0)).toLocaleString('en-IN')}
                </div>
            </div>

            <div className="flex justify-end gap-3">
                <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Creating…' : 'Create Order'}
                </button>
            </div>
        </form>
    );
}
