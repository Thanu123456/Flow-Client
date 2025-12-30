import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Layout, theme } from 'antd';
import Sidebar from './Sidebar';

const { Content } = Layout;

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { token } = theme.useToken();

  const sidebarWidth = collapsed ? 80 : 260;

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
        <Content
          style={{
            background: token.colorBgLayout,
            minHeight: '100vh',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
