import React from 'react';
import {
  Input,
  Select,
  Switch,
  Row,
  Col,
  Form,
} from 'antd';
import { UserAddOutlined } from '@ant-design/icons';
import { useCustomerStore } from '../../store/management/customerStore';
import type { CustomerFormData } from '../../types/entities/customer.types';
import AddModal from '../common/Modal/AddModal';

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
  const { createCustomer } = useCustomerStore();

  const handleSubmit = async (values: CustomerFormData) => {
    await createCustomer(values);
  };

  return (
    <AddModal<CustomerFormData>
      title="Add New Customer"
      subtitle="Register a new customer to the system"
      icon={<UserAddOutlined style={{ fontSize: '20px' }} />}
      visible={visible}
      onCancel={onCancel}
      onSuccess={onSuccess}
      onSubmit={handleSubmit}
      width={850}
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
        <Col span={12}>
          <Form.Item name="isActive" label="Status" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="notes" label="Notes">
            <Input placeholder="Enter any additional notes" />
          </Form.Item>
        </Col>
      </Row>
    </AddModal>
  );
};

export default AddCustomerModal;
