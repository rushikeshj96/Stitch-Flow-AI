import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
    HiOutlineHome, HiOutlineUsers, HiOutlineShoppingBag,
    HiOutlineScale, HiOutlineBell, HiOutlineSparkles,
    HiOutlineUser, HiOutlineChevronLeft, HiOutlineChevronRight,
} from 'react-icons/hi';
import { useNotifications } from '../../context/NotificationContext.jsx';

const NAV_ITEMS = [
    { to: '/dashboard', label: 'Dashboard', icon: HiOutlineHome },
    { to: '/customers', label: 'Customers', icon: HiOutlineUsers },
    { to: '/orders', label: 'Orders', icon: HiOutlineShoppingBag },
    { to: '/measurements', label: 'Measurements', icon: HiOutlineScale },
    { to: '/ai-design', label: 'AI Designer', icon: HiOutlineSparkles },
    { to: '/notifications', label: 'Notifications', icon: HiOutlineBell, badge: true },
    { to: '/profile', label: 'Profile', icon: HiOutlineUser },
];

export default function Sidebar({ onCollapse }) {
    const [collapsed, setCollapsed] = useState(false);
    const { unreadCount } = useNotifications();

    const toggle = () => {
        setCollapsed(c => {
            onCollapse?.(!c);
            return !c;
        });
    };

    return (
        <aside
            className={`relative flex flex-col h-full bg-white dark:bg-[rgb(var(--surface))]
                  border-r border-neutral-200 dark:border-white/5 transition-all duration-300
                  ${collapsed ? 'w-[4.5rem]' : 'w-[var(--sidebar-w)]'}`}
        >
            {/* Brand */}
            <div className={`flex items-center gap-3 h-16 px-4 border-b border-neutral-100 dark:border-white/5 shrink-0 overflow-hidden`}>
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shrink-0">
                    <span className="text-white text-sm font-bold">SF</span>
                </div>
                {!collapsed && (
                    <div className="truncate animate-fade-in">
                        <p className="text-sm font-display font-bold text-neutral-900 dark:text-white leading-none">StitchFlow</p>
                        <p className="text-[10px] text-neutral-400 mt-0.5 uppercase tracking-wider">AI Platform</p>
                    </div>
                )}
            </div>

            {/* Nav items */}
            <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
                {NAV_ITEMS.map(({ to, label, icon: Icon, badge }) => (
                    <NavLink
                        key={to} to={to}
                        className={({ isActive }) =>
                            `${isActive ? 'nav-link-active' : 'nav-link'} ${collapsed ? 'justify-center px-0' : ''} relative`
                        }
                        title={collapsed ? label : undefined}
                    >
                        <Icon className={`w-[1.1rem] h-[1.1rem] shrink-0 ${collapsed ? 'mx-auto' : ''}`} />
                        {!collapsed && <span className="truncate">{label}</span>}

                        {/* Badge for unread notifications */}
                        {badge && unreadCount > 0 && (
                            <span className={`absolute flex items-center justify-center rounded-full text-[10px] font-bold
                                bg-primary-600 text-white tabular-nums leading-none
                                ${collapsed ? 'top-0.5 right-0.5 w-4 h-4' : 'ml-auto min-w-[1.1rem] px-1 h-[1.1rem]'}`}>
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Collapse toggle */}
            <div className="p-3 border-t border-neutral-100 dark:border-white/5 shrink-0">
                <button
                    id="sidebar-toggle"
                    onClick={toggle}
                    className="w-full flex items-center justify-center gap-2 rounded-[var(--radius)] py-2
                     text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5
                     hover:text-neutral-900 dark:hover:text-white transition-all duration-150 text-xs font-medium"
                >
                    {collapsed
                        ? <HiOutlineChevronRight className="w-4 h-4" />
                        : <><HiOutlineChevronLeft className="w-4 h-4" /> <span>Collapse</span></>
                    }
                </button>
            </div>
        </aside>
    );
}
