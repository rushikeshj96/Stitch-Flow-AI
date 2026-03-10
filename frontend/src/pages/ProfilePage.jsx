import React, { useState } from 'react';
import { HiOutlineUser, HiOutlineLogout, HiOutlineLockClosed, HiOutlinePencil } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { authService } from '../services/authService.js';
import { getInitials, avatarColor, formatDate } from '../utils/helpers.js';
import toast from 'react-hot-toast';

export default function ProfilePage() {
    const { user, logout, updateUser } = useAuth();
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState({ name: user?.name || '', boutiqueName: user?.boutiqueName || '', phone: user?.phone || '' });
    const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPw, setSavingPw] = useState(false);

    const handleProfileSave = async (e) => {
        e.preventDefault();
        setSavingProfile(true);
        try {
            const { data } = await authService.updateProfile(form);
            updateUser(data.data.user);
            setEditMode(false);
            toast.success('Profile updated!');
        } catch (err) { toast.error(err?.message || 'Update failed'); }
        finally { setSavingProfile(false); }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (pwForm.newPassword !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
        setSavingPw(true);
        try {
            await authService.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
            toast.success('Password changed successfully!');
            setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
        } catch (err) { toast.error(err?.message || 'Change failed'); }
        finally { setSavingPw(false); }
    };

    return (
        <div className="space-y-6 max-w-2xl animate-fade-in">
            <div>
                <h1 className="page-title">
                    Profile
                </h1>
                <p className="text-slate-400 text-sm mt-1">Manage your account and boutique settings</p>
            </div>

            {/* Avatar + Info */}
            <div className="card p-6 flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shrink-0"
                    style={{ backgroundColor: avatarColor(user?.name) }}>
                    {getInitials(user?.name)}
                </div>
                <div>
                    <p className="text-lg font-display font-semibold page-title">{user?.name}</p>
                    <p className="text-sm text-slate-400">{user?.email}</p>
                    <p className="text-xs text-slate-600 mt-1">
                        Member since {formatDate(user?.createdAt)} · Role: <span className="text-primary-400 capitalize">{user?.role}</span>
                    </p>
                </div>
                <button onClick={() => setEditMode(v => !v)} className="btn-secondary ml-auto gap-2">
                    <HiOutlinePencil className="w-4 h-4" /> {editMode ? 'Cancel' : 'Edit'}
                </button>
            </div>

            {/* Edit Profile Form */}
            {editMode && (
                <form onSubmit={handleProfileSave} className="card p-5 space-y-4 animate-slide-up">
                    <h2 className="font-display font-semibold text-dark dark:text-neutral-200">Edit Profile</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="label">Full Name</label>
                            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                className="input" required />
                        </div>
                        <div>
                            <label className="label">Phone</label>
                            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                className="input" maxLength={10} />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="label">Boutique Name</label>
                            <input value={form.boutiqueName}
                                onChange={e => setForm(f => ({ ...f, boutiqueName: e.target.value }))}
                                className="input" />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" className="btn-primary" disabled={savingProfile}>
                            {savingProfile ? 'Saving…' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            )}

            {/* Change Password */}
            <form onSubmit={handlePasswordChange} className="card p-5 space-y-4">
                <h2 className="font-display font-semibold text-neutral-700 dark:text-neutral-200 flex items-center gap-2">
                    Change Password
                </h2>
                <div className="grid grid-cols-1 gap-3">
                    {[
                        { key: 'currentPassword', label: 'Current Password', type: 'password' },
                        { key: 'newPassword', label: 'New Password', type: 'password' },
                        { key: 'confirm', label: 'Confirm New Password', type: 'password' },
                    ].map(({ key, label, type }) => (
                        <div key={key}>
                            <label className="label">{label}</label>
                            <input type={type} value={pwForm[key]}
                                onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                                className="input" autoComplete="off" />
                        </div>
                    ))}
                </div>
                <div className="flex justify-end">
                    <button type="submit" className="btn-secondary" disabled={savingPw}>
                        {savingPw ? 'Updating…' : 'Update Password'}
                    </button>
                </div>
            </form>

            {/* Danger Zone */}
            <div className="card p-5 border border-red-500/20">
                <h2 className="font-display font-semibold text-red-400 mb-3">Danger Zone</h2>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-300">Sign out of your account</p>
                        <p className="text-xs text-slate-500 mt-0.5">You will need to sign in again to access the dashboard.</p>
                    </div>
                    <button onClick={logout} className="btn-danger gap-2">
                        <HiOutlineLogout className="w-4 h-4" /> Logout
                    </button>
                </div>
            </div>
        </div>
    );
}
