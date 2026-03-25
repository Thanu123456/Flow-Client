import React from 'react';
import {
  Input,
  Select,
  Switch,
  Divider,
  Row,
  Col,
  Form,
} from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useCustomerStore } from '../../store/management/customerStore';
import type { Customer, CustomerFormData } from '../../types/entities/customer.types';
import EditModal from '../common/Modal/EditModal';

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
  const { updateCustomer } = useCustomerStore();

  const handleSubmit = async (values: CustomerFormData) => {
    if (!customer) return;
    await updateCustomer(customer.id, values);
  };

  return (
    <EditModal<Customer>
      title="Edit Customer"
      subtitle={customer ? `Viewing profile of ${customer.firstName} ${customer.lastName}` : "Update customer information"}
      icon={<UserOutlined style={{ fontSize: '20px' }} />}
      visible={visible}
      data={customer}
      onCancel={onCancel}
      onSuccess={onSuccess}
      onSubmit={handleSubmit}
      width={750}
    >
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
            <Switch />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="notes" label="Notes">
        <TextArea rows={3} placeholder="Enter any additional notes (optional)" />
      </Form.Item>
    </EditModal>
  );
};

export default EditCustomerModal;
