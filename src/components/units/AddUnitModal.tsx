import React from "react";
import { Form, Input, Switch } from "antd";
import type { UnitFormData } from "../../types/entities/unit.types";
import { unitService } from "../../services/management/unitService";
import AddModal from "../common/Modal/AddModal";
import type { FormInstance } from "antd";

interface AddUnitModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const AddUnitModal: React.FC<AddUnitModalProps> = ({
  visible,
  onCancel,
  onSuccess,
}) => {
  const handleSubmit = async (values: any) => {
    const unitData: UnitFormData = {
      name: values.name,
      shortName: values.shortName,
      status: values.status ? "active" : "inactive",
    };
    console.log(unitData);

    await unitService.createUnit(unitData);
  };

  return (
    <AddModal
      visible={visible}
      title="Add Unit"
      onCancel={onCancel}
      onSuccess={onSuccess}
      onSubmit={handleSubmit}
      initialValues={{ status: true }}
      submitButtonText="Add Unit"
    >
      {(form: FormInstance) => (
        <>
          <Form.Item
            label="Unit Name"
            name="name"
            rules={[
              { required: true, message: "Please enter Unit Name" },
              {
                min: 1,
                max: 255,
                message: "Unit name must be between 1 and 255 characters",
              },
            ]}
          >
            <Input placeholder="e.g., Kilogram" />
          </Form.Item>

          <Form.Item
            label="Short Name"
            name="shortName"
            rules={[
              { required: true, message: "Please enter Short Name" },
              {
                min: 1,
                max: 10,
                message: "Short name must be between 1 and 10 characters",
              },
            ]}
          >
            <Input placeholder="e.g., Kg" />
          </Form.Item>

          <Form.Item label="Status" name="status" valuePropName="checked">
            <Switch checkedChildren="Active" unCheckedChildren="In-active" />
          </Form.Item>
        </>
      )}
    </AddModal>
  );
};

export default AddUnitModal;
