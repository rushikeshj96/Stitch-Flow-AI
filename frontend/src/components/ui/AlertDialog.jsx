import React from 'react';
import { Dialog } from './Dialog.jsx';
import { Button } from './Button.jsx';
import { HiOutlineExclamationCircle } from 'react-icons/hi';

/**
 * Confirm action dialog — wraps Dialog.
 *
 * @param {{ open, onClose, onConfirm, title, description, confirmLabel, loading, variant }} props
 */
export function AlertDialog({
    open, onClose, onConfirm,
    title = 'Are you sure?',
    description = 'This action cannot be undone.',
    confirmLabel = 'Confirm',
    loading = false,
    variant = 'destructive',
}) {
    return (
        <Dialog open={open} onClose={onClose} size="sm">
            <div className="flex flex-col items-center text-center gap-5 py-3">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0
                         ${variant === 'destructive' ? 'bg-red-50 dark:bg-red-500/15' : 'bg-amber-50 dark:bg-amber-500/15'}`}>
                    <HiOutlineExclamationCircle
                        className={`w-8 h-8 ${variant === 'destructive' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}
                    />
                </div>
                <div>
                    <h3 className="text-base font-display font-semibold text-neutral-900 dark:text-white">{title}</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1.5">{description}</p>
                </div>
                <div className="flex gap-3 w-full">
                    <Button variant="secondary" className="flex-1" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button variant={variant} className="flex-1" onClick={onConfirm} loading={loading}>
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </Dialog>
    );
}

export default AlertDialog;
