// src/components/Categories/EditCategoryModal.tsx
import React, { useEffect } from "react";
import { Form, Input, Switch, message } from "antd";
import type {
  Category,
  CategoryFormData,
} from "../../types/entities/category.types";
import { useCategoryStore } from "../../store/management/categoryStore";
import { EditModal } from "../common/Modal";
import type { FormInstance } from "antd";

const { TextArea } = Input;

interface EditCategoryModalProps {
  visible: boolean;
  category: Category | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const EditCategoryModal: React.FC<EditCategoryModalProps> = ({
  visible,
  category,
  onCancel,
  onSuccess,
}) => {
  const { updateCategory, error, clearError } = useCategoryStore();

  useEffect(() => {
    if (visible && category) {
      clearError();
    }
  }, [visible, category, clearError]);

  useEffect(() => {
    if (error) message.error(error);
  }, [error]);

  const handleSubmit = async (values: any, originalData: Category) => {
    const categoryData: Partial<CategoryFormData> = {
      name: values.name,
      code: values.code,
      description: values.description,
      status: values.status ? "active" : "inactive",
    };

    await updateCategory(originalData.id, categoryData);
  };

  const mapDataToForm = (category: Category) => ({
    name: category.name,
    code: category.code,
    description: category.description,
    status: category.status === "active",
  });

  return (
    <EditModal<Category>
      visible={visible}
      title="Edit Category"
      data={category}
      onCancel={onCancel}
      onSuccess={onSuccess}
      onSubmit={handleSubmit}
      mapDataToForm={mapDataToForm}
      submitButtonText="Update Category"
      width={600}
    >
      {(form: FormInstance, data: Category | null) => (
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
            rules={[{ required: true, message: "Category code is required" }]}
          >
            <Input placeholder="CAT-001" disabled />
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
            <TextArea rows={4} placeholder="Enter category description" />
          </Form.Item>

          <Form.Item label="Status" name="status" valuePropName="checked">
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>
        </>
      )}
    </EditModal>
  );
};

export default EditCategoryModal;
