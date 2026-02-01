import React, { useState } from 'react';
import { Modal, Form, Input, Typography, Alert, App } from 'antd';
import { useUserStore } from '../../store/management/userStore';
import type { User } from '../../types/entities/user.types';

const { Text } = Typography;

interface ResetPINModalProps {
  visible: boolean;
  user: User | null;
  onCancel: () => void;
  onSuccess: () => void;
}

interface ResetPINFormData {
  newPin: string;
  confirmNewPin: string;
}

const ResetPINModal: React.FC<ResetPINModalProps> = ({
  visible,
  user,
  onCancel,
  onSuccess,
}) => {
  const { message } = App.useApp();
  const [form] = Form.useForm<ResetPINFormData>();
  const [submitting, setSubmitting] = useState(false);

  const { resetPIN } = useUserStore();

  const handleSubmit = async () => {
    if (!user) return;

    try {
      const values = await form.validateFields();
      setSubmitting(true);

      await resetPIN(user.id, {
        new_pin: values.newPin,
        confirm_new_pin: values.confirmNewPin,
      });

      message.success('PIN reset successfully');
      form.resetFields();
      onSuccess();
    } catch (error: any) {
      if (error.errorFields) {
        return; // Form validation error
      }
      message.error(error.message || 'Failed to reset PIN');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  if (!user) return null;

  return (
    <Modal
      title="Reset PIN"
      open={visible}
      onCancel={handleCancel}
      onOk={handleSubmit}
      confirmLoading={submitting}
      width={400}
      destroyOnHidden
    >
      <Alert
        message={
          <>
            Resetting PIN for user: <Text strong>{user.fullName}</Text>
          </>
        }
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      {!user.kioskEnabled && (
        <Alert
          message="Kiosk access is not enabled for this user. The PIN will be set but won't be usable until kiosk access is enabled."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Form form={form} layout="vertical">
        <Form.Item
          name="newPin"
          label="New PIN"
          rules={[
            { required: true, message: 'Please enter new PIN' },
            { min: 4, max: 6, message: 'PIN must be 4-6 digits' },
            { pattern: /^\d+$/, message: 'PIN must contain only digits' },
          ]}
        >
          <Input.Password
            placeholder="Enter 4-6 digit PIN"
            maxLength={6}
            autoComplete="new-password"
          />
        </Form.Item>

        <Form.Item
          name="confirmNewPin"
          label="Confirm New PIN"
          dependencies={['newPin']}
          rules={[
            { required: true, message: 'Please confirm new PIN' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPin') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('PINs do not match'));
              },
            }),
          ]}
        >
          <Input.Password
            placeholder="Confirm PIN"
            maxLength={6}
            autoComplete="new-password"
          />
        </Form.Item>
      </Form>

      <Text type="secondary">
        The user will be required to change their PIN on next login.
      </Text>
    </Modal>
  );
};

export default ResetPINModal;
