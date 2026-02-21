import React from 'react';
import {
    Typography,
    Card,
    theme
} from 'antd';
import { useAuth } from '../../contexts/AuthContext';

const { Text } = Typography;

const KioskPOS: React.FC = () => {
    const { user, tenant } = useAuth();
    const { token } = theme.useToken();

    return (
        <div style={{ padding: 24, background: token.colorBgLayout, minHeight: 'calc(100vh - 64px)' }}>
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
