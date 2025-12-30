import React from "react";
import { Modal, Typography } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import type { Warehouse } from "../../types/entities/warehouse.types";

const { Text } = Typography;

interface DeleteWarehouseModalProps {
  visible: boolean;
  warehouse: Warehouse | null;
  onCancel: () => void;
  onConfirm: () => void;
}

const DeleteWarehouseModal: React.FC<DeleteWarehouseModalProps> = ({
  visible,
  warehouse,
  onCancel,
  onConfirm,
}) => {
  if (!warehouse) return null;

  return (
    <Modal
      title={
        <span>
          <ExclamationCircleOutlined style={{ color: "#faad14", marginRight: 8 }} />
          Delete Warehouse
        </span>
      }
      open={visible}
      onCancel={onCancel}
      onOk={onConfirm}
      okText="Delete"
      okButtonProps={{ danger: true }}
      cancelText="Cancel"
    >
      <p>
        Are you sure you want to delete the warehouse{" "}
        <Text strong>"{warehouse.name}"</Text>?
      </p>
      <p>This action cannot be undone.</p>
    </Modal>
  );
};

export default DeleteWarehouseModal;
