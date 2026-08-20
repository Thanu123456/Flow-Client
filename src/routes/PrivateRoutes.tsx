import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Spin } from 'antd';
import AdminLayout from '../components/common/Layout/AdminLayout';

const PrivateRoutes: React.FC = () => {
    const { isAuthenticated, isLoading, mustChangePassword, role } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Spin size="large" /></div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Redirect super admin to their dashboard
    if (role === 'super_admin') {
        return <Navigate to="/superadmin/dashboard" replace />;
    }

    // Force password change if required
    if (mustChangePassword && location.pathname !== '/change-password') {
        return <Navigate to="/change-password" replace />;
    }

    // Kiosk (cashier) sessions share this same layout — Sidebar/Header already
    // filter navigation down to whatever permissions their role grants, so no
    // separate kiosk-only route tree is needed.
    return <AdminLayout />;
};

export default PrivateRoutes;
