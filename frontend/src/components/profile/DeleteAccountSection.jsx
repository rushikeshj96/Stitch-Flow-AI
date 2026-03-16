import React, { useState } from 'react';
import { HiOutlineTrash, HiOutlineLogout } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import DeleteAccountModal from './DeleteAccountModal.jsx';

export default function DeleteAccountSection() {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="card p-5 border border-red-500/20">
            <h2 className="font-display font-semibold text-red-500 mb-4">Danger Zone</h2>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Sign out of your account</p>
                        <p className="text-xs text-slate-500 mt-0.5">You will need to sign in again to access the dashboard.</p>
                    </div>
                    <button 
                        onClick={() => { logout(); navigate('/'); }} 
                        className="btn-secondary text-slate-600 dark:text-slate-300 hover:text-slate-900 gap-2 shrink-0"
                    >
                        <HiOutlineLogout className="w-4 h-4" /> Logout
                    </button>
                </div>

                <hr className="border-neutral-200 dark:border-white/10" />

                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-red-500">Delete Account</p>
                        <p className="text-xs text-slate-500 mt-0.5">Permanently remove your account and all associated data.</p>
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="btn-danger gap-2 shrink-0">
                        <HiOutlineTrash className="w-4 h-4" /> Delete Account
                    </button>
                </div>
            </div>

            <DeleteAccountModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
}
