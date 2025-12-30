import React from "react";
import { Modal, message } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import type { Subcategory } from "../../types/entities/subcategory.types";
import { useSubcategoryStore } from "../../store/management/subCategoryStore";

interface DeleteSubCategoryModalProps {
  visible: boolean;
  subcategory: Subcategory | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const DeleteSubCategoryModal: React.FC<DeleteSubCategoryModalProps> = ({
  visible,
  subcategory,
  onCancel,
  onSuccess,
}) => {
  const { deleteSubcategory, loading } = useSubcategoryStore();

  const handleDelete = async () => {
    if (!subcategory) return;

    try {
      await deleteSubcategory(subcategory.id);
      message.success("SubCategory deleted successfully");
      onCancel();
      onSuccess();
    } catch (error: any) {
      message.error(error.message || "Failed to delete subcategory");
    }
  };

  return (
    <Modal
      title={
        <span>
          <ExclamationCircleOutlined style={{ color: "#faad14", marginRight: 8 }} />
          Delete SubCategory
        </span>
      }
      open={visible}
      onCancel={onCancel}
      onOk={handleDelete}
      okText="Delete"
      okButtonProps={{ danger: true, loading }}
      cancelButtonProps={{ disabled: loading }}
    >
      <p>
        Are you sure you want to delete the subcategory{" "}
        <strong>{subcategory?.name}</strong>?
      </p>
      <p className="text-gray-500 text-sm">This action cannot be undone.</p>
    </Modal>
  );
};

export default DeleteSubCategoryModal;
