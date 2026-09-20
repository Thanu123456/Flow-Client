import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Spin } from 'antd';
import { usePermission } from '../contexts/PermissionContext';
import { PERMISSIONS } from '../types/auth/permissions';
import type { Permission } from '../types/auth/permissions';

// Where someone who can't see the dashboard lands instead, in priority order.
// Everyone is sent to /dashboard right after logging in, so without this a
// role that was never granted dashboard.view would arrive at a 403 wall on
// their very first page. /profile needs no permission and is the last resort.
const FALLBACKS: [Permission, string][] = [
    [PERMISSIONS.POS_SALES, '/pos'],
    [PERMISSIONS.SALES_VIEW, '/sales'],
    [PERMISSIONS.INVENTORY_VIEW, '/products'],
    [PERMISSIONS.CUSTOMERS_VIEW, '/customers'],
    [PERMISSIONS.PURCHASES_VIEW, '/purchases'],
];

// Guards /dashboard behind dashboard.view (the backend enforces the same
// permission on the dashboard endpoints — this just keeps the UI honest and
// gives everyone a sensible home page).
const DashboardRoute: React.FC = () => {
    const { hasPermission, isLoading } = usePermission();

    if (isLoading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Spin size="large" /></div>;
    }

    if (hasPermission(PERMISSIONS.DASHBOARD_VIEW)) {
        return <Outlet />;
    }

    const target = FALLBACKS.find(([perm]) => hasPermission(perm))?.[1] ?? '/profile';
    return <Navigate to={target} replace />;
};

export default DashboardRoute;
