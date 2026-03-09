import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

export default function ProtectedRoute() {
    const { user, loading } = useAuth();

    if (loading) return <LoadingSpinner fullScreen />;
    if (!user) return <Navigate to="/login" replace />;

    return <Outlet />;
}
