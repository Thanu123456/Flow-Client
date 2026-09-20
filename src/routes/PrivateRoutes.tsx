import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Spin } from 'antd';
import AdminLayout from '../components/common/Layout/AdminLayout';

// The only pages inside the shared admin layout a kiosk (register) session may
// open. Everything else — dashboard, reports, purchasing, catalogue admin,
// settings — belongs to the back office and sends the cashier home to the shift
// screen. (/kiosk/* lives under KioskRoutes, not here.) This is convenience and
// clarity only; the real enforcement is server-side (middleware.RestrictKioskScope).
const KIOSK_ALLOWED_PREFIXES = ['/pos', '/holds', '/profile', '/change-password'];

const PrivateRoutes: React.FC = () => {
    const { isAuthenticated, isLoading, mustChangePassword, role, isKiosk } = useAuth();
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

    if (isKiosk) {
        const path = location.pathname;
        const allowed = KIOSK_ALLOWED_PREFIXES.some((p) => path === p || path.startsWith(p + '/'));
        if (!allowed) {
            return <Navigate to="/kiosk/dashboard" replace />;
        }
    }

    // Kiosk (cashier) sessions share this layout for the few pages above.
    return <AdminLayout />;
};

export default PrivateRoutes;
