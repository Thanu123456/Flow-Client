import React, { useState } from "react";
import { Modal, Space, Input, Form, message } from "antd";
import { ExclamationCircleOutlined, LockOutlined } from "@ant-design/icons";
import { useCategoryStore } from "../../store/management/categoryStore";
import type {
  Category,
  DeleteCategoryData,
} from "../../types/entities/category.types";

interface DeleteCategoryModalProps {
  visible: boolean;
  category: Category | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const DeleteCategoryModal: React.FC<DeleteCategoryModalProps> = ({
  visible,
  category,
  onCancel,
  onSuccess,
}) => {
  const { deleteCategory } = useCategoryStore();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!category) return;

    try {
      const values = await form.validateFields();
      setLoading(true);

      // Check if category has sub-categories
      if ((category.subCategoryCount ?? 0) > 0) {
        message.warning(
          "This category has sub-categories. It will be soft-deleted and hidden from the list."
        );
      }

      const deleteData: DeleteCategoryData = {
        password: values.password,
      };

      await deleteCategory(category.id, deleteData);
      message.success("Category deleted successfully");
      form.resetFields();
      onSuccess();
      onCancel();
    } catch (error: any) {
      if (error.errorFields) {
        // Form validation error
        return;
      }
      console.error(error);
      message.error(
        error.response?.data?.message || "Failed to delete category"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "red" }}>
            <ExclamationCircleOutlined />
          </span>
          <span style={{ color: "black" }}>Confirm Delete</span>
        </span>
      }
      open={visible}
      onOk={handleDelete}
      onCancel={handleCancel}
      okText="Delete"
      cancelText="Cancel"
      centered
      confirmLoading={loading}
      okButtonProps={{
        style: { fontSize: 16, padding: "6px 20px" },
        danger: true,
      }}
      cancelButtonProps={{ style: { fontSize: 16, padding: "6px 20px" } }}
      width={500}
    >
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 16, marginBottom: 8 }}>
            Are you sure you want to delete the category{" "}
            <strong>{category?.name}</strong> ({category?.code})?
          </p>
          {(category?.subCategoryCount ?? 0) > 0 && (
            <p style={{ color: "#faad14", marginBottom: 0 }}>
              ⚠️ This category has {category?.subCategoryCount} sub-categories.
              It will be soft-deleted.
            </p>
          )}
        </div>

        <Form form={form} layout="vertical">
          <Form.Item
            label="Enter your password to confirm"
            name="password"
            rules={[
              { required: true, message: "Please enter your password" },
              { min: 6, message: "Password must be at least 6 characters" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </Form.Item>
        </Form>

        <p style={{ fontSize: 12, color: "#666", marginBottom: 0 }}>
          ℹ️ This action requires owner permissions and password confirmation.
        </p>
      </Space>
    </Modal>
  );
};

export default DeleteCategoryModal;
