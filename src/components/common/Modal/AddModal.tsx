// src/components/Common/Modal/AddModal.tsx
import { useState, useEffect } from "react";
import { Modal, Form, Button, App, Typography, Space } from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";
import type { AddModalProps } from "./Modal.types";

const { Title, Text } = Typography;

function AddModal<T = any>({
  visible,
  title = "Add Item",
  onCancel,
  onSuccess,
  onSubmit,
  width = 600,
  loading: externalLoading,
  children,
  initialValues,
  form: externalForm,
  submitButtonText = "Add",
  cancelButtonText = "Cancel",
  icon,
  subtitle,
  ...restProps
}: AddModalProps<T>) {
  const [internalForm] = Form.useForm();
  const form = externalForm || internalForm;
  const { message } = App.useApp();
  const [internalLoading, setInternalLoading] = useState(false);
  const loading = externalLoading ?? internalLoading;

  useEffect(() => {
    if (visible) {
      form.resetFields();
      if (initialValues) {
        form.setFieldsValue(initialValues);
      }
    }
  }, [visible, form, initialValues]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setInternalLoading(true);
      await onSubmit(values);
      message.success(`${title} successfully`);
      onSuccess?.();
      onCancel();
    } catch (err: any) {
      if (err.errorFields) {
        return;
      }
      console.error(err);
      message.error(
        err?.response?.data?.message || `Failed to ${title.toLowerCase()}`
      );
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      width={width}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          {cancelButtonText}
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          {submitButtonText}
        </Button>,
      ]}
      title={
        <div style={{
          background: 'linear-gradient(90deg, #f0f5ff 0%, #ffffff 100%)',
          padding: '16px 24px',
          margin: '-20px -24px 0 -24px',
          borderBottom: '1px solid #f0f0f0',
          borderRadius: '8px 8px 0 0',
        }}>
          <Space align="start">
            <div style={{
              background: '#e6f7ff',
              padding: '8px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1890ff'
            }}>
              {icon || <PlusCircleOutlined style={{ fontSize: '20px' }} />}
            </div>
            <Space direction="vertical" size={0}>
              <Title level={4} style={{ margin: 0 }}>{title}</Title>
              {subtitle && <Text type="secondary" style={{ fontSize: '13px' }}>{subtitle}</Text>}
            </Space>
          </Space>
        </div>
      }
      {...restProps}
    >
      <div style={{ padding: '16px 0' }}>
        <Form form={form} layout="vertical" initialValues={initialValues}>
          {typeof children === "function" ? children(form) : children}
        </Form>
      </div>
    </Modal>
  );
}

export default AddModal;
