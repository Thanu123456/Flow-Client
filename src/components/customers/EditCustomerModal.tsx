import React, { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Divider,
  Row,
  Col,
  Typography,
  App,
} from 'antd';
import { useCustomerStore } from '../../store/management/customerStore';
import type { Customer, CustomerFormData } from '../../types/entities/customer.types';

const { Text } = Typography;
const { TextArea } = Input;

interface EditCustomerModalProps {
  visible: boolean;
  customer: Customer | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const EditCustomerModal: React.FC<EditCustomerModalProps> = ({
  visible,
  customer,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm<CustomerFormData>();
  const [submitting, setSubmitting] = useState(false);
  const { message } = App.useApp();

  const { updateCustomer } = useCustomerStore();

  useEffect(() => {
    if (visible && customer) {
      form.setFieldsValue({
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
        email: customer.email,
        city: customer.city,
        address: customer.address,
        customerType: customer.customerType,
        creditLimit: customer.creditLimit,
        imageUrl: customer.imageUrl,
        notes: customer.notes,
        isActive: customer.isActive,
      });
    }
  }, [visible, customer, form]);

  const handleSubmit = async () => {
    if (!customer) return;

    try {
      const values = await form.validateFields();
      setSubmitting(true);

      await updateCustomer(customer.id, values);
      message.success('Customer updated successfully');
      onSuccess();
    } catch (error: any) {
      if (error.errorFields) {
        return;
      }
      message.error(error.message || 'Failed to update customer');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Edit Customer"
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={submitting}
      width={700}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Divider orientation="left">Personal Information</Divider>
        <Row gutter={16}>
          <Col span={12}>
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
          <Col span={12}>
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
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="phone"
              label="Phone Number"
              rules={[{ required: true, message: 'Please enter phone number' }]}
            >
              <Input placeholder="Enter phone number" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { type: 'email', message: 'Please enter a valid email' },
              ]}
            >
              <Input placeholder="Enter email address (optional)" />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Address Information</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="city" label="City">
              <Input placeholder="Enter city" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="address" label="Address">
              <Input placeholder="Enter address" />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Customer Settings</Divider>
        <Row gutter={16}>
          <Col span={12}>
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
          <Col span={12}>
            <Form.Item name="creditLimit" label="Credit Limit">
              <Input placeholder="Enter credit limit (optional)" type="number" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="imageUrl" label="Image URL">
              <Input placeholder="Enter image URL (optional)" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="isActive" label="Status" valuePropName="checked">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Switch />
                <Text>Active</Text>
              </div>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="notes" label="Notes">
          <TextArea rows={3} placeholder="Enter any additional notes (optional)" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditCustomerModal;
