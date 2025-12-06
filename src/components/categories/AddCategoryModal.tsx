import React, { useState, useEffect } from "react";
import { Form, Input, Switch, Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import type { CategoryFormData } from "../../types/entities/category.types";
import { categoryService } from "../../services/management/categoryService";
import { useCategoryStore } from "../../store/management/categoryStore";
import { AddModal } from "../common/Modal";
import type { FormInstance } from "antd";

const { TextArea } = Input;

interface AddCategoryModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  visible,
  onCancel,
  onSuccess,
}) => {
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [loadingCode, setLoadingCode] = useState(false);
  const { generateCategoryCode } = useCategoryStore();

  useEffect(() => {
    if (visible) {
      handleGenerateCode();
    }
  }, [visible]);

  const handleGenerateCode = async () => {
    setLoadingCode(true);
    try {
      const code = await generateCategoryCode();
      setGeneratedCode(code);
    } catch (error) {
      console.error("Failed to generate code:", error);
    } finally {
      setLoadingCode(false);
    }
  };

  const handleSubmit = async (values: any) => {
    const categoryData: CategoryFormData = {
      name: values.name,
      code: values.code || generatedCode,
      description: values.description,
      status: values.status ? "active" : "inactive",
    };

    await categoryService.createCategory(categoryData);
  };

  return (
    <AddModal
      visible={visible}
      title="Add Category"
      onCancel={onCancel}
      onSuccess={onSuccess}
      onSubmit={handleSubmit}
      initialValues={{ status: true, code: generatedCode }}
      submitButtonText="Add Category"
      width={600}
    >
      {(form: FormInstance) => {
        // Update form when generated code changes
        useEffect(() => {
          if (generatedCode) {
            form.setFieldsValue({ code: generatedCode });
          }
        }, [generatedCode]);

        return (
          <>
            <Form.Item
              label="Category Name"
              name="name"
              rules={[
                { required: true, message: "Please enter Category Name" },
                {
                  min: 3,
                  max: 50,
                  message: "Category name must be between 3 and 50 characters",
                },
              ]}
            >
              <Input placeholder="e.g., Electronics" />
            </Form.Item>

            <Form.Item
              label="Category Code"
              name="code"
              tooltip="Leave empty for auto-generation (e.g., CAT-001)"
            >
              <Input
                placeholder="CAT-001"
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

            <Form.Item
              label="Description"
              name="description"
              rules={[
                {
                  max: 500,
                  message: "Description must be less than 500 characters",
                },
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Enter category description (optional)"
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

export default AddCategoryModal;
