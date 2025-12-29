import React, { useState } from 'react';
import { Form, Input, Button, Alert, Typography, Result } from 'antd';
import { LockOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import type { ResetPasswordRequest } from '../../types/auth/auth.types';
import PasswordStrengthMeter from './PasswordStrengthMeter';

const { Title, Paragraph } = Typography;

interface ResetPasswordFormProps {
  token: string;
  onSubmit: (data: ResetPasswordRequest) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  loginUrl?: string;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  token,
  onSubmit,
  loading = false,
  error = null,
  loginUrl = '/login',
}) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [password, setPassword] = useState('');

  const handleSubmit = async (values: { password: string; confirm_password: string }) => {
    setSubmitting(true);
    try {
      await onSubmit({
        token,
        password: values.password,
        confirm_password: values.confirm_password,
      });
      setSubmitted(true);
    } catch {
      // Error handled by parent
    } finally {
      setSubmitting(false);
    }
  };

  const validatePassword = (_: unknown, value: string) => {
    if (!value) return Promise.reject('Please enter a password');
    if (value.length < 8) return Promise.reject('Password must be at least 8 characters');
    if (!/[A-Z]/.test(value)) return Promise.reject('Password must contain at least one uppercase letter');
    if (!/[a-z]/.test(value)) return Promise.reject('Password must contain at least one lowercase letter');
    if (!/[0-9]/.test(value)) return Promise.reject('Password must contain at least one number');
    if (!/[^A-Za-z0-9]/.test(value)) return Promise.reject('Password must contain at least one special character');
    return Promise.resolve();
  };

  if (submitted) {
    return (
      <Result
        status="success"
        title="Password Reset Successful"
        subTitle="Your password has been reset successfully. You can now login with your new password."
        extra={[
          <Button type="primary" key="login">
            <Link to={loginUrl}>Go to Login</Link>
          </Button>,
        ]}
      />
    );
  }

  return (
    <div style={{ maxWidth: 400 }}>
      <div style={{ marginBottom: 24 }}>
        <Link to={loginUrl}>
          <ArrowLeftOutlined /> Back to Login
        </Link>
      </div>

      <Title level={3}>Reset Password</Title>
      <Paragraph type="secondary" style={{ marginBottom: 24 }}>
        Enter your new password below. Make sure it's strong and secure.
      </Paragraph>

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          closable
          style={{ marginBottom: 24 }}
        />
      )}

      <Form
        form={form}
        name="reset-password"
        onFinish={handleSubmit}
        layout="vertical"
        requiredMark={false}
      >
        <Form.Item
          name="password"
          label="New Password"
          rules={[{ validator: validatePassword }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Enter new password"
            size="large"
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Item>
        <PasswordStrengthMeter password={password} />

        <Form.Item
          name="confirm_password"
          label="Confirm Password"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Please confirm your password' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject('Passwords do not match');
              },
            }),
          ]}
          style={{ marginTop: 16 }}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Confirm new password"
            size="large"
          />
        </Form.Item>

        <Form.Item style={{ marginTop: 24 }}>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={loading || submitting}
          >
            Reset Password
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ResetPasswordForm;
