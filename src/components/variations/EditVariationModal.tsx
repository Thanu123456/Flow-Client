import React, { useState, useEffect } from "react";
import { Form, Input, Switch, Tag, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type {
  Variation,
  VariationFormData,
} from "../../types/entities/variation.types";
import { useVariationStore } from "../../store/management/variationStore";
import { EditModal } from "../common/Modal";
import type { FormInstance } from "antd";

interface EditVariationModalProps {
  visible: boolean;
  variation: Variation | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const EditVariationModal: React.FC<EditVariationModalProps> = ({
  visible,
  variation,
  onCancel,
  onSuccess,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [values, setValues] = useState<string[]>([]);
  const { updateVariation, error, clearError } = useVariationStore();

  useEffect(() => {
    if (visible && variation) {
      // Extract value strings from variation values
      const valueStrings = variation.values.map((v) => v.value);
      setValues(valueStrings);
      setInputValue("");
      clearError();
    }
  }, [visible, variation, clearError]);

  useEffect(() => {
    if (error) message.error(error);
  }, [error]);

  const handleClose = (removedValue: string) => {
    setValues(values.filter((value) => value !== removedValue));
  };

  const handleInputConfirm = () => {
    if (inputValue && !values.includes(inputValue)) {
      setValues([...values, inputValue]);
      setInputValue("");
    } else if (values.includes(inputValue)) {
      message.warning("This value already exists");
    }
  };

  const handleSubmit = async (formValues: any, originalData: Variation) => {
    if (values.length === 0) {
      message.error("Please add at least one variation value");
      throw new Error("No values provided");
    }

    const variationData: Partial<VariationFormData> = {
      name: formValues.name,
      values: values,
      status: formValues.status ? "active" : "inactive",
    };

    await updateVariation(originalData.id, variationData);
  };

  const mapDataToForm = (variation: Variation) => ({
    name: variation.name,
    status: variation.status === "active",
  });

  return (
    <EditModal<Variation>
      visible={visible}
      title="Edit Variation"
      data={variation}
      onCancel={onCancel}
      onSuccess={onSuccess}
      onSubmit={handleSubmit}
      mapDataToForm={mapDataToForm}
      submitButtonText="Update Variation"
      width={600}
    >
      {(form: FormInstance, data: Variation | null) => (
        <>
          <Form.Item
            label="Variation Name"
            name="name"
            rules={[
              { required: true, message: "Please enter Variation Name" },
              {
                min: 2,
                max: 50,
                message: "Name must be between 2 and 50 characters",
              },
            ]}
          >
            <Input placeholder="e.g., Size" />
          </Form.Item>

          <Form.Item
            label="Variation Values"
            tooltip="Press Enter to add each value"
            required
          >
            <div>
              <div style={{ marginBottom: 8 }}>
                {values.map((value) => (
                  <Tag
                    key={value}
                    closable
                    onClose={() => handleClose(value)}
                    style={{ marginBottom: 8 }}
                  >
                    {value}
                  </Tag>
                ))}
              </div>
              <Input
                placeholder="Add new value"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onPressEnter={handleInputConfirm}
                onBlur={handleInputConfirm}
                suffix={
                  <PlusOutlined
                    style={{ cursor: "pointer", color: "#1890ff" }}
                    onClick={handleInputConfirm}
                  />
                }
              />
              <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
                Type a value and press Enter or click + to add
              </div>
            </div>
          </Form.Item>

          <Form.Item label="Status" name="status" valuePropName="checked">
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>
        </>
      )}
    </EditModal>
  );
};

export default EditVariationModal;
