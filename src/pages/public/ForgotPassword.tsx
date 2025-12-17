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
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { authService } from '../../services/auth/authService';
import { useApiError } from '../../hooks/useApiError';
import { Alert } from 'antd';

const { Title, Text } = Typography;

const ForgotPassword: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const { token } = theme.useToken();
    const apiError = useApiError();

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            await authService.forgotPassword(values.email);
            message.success('Password reset link sent to your email!');
        } catch (error: any) {
            console.error('Forgot Password Failed:', error);
            const errorMsg = error.response?.data?.message || 'Failed to process request';
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            minHeight: '100vh', 
            background: token.colorBgLayout, 
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
                    <Title level={3}>Forgot Password?</Title>
                    <Text type="secondary">Enter your email to reset your password.</Text>
                </div>

                {apiError && (
                    <Alert
                        message="Error"
                        description={apiError.message}
                        type="error"
                        showIcon
                        style={{ marginBottom: 24 }}
                    />
                )}

                <Form
                    name="forgot_password"
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                >
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Please input your Email!' }, 
                            { type: 'email', message: 'Invalid Email Format'}
                        ]}
                    >
                        <Input prefix={<MailOutlined />} placeholder="Email" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={loading}>
                            Send Reset Link
                        </Button>
                    </Form.Item>

                    <div style={{ textAlign: 'center' }}>
                        <Link to="/login"><ArrowLeftOutlined /> Back to Login</Link>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default ForgotPassword;
