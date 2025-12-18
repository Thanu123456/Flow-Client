// src/components/SubCategories/DeleteSubCategoryModal.tsx
import React from "react";
import { message } from "antd";
import { DeleteModal } from "../common/Modal";
import { useSubCategoryStore } from "../../store/management/subCategoryStore";
import type { SubCategory } from "../../types/entities/subCategory.types";

interface DeleteSubCategoryModalProps {
  visible: boolean;
  subCategory: SubCategory | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const DeleteSubCategoryModal: React.FC<DeleteSubCategoryModalProps> = ({
  visible,
  subCategory,
  onCancel,
  onSuccess,
}) => {
  const { deleteSubCategory } = useSubCategoryStore();

  const handleDelete = async (subCategoryData: SubCategory) => {
    // Check if sub-category has products
    if ((subCategoryData.productCount ?? 0) > 0) {
      message.warning(
        "This sub-category has products associated and cannot be deleted."
      );
      throw new Error("Sub-category has associated products");
    }

    await deleteSubCategory(subCategoryData.id);
  };

  return (
    <DeleteModal<SubCategory>
      visible={visible}
      title="Confirm Delete"
      data={subCategory}
      onCancel={onCancel}
      onSuccess={onSuccess}
      onDelete={handleDelete}
      getImageUrl={(subCat) => subCat?.imageUrl}
      getName={(subCat) => subCat?.name}
      customMessage={
        subCategory && (
          <>
            Are you sure you want to delete the sub-category{" "}
            <strong>{subCategory.name}</strong> from{" "}
            <strong>
              {subCategory.categoryName || subCategory.category?.name}
            </strong>
            ?
          </>
        )
      }
    />
  );
};

export default DeleteSubCategoryModal;
