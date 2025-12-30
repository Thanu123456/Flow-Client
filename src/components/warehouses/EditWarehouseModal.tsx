import React, { useEffect } from "react";
import { Form, Input, Switch, message } from "antd";
import type { Warehouse, WarehouseFormData } from "../../types/entities/warehouse.types";
import { useWarehouseStore } from "../../store/management/warehouseStore";
import EditModal from "../common/Modal/EditModal";
import type { FormInstance } from "antd";

const { TextArea } = Input;

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
      contactPerson: values.contactPerson,
      email: values.email,
      mobile: values.mobile,
      phone: values.phone,
      city: values.city,
      address: values.address,
      status: values.status ? "active" : "inactive",
    };

    await updateWarehouse(originalData.id, warehouseData);
  };

  const mapDataToForm = (warehouse: Warehouse) => ({
    name: warehouse.name,
    contactPerson: warehouse.contactPerson,
    email: warehouse.email,
    mobile: warehouse.mobile,
    phone: warehouse.phone,
    city: warehouse.city,
    address: warehouse.address,
    status: warehouse.status === "active",
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
    >
      {(_form: FormInstance, _data: Warehouse | null) => (
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
    </EditModal>
  );
};

export default EditWarehouseModal;
