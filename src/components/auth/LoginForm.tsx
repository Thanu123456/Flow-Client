import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Divider, Alert, Space } from 'antd';
import { MailOutlined, LockOutlined, GoogleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import type { LoginRequest } from '../../types/auth/auth.types';

interface LoginFormProps {
  onSubmit: (values: LoginRequest) => Promise<void>;
  onGoogleLogin?: () => void;
  loading?: boolean;
  error?: string | null;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  onGoogleLogin,
  loading = false,
  error = null,
}) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: LoginRequest) => {
    setSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form
      form={form}
      name="login"
      onFinish={handleSubmit}
      layout="vertical"
      requiredMark={false}
      initialValues={{ remember_me: false }}
    >
      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          closable
          style={{ marginBottom: 24 }}
        />
      )}

      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: 'Please enter your email' },
          { type: 'email', message: 'Please enter a valid email' },
        ]}
      >
        <Input
          prefix={<MailOutlined />}
          placeholder="Enter your email"
          size="large"
          autoComplete="email"
        />
      </Form.Item>

      <Form.Item
        name="password"
        label="Password"
        rules={[{ required: true, message: 'Please enter your password' }]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Enter your password"
          size="large"
          autoComplete="current-password"
        />
      </Form.Item>

      <Form.Item>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Form.Item name="remember_me" valuePropName="checked" noStyle>
            <Checkbox>Remember me</Checkbox>
          </Form.Item>
          <Link to="/forgot-password">Forgot Password?</Link>
        </Space>
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          size="large"
          block
          loading={loading || submitting}
        >
          Sign In
        </Button>
      </Form.Item>

      {onGoogleLogin && (
        <>
          <Divider plain>or</Divider>
          <Form.Item>
            <Button
              icon={<GoogleOutlined />}
              size="large"
              block
              onClick={onGoogleLogin}
              disabled={loading || submitting}
            >
              Continue with Google
            </Button>
          </Form.Item>
        </>
      )}

      <div style={{ textAlign: 'center', marginTop: 16 }}>
        Don't have an account? <Link to="/register">Register</Link>
      </div>
    </Form>
  );
};

export default LoginForm;
