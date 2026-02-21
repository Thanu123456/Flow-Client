import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Layout, theme } from 'antd';
import Sidebar from './Sidebar';
import HeaderWithSearch from './HeaderWithSearch';

const { Content } = Layout;

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { token } = theme.useToken();
  const location = useLocation();

  const sidebarWidth = collapsed ? 80 : 260;
  const isDashboard = location.pathname === '/dashboard';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      <Layout
        style={{
          marginLeft: sidebarWidth,
          transition: 'margin-left 0.3s cubic-bezier(0.2, 0, 0, 1)',
          minHeight: '100vh',
        }}
      >
        {!isDashboard && (
          <HeaderWithSearch
            onMenuClick={() => setCollapsed(!collapsed)}
            collapsed={false}
            sidebarOpen={!collapsed}
            setSidebarOpen={(open) => setCollapsed(!open)}
          />
        )}
        <Content
          style={{
            background: token.colorBgLayout,
            minHeight: isDashboard ? '100vh' : 'calc(100vh - 64px)',
            padding: isDashboard ? '0' : '24px',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
