import React from 'react';
import Modal from './Modal.jsx';
import { HiOutlineExclamation } from 'react-icons/hi';

/**
 * @param {{ isOpen, onClose, onConfirm, title, message, confirmLabel, loading, variant }} props
 */
export default function ConfirmDialog({
    isOpen, onClose, onConfirm,
    title = 'Are you sure?',
    message = 'This action cannot be undone.',
    confirmLabel = 'Delete',
    loading = false,
    variant = 'danger',
}) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="" size="sm">
            <div className="flex flex-col items-center text-center gap-4 py-2">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center
                         ${variant === 'danger' ? 'bg-red-500/20' : 'bg-amber-500/20'}`}>
                    <HiOutlineExclamation className={`w-8 h-8 ${variant === 'danger' ? 'text-red-400' : 'text-amber-400'}`} />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                    <p className="text-slate-400 text-sm mt-1">{message}</p>
                </div>
                <div className="flex gap-3 w-full pt-2">
                    <button className="btn-secondary flex-1" onClick={onClose} disabled={loading}>Cancel</button>
                    <button
                        className={`flex-1 btn ${variant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
                        onClick={onConfirm} disabled={loading}
                    >
                        {loading ? 'Processing…' : confirmLabel}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
