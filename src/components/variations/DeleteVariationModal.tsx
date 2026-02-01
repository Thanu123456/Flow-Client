import React from "react";
import { DeleteModal } from "../common/Modal";
import { useVariationStore } from "../../store/management/variationStore";
import type { Variation } from "../../types/entities/variation.types";

interface DeleteVariationModalProps {
  visible: boolean;
  variation: Variation | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const DeleteVariationModal: React.FC<DeleteVariationModalProps> = ({
  visible,
  variation,
  onCancel,
  onSuccess,
}) => {
  const { deleteVariation } = useVariationStore();

  const handleDelete = async (variationData: Variation) => {
    await deleteVariation(variationData.id);
  };

  return (
    <DeleteModal<Variation>
      visible={visible}
      title="Confirm Delete"
      data={variation}
      onCancel={onCancel}
      onSuccess={onSuccess}
      onDelete={handleDelete}
      getName={(variation) => variation?.name}
      showImage={false}
      customMessage={
        variation && (
          <>
            <p>
              Are you sure you want to delete the variation{" "}
              <strong>{variation.name}</strong>?
            </p>
            <p style={{ fontSize: 12, color: "#666" }}>
              This variation has {variation.values.length} value(s):{" "}
              {variation.values.map((v) => v.value).join(", ")}
            </p>
            <p style={{ fontSize: 12, color: "#ff4d4f", marginTop: 8 }}>
              ⚠️ Warning: This action cannot be undone. Products using this
              variation may be affected.
            </p>
          </>
        )
      }
    />
  );
};

export default DeleteVariationModal;
