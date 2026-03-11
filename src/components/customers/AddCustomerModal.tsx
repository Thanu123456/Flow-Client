import React, { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Row,
  Col,
  Typography,
  App,
} from 'antd';
import { useCustomerStore } from '../../store/management/customerStore';
import type { CustomerFormData } from '../../types/entities/customer.types';

const { Text } = Typography;

interface AddCustomerModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
  visible,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm<CustomerFormData>();
  const [submitting, setSubmitting] = useState(false);
  const { message } = App.useApp();

  const { createCustomer } = useCustomerStore();

  useEffect(() => {
    if (visible) {
      form.resetFields();
    }
  }, [visible, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      await createCustomer(values);
      message.success('Customer created successfully');
      onSuccess();
      form.resetFields();
    } catch (error: any) {
      if (error.errorFields) {
        return;
      }
      message.error(error.message || 'Failed to create customer');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Add New Customer"
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={submitting}
      width={900}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          customerType: 'walk_in',
          isActive: true,
        }}
      >
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="firstName"
              label="First Name"
              rules={[
                { required: true, message: 'Please enter first name' },
                { min: 2, message: 'Name must be at least 2 characters' },
              ]}
            >
              <Input placeholder="Enter first name" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="lastName"
              label="Last Name"
              rules={[
                { required: true, message: 'Please enter last name' },
                { min: 2, message: 'Name must be at least 2 characters' },
              ]}
            >
              <Input placeholder="Enter last name" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="phone"
              label="Phone Number"
              rules={[{ required: true, message: 'Please enter phone number' }]}
            >
              <Input placeholder="Enter phone number" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { type: 'email', message: 'Please enter a valid email' },
              ]}
            >
              <Input placeholder="Enter email address" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="city" label="City">
              <Input placeholder="Enter city" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="address" label="Address">
              <Input placeholder="Enter address" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="customerType"
              label="Customer Type"
              rules={[{ required: true, message: 'Please select customer type' }]}
            >
              <Select>
                <Select.Option value="walk_in">Walk-in</Select.Option>
                <Select.Option value="regular">Regular</Select.Option>
                <Select.Option value="wholesale">Wholesale</Select.Option>
                <Select.Option value="vip">VIP</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="creditLimit" label="Credit Limit">
              <Input placeholder="Enter credit limit" type="number" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="imageUrl" label="Image URL">
              <Input placeholder="Enter image URL" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="isActive" label="Status" valuePropName="checked">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Switch defaultChecked />
                <Text>Active</Text>
              </div>
            </Form.Item>
          </Col>
          <Col span={16}>
            <Form.Item name="notes" label="Notes">
              <Input placeholder="Enter any additional notes" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AddCustomerModal;
