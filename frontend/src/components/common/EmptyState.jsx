import React from 'react';

/**
 * @param {{ icon, title, description, action, actionLabel }} props
 */
export default function EmptyState({ icon = '📭', title = 'Nothing here yet', description, action, actionLabel }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="text-6xl mb-4 select-none">{icon}</div>
            <h3 className="text-lg font-display font-semibold text-white">{title}</h3>
            {description && <p className="text-slate-400 text-sm mt-2 max-w-sm">{description}</p>}
            {action && (
                <button onClick={action} className="btn-primary mt-6">
                    {actionLabel || 'Get Started'}
                </button>
            )}
        </div>
    );
}
