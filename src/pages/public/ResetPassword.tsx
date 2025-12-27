import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Typography,
  Card,
  message,
  theme,
  Alert
} from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authService } from '../../services/auth/authService';
import PasswordStrengthMeter from '../../components/auth/PasswordStrengthMeter';

const { Title, Text } = Typography;

const ResetPassword: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const resetToken = searchParams.get('token');
    const [loading, setLoading] = useState(false);
    const { token: themeToken } = theme.useToken();
    const [password, setPassword] = useState('');
    const [tokenError, setTokenError] = useState<string | null>(null);

    const onFinish = async (values: any) => {
        if (!resetToken) {
            setTokenError('Invalid or missing reset token. Please request a new password reset link.');
            return;
        }

        setLoading(true);
        setTokenError(null);
        try {
            await authService.resetPassword({
                token: resetToken,
                password: values.password,
                confirm_password: values.confirm
            });
            message.success('Password reset successful! Please login with your new password.');
            navigate('/login');
        } catch (error: any) {
            console.error('Reset Password Failed:', error);
            const errorData = error.response?.data;
            const errorMsg = errorData?.message || 'Failed to reset password';

            // Check for token-related errors
            if (errorMsg.toLowerCase().includes('expired') || errorMsg.toLowerCase().includes('invalid token')) {
                setTokenError('Your password reset link has expired or is invalid. Please request a new one.');
            } else {
                message.error(errorMsg);
            }
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

                {/* Token Error Alert */}
                {tokenError && (
                    <Alert
                        message="Reset Link Invalid"
                        description={
                            <div>
                                <p>{tokenError}</p>
                                <Link to="/forgot-password">Request a new reset link</Link>
                            </div>
                        }
                        type="error"
                        showIcon
                        style={{ marginBottom: 24 }}
                    />
                )}

                {/* No Token Warning */}
                {!resetToken && !tokenError && (
                    <Alert
                        message="Missing Reset Token"
                        description={
                            <div>
                                <p>No reset token found. Please use the link from your email.</p>
                                <Link to="/forgot-password">Request a new reset link</Link>
                            </div>
                        }
                        type="warning"
                        showIcon
                        style={{ marginBottom: 24 }}
                    />
                )}

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
                            { min: 8, message: 'Password must be at least 8 characters' },
                            {
                                pattern: /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])/,
                                message: 'Must include uppercase, lowercase, number, and special character'
                            }
                        ]}
                        hasFeedback
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="New Password"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </Form.Item>
                    <PasswordStrengthMeter password={password} />

                    <Form.Item
                        name="confirm"
                        dependencies={['password']}
                        hasFeedback
                        style={{ marginTop: 16 }}
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
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            loading={loading}
                            disabled={!resetToken}
                        >
                            Reset Password
                        </Button>
                    </Form.Item>

                    <div style={{ textAlign: 'center' }}>
                        <Link to="/login">Back to Login</Link>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default ResetPassword;
