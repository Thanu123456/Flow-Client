import React, { useState } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Typography, 
  Card, 
  message, 
  theme 
} from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../../services/auth/authService';

const { Title, Text } = Typography;

const ResetPassword: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [loading, setLoading] = useState(false);
    const { token: themeToken } = theme.useToken();

    const onFinish = async (values: any) => {
        if (!token) {
            message.error('Invalid or missing reset token.');
            return;
        }

        setLoading(true);
        try {
            await authService.resetPassword({
                token: token,
                password: values.password
            });
            message.success('Password reset successful! login with new password.');
            navigate('/login');
        } catch (error: any) {
            console.error('Reset Password Failed:', error);
            const errorMsg = error.response?.data?.message || 'Failed to reset password';
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            minHeight: '100vh', 
            background: themeToken.colorBgLayout, 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            padding: '24px'
        }}>
            <Card 
                style={{ 
                    width: '100%', 
                    maxWidth: 400, 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)' 
                }}
                bordered={false}
            >
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Title level={3}>Reset Password</Title>
                    <Text type="secondary">Enter your new password below.</Text>
                </div>

                <Form
                    name="reset_password"
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                >
                    <Form.Item
                        name="password"
                        rules={[
                            { required: true, message: 'Please input your password!' },
                            { min: 8, message: 'Password must be at least 8 characters' }
                        ]}
                        hasFeedback
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="New Password" />
                    </Form.Item>

                    <Form.Item
                        name="confirm"
                        dependencies={['password']}
                        hasFeedback
                        rules={[
                            { required: true, message: 'Please confirm your password!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('The two passwords that you entered do not match!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Confirm Password" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={loading}>
                            Reset Password
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default ResetPassword;
