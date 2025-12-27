import React, { useEffect } from "react";
import { Form, Input, Switch, message } from "antd";
import type { Unit, UnitFormData } from "../../types/entities/unit.types";
import { useUnitStore } from "../../store/management/unitStore";
import EditModal from "../common/Modal/EditModal";
import type { FormInstance } from "antd";

interface EditUnitModalProps {
  visible: boolean;
  unit: Unit | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const EditUnitModal: React.FC<EditUnitModalProps> = ({
  visible,
  unit,
  onCancel,
  onSuccess,
}) => {
  const { updateUnit, error, clearError } = useUnitStore();

  useEffect(() => {
    if (visible && unit) {
      clearError();
    }
  }, [visible, unit, clearError]);

  useEffect(() => {
    if (error) message.error(error);
  }, [error]);

  const handleSubmit = async (values: any, originalData: Unit) => {
    const unitData: Partial<UnitFormData> = {
      unitName: values.unitName,
      shortUnitName: values.shortUnitName,
      status: values.status ? "active" : "inactive",
    };

    await updateUnit(originalData.id, unitData);
  };

  const mapDataToForm = (unit: Unit) => ({
    unitName: unit.unitName,
    shortUnitName: unit.shortUnitName,
    status: unit.status === "active",
  });

  return (
    <EditModal<Unit>
      visible={visible}
      title="Edit Unit"
      data={unit}
      onCancel={onCancel}
      onSuccess={onSuccess}
      onSubmit={handleSubmit}
      mapDataToForm={mapDataToForm}
      submitButtonText="Update Unit"
    >
      {(_form: FormInstance, _data: Unit | null) => (
        <>
          <Form.Item
            label="Unit Name"
            name="unitName"
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
            name="shortUnitName"
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
    </EditModal>
  );
};

export default EditUnitModal;
