import React, { useEffect, useState } from 'react';
import {
    HiOutlineUsers, HiOutlineShoppingBag, HiOutlineCurrencyRupee,
    HiOutlineSparkles, HiOutlineClock, HiOutlineChartBar,
} from 'react-icons/hi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

import StatCard from '../components/common/StatCard.jsx';
import DeliveryReminderWidget from '../components/common/DeliveryReminderWidget.jsx';
import Badge from '../components/common/Badge.jsx';
import PaymentSummaryCards from '../components/payments/PaymentSummaryCards.jsx';
import { orderService } from '../services/orderService.js';
import { customerService } from '../services/customerService.js';
import { formatCurrency, formatDate } from '../utils/helpers.js';

const CHART_STYLE = {
    background: 'transparent',
    fontSize: 12,
};

export default function DashboardPage() {
    const [stats, setStats] = useState(null);
    const [recent, setRecent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [custCount, setCustCount] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const [statsRes, ordersRes, custRes] = await Promise.all([
                    orderService.getStats(),
                    orderService.getAll({ limit: 6, page: 1 }),
                    customerService.getAll({ limit: 1 }),
                ]);
                setStats(statsRes.data.data.stats);
                setRecent(ordersRes.data.data.orders);
                setCustCount(custRes.data.data.pagination.total);
            } catch {/* handled by interceptor */ }
            finally { setLoading(false); }
        })();
    }, []);

    // Compute top-level numbers from aggregate
    const totals = stats?.reduce(
        (acc, s) => ({ ...acc, count: acc.count + s.count, revenue: acc.revenue + s.revenue }),
        { count: 0, revenue: 0 }
    ) || {};

    const pendingCount = stats?.find(s => s._id === 'pending')?.count || 0;
    const deliveredRev = stats?.find(s => s._id === 'delivered')?.revenue || 0;

    // Chart data
    const chartData = (stats || []).map(s => ({
        name: s._id.charAt(0).toUpperCase() + s._id.slice(1),
        Orders: s.count,
        Revenue: Math.round(s.revenue / 1000),
    }));

    const STAT_CARDS = [
        {
            title: 'Total Customers', value: custCount ?? '—',
            icon: HiOutlineUsers, color: 'primary',
            trend: 12, trendLabel: 'vs last month',
        },
        {
            title: 'Total Orders', value: totals.count || '—',
            icon: HiOutlineShoppingBag, color: 'info',
            trend: 8, trendLabel: 'vs last month',
        },
        {
            title: 'Revenue Collected', value: formatCurrency(deliveredRev),
            icon: HiOutlineCurrencyRupee, color: 'success',
            trend: 15, trendLabel: 'from delivered orders',
        },
        {
            title: 'Pending Orders', value: pendingCount,
            icon: HiOutlineClock, color: 'warning',
            trend: -3, trendLabel: 'vs last week',
        },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="page-title">Dashboard</h1>
                <p className="page-subtitle">Welcome back! Here's your boutique overview.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {STAT_CARDS.map(card => (
                    <StatCard key={card.title} {...card} loading={loading} />
                ))}
            </div>

            {/* Chart + Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Bar Chart */}
                <div className="lg:col-span-3 card p-5">
                    <div className="flex items-center gap-2 mb-5">
                        <HiOutlineChartBar className="w-5 h-5 text-primary-500" />
                        <h2 className="font-display font-semibold" style={{ color: 'rgb(var(--text-primary))' }}>Orders by Status</h2>
                    </div>
                    {loading ? (
                        <div className="skeleton h-48 w-full rounded-lg" />
                    ) : chartData.length === 0 ? (
                        <div className="h-48 flex items-center justify-center text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
                            No data yet — create your first order!
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={chartData} style={CHART_STYLE}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
                                <XAxis dataKey="name" tick={{ fill: 'rgb(var(--text-secondary))', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: 'rgb(var(--text-secondary))', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ background: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: 12, color: 'rgb(var(--text-primary))' }}
                                    labelStyle={{ color: 'rgb(var(--text-primary))' }}
                                    itemStyle={{ color: 'rgb(var(--primary))' }}
                                />
                                <Bar dataKey="Orders" fill="#c453f0" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Recent Orders */}
                <div className="lg:col-span-2 card p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-display font-semibold" style={{ color: 'rgb(var(--text-primary))' }}>Recent Orders</h2>
                        <a href="/orders" className="text-xs text-primary-600 dark:text-primary-400 hover:underline">View all →</a>
                    </div>

                    {loading ? (
                        <div className="space-y-3">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="skeleton h-12 rounded-lg" />
                            ))}
                        </div>
                    ) : recent.length === 0 ? (
                        <p className="text-sm text-center py-8" style={{ color: 'rgb(var(--text-tertiary))' }}>No orders yet</p>
                    ) : (
                        <ul className="space-y-2">
                            {recent.map(order => (
                                <li key={order._id}
                                    className="flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-[rgb(var(--surface-raised))] transition-colors">
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium truncate" style={{ color: 'rgb(var(--text-primary))' }}>
                                            {order.customer?.name || '—'}
                                        </p>
                                        <p className="text-xs" style={{ color: 'rgb(var(--text-secondary))' }}>
                                            {order.orderNumber} · {formatDate(order.dueDate)}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                        <Badge label={order.status} variant={order.status} />
                                        <p className="text-xs" style={{ color: 'rgb(var(--text-secondary))' }}>{formatCurrency(order.totalAmount)}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Payment Analytics */}
            <PaymentSummaryCards />

            {/* Delivery Reminder Widget — PRD Feature 7 */}
            <DeliveryReminderWidget />

            {/* AI Banner */}
            <div className="card p-5 sm:p-6 bg-gradient-to-r from-primary-50 dark:from-primary-900/40 to-purple-50 dark:to-purple-900/30
                      border border-primary-200 dark:border-primary-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center text-2xl shrink-0">✨</div>
                    <div>
                        <h3 className="font-display font-semibold" style={{ color: 'rgb(var(--text-primary))' }}>AI Design Generator</h3>
                        <p className="text-sm mt-0.5" style={{ color: 'rgb(var(--text-secondary))' }}>Generate stunning garment designs from text prompts using DALL-E 3</p>
                    </div>
                </div>
                <a href="/ai-design" className="btn-primary shrink-0 w-full sm:w-auto justify-center">
                    <HiOutlineSparkles className="w-4 h-4" /> Try AI Design
                </a>
            </div>
        </div>
    );
}
