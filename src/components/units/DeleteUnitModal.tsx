import React, { useEffect } from "react";
import { Modal, message } from "antd";
import type { Unit } from "../../types/entities/unit.types";
import { useUnitStore } from "../../store/management/unitStore";

interface DeleteUnitModalProps {
  visible: boolean;
  unit: Unit | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const DeleteUnitModal: React.FC<DeleteUnitModalProps> = ({
  visible,
  unit,
  onCancel,
  onSuccess,
}) => {
  const { deleteUnit, loading, error, clearError } = useUnitStore();

  useEffect(() => {
    if (visible) {
      clearError();
    }
  }, [visible, clearError]);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  const handleOk = async () => {
    if (!unit) return;
    try {
      await deleteUnit(unit.id);
      message.success("Unit deleted successfully");
      onSuccess();
    } catch (err) {
      // Error is handled by the store and displayed via useEffect
    }
  };

  return (
    <Modal
      title="Delete Unit"
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={loading}
      okText="Delete"
      cancelText="Cancel"
      okButtonProps={{ danger: true }}
    >
      <p>
        Are you sure you want to delete the unit "
        <strong>{unit?.name}</strong>
        "?
      </p>
      <p style={{ color: "#ff4d4f" }}>This action cannot be undone.</p>
    </Modal>
  );
};

export default DeleteUnitModal;
