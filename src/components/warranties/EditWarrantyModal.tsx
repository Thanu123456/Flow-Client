import React, { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Switch,
  InputNumber,
  Row,
  Col,
  Typography,
  App,
} from 'antd';
import { useWarrantyStore } from '../../store/management/warrantyStore';
import type { Warranty, WarrantyFormData } from '../../types/entities/warranty.types';

const { Text } = Typography;
const { TextArea } = Input;

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

      await updateWarranty(warranty.id, values);
      message.success('Warranty updated successfully');
      onSuccess();
    } catch (error: any) {
      if (error.errorFields) {
        return;
      }
      message.error(error.message || 'Failed to update warranty');
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
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="name"
              label="Warranty Name"
              rules={[
                { required: true, message: 'Please enter warranty name' },
                { min: 2, message: 'Name must be at least 2 characters' },
                { max: 100, message: 'Name must not exceed 100 characters' },
              ]}
            >
              <Input placeholder="e.g., 6 Month Warranty" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="duration"
              label="Duration"
              rules={[
                { required: true, message: 'Please enter warranty duration' },
              ]}
            >
              <InputNumber
                min={1}
                placeholder="e.g., 6"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="period"
              label="Period"
              rules={[{ required: true, message: 'Please select period' }]}
            >
              <Select>
                <Select.Option value="month">Month</Select.Option>
                <Select.Option value="year">Year</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="description"
              label="Description"
              rules={[
                { max: 500, message: 'Description must not exceed 500 characters' },
              ]}
            >
              <TextArea rows={3} placeholder="Enter warranty description (optional)" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="isActive" label="Status" valuePropName="checked">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Switch />
                <Text>Active</Text>
              </div>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default EditWarrantyModal;
