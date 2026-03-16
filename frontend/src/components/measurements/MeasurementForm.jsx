import React, { useState } from 'react';
import MeasurementImageUpload from './MeasurementImageUpload.jsx';

const FIELDS_UPPER = [
    { name: 'chest', label: 'Chest' },
    { name: 'waist', label: 'Waist' },
    { name: 'hips', label: 'Hips' },
    { name: 'shoulder', label: 'Shoulder' },
    { name: 'sleeveLength', label: 'Sleeve Length' },
    { name: 'armhole', label: 'Armhole' },
];

const FIELDS_LOWER = [
    { name: 'length', label: 'Length' },
    { name: 'inseam', label: 'Inseam' },
    { name: 'thigh', label: 'Thigh' },
    { name: 'knee', label: 'Knee' },
    { name: 'ankle', label: 'Ankle' },
];

const FIELDS_SPECIAL = [
    { name: 'kurta_length', label: 'Kurta Length' },
    { name: 'salwar_length', label: 'Salwar Length' },
    { name: 'neck', label: 'Neck' },
];

const EMPTY = {
    label: 'Standard Measurements', unit: 'inch',
    chest: '', waist: '', hips: '', shoulder: '', sleeveLength: '', armhole: '',
    length: '', inseam: '', thigh: '', knee: '', ankle: '',
    kurta_length: '', salwar_length: '', neck: '', notes: '',
};

/**
 * @param {{ initial, onSubmit, onCancel, loading }} props
 */
export default function MeasurementForm({ initial, onSubmit, onCancel, loading }) {
    const [form, setForm] = useState(initial || EMPTY);

    const handleChange = (e) => {
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(form);
    };

    const MeasureInput = ({ name, label }) => (
        <div>
            <label className="label text-xs">{label}</label>
            <input name={name} type="text"
                value={form[name]} onChange={handleChange}
                className="input text-sm py-2" placeholder="0" />
        </div>
    );

    const handleAnalyzed = (data) => {
        setForm(f => ({ 
            ...f, 
            ...data, 
            label: 'AI Estimated Measurements', 
            measurementSource: 'AI_IMAGE' // marks this as AI generated
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <MeasurementImageUpload onAnalyzed={handleAnalyzed} />

            {/* Label & Unit */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="label">Profile Label</label>
                    <input name="label" value={form.label} onChange={handleChange}
                        className="input" placeholder="e.g. Blouse, Lehenga" />
                </div>
                <div>
                    <label className="label">Unit</label>
                    <select name="unit" value={form.unit} onChange={handleChange} className="input">
                        <option value="inch">Inch (″)</option>
                        <option value="cm">Centimeter (cm)</option>
                    </select>
                </div>
            </div>

            {/* Upper Body */}
            <div>
                <p className="text-xs uppercase tracking-wider text-slate-500 mb-3 font-medium">Upper Body</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {FIELDS_UPPER.map(f => <MeasureInput key={f.name} {...f} />)}
                </div>
            </div>

            {/* Lower Body */}
            <div>
                <p className="text-xs uppercase tracking-wider text-slate-500 mb-3 font-medium">Lower Body</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {FIELDS_LOWER.map(f => <MeasureInput key={f.name} {...f} />)}
                </div>
            </div>

            {/* Ethnic Wear */}
            <div>
                <p className="text-xs uppercase tracking-wider text-slate-500 mb-3 font-medium">Ethnic Wear</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {FIELDS_SPECIAL.map(f => <MeasureInput key={f.name} {...f} />)}
                </div>
            </div>

            {/* Notes */}
            <div>
                <label className="label">Notes</label>
                <textarea name="notes" rows={2} value={form.notes} onChange={handleChange}
                    className="input resize-none" placeholder="Any special fitting notes…" />
            </div>

            <div className="flex justify-end gap-3 pt-1">
                <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Saving…' : 'Save Measurements'}
                </button>
            </div>
        </form>
    );
}
