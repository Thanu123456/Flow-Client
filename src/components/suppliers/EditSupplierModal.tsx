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
import { useSupplierStore } from '../../store/management/supplierStore';
import type { Supplier, SupplierFormData } from '../../types/entities/supplier.types';

const { Text } = Typography;
const { TextArea } = Input;

interface EditSupplierModalProps {
  visible: boolean;
  supplier: Supplier | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const EditSupplierModal: React.FC<EditSupplierModalProps> = ({
  visible,
  supplier,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm<SupplierFormData>();
  const [submitting, setSubmitting] = useState(false);
  const { message } = App.useApp();

  const { updateSupplier } = useSupplierStore();

  useEffect(() => {
    if (visible && supplier) {
      form.setFieldsValue({
        firstName: supplier.firstName,
        lastName: supplier.lastName,
        companyName: supplier.companyName,
        phone: supplier.phone,
        email: supplier.email,
        taxNumber: supplier.taxNumber,
        city: supplier.city,
        address: supplier.address,
        paymentTerms: supplier.paymentTerms,
        creditLimit: supplier.creditLimit,
        imageUrl: supplier.imageUrl,
        notes: supplier.notes,
        isActive: supplier.isActive,
      });
    }
  }, [visible, supplier, form]);

  const handleSubmit = async () => {
    if (!supplier) return;

    try {
      const values = await form.validateFields();
      setSubmitting(true);

      await updateSupplier(supplier.id, values);
      message.success('Supplier updated successfully');
      onSuccess();
    } catch (error: any) {
      if (error.errorFields) {
        return;
      }
      message.error(error.message || 'Failed to update supplier');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Edit Supplier"
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
            <Form.Item name="companyName" label="Company Name">
              <Input placeholder="Enter company name (optional)" />
            </Form.Item>
          </Col>
          <Col span={12}>
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
          <Col span={12}>
            <Form.Item name="taxNumber" label="Tax Number">
              <Input placeholder="Enter tax number (optional)" />
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

        <Divider orientation="left">Supplier Settings</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="paymentTerms"
              label="Payment Terms"
              rules={[{ required: true, message: 'Please select payment terms' }]}
            >
              <Select>
                <Select.Option value="cod">COD (Cash on Delivery)</Select.Option>
                <Select.Option value="net_7">Net 7 Days</Select.Option>
                <Select.Option value="net_15">Net 15 Days</Select.Option>
                <Select.Option value="net_30">Net 30 Days</Select.Option>
                <Select.Option value="net_60">Net 60 Days</Select.Option>
                <Select.Option value="net_90">Net 90 Days</Select.Option>
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

export default EditSupplierModal;
