import React, { useState } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Typography, 
  message, 
  Modal,
  theme,
  Row,
  Col,
  Avatar,
  Card
} from 'antd';
import { UserOutlined, InfoCircleOutlined, ShopOutlined, FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext'; // Added TenantContext
import VirtualKeypad from '../../components/kiosk/VirtualKeypad';
import type { KioskLoginRequest } from '../../types/auth/kiosk.types';

const { Title, Text } = Typography;

const KioskLogin: React.FC = () => {
    const { kioskLogin } = useAuth();
    const { tenant } = useTenant(); // Get tenant info
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { token } = theme.useToken();
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const [isFullscreen, setIsFullscreen] = useState(false);
    
    // Keypad state
    const [activeField, setActiveField] = useState<'user_id' | 'pin'>('user_id');
    const [pinValue, setPinValue] = useState('');
    const [userIdValue, setUserIdValue] = useState('');

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(err => console.error(err));
        } else {
            document.exitFullscreen().then(() => setIsFullscreen(false)).catch(err => console.error(err));
        }
    };

    const handleKeypadPress = (key: string) => {
        if (activeField === 'pin') {
            if (pinValue.length < 6) {
                const newValue = pinValue + key;
                setPinValue(newValue);
                form.setFieldsValue({ pin: newValue });
            }
        } else {
            if (userIdValue.length < 10) { // Limit numeric ID length via keypad
                const newValue = userIdValue + key;
                setUserIdValue(newValue);
                form.setFieldsValue({ user_id: newValue });
            }
        }
    };

    const handleBackspace = () => {
        if (activeField === 'pin') {
            const newValue = pinValue.slice(0, -1);
            setPinValue(newValue);
            form.setFieldsValue({ pin: newValue });
        } else {
            const newValue = userIdValue.slice(0, -1);
            setUserIdValue(newValue);
            form.setFieldsValue({ user_id: newValue });
        }
    };

    const handleClear = () => {
        if (activeField === 'pin') {
            setPinValue('');
            form.setFieldsValue({ pin: '' });
        } else {
            setUserIdValue('');
            form.setFieldsValue({ user_id: '' });
        }
    };

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
            setPinValue('');
            form.setFieldValue('pin', '');
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
                    <p>Refer to the admin dashboard to reset PINS.</p>
                </div>
            ),
            centered: true,
        });
    };

    return (
        <div style={{ 
            height: '100vh', 
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', 
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            {contextHolder}
            {/* Top Bar */}
            <div style={{ padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Avatar 
                        src={tenant?.logo_url} 
                        icon={<ShopOutlined />} 
                        size={48} 
                        style={{ background: token.colorPrimary }}
                    />
                    <Title level={3} style={{ margin: 0 }}>{tenant?.shop_name || 'Flow POS'}</Title>
                </div>
                <Button 
                    size="large"
                    icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />} 
                    onClick={toggleFullscreen}
                    style={{ borderRadius: 10 }}
                >
                    {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                </Button>
            </div>

            <Row style={{ flex: 1, paddingBottom: 40 }}>
                {/* Left Side: Login Form */}
                <Col xs={24} md={12} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                    <Card style={{ 
                        maxWidth: 450, 
                        width: '100%', 
                        borderRadius: 24, 
                        boxShadow: '0 12px 30px rgba(0,0,0,0.1)',
                        padding: '20px 10px'
                    }}>
                         <div style={{ textAlign: 'center', marginBottom: 40 }}>
                            <Title level={2} style={{ marginBottom: 8 }}>Team Sign In</Title>
                            <Text type="secondary" style={{ fontSize: 16 }}>Tap input fields to use keypad</Text>
                        </div>

                        <Form
                            form={form}
                            onFinish={onFinish}
                            layout="vertical"
                            size="large"
                        >
                            <Form.Item
                                name="user_id"
                                rules={[
                                    { required: true, message: 'Please enter User ID' },
                                    { min: 3, max: 20, message: 'ID must be 3-20 characters' }
                                ]}
                            >
                                <Input 
                                    prefix={<UserOutlined style={{ color: activeField === 'user_id' ? token.colorPrimary : '#bfbfbf' }} />} 
                                    placeholder="Enter User ID" 
                                    onClick={() => setActiveField('user_id')}
                                    onChange={(e) => setUserIdValue(e.target.value)}
                                    style={{ 
                                        height: 64, 
                                        borderRadius: 16, 
                                        fontSize: 18,
                                        borderWidth: activeField === 'user_id' ? 2 : 1,
                                        borderColor: activeField === 'user_id' ? token.colorPrimary : undefined
                                    }}
                                />
                            </Form.Item>

                            <Form.Item
                                name="pin"
                                label={<Text strong style={{ fontSize: 16 }}>Security PIN</Text>}
                                rules={[
                                    { required: true, message: 'Please enter PIN' },
                                    { min: 4, message: 'Minimum 4 digits' }
                                ]}
                            >
                                <Input.Password 
                                    style={{ display: 'none' }}
                                />
                                <div 
                                    onClick={() => setActiveField('pin')}
                                    style={{ 
                                        display: 'flex', 
                                        justifyContent: 'center', 
                                        gap: 16, 
                                        padding: '24px 16px', 
                                        border: `2px solid ${activeField === 'pin' ? token.colorPrimary : '#e8e8e8'}`,
                                        borderRadius: 16,
                                        cursor: 'pointer',
                                        background: activeField === 'pin' ? '#fff' : '#fafafa',
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} style={{
                                            width: 20,
                                            height: 20,
                                            borderRadius: '50%',
                                            background: i < pinValue.length ? token.colorPrimary : '#e0e0e0',
                                            transform: i < pinValue.length ? 'scale(1.1)' : 'scale(1)',
                                            transition: 'all 0.2s',
                                            boxShadow: i < pinValue.length ? `0 0 8px ${token.colorPrimary}40` : 'none'
                                        }} />
                                    ))}
                                </div>
                            </Form.Item>

                            <div style={{ marginTop: 40 }}>
                                <Button 
                                    type="primary" 
                                    htmlType="submit" 
                                    block 
                                    size="large" 
                                    loading={loading} 
                                    style={{ 
                                        height: 64, 
                                        fontSize: 20, 
                                        fontWeight: 600, 
                                        borderRadius: 16,
                                        boxShadow: `0 8px 20px ${token.colorPrimary}40`
                                    }}
                                >
                                    START SHIFT
                                </Button>
                                <div style={{ textAlign: 'center', marginTop: 24 }}>
                                    <Button type="link" onClick={showHelp} icon={<InfoCircleOutlined />} style={{ fontSize: 16 }}>
                                        Forgot PIN or ID?
                                    </Button>
                                </div>
                            </div>
                        </Form>
                    </Card>
                </Col>

                {/* Right Side: Keypad */}
                <Col xs={0} md={12} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ width: '100%', maxWidth: 500 }}>
                        <VirtualKeypad 
                            onKeyPress={handleKeypadPress} 
                            onBackspace={handleBackspace} 
                            onClear={handleClear}
                            disabled={loading}
                        />
                        <div style={{ textAlign: 'center', marginTop: 40 }}>
                             <Typography.Title level={4} type="secondary" style={{ fontWeight: 400 }}>
                                {activeField === 'pin' ? 'Entering Security PIN' : 'Entering User ID'}
                             </Typography.Title>
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default KioskLogin;
