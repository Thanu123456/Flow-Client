import React from "react";
import { message } from "antd";
import DeleteModal from "../common/Modal/DeleteModal";
import { useCategoryStore } from "../../store/management/categoryStore";
import type { Category } from "../../types/entities/category.types";

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

  const handleDelete = async (categoryData: Category) => {
    // Check if category has subcategories
    if ((categoryData.subcategoryCount ?? 0) > 0) {
      message.warning(
        "This category has subcategories associated. It will be soft-deleted."
      );
    }

    await deleteCategory(categoryData.id);
  };

  return (
    <DeleteModal<Category>
      visible={visible}
      title="Confirm Delete"
      data={category}
      onCancel={onCancel}
      onSuccess={onSuccess}
      onDelete={handleDelete}
      getImageUrl={(category) => category?.imageUrl}
      getName={(category) => category?.name}
      customMessage={
        category && (
          <>
            Are you sure you want to delete the category{" "}
            <strong>{category.name}</strong>?
            {(category.subcategoryCount ?? 0) > 0 && (
              <p style={{ color: "#faad14", marginTop: 8, marginBottom: 0 }}>
                This category has {category.subcategoryCount} subcategories.
              </p>
            )}
          </>
        )
      }
    />
  );
};

export default DeleteCategoryModal;
