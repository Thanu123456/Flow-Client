import React from 'react';
import { 
  Button, 
  Typography, 
  Card,
  theme 
} from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
    const { logout, user, tenant } = useAuth();
    const { token } = theme.useToken();

    return (
        <div style={{ padding: 24, background: token.colorBgLayout, minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2}>Admin Dashboard</Title>
                <Button type="primary" icon={<LogoutOutlined />} onClick={logout} danger>
                    Logout
                </Button>
            </div>
            
            <Card title="Welcome Back">
                <Text>
                    Hello, <strong>{user?.full_name}</strong>! 
                </Text>
                <br />
                {tenant && (
                    <Text type="secondary">
                        Managing: {tenant.shop_name} ({tenant.business_type})
                    </Text>
                )}
            </Card>
        </div>
    );
};

export default Dashboard;
