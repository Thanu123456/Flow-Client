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
import type { WarrantyFormData } from '../../types/entities/warranty.types';

const { Text } = Typography;
const { TextArea } = Input;

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
      message.error(error.message || 'Failed to create warranty');
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
          isActive: true,
        }}
      >
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
                <Switch defaultChecked />
                <Text>Active</Text>
              </div>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AddWarrantyModal;
