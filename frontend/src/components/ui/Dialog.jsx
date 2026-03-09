import React from 'react';
import { createPortal } from 'react-dom';
import { HiOutlineX } from 'react-icons/hi';
import { Button } from './Button.jsx';

/**
 * Accessible Modal / Dialog.
 *
 * @param {{ open, onClose, title, description, size, footer, children }} props
 */
export function Dialog({ open, onClose, title, description, size = 'md', footer, children }) {
    const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl', full: 'max-w-full' };

    React.useEffect(() => {
        if (!open) return;
        const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
    }, [open, onClose]);

    if (!open) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Panel */}
            <div className={`relative w-full ${widths[size]} card animate-slide-up
                       flex flex-col max-h-[95dvh] sm:max-h-[85dvh]
                       rounded-b-none sm:rounded-[var(--radius-xl)] shadow-2xl`}>

                {/* Header */}
                <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-neutral-100 dark:border-white/5 shrink-0">
                    <div>
                        {title && <h2 className="text-base font-display font-semibold text-neutral-900 dark:text-white">{title}</h2>}
                        {description && <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">{description}</p>}
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0 -mr-2 -mt-1">
                        <HiOutlineX className="w-4 h-4" />
                    </Button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

                {/* Footer */}
                {footer && (
                    <div className="px-6 py-4 border-t border-neutral-100 dark:border-white/5 flex justify-end gap-3 shrink-0">
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}

export default Dialog;
