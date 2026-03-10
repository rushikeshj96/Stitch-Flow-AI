import React from 'react';
import { Link } from 'react-router-dom';
import { HiOutlinePhone, HiOutlineMail, HiOutlineShoppingBag, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { getInitials, avatarColor, formatDate } from '../../utils/helpers.js';

/**
 * @param {{ customer, onEdit, onDelete }} props
 */
export default function CustomerCard({ customer, onEdit, onDelete }) {
    return (
        <div className="card p-5 flex flex-col gap-4 hover:glow-border transition-all duration-300 group">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ backgroundColor: avatarColor(customer.name) }}>
                    {getInitials(customer.name)}
                </div>
                <div className="min-w-0">
                    <Link to={`/customers/${customer._id}`}
                        className="font-semibold text-neutral-700 dark:text-neutral-200 hover:text-primary-400 transition-colors truncate block">
                        {customer.name}
                    </Link>
                    <p className="text-xs text-slate-500 capitalize">
                        {customer.gender || 'Not specified'} · Joined {formatDate(customer.createdAt)}
                    </p>
                </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-1.5 text-sm">
                <div className="flex items-center gap-2 text-slate-400">
                    <HiOutlinePhone className="w-4 h-4 shrink-0" />
                    <span>{customer.phone}</span>
                </div>
                {customer.email && (
                    <div className="flex items-center gap-2 text-slate-400 truncate">
                        <HiOutlineMail className="w-4 h-4 shrink-0" />
                        <span className="truncate">{customer.email}</span>
                    </div>
                )}
                <div className="flex items-center gap-2 text-slate-400">
                    <HiOutlineShoppingBag className="w-4 h-4 shrink-0" />
                    <span>{customer.totalOrders} orders</span>
                </div>
            </div>

            {/* Tags */}
            {customer.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {customer.tags.map(tag => (
                        <span key={tag} className="badge bg-primary-500/15 text-primary-600 text-xs">{tag}</span>
                    ))}
                </div>
            )}

            {/* Actions (hidden unless hover) */}
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onEdit(customer)}
                    className="btn-ghost flex-1 py-1.5 text-xs gap-1">
                    <HiOutlinePencil className="w-4 h-4" /> Edit
                </button>
                <button onClick={() => onDelete(customer)}
                    className="btn-ghost flex-1 py-1.5 text-xs gap-1 text-red-400 hover:text-red-300">
                    <HiOutlineTrash className="w-4 h-4" /> Delete
                </button>
            </div>
        </div>
    );
}
