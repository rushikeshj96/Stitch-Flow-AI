import React, { useState } from 'react';
import Modal from '../common/Modal.jsx';
import { authService } from '../../services/authService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';

export default function DeleteAccountModal({ isOpen, onClose }) {
    const { logout } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        try {
            await authService.deleteAccount();
            toast.success('Your account and all associated data have been deleted successfully.');
            logout();
        } catch (err) {
            toast.error(err?.response?.data?.message || err?.message || 'Failed to delete account');
        } finally {
            setLoading(false);
            if (onClose) onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Delete Account" size="sm">
            <div className="space-y-4 py-2">
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                    Are you sure you want to delete your account?<br /><br />
                    <strong className="text-red-500">This action is permanent and all your data will be removed.</strong> This includes all customers, orders, measurements, and settings.
                </p>
                <div className="flex justify-end gap-3 pt-4">
                    <button
                        onClick={onClose}
                        className="btn-secondary"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        className="btn-danger"
                        disabled={loading}
                    >
                        {loading ? 'Deleting...' : 'Delete Account'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
