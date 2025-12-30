import React from "react";
import { Form, Input, Switch } from "antd";
import type { WarehouseFormData } from "../../types/entities/warehouse.types";
import { warehouseService } from "../../services/management/warehouseService";
import AddModal from "../common/Modal/AddModal";
import type { FormInstance } from "antd";

const { TextArea } = Input;

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
  const handleSubmit = async (values: any) => {
    const warehouseData: WarehouseFormData = {
      name: values.name,
      contactPerson: values.contactPerson,
      email: values.email,
      mobile: values.mobile,
      phone: values.phone,
      city: values.city,
      address: values.address,
      status: values.status ? "active" : "inactive",
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
      initialValues={{ status: true }}
      submitButtonText="Add Warehouse"
    >
      {(_form: FormInstance) => (
        <>
          <Form.Item
            label="Warehouse Name"
            name="name"
            rules={[
              { required: true, message: "Please enter Warehouse Name" },
              { min: 1, max: 100, message: "Name must be between 1 and 100 characters" },
            ]}
          >
            <Input placeholder="Enter Warehouse Name" maxLength={100} />
          </Form.Item>

          <Form.Item
            label="Contact Person"
            name="contactPerson"
            rules={[{ max: 100, message: "Contact person must be less than 100 characters" }]}
          >
            <Input placeholder="Enter Contact Person" maxLength={100} />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { type: "email", message: "Please enter a valid email" },
              { max: 100, message: "Email must be less than 100 characters" },
            ]}
          >
            <Input placeholder="Enter Email" maxLength={100} />
          </Form.Item>

          <Form.Item
            label="Mobile"
            name="mobile"
            rules={[{ max: 20, message: "Mobile must be less than 20 characters" }]}
          >
            <Input placeholder="Enter Mobile Number" maxLength={20} />
          </Form.Item>

          <Form.Item
            label="Phone"
            name="phone"
            rules={[{ max: 20, message: "Phone must be less than 20 characters" }]}
          >
            <Input placeholder="Enter Phone Number" maxLength={20} />
          </Form.Item>

          <Form.Item
            label="City"
            name="city"
            rules={[{ max: 100, message: "City must be less than 100 characters" }]}
          >
            <Input placeholder="Enter City" maxLength={100} />
          </Form.Item>

          <Form.Item
            label="Address"
            name="address"
            rules={[{ max: 500, message: "Address must be less than 500 characters" }]}
          >
            <TextArea rows={3} placeholder="Enter Address" maxLength={500} />
          </Form.Item>

          <Form.Item label="Status" name="status" valuePropName="checked">
            <Switch checkedChildren="Active" unCheckedChildren="In-active" />
          </Form.Item>
        </>
      )}
    </AddModal>
  );
};

export default AddWarehouseModal;
