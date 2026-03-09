import React from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineTrash, HiOutlineEye } from 'react-icons/hi';
import Badge from '../common/Badge.jsx';
import { formatDate, formatCurrency, getInitials, avatarColor } from '../../utils/helpers.js';

const STATUS_NEXT = {
    pending: 'confirmed',
    confirmed: 'in-progress',
    'in-progress': 'ready',
    ready: 'delivered',
};

/**
 * @param {{ orders, onStatusChange, onDelete }} props
 */
export default function OrderTable({ orders, onStatusChange, onDelete }) {
    return (
        <div className="table-wrapper">
            <table className="table">
                <thead>
                    <tr>
                        <th>Order #</th>
                        <th>Customer</th>
                        <th>Due Date</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => {
                        const nextStatus = STATUS_NEXT[order.status];
                        const pastDue = new Date(order.dueDate) < new Date() && order.status !== 'delivered';
                        return (
                            <tr key={order._id}>
                                {/* Order # */}
                                <td>
                                    <Link to={`/orders/${order._id}`}
                                        className="text-primary-400 hover:text-primary-300 font-medium">
                                        {order.orderNumber}
                                    </Link>
                                </td>

                                {/* Customer */}
                                <td>
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                                            style={{ backgroundColor: avatarColor(order.customer?.name) }}>
                                            {getInitials(order.customer?.name)}
                                        </div>
                                        <span className="text-slate-200">{order.customer?.name || '—'}</span>
                                    </div>
                                </td>

                                {/* Due Date */}
                                <td>
                                    <span className={pastDue ? 'text-red-400 font-medium' : 'text-slate-300'}>
                                        {formatDate(order.dueDate)}
                                        {pastDue && ' ⚠️'}
                                    </span>
                                </td>

                                {/* Amount */}
                                <td>
                                    <div>
                                        <p className="text-slate-200">{formatCurrency(order.totalAmount)}</p>
                                        {order.balanceDue > 0 && (
                                            <p className="text-xs text-amber-400">Due: {formatCurrency(order.balanceDue)}</p>
                                        )}
                                    </div>
                                </td>

                                {/* Status */}
                                <td><Badge label={order.status} variant={order.status} /></td>

                                {/* Priority */}
                                <td>
                                    <Badge
                                        label={order.priority}
                                        variant={order.priority === 'urgent' ? 'danger' : order.priority === 'high' ? 'warning' : 'info'}
                                    />
                                </td>

                                {/* Actions */}
                                <td>
                                    <div className="flex items-center gap-1">
                                        <Link to={`/orders/${order._id}`} className="btn-ghost p-1.5 text-slate-400 hover:text-white"
                                            title="View">
                                            <HiOutlineEye className="w-4 h-4" />
                                        </Link>
                                        {nextStatus && (
                                            <button
                                                className="text-xs px-2 py-1 rounded-lg bg-primary-500/20 text-primary-300
                                   hover:bg-primary-500/40 transition-colors"
                                                onClick={() => onStatusChange(order._id, nextStatus)}
                                                title={`Move to ${nextStatus}`}>
                                                → {nextStatus}
                                            </button>
                                        )}
                                        <button className="btn-ghost p-1.5 text-red-400 hover:text-red-300" onClick={() => onDelete(order)}>
                                            <HiOutlineTrash className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
