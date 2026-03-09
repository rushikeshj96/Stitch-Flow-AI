import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar.jsx';
import Topbar from '../components/common/Topbar.jsx';

export default function DashboardLayout() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    return (
        <div className="flex h-dvh overflow-hidden bg-neutral-50 dark:bg-[rgb(var(--bg))]">
            {/* ── Desktop Sidebar ─────────────────────────────── */}
            <div className="hidden lg:flex">
                <Sidebar onCollapse={setSidebarCollapsed} />
            </div>

            {/* ── Mobile Sidebar Overlay ───────────────────────── */}
            {mobileSidebarOpen && (
                <>
                    <div
                        className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden animate-fade-in"
                        onClick={() => setMobileSidebarOpen(false)}
                    />
                    <div className="fixed left-0 top-0 z-40 h-full flex lg:hidden animate-slide-in">
                        <Sidebar onCollapse={() => { }} />
                    </div>
                </>
            )}

            {/* ── Main area ───────────────────────────────────── */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Topbar onMenuToggle={() => setMobileSidebarOpen(o => !o)} />

                {/* Page content */}
                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-7xl mx-auto p-5 sm:p-6 lg:p-8 animate-fade-in">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
