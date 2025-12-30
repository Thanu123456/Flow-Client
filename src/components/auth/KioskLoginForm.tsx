import React, { useState } from 'react';
import { Form, Input, Button, Alert, Typography, Space, Modal } from 'antd';
import { UserOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import type { KioskLoginRequest } from '../../types/auth/kiosk.types';
import PINInput from './PINInput';

const { Title, Text, Paragraph } = Typography;

interface KioskLoginFormProps {
  onSubmit: (values: KioskLoginRequest) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  shopName?: string;
  shopLogo?: string;
  rateLimitMessage?: string | null;
  lockedMessage?: string | null;
}

const KioskLoginForm: React.FC<KioskLoginFormProps> = ({
  onSubmit,
  loading = false,
  error = null,
  shopName = 'POS System',
  shopLogo,
  rateLimitMessage = null,
  lockedMessage = null,
}) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [helpModalVisible, setHelpModalVisible] = useState(false);

  const handleSubmit = async (values: KioskLoginRequest) => {
    setSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setSubmitting(false);
    }
  };

  const isDisabled = !!rateLimitMessage || !!lockedMessage;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <div style={{
        background: 'white',
        borderRadius: 16,
        padding: '48px 40px',
        width: '100%',
        maxWidth: 400,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        {/* Logo and Shop Name */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          {shopLogo ? (
            <img
              src={shopLogo}
              alt={shopName}
              style={{ height: 80, marginBottom: 16, objectFit: 'contain' }}
            />
          ) : (
            <div style={{
              width: 80,
              height: 80,
              background: '#f0f0f0',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: 32,
              color: '#666'
            }}>
              <UserOutlined />
            </div>
          )}
          <Title level={3} style={{ margin: 0 }}>{shopName}</Title>
          <Text type="secondary">Employee Login</Text>
        </div>

        {lockedMessage && (
          <Alert
            message="Account Locked"
            description={lockedMessage}
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        {rateLimitMessage && !lockedMessage && (
          <Alert
            message="Too Many Attempts"
            description={rateLimitMessage}
            type="warning"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        {error && !lockedMessage && !rateLimitMessage && (
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
          name="kiosk-login"
          onFinish={handleSubmit}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="user_id"
            label="User ID"
            rules={[
              { required: true, message: 'Please enter your User ID' },
              { min: 3, max: 20, message: 'User ID must be 3-20 characters' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Enter User ID (e.g., EMP001)"
              size="large"
              autoFocus
              autoComplete="off"
              disabled={isDisabled}
              style={{ fontSize: 18 }}
            />
          </Form.Item>

          <Form.Item
            name="pin"
            label="PIN"
            rules={[
              { required: true, message: 'Please enter your PIN' },
              { min: 4, max: 6, message: 'PIN must be 4-6 digits' },
              { pattern: /^\d+$/, message: 'PIN must contain only numbers' },
            ]}
          >
            <PINInput
              length={6}
              disabled={isDisabled}
              onChange={(pin) => form.setFieldValue('pin', pin)}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 16, marginTop: 32 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading || submitting}
              disabled={isDisabled}
              style={{
                height: 56,
                fontSize: 18,
                borderRadius: 8,
              }}
            >
              Start Shift
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center' }}>
          <Button
            type="link"
            icon={<QuestionCircleOutlined />}
            onClick={() => setHelpModalVisible(true)}
          >
            Need help?
          </Button>
        </div>
      </div>

      {/* Help Modal */}
      <Modal
        title="Need Help?"
        open={helpModalVisible}
        onCancel={() => setHelpModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setHelpModalVisible(false)}>
            Close
          </Button>
        ]}
      >
        <Space direction="vertical" size="middle">
          <div>
            <Text strong>How to Login:</Text>
            <Paragraph>
              1. Enter your User ID (provided by your manager, e.g., EMP001)
              <br />
              2. Enter your 4-6 digit PIN
              <br />
              3. Click "Start Shift" to begin
            </Paragraph>
          </div>

          <div>
            <Text strong>Forgot your PIN?</Text>
            <Paragraph>
              Contact your manager or store owner to reset your PIN.
            </Paragraph>
          </div>

          <div>
            <Text strong>Account Locked?</Text>
            <Paragraph>
              If your account is locked after multiple failed attempts,
              wait 15 minutes or contact your manager.
            </Paragraph>
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default KioskLoginForm;
