import React from 'react';

/**
 * Spinner — accessible loading indicator.
 *
 * @param {{ size, className, label }} props
 */
export function Spinner({ size = 'md', className = '', label = 'Loading…' }) {
    const sizes = { xs: 'w-3 h-3 border', sm: 'w-4 h-4 border-2', md: 'w-6 h-6 border-2', lg: 'w-10 h-10 border-[3px]', xl: 'w-14 h-14 border-4' };
    return (
        <span role="status" aria-label={label} className={`inline-block rounded-full animate-spin border-primary-300 border-t-primary-600 dark:border-primary-800 dark:border-t-primary-400 ${sizes[size]} ${className}`} />
    );
}

/**
 * Full-page centred loading overlay.
 */
export function LoadingScreen({ label = 'Loading…' }) {
    return (
        <div className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-4 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-sm">
            <Spinner size="xl" />
            <p className="text-sm text-neutral-500 dark:text-neutral-400 animate-pulse">{label}</p>
        </div>
    );
}

/**
 * Inline section loading state.
 */
export function LoadingState({ label, className = '' }) {
    return (
        <div className={`flex flex-col items-center justify-center py-16 gap-3 ${className}`}>
            <Spinner size="lg" />
            {label && <p className="text-sm text-neutral-400">{label}</p>}
        </div>
    );
}

export default Spinner;
