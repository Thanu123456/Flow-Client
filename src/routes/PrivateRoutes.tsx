import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Spin } from 'antd';

const PrivateRoutes: React.FC = () => {
    const { isAuthenticated, isLoading, isKiosk, mustChangePassword, role } = useAuth();
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

    // Prevent Kiosk users from accessing regular private routes
    if (isKiosk) {
         return <Navigate to="/kiosk/dashboard" replace />;
    }

    return <Outlet />;
};

export default PrivateRoutes;
