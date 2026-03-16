import React from 'react';

/**
 * PaymentStatusBadge — uses the project's native .badge-* CSS classes
 * exactly as Badge.jsx does, extended for the 4 payment states.
 *
 * @param {{ status: 'paid'|'partial'|'pending'|'overdue', size?: 'sm'|'md'|'lg' }} props
 */

const STATUS_MAP = {
    paid: { cls: 'badge-success', dot: 'bg-emerald-500', label: 'Paid' },
    partial: { cls: 'badge-warning', dot: 'bg-amber-500', label: 'Partial' },
    pending: { cls: 'badge-warning', dot: 'bg-amber-400', label: 'Pending' },
    overdue: { cls: 'badge-danger', dot: 'bg-red-500', label: 'Overdue' },
};

const SIZE_PAD = {
    sm: '',                  // default badge padding (px-2.5 py-0.5 text-xs from .badge)
    md: 'px-3 py-1 text-sm',
    lg: 'px-3.5 py-1.5 text-sm',
};

export default function PaymentStatusBadge({ status = 'pending', size = 'sm' }) {
    const cfg = STATUS_MAP[status] || STATUS_MAP.pending;
    // size='sm' → rely entirely on .badge built-in sizing
    // size='md'|'lg' → override with larger pad
    const sizeOverride = size !== 'sm' ? SIZE_PAD[size] : '';

    return (
        <span className={`${cfg.cls} ${sizeOverride} inline-flex items-center gap-1.5`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
}
