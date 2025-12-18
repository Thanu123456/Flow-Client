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
      unitName: values.name,
      shortUnitName: values.shortName,
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
            validateTrigger="onChange"
            rules={[
              { required: true, message: "Please Enter Unit Name" },
              {
                min: 1,
                max: 10,
                message: "Unit Name Must be Between 1 and 10 Characters",
              },
            ]}
          >
            <Input placeholder="e.g., Kilogram" />
          </Form.Item>

          <Form.Item
            label="Short Name"
            name="shortName"
            validateTrigger="onChange"
            rules={[
              { required: true, message: "Please Enter Short Name" },
              {
                min: 1,
                max: 5,
                message: "Short name must be between 1 and 5 Characters",
              },
            ]}
          >
            <Input placeholder="e.g., Kg" />
          </Form.Item>

          <Form.Item
            label="Status (Active/ In-active)"
            name="status"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </>
      )}
    </AddModal>
  );
};

export default AddUnitModal;
