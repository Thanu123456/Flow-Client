import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Layout, theme } from 'antd';
import HeaderWithSearch from './HeaderWithSearch';

const { Content } = Layout;

const KioskLayout: React.FC = () => {
    const { token } = theme.useToken();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <HeaderWithSearch
                onMenuClick={() => setSidebarOpen(!sidebarOpen)}
                collapsed={false}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
            />
            <Content
                style={{
                    background: token.colorBgLayout,
                    minHeight: 'calc(100vh - 64px)',
                    padding: '24px',
                }}
            >
                <Outlet />
            </Content>
        </Layout>
    );
};

export default KioskLayout;
