import React from 'react';
import { HiOutlineTrendingUp, HiOutlineTrendingDown } from 'react-icons/hi';

const COLOR_MAP = {
    primary: { bg: 'bg-primary-500/10 dark:bg-primary-500/15', icon: 'text-primary-600 dark:text-primary-400', ring: 'ring-primary-500/20' },
    success: { bg: 'bg-emerald-500/10 dark:bg-emerald-500/15', icon: 'text-emerald-600 dark:text-emerald-400', ring: 'ring-emerald-500/20' },
    warning: { bg: 'bg-amber-500/10  dark:bg-amber-500/15', icon: 'text-amber-600  dark:text-amber-400', ring: 'ring-amber-500/20' },
    danger: { bg: 'bg-red-500/10    dark:bg-red-500/15', icon: 'text-red-600    dark:text-red-400', ring: 'ring-red-500/20' },
    info: { bg: 'bg-blue-500/10   dark:bg-blue-500/15', icon: 'text-blue-600   dark:text-blue-400', ring: 'ring-blue-500/20' },
};

/**
 * @param {{ title, value, icon: React.ElementType, trend, trendLabel, color, loading }} props
 */
export default function StatCard({ title, value, icon: Icon, trend, trendLabel, color = 'primary', loading }) {
    const c = COLOR_MAP[color] || COLOR_MAP.primary;
    const positive = trend >= 0;

    return (
        <div className="card p-5 flex flex-col gap-3 hover:shadow-card-hover transition-shadow duration-200">
            <div className="flex items-start justify-between">

                {/* Icon */}
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ring-1 ${c.bg} ${c.ring}`}>
                    {loading
                        ? <div className="w-5 h-5 rounded skeleton" />
                        : Icon && <Icon className={`w-6 h-6 ${c.icon}`} />}
                </div>

                {/* Trend badge */}
                {trend !== undefined && !loading && (
                    <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full
            ${positive
                            ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10'
                            : 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-500/10'}`}>
                        {positive
                            ? <HiOutlineTrendingUp className="w-3.5 h-3.5" />
                            : <HiOutlineTrendingDown className="w-3.5 h-3.5" />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>

            {/* Content */}
            {loading ? (
                <>
                    <div className="skeleton h-8 w-24 rounded" />
                    <div className="skeleton h-3 w-32 rounded" />
                </>
            ) : (
                <>
                    {/* Value — uses CSS var so it adapts to light/dark */}
                    <p className="text-3xl font-display font-bold leading-none"
                        style={{ color: 'rgb(var(--text-primary))' }}>
                        {value ?? '—'}
                    </p>
                    <div>
                        <p className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>{title}</p>
                        {trendLabel && (
                            <p className="text-xs mt-0.5" style={{ color: 'rgb(var(--text-tertiary))' }}>{trendLabel}</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
