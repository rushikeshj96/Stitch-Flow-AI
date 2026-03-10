import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HiOutlineX } from 'react-icons/hi';

/**
 * @param {{ isOpen, onClose, title, children, size, footer }} props
 */
export default function Modal({ isOpen, onClose, title, children, size = 'md', footer }) {
    const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

    useEffect(() => {
        if (!isOpen) return;
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handler);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                onClick={onClose} />

            {/* Panel */}
            <div className={`relative w-full ${sizes[size]} card p-0 animate-slide-up
                       flex flex-col max-h-[90vh] shadow-2xl`}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                    <h2 className="text-lg font-display font-semibold text-dark dark:text-white">{title}</h2>
                    <button id="modal-close" onClick={onClose}
                        className="btn-ghost p-1.5 text-slate-400 hover:text-white rounded-lg">
                        <HiOutlineX className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

                {/* Footer */}
                {footer && (
                    <div className="px-6 py-4 border-t border-white/5 flex justify-end gap-3">
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}
