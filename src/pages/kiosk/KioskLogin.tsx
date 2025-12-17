import React, { useState } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Typography, 
  Card, 
  message, 
  Modal,
  theme
} from 'antd';
import { UserOutlined, LockOutlined, InfoCircleOutlined, ShopOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { KioskLoginRequest } from '../../types/auth/kiosk.types';

const { Title, Text } = Typography;

const KioskLogin: React.FC = () => {
    const { kioskLogin } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { token } = theme.useToken();
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const loginData: KioskLoginRequest = {
                user_id: values.user_id,
                pin: values.pin,
            };
            await kioskLogin(loginData);
            messageApi.success('Shift Started Successfully!');
            navigate('/kiosk/dashboard');
        } catch (error: any) {
            console.error('Kiosk Login Failed:', error);
            const errorMsg = error.response?.data?.message || 'Invalid User ID or PIN';
            messageApi.error(errorMsg);
            form.setFieldValue('pin', ''); // Clear PIN on error
        } finally {
            setLoading(false);
        }
    };

    const showHelp = () => {
        Modal.info({
            title: 'Need Help?',
            content: (
                <div>
                    <p>Contact your manager or shop owner for assistance.</p>
                    <p>If you have forgotten your PIN, the manager can reset it from the Admin Dashboard.</p>
                </div>
            ),
            icon: <InfoCircleOutlined />,
            okText: 'Close',
            centered: true,
        });
    };

    return (
        <div style={{ 
            height: '100vh', 
            background: '#f0f2f5', 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center',
            padding: '24px'
        }}>
            {contextHolder}
            {/* Header / Logo Area */}
            <div style={{ marginBottom: 40, textAlign: 'center' }}>
                <div style={{ 
                    height: 64, 
                    width: 64, 
                    background: token.colorPrimary, 
                    borderRadius: '50%', 
                    margin: '0 auto 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                 }}>
                    <ShopOutlined style={{ fontSize: 32, color: '#fff' }} />
                </div>
                <Title level={2} style={{ marginBottom: 8 }}>POS Kiosk</Title>
                <Text type="secondary" style={{ fontSize: 16 }}>Enter your credentials to start shift</Text>
            </div>

            <Card 
                style={{ 
                    width: '100%', 
                    maxWidth: 480, 
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    borderRadius: 16
                }}
                styles={{ body: { padding: 40 } }}
                variant="borderless"
            >
                <Form
                    form={form}
                    name="kiosk_login"
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                >
                    <Form.Item
                        name="user_id"
                        rules={[{ required: true, message: 'Please enter User ID' }]}
                    >
                        <Input 
                            prefix={<UserOutlined style={{ fontSize: 20 }} />} 
                            placeholder="User ID (e.g. EMP001)" 
                            style={{ height: 50, fontSize: 18 }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="pin"
                        rules={[
                            { required: true, message: 'Please enter PIN' },
                            { pattern: /^[0-9]+$/, message: 'PIN must be numeric' },
                            { min: 4, max: 6, message: 'PIN must be 4-6 digits' }
                        ]}
                    >
                        <Input.Password 
                            prefix={<LockOutlined style={{ fontSize: 20 }} />} 
                            placeholder="PIN" 
                            style={{ height: 50, fontSize: 18 }}
                            maxLength={6}
                        />
                    </Form.Item>

                    <Form.Item style={{ marginTop: 24 }}>
                        <Button 
                            type="primary" 
                            htmlType="submit" 
                            block 
                            loading={loading}
                            style={{ height: 56, fontSize: 20, fontWeight: 600 }}
                        >
                            Start Shift
                        </Button>
                    </Form.Item>
                </Form>

                <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Button type="link" onClick={showHelp} icon={<InfoCircleOutlined />}>
                        Need help?
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default KioskLogin;
