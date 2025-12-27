import React, { useEffect } from "react";
import {
  Form,
  Input,
  Switch,
  Select,
  InputNumber,
  Row,
  Col,
  message,
} from "antd";
import type {
  Warehouse,
  WarehouseFormData,
} from "../../types/entities/warehouse.types";
import { useWarehouseStore } from "../../store/management/warehouseStore";
import { EditModal } from "../common/Modal";
import type { FormInstance } from "antd";

const { TextArea } = Input;
const { Option } = Select;

interface EditWarehouseModalProps {
  visible: boolean;
  warehouse: Warehouse | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const EditWarehouseModal: React.FC<EditWarehouseModalProps> = ({
  visible,
  warehouse,
  onCancel,
  onSuccess,
}) => {
  const { updateWarehouse, error, clearError } = useWarehouseStore();

  useEffect(() => {
    if (visible && warehouse) {
      clearError();
    }
  }, [visible, warehouse, clearError]);

  useEffect(() => {
    if (error) message.error(error);
  }, [error]);

  const handleSubmit = async (values: any, originalData: Warehouse) => {
    const warehouseData: Partial<WarehouseFormData> = {
      name: values.name,
      code: values.code,
      address: values.address,
      city: values.city,
      state: values.state,
      postalCode: values.postalCode,
      country: values.country,
      phone: values.phone,
      email: values.email,
      managerName: values.managerName,
      managerPhone: values.managerPhone,
      capacity: values.capacity,
      status: values.status ? "active" : "inactive",
      type: values.type,
      description: values.description,
    };

    await updateWarehouse(originalData.id, warehouseData);
  };

  const mapDataToForm = (warehouse: Warehouse) => ({
    name: warehouse.name,
    code: warehouse.code,
    address: warehouse.address,
    city: warehouse.city,
    state: warehouse.state,
    postalCode: warehouse.postalCode,
    country: warehouse.country,
    phone: warehouse.phone,
    email: warehouse.email,
    managerName: warehouse.managerName,
    managerPhone: warehouse.managerPhone,
    capacity: warehouse.capacity,
    status: warehouse.status === "active",
    type: warehouse.type,
    description: warehouse.description,
  });

  return (
    <EditModal<Warehouse>
      visible={visible}
      title="Edit Warehouse"
      data={warehouse}
      onCancel={onCancel}
      onSuccess={onSuccess}
      onSubmit={handleSubmit}
      mapDataToForm={mapDataToForm}
      submitButtonText="Update Warehouse"
      width={800}
    >
      {(form: FormInstance, data: Warehouse | null) => (
        <>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Warehouse Name"
                name="name"
                rules={[
                  { required: true, message: "Please enter Warehouse Name" },
                  {
                    min: 3,
                    max: 100,
                    message: "Name must be between 3 and 100 characters",
                  },
                ]}
              >
                <Input placeholder="e.g., Main Warehouse" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Warehouse Code"
                name="code"
                rules={[{ required: true, message: "Code is required" }]}
              >
                <Input placeholder="WH-001" disabled />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Type"
                name="type"
                rules={[{ required: true, message: "Please select Type" }]}
              >
                <Select placeholder="Select Type">
                  <Option value="main">Main Warehouse</Option>
                  <Option value="branch">Branch Warehouse</Option>
                  <Option value="distribution">Distribution Center</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Capacity (Units)" name="capacity">
                <InputNumber
                  placeholder="10000"
                  style={{ width: "100%" }}
                  min={0}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Address"
            name="address"
            rules={[
              { required: true, message: "Please enter Address" },
              { max: 255, message: "Address must be less than 255 characters" },
            ]}
          >
            <TextArea rows={2} placeholder="Street address" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="City"
                name="city"
                rules={[{ required: true, message: "Please enter City" }]}
              >
                <Input placeholder="e.g., Colombo" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="State/Province"
                name="state"
                rules={[{ required: true, message: "Please enter State" }]}
              >
                <Input placeholder="e.g., Western Province" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Postal Code"
                name="postalCode"
                rules={[
                  { required: true, message: "Please enter Postal Code" },
                  { pattern: /^[0-9]{5,10}$/, message: "Invalid postal code" },
                ]}
              >
                <Input placeholder="10100" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Country"
                name="country"
                rules={[{ required: true, message: "Please enter Country" }]}
              >
                <Input placeholder="Sri Lanka" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Phone"
                name="phone"
                rules={[
                  {
                    pattern: /^[0-9+\-() ]{10,20}$/,
                    message: "Invalid phone number",
                  },
                ]}
              >
                <Input placeholder="+94 11 234 5678" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[{ type: "email", message: "Invalid email address" }]}
              >
                <Input placeholder="warehouse@example.com" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Manager Name" name="managerName">
                <Input placeholder="John Doe" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Manager Phone"
                name="managerPhone"
                rules={[
                  {
                    pattern: /^[0-9+\-() ]{10,20}$/,
                    message: "Invalid phone number",
                  },
                ]}
              >
                <Input placeholder="+94 77 123 4567" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Description" name="description">
            <TextArea rows={3} placeholder="Additional information" />
          </Form.Item>

          <Form.Item label="Status" name="status" valuePropName="checked">
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>
        </>
      )}
    </EditModal>
  );
};

export default EditWarehouseModal;
