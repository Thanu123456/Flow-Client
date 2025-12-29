import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Spin } from 'antd';

const SuperAdminRoutes: React.FC = () => {
    const { isAuthenticated, isLoading, role, mustChangePassword } = useAuth();
    const location = useLocation();

    if (isLoading) {
         return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Spin size="large" /></div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/superadmin/login" replace />;
    }

    if (role !== 'super_admin') {
         // Redirect non-super admin users to regular dashboard
         return <Navigate to="/dashboard" replace />;
    }

    // Force password change if required (first login)
    if (mustChangePassword && !location.pathname.includes('/change-password')) {
        return <Navigate to="/superadmin/change-password" replace />;
    }

    return <Outlet />;
};

export default SuperAdminRoutes;
