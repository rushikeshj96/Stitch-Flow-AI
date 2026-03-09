import React from 'react';

export default function LoadingSpinner({ fullScreen = false, size = 'md' }) {
    const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };

    const spinner = (
        <div className={`${sizes[size]} rounded-full border-2 border-primary-700
                     border-t-primary-400 animate-spin`} />
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-surface flex flex-col items-center justify-center z-50 gap-4">
                <div className="w-12 h-12 rounded-full border-2 border-primary-700
                        border-t-primary-400 animate-spin" />
                <p className="text-slate-400 text-sm animate-pulse">Loading StitchFlow AI…</p>
            </div>
        );
    }

    return spinner;
}
