import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PublicRoutes: React.FC = () => {
    const { isAuthenticated, isKiosk, role } = useAuth();

    if (isAuthenticated) {
        if (isKiosk) {
            return <Navigate to="/kiosk/dashboard" replace />;
        }
        if (role === 'super_admin') {
             return <Navigate to="/superadmin/dashboard" replace />;
        }
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default PublicRoutes;
