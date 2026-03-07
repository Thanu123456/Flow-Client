import React from "react";
import { Modal, Descriptions, Badge } from "antd";
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
      width={700}
    >
      <Descriptions bordered column={2}>
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
        <Descriptions.Item label="Address" span={2}>
          {warehouse.address || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Total Products">
          <Badge
            count={warehouse.totalProducts || 0}
            showZero
            style={{
              backgroundColor: (warehouse.totalProducts || 0) > 0 ? "#1890ff" : "#d9d9d9",
            }}
          />
        </Descriptions.Item>
        <Descriptions.Item label="Total Stock">
          {warehouse.totalStock ?? 0}
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <span
            className={`px-3 py-1 rounded-lg text-sm border ${warehouse.status === "active"
              ? "border-green-500 text-green-500 bg-green-50/70"
              : "border-red-500 text-red-500 bg-red-50/70"
              }`}
          >
            {warehouse.status === "active" ? "Active" : "Inactive"}
          </span>
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
