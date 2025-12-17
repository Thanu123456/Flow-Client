// src/components/Common/Modal/AddModal.tsx
import { useState, useEffect } from "react";
import { Modal, Form, Button, App } from "antd";

import type { AddModalProps } from "./Modal.types";

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
        // Form validation error
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
      title={title}
      open={visible}
      onCancel={onCancel}
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
      width={width}
      {...restProps}
    >
      <Form form={form} layout="vertical" initialValues={initialValues}>
        {typeof children === "function" ? children(form) : children}
      </Form>
    </Modal>
  );
}

export default AddModal;
