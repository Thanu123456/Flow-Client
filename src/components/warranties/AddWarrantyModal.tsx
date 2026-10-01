import React, { useEffect, useState } from 'react';
import { Modal, Form, App } from 'antd';
import WarrantyFormFields from './WarrantyFormFields';
import { apiErrorMessage } from '../../utils/apiError';
import { useWarrantyStore } from '../../store/management/warrantyStore';
import type { WarrantyFormData } from '../../types/entities/warranty.types';

interface AddWarrantyModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const AddWarrantyModal: React.FC<AddWarrantyModalProps> = ({
  visible,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm<WarrantyFormData>();
  const [submitting, setSubmitting] = useState(false);
  const { message } = App.useApp();

  const { createWarranty } = useWarrantyStore();

  useEffect(() => {
    if (visible) {
      form.resetFields();
    }
  }, [visible, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      await createWarranty(values);
      message.success('Warranty created successfully');
      onSuccess();
      form.resetFields();
    } catch (error: any) {
      if (error.errorFields) {
        return;
      }
      message.error(apiErrorMessage(error, 'Failed to create warranty'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Add New Warranty"
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={submitting}
      width={600}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          period: 'month',
          warrantyType: 'manufacturer',
          isActive: true,
        }}
      >
        <WarrantyFormFields form={form} />
      </Form>
    </Modal>
  );
};

export default AddWarrantyModal;
