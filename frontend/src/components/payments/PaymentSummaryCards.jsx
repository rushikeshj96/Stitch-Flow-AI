import React, { useEffect, useState } from 'react';
import {
    HiOutlineCurrencyRupee,
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlineExclamation,
    HiOutlineTrendingUp,
    HiOutlineRefresh,
} from 'react-icons/hi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatCurrency } from '../../utils/helpers.js';
import apiClient from '../../services/apiClient.js';
import StatCard from '../common/StatCard.jsx';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * PaymentSummaryCards
 * Drop-in dashboard block — uses the same StatCard, .card, .skeleton, .table-wrapper
 * patterns used throughout the project.
 */
export default function PaymentSummaryCards() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchSummary = () => {
        setLoading(true);
        setError(false);
        apiClient.get('/payments/summary')
            .then(res => setData(res.data.data))
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchSummary(); }, []);

    /* ── chart data: last 6 months of collection ── */
    const chartData = (data?.monthlyTrend || []).map(t => ({
        name: MONTH_NAMES[t._id.month - 1] || '',
        Collected: t.collected,
    }));

    /* ── KPI config — reuses StatCard (color must match StatCard COLOR_MAP) ── */
    const KPI_CARDS = loading || !data ? [] : [
        {
            title: 'Total Revenue',
            value: formatCurrency(data.totalRevenue),
            icon: HiOutlineCurrencyRupee,
            color: 'primary',
            trendLabel: `${(data.paidOrders + data.partialOrders + data.pendingOrders + data.overdueOrders)} total orders`,
        },
        {
            title: 'Collected',
            value: formatCurrency(data.totalCollected),
            icon: HiOutlineCheckCircle,
            color: 'success',
            trendLabel: `${data.paidOrders} fully paid`,
        },
        {
            title: 'Pending',
            value: formatCurrency(data.totalPending),
            icon: HiOutlineClock,
            color: 'warning',
            trendLabel: `${data.pendingOrders + data.partialOrders} orders awaiting`,
        },
        {
            title: 'Overdue',
            value: formatCurrency(data.overdueAmount || 0),
            icon: HiOutlineExclamation,
            color: 'danger',
            trendLabel: `${data.overdueOrders} overdue orders`,
        },
    ];

    return (
        <section className="space-y-5" aria-label="Payment Analytics">

            {/* ── Section header — same pattern as DashboardPage ── */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="page-title" style={{ fontSize: undefined }}>
                        Payment Analytics
                    </h2>
                    <p className="page-subtitle">Revenue, collections and outstanding balances</p>
                </div>
                <button
                    onClick={fetchSummary}
                    className="btn-ghost gap-1.5 text-xs"
                    aria-label="Refresh payment analytics"
                    disabled={loading}
                >
                    <HiOutlineRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* ── KPI cards — same grid as DashboardPage ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {loading
                    ? [...Array(4)].map((_, i) => (
                        <div key={i} className="card p-5 space-y-3">
                            <div className="skeleton h-10 w-10 rounded-xl" />
                            <div className="skeleton h-8 w-28 rounded" />
                            <div className="skeleton h-3 w-32 rounded" />
                        </div>
                    ))
                    : KPI_CARDS.map(card => (
                        <StatCard key={card.title} {...card} loading={false} />
                    ))
                }
            </div>

            {/* ── Status breakdown + trend chart ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

                {/* Status breakdown pill grid */}
                <div className="lg:col-span-2 card p-5">
                    <h3 className="text-sm font-display font-semibold t-primary mb-4">Orders by Payment Status</h3>

                    {loading ? (
                        <div className="space-y-3">
                            {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-12 rounded-[var(--radius)]" />)}
                        </div>
                    ) : error ? (
                        <p className="text-sm t-tertiary text-center py-6">Failed to load. <button onClick={fetchSummary} className="text-primary-600 dark:text-primary-400 underline">Retry</button></p>
                    ) : (
                        <div className="space-y-2">
                            {[
                                { label: 'Paid', count: data.paidOrders, icon: HiOutlineCheckCircle, badge: 'badge-success' },
                                { label: 'Partial', count: data.partialOrders, icon: HiOutlineTrendingUp, badge: 'badge-warning' },
                                { label: 'Pending', count: data.pendingOrders, icon: HiOutlineClock, badge: 'badge-warning' },
                                { label: 'Overdue', count: data.overdueOrders, icon: HiOutlineExclamation, badge: 'badge-danger' },
                            ].map(({ label, count, icon: Icon, badge }) => (
                                <div
                                    key={label}
                                    className="flex items-center justify-between px-3.5 py-2.5 rounded-[var(--radius)] transition-colors"
                                    style={{ backgroundColor: 'rgb(var(--surface-raised))', border: '1px solid rgb(var(--border))' }}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <span className={`${badge} rounded-lg p-1.5`} style={{ borderRadius: 'var(--radius)' }}>
                                            <Icon className="w-3.5 h-3.5" />
                                        </span>
                                        <span className="text-sm font-medium t-primary">{label}</span>
                                    </div>
                                    <span className="text-lg font-display font-bold t-primary">{count}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Monthly trend bar chart — same style as DashboardPage chart */}
                <div className="lg:col-span-3 card p-5">
                    <h3 className="text-sm font-display font-semibold t-primary mb-4">Monthly Collections</h3>

                    {loading ? (
                        <div className="skeleton h-44 w-full rounded-[var(--radius)]" />
                    ) : chartData.length === 0 ? (
                        <div className="h-44 flex items-center justify-center">
                            <p className="text-sm t-tertiary">Record payments to see collection trends here.</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={176}>
                            <BarChart data={chartData} style={{ fontSize: 12 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fill: 'rgb(var(--text-secondary))', fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`}
                                    tick={{ fill: 'rgb(var(--text-secondary))', fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    formatter={(v) => [formatCurrency(v), 'Collected']}
                                    contentStyle={{
                                        background: 'rgb(var(--surface))',
                                        border: '1px solid rgb(var(--border))',
                                        borderRadius: 'var(--radius)',
                                        color: 'rgb(var(--text-primary))',
                                        fontSize: 12,
                                    }}
                                    labelStyle={{ color: 'rgb(var(--text-primary))' }}
                                />
                                {/* same bar colour as DashboardPage */}
                                <Bar dataKey="Collected" fill="#c453f0" radius={[6, 6, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </section>
    );
}
