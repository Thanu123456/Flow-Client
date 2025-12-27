import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Spin } from 'antd';

const PrivateRoutes: React.FC = () => {
    const { isAuthenticated, isLoading, isKiosk, mustChangePassword } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Spin size="large" /></div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (mustChangePassword && location.pathname !== '/change-password') {
        return <Navigate to="/change-password" replace />;
    }

    if (!mustChangePassword && location.pathname === '/change-password') {
         // If user manually goes to /change-password but doesn't need to force change, 
         // we allow it if they want to change it voluntarily? 
         // Actually, this page is reused for both Forced and Voluntary?
         // If voluntary, they shouldn't be redirected away.
         // BUT if this route is only used for FORCED change, then redirect.
         // Let's assume this route is for the generic "Change Password" feature too.
         // So we don't redirect away.
    }

    if (isKiosk) {
        // Prevent Kiosk users from accessing regular private routes
         return <Navigate to="/kiosk/dashboard" replace />;
    }

    return <Outlet />;
};

export default PrivateRoutes;
