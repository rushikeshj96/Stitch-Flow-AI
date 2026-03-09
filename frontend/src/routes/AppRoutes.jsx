import React, { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import DashboardLayout from '../layouts/DashboardLayout.jsx';
import AuthLayout from '../layouts/AuthLayout.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';

// Lazy-loaded pages
const LoginPage = lazy(() => import('../pages/LoginPage.jsx'));
const SignupPage = lazy(() => import('../pages/SignupPage.jsx'));
const DashboardPage = lazy(() => import('../pages/DashboardPage.jsx'));
const CustomersPage = lazy(() => import('../pages/CustomersPage.jsx'));
const CustomerDetailPage = lazy(() => import('../pages/CustomerDetailPage.jsx'));
const MeasurementsPage = lazy(() => import('../pages/MeasurementsPage.jsx'));
const OrdersPage = lazy(() => import('../pages/OrdersPage.jsx'));
const OrderDetailPage = lazy(() => import('../pages/OrderDetailPage.jsx'));
const AIDesignPage = lazy(() => import('../pages/AIDesignPage.jsx'));
const NotificationsPage = lazy(() => import('../pages/NotificationsPage.jsx'));
const ProfilePage = lazy(() => import('../pages/ProfilePage.jsx'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage.jsx'));

export default function AppRoutes() {
    return (
        <Routes>
            {/* Public - Auth */}
            <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
            </Route>

            {/* Protected - Dashboard */}
            <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/customers" element={<CustomersPage />} />
                    <Route path="/customers/:id" element={<CustomerDetailPage />} />
                    <Route path="/measurements" element={<MeasurementsPage />} />
                    <Route path="/orders" element={<OrdersPage />} />
                    <Route path="/orders/:id" element={<OrderDetailPage />} />
                    <Route path="/ai-design" element={<AIDesignPage />} />
                    <Route path="/notifications" element={<NotificationsPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                </Route>
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}
