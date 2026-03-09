import React, { useState, useEffect } from 'react';
import { HiOutlineX } from 'react-icons/hi';

const EMPTY = {
    name: '', phone: '', email: '', gender: '',
    address: { street: '', city: '', state: '', pincode: '' },
    notes: '', tags: '',
};

/**
 * @param {{ initial, onSubmit, onCancel, loading }} props
 */
export default function CustomerForm({ initial, onSubmit, onCancel, loading }) {
    const [form, setForm] = useState(initial || EMPTY);

    useEffect(() => { if (initial) setForm({ ...EMPTY, ...initial, tags: initial.tags?.join(', ') || '' }); }, [initial]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('address.')) {
            const key = name.split('.')[1];
            setForm(f => ({ ...f, address: { ...f.address, [key]: value } }));
        } else {
            setForm(f => ({ ...f, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="label">Full Name *</label>
                    <input name="name" value={form.name} onChange={handleChange}
                        className="input" placeholder="Customer name" required />
                </div>
                <div>
                    <label className="label">Phone *</label>
                    <input name="phone" value={form.phone} onChange={handleChange}
                        className="input" placeholder="10-digit mobile" required maxLength={10} />
                </div>
                <div>
                    <label className="label">Email</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange}
                        className="input" placeholder="Optional" />
                </div>
                <div>
                    <label className="label">Gender</label>
                    <select name="gender" value={form.gender} onChange={handleChange} className="input">
                        <option value="">Select</option>
                        <option value="female">Female</option>
                        <option value="male">Male</option>
                        <option value="other">Other</option>
                    </select>
                </div>
            </div>

            {/* Address */}
            <div>
                <p className="text-sm font-medium text-slate-300 mb-2">Address</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input name="address.street" value={form.address.street} onChange={handleChange}
                        className="input sm:col-span-2" placeholder="Street / Area" />
                    <input name="address.city" value={form.address.city} onChange={handleChange}
                        className="input" placeholder="City" />
                    <input name="address.state" value={form.address.state} onChange={handleChange}
                        className="input" placeholder="State" />
                    <input name="address.pincode" value={form.address.pincode} onChange={handleChange}
                        className="input" placeholder="Pincode" maxLength={6} />
                </div>
            </div>

            {/* Tags */}
            <div>
                <label className="label">Tags <span className="text-slate-500 font-normal">(comma-separated)</span></label>
                <input name="tags" value={form.tags} onChange={handleChange}
                    className="input" placeholder="VIP, Wedding, Regular" />
            </div>

            {/* Notes */}
            <div>
                <label className="label">Notes</label>
                <textarea name="notes" value={form.notes} onChange={handleChange}
                    rows={3} className="input resize-none" placeholder="Any special notes…" />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
                <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Saving…' : initial ? 'Update Customer' : 'Add Customer'}
                </button>
            </div>
        </form>
    );
}
