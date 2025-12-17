import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Spin } from 'antd';

const PrivateRoutes: React.FC = () => {
    const { isAuthenticated, isLoading, isKiosk } = useAuth();

    if (isLoading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Spin size="large" /></div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (isKiosk) {
        // Prevent Kiosk users from accessing regular private routes
         return <Navigate to="/kiosk/dashboard" replace />;
    }

    return <Outlet />;
};

export default PrivateRoutes;
