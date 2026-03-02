import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Layout } from 'antd';
import Sidebar from './Sidebar';

const { Content } = Layout;

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  const sidebarWidth = collapsed ? 72 : 264;

  return (
    <Layout style={{ minHeight: '100vh', background: '#f8f9fb' }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      <Layout
        style={{
          marginLeft: sidebarWidth,
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          minHeight: '100vh',
          background: '#f8f9fb',
        }}
      >
        <Content
          style={{
            background: '#f8f9fb',
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
