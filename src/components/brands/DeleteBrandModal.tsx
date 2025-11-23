// src/components/Brands/DeleteBrandModal.tsx
import React from "react";
import { message } from "antd";
import DeleteModal from "../common/Modal/DeleteModal";
import { useBrandStore } from "../../store/management/brandStore";
import type { Brand } from "../../types/entities/brand.types";

interface DeleteBrandModalProps {
  visible: boolean;
  brand: Brand | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const DeleteBrandModal: React.FC<DeleteBrandModalProps> = ({
  visible,
  brand,
  onCancel,
  onSuccess,
}) => {
  const { deleteBrand } = useBrandStore();

  const handleDelete = async (brandData: Brand) => {
    // Check if brand has products
    if ((brandData.productCount ?? 0) > 0) {
      message.warning(
        "This brand has products associated and cannot be deleted."
      );
      throw new Error("Brand has associated products");
    }

    await deleteBrand(brandData.id);
  };

  return (
    <DeleteModal<Brand>
      visible={visible}
      title="Confirm Delete"
      data={brand}
      onCancel={onCancel}
      onSuccess={onSuccess}
      onDelete={handleDelete}
      getImageUrl={(brand) => brand?.imageUrl}
      getName={(brand) => brand?.name}
      customMessage={
        brand && (
          <>
            Are you sure you want to delete the brand{" "}
            <strong>{brand.name}</strong>?
          </>
        )
      }
    />
  );
};

export default DeleteBrandModal;
