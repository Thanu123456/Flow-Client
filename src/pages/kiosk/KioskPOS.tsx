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

const KioskPOS: React.FC = () => {
    const { endShift, user, tenant } = useAuth();
    const { token } = theme.useToken();

    const handleEndShift = async () => {
        try {
            await endShift();
            // Redirect handled by logout
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div style={{ padding: 24, background: token.colorBgLayout, minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2}>Kiosk POS</Title>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2}>Kiosk POS</Title>
                <Button type="primary" icon={<LogoutOutlined />} onClick={handleEndShift} danger>
                    End Shift
                </Button>
            </div>
            </div>
            
            <Card title="Shift Active">
                 <Text>
                    Employee: <strong>{user?.full_name}</strong> (ID: {user?.id})
                </Text>
                <br />
                 {tenant && (
                    <Text type="secondary">
                        Shop: {tenant.shop_name}
                    </Text>
                )}
            </Card>
        </div>
    );
};

export default KioskPOS;
