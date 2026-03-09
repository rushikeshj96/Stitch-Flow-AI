import React from 'react';
import { HiOutlineInbox } from 'react-icons/hi';
import { Button } from './Button.jsx';

/**
 * Empty state illustration + call-to-action.
 *
 * @param {{ icon, emoji, title, description, action, actionLabel }} props
 */
export function EmptyState({ icon: Icon, emoji, title, description, action, actionLabel = 'Get Started', className = '' }) {
    return (
        <div className={`flex flex-col items-center justify-center text-center py-20 px-6 ${className}`}>
            {emoji ? (
                <div className="text-5xl mb-5 select-none">{emoji}</div>
            ) : (
                <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-white/5 flex items-center justify-center mb-5">
                    {Icon
                        ? <Icon className="w-8 h-8 text-neutral-400" />
                        : <HiOutlineInbox className="w-8 h-8 text-neutral-400" />
                    }
                </div>
            )}

            <h3 className="text-base font-display font-semibold text-neutral-900 dark:text-white">
                {title}
            </h3>

            {description && (
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1.5 max-w-sm text-balance">
                    {description}
                </p>
            )}

            {action && (
                <Button variant="default" className="mt-6" onClick={action}>
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}

export default EmptyState;
