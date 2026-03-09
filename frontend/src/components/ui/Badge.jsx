import React from 'react';

const VARIANTS = {
    default: 'badge-neutral',
    primary: 'badge-primary',
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    info: 'badge-info',
    /* Order status auto-mapping */
    pending: 'badge-warning',
    confirmed: 'badge-info',
    'in-progress': 'badge-primary',
    ready: 'badge-success',
    delivered: 'badge-neutral',
    cancelled: 'badge-danger',
    normal: 'badge-neutral',
    high: 'badge-warning',
    urgent: 'badge-danger',
};

/**
 * Primitive Badge.
 *
 * @param {{ variant, dot, children }} props
 */
export function Badge({ variant = 'default', dot = false, children, className = '' }) {
    const cls = VARIANTS[variant] ?? VARIANTS[variant?.toLowerCase()] ?? 'badge-neutral';
    return (
        <span className={`badge ${cls} ${className}`}>
            {dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 shrink-0" />}
            {children}
        </span>
    );
}

export default Badge;
