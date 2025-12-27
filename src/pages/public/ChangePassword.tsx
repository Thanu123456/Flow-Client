import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Modal, Layout, theme } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PasswordStrengthMeter from '../../components/auth/PasswordStrengthMeter';
import { authService } from '../../services/auth/authService';

const { Title, Text } = Typography;
const { Content } = Layout;

const ChangePassword: React.FC = () => {
    const { logout, mustChangePassword } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { token } = theme.useToken();
    const [password, setPassword] = useState('');

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            await authService.changePassword({
                current_password: values.current_password,
                new_password: values.new_password,
                confirm_password: values.confirm_password,
            });
            
            Modal.success({
                title: 'Password Changed Successfully',
                content: 'Please login again with your new password.',
                onOk: async () => {
                    await logout(); // Logout to force re-login or update state if needed
                    navigate('/login');
                },
            });

        } catch (error: any) {
            console.error(error);
            const errorMsg = error.response?.data?.message || 'Failed to change password.';
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Content style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                background: token.colorBgLayout 
            }}>
                <Card 
                    style={{ width: '100%', maxWidth: 450, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    title={<div style={{ textAlign: 'center' }}><Title level={3}>Change Password</Title></div>}
                >
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                         <Text type="secondary">
                            {mustChangePassword 
                                ? "For security reasons, you must change your password before proceeding." 
                                : "Update your password to keep your account secure."}
                         </Text>
                    </div>

                    <Form
                        layout="vertical"
                        onFinish={onFinish}
                        requiredMark="optional"
                    >
                        <Form.Item
                            name="current_password"
                            label="Current Password"
                            rules={[{ required: true, message: 'Please enter your current password' }]}
                        >
                            <Input.Password prefix={<LockOutlined />} placeholder="Current Password" />
                        </Form.Item>

                        <Form.Item
                            name="new_password"
                            label="New Password"
                            rules={[
                                { required: true, message: 'Please enter your new password' },
                                { min: 8, message: 'Must be at least 8 characters' },
                                { 
                                    pattern: /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])/,
                                    message: 'Must include uppercase, lowercase, number, and special char'
                                }
                            ]}
                        >
                            <Input.Password 
                                prefix={<LockOutlined />} 
                                placeholder="New Password" 
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </Form.Item>
                        <PasswordStrengthMeter password={password} />

                        <Form.Item
                            name="confirm_password"
                            label="Confirm New Password"
                            dependencies={['new_password']}
                            rules={[
                                { required: true, message: 'Please confirm your new password' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('new_password') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('The two passwords do not match!'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password prefix={<LockOutlined />} placeholder="Confirm New Password" />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" block loading={loading}>
                                Change Password
                            </Button>
                        </Form.Item>
                         <div style={{ textAlign: 'center' }}>
                             <Button type="link" onClick={() => logout()}>
                                 Logout
                             </Button>
                        </div>
                    </Form>
                </Card>
            </Content>
        </Layout>
    );
};

export default ChangePassword;
