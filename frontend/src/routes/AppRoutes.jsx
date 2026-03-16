import React, { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import DashboardLayout from '../layouts/DashboardLayout.jsx';
import AuthLayout from '../layouts/AuthLayout.jsx';
import PublicLayout from '../layouts/PublicLayout.jsx';
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

// Lazy-loaded Admin Booking Pages
const AdminServicesPage = lazy(() => import('../pages/admin/AdminServicesPage.jsx'));
const AdminAppointmentsPage = lazy(() => import('../pages/admin/AdminAppointmentsPage.jsx'));
const AdminReviewsPage = lazy(() => import('../pages/admin/AdminReviewsPage.jsx'));

// Lazy-loaded Public Pages
const PublicHomePage = lazy(() => import('../pages/public/HomePage.jsx'));
const PublicServicesPage = lazy(() => import('../pages/public/ServicesPage.jsx'));
const PublicServiceDetailPage = lazy(() => import('../pages/public/ServiceDetailPage.jsx'));
const PublicBookAppointmentPage = lazy(() => import('../pages/public/BookAppointmentPage.jsx'));
const PublicProductsPage = lazy(() => import('../pages/public/ProductsPage.jsx'));
const PublicProductDetailPage = lazy(() => import('../pages/public/ProductDetailPage.jsx'));
const CartPage = lazy(() => import('../pages/public/CartPage.jsx'));
const CheckoutPage = lazy(() => import('../pages/public/CheckoutPage.jsx'));
const MyOrdersPage = lazy(() => import('../pages/public/MyOrdersPage.jsx'));

const AdminProductsPage = lazy(() => import('../pages/admin/AdminProductsPage.jsx'));
const AddProductPage = lazy(() => import('../pages/admin/AddProductPage.jsx'));
const EditProductPage = lazy(() => import('../pages/admin/EditProductPage.jsx'));
const AdminStoreOrdersPage = lazy(() => import('../pages/admin/AdminStoreOrdersPage.jsx'));

export default function AppRoutes() {
    return (
        <Routes>
            {/* Public - Customer Facing */}
            <Route element={<PublicLayout />}>
                <Route path="/" element={<PublicHomePage />} />
                <Route path="/services" element={<PublicServicesPage />} />
                <Route path="/services/:id" element={<PublicServiceDetailPage />} />
                <Route path="/products" element={<PublicProductsPage />} />
                <Route path="/products/:id" element={<PublicProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/my-orders" element={<MyOrdersPage />} />
                <Route path="/book-appointment" element={<PublicBookAppointmentPage />} />
            </Route>

            {/* Public - Auth */}
            <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
            </Route>

            {/* Protected - Dashboard */}
            <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/customers" element={<CustomersPage />} />
                    <Route path="/customers/:id" element={<CustomerDetailPage />} />
                    <Route path="/measurements" element={<MeasurementsPage />} />
                    <Route path="/orders" element={<OrdersPage />} />
                    <Route path="/orders/:id" element={<OrderDetailPage />} />
                    <Route path="/ai-design" element={<AIDesignPage />} />
                    
                    {/* Admin Booking Routes */}
                    <Route path="/admin/services" element={<AdminServicesPage />} />
                    <Route path="/admin/appointments" element={<AdminAppointmentsPage />} />
                    <Route path="/admin/reviews" element={<AdminReviewsPage />} />
                    <Route path="/admin/products" element={<AdminProductsPage />} />
                    <Route path="/admin/products/new" element={<AddProductPage />} />
                    <Route path="/admin/products/:id/edit" element={<EditProductPage />} />
                    <Route path="/admin/store-orders" element={<AdminStoreOrdersPage />} />

                    <Route path="/notifications" element={<NotificationsPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                </Route>
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}
