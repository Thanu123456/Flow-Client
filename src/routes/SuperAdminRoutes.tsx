import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Spin } from 'antd';

const SuperAdminRoutes: React.FC = () => {
    const { isAuthenticated, isLoading, role } = useAuth();

    if (isLoading) {
         return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Spin size="large" /></div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/superadmin/login" replace />;
    }

    if (role !== 'super_admin') {
         // Optionally show 403 Forbidden page
         return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default SuperAdminRoutes;
