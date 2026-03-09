import React from 'react';

/**
 * Skeleton shimmer block.
 *
 * @param {{ className, rounded }} props
 */
export function Skeleton({ className = '', rounded = 'rounded-[var(--radius)]' }) {
    return <div className={`skeleton ${rounded} ${className}`} aria-hidden="true" />;
}

/**
 * Pre-built skeleton for a stat card.
 */
export function StatCardSkeleton() {
    return (
        <div className="card p-5 space-y-3">
            <div className="flex items-center justify-between">
                <Skeleton className="w-10 h-10" rounded="rounded-xl" />
                <Skeleton className="w-14 h-4" />
            </div>
            <Skeleton className="w-24 h-8" />
            <Skeleton className="w-32 h-3" />
        </div>
    );
}

/**
 * Pre-built skeleton for a table row.
 */
export function TableRowSkeleton({ cols = 5 }) {
    return (
        <tr>
            {Array.from({ length: cols }).map((_, i) => (
                <td key={i} className="px-4 py-3.5 border-b border-neutral-100 dark:border-white/[0.04]">
                    <Skeleton className={`h-4 ${i === 0 ? 'w-28' : 'w-20'}`} />
                </td>
            ))}
        </tr>
    );
}

export default Skeleton;
