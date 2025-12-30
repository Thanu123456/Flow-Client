import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Alert, Typography } from 'antd';
import { MailOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import type { SuperAdminLoginRequest } from '../../types/auth/superadmin.types';

const { Text } = Typography;

interface SuperAdminLoginFormProps {
  onSubmit: (values: SuperAdminLoginRequest) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  showMfaField?: boolean;
  rateLimitMessage?: string | null;
}

const SuperAdminLoginForm: React.FC<SuperAdminLoginFormProps> = ({
  onSubmit,
  loading = false,
  error = null,
  showMfaField = false,
  rateLimitMessage = null,
}) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: SuperAdminLoginRequest) => {
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
      name="superadmin-login"
      onFinish={handleSubmit}
      layout="vertical"
      requiredMark={false}
      initialValues={{ remember_me: false }}
    >
      {rateLimitMessage && (
        <Alert
          message="Too Many Attempts"
          description={rateLimitMessage}
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          closable
          style={{ marginBottom: 24 }}
        />
      )}

      <Text type="secondary" style={{ display: 'block', marginBottom: 24, textAlign: 'center' }}>
        Super Admin Portal - Restricted Access
      </Text>

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
          placeholder="Enter admin email"
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

      {showMfaField && (
        <Form.Item
          name="mfa_code"
          label="Two-Factor Authentication Code"
          rules={[
            { required: true, message: 'Please enter your 2FA code' },
            { len: 6, message: '2FA code must be 6 digits' },
          ]}
        >
          <Input
            prefix={<SafetyOutlined />}
            placeholder="Enter 6-digit code"
            size="large"
            maxLength={6}
            style={{ letterSpacing: '0.5em', textAlign: 'center' }}
          />
        </Form.Item>
      )}

      <Form.Item>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Form.Item name="remember_me" valuePropName="checked" noStyle>
            <Checkbox>Remember me</Checkbox>
          </Form.Item>
          <Link to="/superadmin/forgot-password">Forgot Password?</Link>
        </div>
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          size="large"
          block
          loading={loading || submitting}
          disabled={!!rateLimitMessage}
        >
          Sign In
        </Button>
      </Form.Item>

      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <Link to="/login">Back to Owner Login</Link>
      </div>
    </Form>
  );
};

export default SuperAdminLoginForm;
