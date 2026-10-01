import React, { useEffect, useState } from 'react';
import { Modal, Form, App } from 'antd';
import WarrantyFormFields from './WarrantyFormFields';
import { apiErrorMessage } from '../../utils/apiError';
import { useWarrantyStore } from '../../store/management/warrantyStore';
import type { Warranty, WarrantyFormData } from '../../types/entities/warranty.types';

interface EditWarrantyModalProps {
  visible: boolean;
  warranty: Warranty | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const EditWarrantyModal: React.FC<EditWarrantyModalProps> = ({
  visible,
  warranty,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm<WarrantyFormData>();
  const [submitting, setSubmitting] = useState(false);
  const { message } = App.useApp();

  const { updateWarranty } = useWarrantyStore();

  useEffect(() => {
    if (visible && warranty) {
      form.setFieldsValue({
        name: warranty.name,
        duration: warranty.duration,
        period: warranty.period,
        warrantyType: warranty.warrantyType,
        terms: warranty.terms,
        exclusions: warranty.exclusions,
        description: warranty.description,
        isActive: warranty.isActive,
      });
    }
  }, [visible, warranty, form]);

  const handleSubmit = async () => {
    if (!warranty) return;

    try {
      const values = await form.validateFields();
      setSubmitting(true);

      await updateWarranty(warranty.id, { ...values, updatedAt: warranty.updatedAt });
      message.success('Warranty updated successfully');
      onSuccess();
    } catch (error: any) {
      if (error.errorFields) {
        return;
      }
      message.error(apiErrorMessage(error, 'Failed to update warranty'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Edit Warranty"
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={submitting}
      width={600}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <WarrantyFormFields form={form} />
      </Form>
    </Modal>
  );
};

export default EditWarrantyModal;
