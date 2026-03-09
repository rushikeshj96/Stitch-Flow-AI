import React from 'react';

const VARIANTS = {
    pending: 'badge-warning',
    confirmed: 'badge-info',
    'in-progress': 'badge-primary',
    ready: 'badge-success',
    delivered: 'bg-slate-500/20 text-slate-400 badge',
    cancelled: 'badge-danger',
    // Generic
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    info: 'badge-info',
    primary: 'badge-primary',
};

export default function Badge({ label, variant }) {
    const cls = VARIANTS[variant] || VARIANTS[label?.toLowerCase()] || 'badge bg-white/10 text-slate-300';
    return <span className={cls}>{label}</span>;
}
