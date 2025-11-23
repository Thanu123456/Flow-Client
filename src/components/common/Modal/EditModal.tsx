import React, { useState, useEffect } from "react";
import { Modal, Form, Button, App } from "antd";
import type { EditModalProps } from "./Modal.types";

function EditModal<T = any>({
  visible,
  title = "Edit Item",
  data,
  onCancel,
  onSuccess,
  onSubmit,
  width = 600,
  loading: externalLoading,
  children,
  form: externalForm,
  submitButtonText = "Update",
  cancelButtonText = "Cancel",
  mapDataToForm,
  ...restProps
}: EditModalProps<T>) {
  const [internalForm] = Form.useForm();
  const form = externalForm || internalForm;
  const { message } = App.useApp();
  const [internalLoading, setInternalLoading] = useState(false);
  const loading = externalLoading ?? internalLoading;

  useEffect(() => {
    if (visible && data) {
      const formValues = mapDataToForm ? mapDataToForm(data) : data;
      form.setFieldsValue(formValues);
    }
  }, [visible, data, form, mapDataToForm]);

  const handleSubmit = async () => {
    if (!data) return;

    try {
      const values = await form.validateFields();
      setInternalLoading(true);
      await onSubmit(values, data);
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
      <Form form={form} layout="vertical">
        {typeof children === "function" ? children(form, data) : children}
      </Form>
    </Modal>
  );
}

export default EditModal;
