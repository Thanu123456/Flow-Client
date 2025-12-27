import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Switch,
  Select,
  InputNumber,
  Button,
  Row,
  Col,
} from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import type { WarehouseFormData } from "../../types/entities/warehouse.types";
import { warehouseService } from "../../services/management/warehouseService";
import { useWarehouseStore } from "../../store/management/warehouseStore";
import { AddModal } from "../common/Modal";
import type { FormInstance } from "antd";

const { TextArea } = Input;
const { Option } = Select;

interface AddWarehouseModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const AddWarehouseModal: React.FC<AddWarehouseModalProps> = ({
  visible,
  onCancel,
  onSuccess,
}) => {
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [loadingCode, setLoadingCode] = useState(false);
  const { generateWarehouseCode } = useWarehouseStore();

  useEffect(() => {
    if (visible) {
      handleGenerateCode();
    }
  }, [visible]);

  const handleGenerateCode = async () => {
    setLoadingCode(true);
    try {
      const code = await generateWarehouseCode();
      setGeneratedCode(code);
    } catch (error) {
      console.error("Failed to generate code:", error);
    } finally {
      setLoadingCode(false);
    }
  };

  const handleSubmit = async (values: any) => {
    const warehouseData: WarehouseFormData = {
      name: values.name,
      code: values.code || generatedCode,
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

    await warehouseService.createWarehouse(warehouseData);
  };

  return (
    <AddModal
      visible={visible}
      title="Add Warehouse"
      onCancel={onCancel}
      onSuccess={onSuccess}
      onSubmit={handleSubmit}
      initialValues={{
        status: true,
        code: generatedCode,
        type: "branch",
        country: "Sri Lanka",
      }}
      submitButtonText="Add Warehouse"
      width={800}
    >
      {(form: FormInstance) => {
        useEffect(() => {
          if (generatedCode) {
            form.setFieldsValue({ code: generatedCode });
          }
        }, [generatedCode]);

        return (
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
                  tooltip="Leave empty for auto-generation (e.g., WH-001)"
                >
                  <Input
                    placeholder="WH-001"
                    suffix={
                      <Button
                        type="text"
                        size="small"
                        icon={<ReloadOutlined />}
                        loading={loadingCode}
                        onClick={handleGenerateCode}
                      />
                    }
                  />
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
                <Form.Item
                  label="Capacity (Units)"
                  name="capacity"
                  tooltip="Maximum storage capacity"
                >
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
                {
                  max: 255,
                  message: "Address must be less than 255 characters",
                },
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
                    {
                      pattern: /^[0-9]{5,10}$/,
                      message: "Invalid postal code",
                    },
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
              <TextArea
                rows={3}
                placeholder="Additional information about the warehouse"
              />
            </Form.Item>

            <Form.Item label="Status" name="status" valuePropName="checked">
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          </>
        );
      }}
    </AddModal>
  );
};

export default AddWarehouseModal;
