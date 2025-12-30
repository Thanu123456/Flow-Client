import React from "react";
import { Modal, Descriptions, Tag } from "antd";
import type { Warehouse } from "../../types/entities/warehouse.types";

interface ViewWarehouseModalProps {
  visible: boolean;
  warehouse: Warehouse | null;
  onCancel: () => void;
}

const ViewWarehouseModal: React.FC<ViewWarehouseModalProps> = ({
  visible,
  warehouse,
  onCancel,
}) => {
  if (!warehouse) return null;

  return (
    <Modal
      title="Warehouse Details"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <Descriptions bordered column={1}>
        <Descriptions.Item label="Name">{warehouse.name}</Descriptions.Item>
        <Descriptions.Item label="Contact Person">
          {warehouse.contactPerson || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Email">
          {warehouse.email || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Mobile">
          {warehouse.mobile || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Phone">
          {warehouse.phone || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="City">
          {warehouse.city || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Address">
          {warehouse.address || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Total Products">
          {warehouse.totalProducts ?? 0}
        </Descriptions.Item>
        <Descriptions.Item label="Total Stock">
          {warehouse.totalStock ?? 0}
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color={warehouse.status === "active" ? "green" : "red"}>
            {warehouse.status?.toUpperCase() || "UNKNOWN"}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Created At">
          {warehouse.createdAt
            ? new Date(warehouse.createdAt).toLocaleString()
            : "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Updated At">
          {warehouse.updatedAt
            ? new Date(warehouse.updatedAt).toLocaleString()
            : "-"}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default ViewWarehouseModal;
