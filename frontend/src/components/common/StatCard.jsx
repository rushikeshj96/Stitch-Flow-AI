import React from 'react';
import { HiOutlineTrendingUp, HiOutlineTrendingDown } from 'react-icons/hi';

/**
 * @param {{ title, value, icon: React.ElementType, trend, trendLabel, color, loading }} props
 */
export default function StatCard({ title, value, icon: Icon, trend, trendLabel, color = 'primary', loading }) {
    const colors = {
        primary: { bg: 'bg-primary-500/15', icon: 'text-primary-400', ring: 'ring-primary-500/30' },
        success: { bg: 'bg-emerald-500/15', icon: 'text-emerald-400', ring: 'ring-emerald-500/30' },
        warning: { bg: 'bg-amber-500/15', icon: 'text-amber-400', ring: 'ring-amber-500/30' },
        danger: { bg: 'bg-red-500/15', icon: 'text-red-400', ring: 'ring-red-500/30' },
        info: { bg: 'bg-blue-500/15', icon: 'text-blue-400', ring: 'ring-blue-500/30' },
    };
    const c = colors[color] || colors.primary;
    const trendPositive = trend >= 0;

    return (
        <div className="card p-5 flex flex-col gap-3 hover:glow-border transition-all duration-300">
            <div className="flex items-start justify-between">
                <div className={`w-11 h-11 rounded-xl ${c.bg} ring-1 ${c.ring}
                         flex items-center justify-center`}>
                    {loading
                        ? <div className="w-5 h-5 rounded skeleton" />
                        : Icon && <Icon className={`w-6 h-6 ${c.icon}`} />}
                </div>

                {trend !== undefined && !loading && (
                    <div className={`flex items-center gap-1 text-xs font-medium
                           ${trendPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                        {trendPositive
                            ? <HiOutlineTrendingUp className="w-4 h-4" />
                            : <HiOutlineTrendingDown className="w-4 h-4" />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>

            {loading ? (
                <>
                    <div className="skeleton h-8 w-24 rounded" />
                    <div className="skeleton h-3 w-32 rounded" />
                </>
            ) : (
                <>
                    <p className="text-3xl font-display font-bold text-white leading-none">{value ?? '—'}</p>
                    <div>
                        <p className="text-sm text-slate-400">{title}</p>
                        {trendLabel && <p className="text-xs text-slate-600 mt-0.5">{trendLabel}</p>}
                    </div>
                </>
            )}
        </div>
    );
}
