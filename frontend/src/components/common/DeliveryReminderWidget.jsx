/**
 * DeliveryReminderWidget — PRD Feature 7
 *
 * Fetches and displays upcoming + overdue orders on the dashboard.
 * Pulls from GET /api/orders/delivery-status
 */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    HiOutlineClock, HiOutlineExclamationCircle,
    HiOutlineCheckCircle, HiOutlineArrowRight,
} from 'react-icons/hi';
import apiClient from '../../services/apiClient.js';
import { formatDate } from '../../utils/helpers.js';

export default function DeliveryReminderWidget() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient.get('/orders/delivery-status')
            .then(res => setData(res.data.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="card p-5 animate-pulse space-y-3">
            <div className="h-4 bg-neutral-200 dark:bg-white/10 rounded w-1/3" />
            {[1, 2, 3].map(i => <div key={i} className="h-10 bg-neutral-100 dark:bg-white/5 rounded-xl" />)}
        </div>
    );

    if (!data) return null;

    const { upcoming = [], overdue = [] } = data;
    const hasNothing = upcoming.length === 0 && overdue.length === 0;

    return (
        <div className="card p-5 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-base font-display font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                    <HiOutlineClock className="w-5 h-5 text-primary-500" />
                    Delivery Reminders
                </h3>
                <Link to="/orders" className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
                    View all <HiOutlineArrowRight className="w-3 h-3" />
                </Link>
            </div>

            {/* All clear */}
            {hasNothing && (
                <div className="flex items-center gap-3 py-4 text-center justify-center flex-col">
                    <HiOutlineCheckCircle className="w-10 h-10 text-emerald-500" />
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">No upcoming or overdue deliveries</p>
                </div>
            )}

            {/* Overdue — red */}
            {overdue.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center gap-1">
                        <HiOutlineExclamationCircle className="w-3.5 h-3.5" />
                        Overdue ({overdue.length})
                    </p>
                    {overdue.map(order => (
                        <Link key={order._id} to={`/orders/${order._id}`}
                            className="flex items-center justify-between p-3 rounded-xl
                             bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20
                             hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors group">
                            <div>
                                <p className="text-sm font-medium text-red-800 dark:text-red-300">{order.customer?.name}</p>
                                <p className="text-xs text-red-600 dark:text-red-400">{order.orderNumber} · was due {formatDate(order.dueDate)}</p>
                            </div>
                            <HiOutlineArrowRight className="w-4 h-4 text-red-400 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    ))}
                </div>
            )}

            {/* Upcoming — amber */}
            {upcoming.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                        <HiOutlineClock className="w-3.5 h-3.5" />
                        Due in {data.windowDays} days ({upcoming.length})
                    </p>
                    {upcoming.map(order => (
                        <Link key={order._id} to={`/orders/${order._id}`}
                            className="flex items-center justify-between p-3 rounded-xl
                             bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20
                             hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors group">
                            <div>
                                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">{order.customer?.name}</p>
                                <p className="text-xs text-amber-600 dark:text-amber-400">{order.orderNumber} · due {formatDate(order.dueDate)}</p>
                            </div>
                            <HiOutlineArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
