import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Typography, 
  message, 
  Modal,
  theme,
  Row,
  Col
} from 'antd';
import { UserOutlined, InfoCircleOutlined, ShopOutlined, FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import VirtualKeypad from '../../components/kiosk/VirtualKeypad';
import type { KioskLoginRequest } from '../../types/auth/kiosk.types';

const { Title, Text } = Typography;

const KioskLogin: React.FC = () => {
    const { kioskLogin } = useAuth();
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

    useEffect(() => {
        // Attempt to load tenant info from localStorage for Logo/Name
        // If not found, maybe redirect to setup? But for now assume it's pre-configured.
    }, []);

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
            const newValue = userIdValue + key; // User ID might be alphanumeric, but keypad is numeric. 
            // If User ID is alphanumeric, they must use physical keyboard. 
            // Requirements: "Add virtual numeric keypad component". 
            // "User ID validation (3-20 chars, alphanumeric)".
            // If User ID is alphanumeric, numeric keypad is insufficient? 
            // Use numeric keypad for PIN primarily. 
            // For User ID, if it's numeric (e.g. Employee Number), it works.
            setUserIdValue(newValue);
            form.setFieldsValue({ user_id: newValue });
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
            background: '#f0f2f5', 
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            {contextHolder}
            {/* Top Bar */}
            <div style={{ padding: 16, display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                    icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />} 
                    onClick={toggleFullscreen}
                >
                    {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                </Button>
            </div>

            <Row style={{ flex: 1, height: '100%' }}>
                {/* Left Side: Login Form */}
                <Col xs={24} md={12} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                    <div style={{ maxWidth: 400, width: '100%' }}>
                         <div style={{ textAlign: 'center', marginBottom: 32 }}>
                            <div style={{ 
                                height: 80, 
                                width: 80, 
                                background: token.colorPrimary, 
                                borderRadius: '50%', 
                                margin: '0 auto 16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                             }}>
                                <ShopOutlined style={{ fontSize: 40, color: '#fff' }} />
                            </div>
                            <Title level={2}>POS Access</Title>
                            <Text type="secondary">Enter ID and PIN to start</Text>
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
                                    { min: 3, max: 20, message: 'ID must be 3-20 characters' },
                                    { pattern: /^[a-zA-Z0-9]+$/, message: 'Alphanumeric only' }
                                ]}
                            >
                                <Input 
                                    prefix={<UserOutlined />} 
                                    placeholder="User ID" 
                                    onClick={() => setActiveField('user_id')}
                                    onChange={(e) => setUserIdValue(e.target.value)} // Sync manual typing
                                    style={{ borderColor: activeField === 'user_id' ? token.colorPrimary : undefined }}
                                />
                            </Form.Item>

                            <Form.Item
                                name="pin"
                                rules={[
                                    { required: true, message: 'Please enter PIN' },
                                    { len: 4, message: 'PIN must be 4-6 digits' }, // Adjust if variable length
                                    // Visual indicator handled separately below
                                ]}
                            >
                                {/* Hidden input for form submission, we use visual indicator */}
                                <Input.Password 
                                    placeholder="PIN"
                                    onClick={() => setActiveField('pin')} 
                                    style={{ display: 'none' }}
                                />
                                <div 
                                    onClick={() => setActiveField('pin')}
                                    style={{ 
                                        display: 'flex', 
                                        justifyContent: 'center', 
                                        gap: 12, 
                                        padding: 16, 
                                        border: `1px solid ${activeField === 'pin' ? token.colorPrimary : '#d9d9d9'}`,
                                        borderRadius: 8,
                                        cursor: 'pointer',
                                        background: '#fff'
                                    }}
                                >
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} style={{
                                            width: 16,
                                            height: 16,
                                            borderRadius: '50%',
                                            background: i < pinValue.length ? token.colorPrimary : '#f0f0f0',
                                            border: '1px solid #d9d9d9'
                                        }} />
                                    ))}
                                </div>
                            </Form.Item>

                            <Button type="primary" htmlType="submit" block size="large" loading={loading} style={{ height: 50 }}>
                                ENTER
                            </Button>
                        </Form>

                         <div style={{ textAlign: 'center', marginTop: 16 }}>
                            <Button type="link" onClick={showHelp} icon={<InfoCircleOutlined />}>Help</Button>
                        </div>
                    </div>
                </Col>

                {/* Right Side: Keypad (Visible on larger screens or always?) */}
                <Col xs={0} md={12} style={{ background: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', borderLeft: '1px solid #f0f0f0' }}>
                    <div>
                        <VirtualKeypad 
                            onKeyPress={handleKeypadPress} 
                            onBackspace={handleBackspace} 
                            onClear={handleClear}
                        />
                        <div style={{ textAlign: 'center', marginTop: 32 }}>
                            <Text type="secondary">Use the keypad to enter credentials</Text>
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default KioskLogin;
