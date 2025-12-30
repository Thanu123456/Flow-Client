import React, { useState } from 'react';
import { Form, Input, Button, Alert, Typography, Result } from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Paragraph } = Typography;

interface ForgotPasswordFormProps {
  onSubmit: (email: string) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  backUrl?: string;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onSubmit,
  loading = false,
  error = null,
  backUrl = '/login',
}) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const handleSubmit = async (values: { email: string }) => {
    setSubmitting(true);
    try {
      await onSubmit(values.email);
      setSubmittedEmail(values.email);
      setSubmitted(true);
    } catch {
      // Error handled by parent
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Result
        status="success"
        title="Check Your Email"
        subTitle={
          <div>
            <Paragraph>
              We've sent a password reset link to:
            </Paragraph>
            <Paragraph strong>{submittedEmail}</Paragraph>
            <Paragraph type="secondary">
              The link will expire in 1 hour. If you don't see the email,
              check your spam folder.
            </Paragraph>
          </div>
        }
        extra={[
          <Button type="primary" key="login">
            <Link to={backUrl}>Back to Login</Link>
          </Button>,
          <Button
            key="resend"
            onClick={() => {
              setSubmitted(false);
              form.setFieldValue('email', submittedEmail);
            }}
          >
            Send Again
          </Button>,
        ]}
      />
    );
  }

  return (
    <div style={{ maxWidth: 400 }}>
      <div style={{ marginBottom: 24 }}>
        <Link to={backUrl}>
          <ArrowLeftOutlined /> Back to Login
        </Link>
      </div>

      <Title level={3}>Forgot Password?</Title>
      <Paragraph type="secondary" style={{ marginBottom: 24 }}>
        Enter your email address and we'll send you a link to reset your password.
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
        name="forgot-password"
        onFinish={handleSubmit}
        layout="vertical"
        requiredMark={false}
      >
        <Form.Item
          name="email"
          label="Email Address"
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

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={loading || submitting}
          >
            Send Reset Link
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ForgotPasswordForm;
