import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export default function AuthLayout() {
    return (
        <div className="min-h-dvh flex">
            {/* ── Left panel — branding ─── */}
            <div className="hidden lg:flex lg:w-[48%] xl:w-[52%] flex-col justify-between
                      bg-neutral-950 p-12 relative overflow-hidden">
                {/* Subtle gradient orb */}
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

                {/* Brand */}
                <div className="relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white font-bold text-base">SF</span>
                        </div>
                        <div>
                            <p className="text-white font-display font-bold text-lg leading-none">StitchFlow AI</p>
                            <p className="text-neutral-500 text-xs mt-0.5 uppercase tracking-wider">Boutique Platform</p>
                        </div>
                    </div>
                </div>

                {/* Hero copy */}
                <div className="relative z-10 space-y-6">
                    <div>
                        <h1 className="text-4xl xl:text-5xl font-display font-bold text-white leading-[1.15] text-balance">
                            Manage your boutique<br />
                            <span className="text-gradient">with the power of AI</span>
                        </h1>
                        <p className="text-neutral-400 mt-5 text-base leading-relaxed max-w-md">
                            Track orders, manage customers, record measurements, and generate AI-powered garment designs — all in one place.
                        </p>
                    </div>

                    {/* Feature pills */}
                    <div className="flex flex-wrap gap-2">
                        {['Order Tracking', 'Customer Profiles', 'AI Design Generator', 'Measurement Records', 'Delivery Alerts'].map(f => (
                            <span key={f} className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-neutral-300">
                                {f}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Testimonial */}
                <div className="relative z-10 card bg-white/[0.04] border-white/10 p-5">
                    <p className="text-neutral-300 text-sm leading-relaxed">
                        "StitchFlow AI transformed how I manage my boutique. I never miss a delivery date now!"
                    </p>
                    <div className="flex items-center gap-2.5 mt-3">
                        <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold">P</div>
                        <div>
                            <p className="text-white text-xs font-semibold">Priya Mehta</p>
                            <p className="text-neutral-500 text-[10px]">Owner, Priya Fashions · Mumbai</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Right panel — form ─── */}
            <div className="flex-1 flex flex-col justify-center items-center px-6 py-10
                      bg-white dark:bg-[rgb(var(--bg))]">
                {/* Mobile brand */}
                <div className="flex items-center gap-2.5 mb-10 lg:hidden">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">SF</span>
                    </div>
                    <p className="font-display font-bold text-neutral-900 dark:text-white">StitchFlow AI</p>
                </div>

                <div className="w-full max-w-[22rem]">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
