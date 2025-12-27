import React from 'react';
import { Outlet } from 'react-router-dom';
import { usePermission } from '../contexts/PermissionContext';
import type { Permission } from '../types/auth/permissions';
import { Spin, Result, Button } from 'antd';

interface PermissionRouteProps {
  requiredPermission?: Permission;
  requiredPermissions?: Permission[]; // Check if has ANY of these (default) or ALL? Let's say ANY.
  requireAll?: boolean;
}

const PermissionRoute: React.FC<PermissionRouteProps> = ({ 
  requiredPermission, 
  requiredPermissions = [], 
  requireAll = false 
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isLoading } = usePermission();

  if (isLoading) {
     return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Spin size="large" /></div>;
  }

  let allowed = true;

  if (requiredPermission) {
    allowed = hasPermission(requiredPermission);
  } else if (requiredPermissions.length > 0) {
     if (requireAll) {
       allowed = hasAllPermissions(requiredPermissions);
     } else {
       allowed = hasAnyPermission(requiredPermissions);
     }
  }

  if (!allowed) {
    return (
      <div style={{ padding: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Result
          status="403"
          title="403"
          subTitle="Sorry, you are not authorized to access this page."
          extra={<Button type="primary" onClick={() => window.location.href = '/dashboard'}>Back to Dashboard</Button>}
        />
      </div>
    );
  }

  return <Outlet />;
};

export default PermissionRoute;
