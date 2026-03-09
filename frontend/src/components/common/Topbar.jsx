import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    HiOutlineBell, HiOutlineSun, HiOutlineMoon,
    HiOutlineMenu, HiOutlineLogout, HiOutlineUser,
} from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useNotifications } from '../../context/NotificationContext.jsx';
import { getInitials, avatarColor } from '../../utils/helpers.js';

export default function Topbar({ onMenuToggle }) {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { unreadCount } = useNotifications();

    const [dropOpen, setDropOpen] = useState(false);
    const dropRef = useRef(null);

    /* Close dropdown on outside click */
    useEffect(() => {
        const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <header className="h-16 flex items-center justify-between px-4 sm:px-6
                       bg-white dark:bg-[rgb(var(--surface))]
                       border-b border-neutral-200 dark:border-white/5 shrink-0">

            {/* Left: mobile menu + breadcrumb area */}
            <button id="topbar-menu-toggle" onClick={onMenuToggle}
                className="btn-ghost p-2 -ml-2 lg:hidden">
                <HiOutlineMenu className="w-5 h-5" />
            </button>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Right: actions */}
            <div className="flex items-center gap-1">

                {/* Theme toggle */}
                <button
                    id="theme-toggle"
                    onClick={toggleTheme}
                    className="btn-ghost p-2.5 rounded-[var(--radius)]"
                    title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    aria-label="Toggle theme"
                >
                    {theme === 'dark'
                        ? <HiOutlineSun className="w-[1.1rem] h-[1.1rem]" />
                        : <HiOutlineMoon className="w-[1.1rem] h-[1.1rem]" />
                    }
                </button>

                {/* Notifications */}
                <Link to="/notifications"
                    id="topbar-notifications"
                    className="btn-ghost p-2.5 rounded-[var(--radius)] relative"
                    aria-label="Notifications">
                    <HiOutlineBell className="w-[1.1rem] h-[1.1rem]" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary-500 ring-2 ring-white dark:ring-[rgb(var(--surface))]" />
                    )}
                </Link>

                {/* Vertical divider */}
                <div className="w-px h-6 bg-neutral-200 dark:bg-white/10 mx-1" />

                {/* User dropdown */}
                <div className="relative" ref={dropRef}>
                    <button
                        id="topbar-user-menu"
                        onClick={() => setDropOpen(d => !d)}
                        className="flex items-center gap-2.5 rounded-[var(--radius)] px-2 py-1.5
                       hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"
                    >
                        <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-semibold shrink-0"
                            style={{ backgroundColor: avatarColor(user?.name) }}
                        >
                            {getInitials(user?.name)}
                        </div>
                        <span className="hidden sm:block text-sm font-medium text-neutral-700 dark:text-neutral-200 max-w-[8rem] truncate">
                            {user?.name}
                        </span>
                    </button>

                    {/* Dropdown */}
                    {dropOpen && (
                        <div className="absolute right-0 mt-2 w-52 card py-1.5 shadow-card-hover z-30 animate-slide-up">
                            <div className="px-3.5 py-2.5 border-b border-neutral-100 dark:border-white/5 mb-1">
                                <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">{user?.name}</p>
                                <p className="text-xs text-neutral-400 truncate">{user?.email}</p>
                            </div>
                            <Link to="/profile"
                                className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-neutral-700 dark:text-neutral-300
                               hover:bg-neutral-50 dark:hover:bg-white/5 hover:text-neutral-900 dark:hover:text-white
                               transition-colors rounded-none"
                                onClick={() => setDropOpen(false)}>
                                <HiOutlineUser className="w-4 h-4" /> Profile
                            </Link>
                            <button
                                onClick={() => { setDropOpen(false); logout(); }}
                                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-red-600 dark:text-red-400
                           hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                            >
                                <HiOutlineLogout className="w-4 h-4" /> Sign out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
