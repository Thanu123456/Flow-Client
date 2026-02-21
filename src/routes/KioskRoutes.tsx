import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Spin } from 'antd';
import KioskLayout from '../components/common/Layout/KioskLayout';

const KioskRoutes: React.FC = () => {
    const { isAuthenticated, isLoading, isKiosk } = useAuth();

    if (isLoading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Spin size="large" /></div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/kiosk/login" replace />;
    }

    if (!isKiosk) {
        return <Navigate to="/dashboard" replace />;
    }

    return <KioskLayout />;
};

export default KioskRoutes;
