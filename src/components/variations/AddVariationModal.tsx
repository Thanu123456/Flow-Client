import React, { useState } from "react";
import { Form, Input, Switch, Tag, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type { VariationFormData } from "../../types/entities/variation.types";
import { variationService } from "../../services/management/variationService";
import { AddModal } from "../common/Modal";
import type { FormInstance } from "antd";

interface AddVariationModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const AddVariationModal: React.FC<AddVariationModalProps> = ({
  visible,
  onCancel,
  onSuccess,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [values, setValues] = useState<string[]>([]);

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

  const handleSubmit = async (formValues: any) => {
    if (values.length === 0) {
      message.error("Please add at least one variation value");
      throw new Error("No values provided");
    }

    const variationData: VariationFormData = {
      name: formValues.name,
      values: values,
      status: formValues.status ? "active" : "inactive",
    };

    await variationService.createVariation(variationData);

    // Reset values
    setValues([]);
    setInputValue("");
  };

  const handleCancel = () => {
    setValues([]);
    setInputValue("");
    onCancel();
  };

  return (
    <AddModal
      visible={visible}
      title="Add Variation"
      onCancel={handleCancel}
      onSuccess={onSuccess}
      onSubmit={handleSubmit}
      initialValues={{ status: true }}
      submitButtonText="Add Variation"
      width={600}
    >
      {(form: FormInstance) => (
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
            tooltip="e.g., Size, Color, Material"
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
                placeholder="e.g., Small, Medium, Large"
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
    </AddModal>
  );
};

export default AddVariationModal;
