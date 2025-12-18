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
      console.error("Failed to Generate Code:", error);
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
              validateTrigger="onChange"
              rules={[
                { required: true, message: "Please Enter Category Name" },
                {
                  min: 1,
                  max: 10,
                  message: "Category Name Must be Between 1 and 10 Characters",
                },
              ]}
            >
              <Input placeholder="e.g., Fans" />
            </Form.Item>

            <Form.Item
              label="Category Code"
              name="code"
              tooltip="Leave Empty for Auto-Generation (e.g., CAT-001)"
            >
              <Input
                placeholder="Auto-Filled"
                suffix={
                  <Button
                    type="text"
                    size="small"
                    //icon={<ReloadOutlined />}
                    loading={loadingCode}
                    onClick={handleGenerateCode}
                  />
                }
                disabled
              />
            </Form.Item>

            <Form.Item
              label="Description"
              name="description"
              validateTrigger="onChange"
              rules={[
                {
                  min: 1,
                  max: 20,
                  message: "Description Must be Between 1 and 20 Characters",
                },
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Enter Category Description (Optional)"
              />
            </Form.Item>

            <Form.Item
              label="Status (Active/ In-active)"
              name="status"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </>
        );
      }}
    </AddModal>
  );
};

export default AddCategoryModal;
