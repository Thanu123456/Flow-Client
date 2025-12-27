import React from "react";
import { Modal, Descriptions, Tag, Button, Space } from "antd";
import {
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
} from "@ant-design/icons";
import type { Warehouse } from "../../types/entities/warehouse.types";
import dayjs from "dayjs";

interface ViewWarehouseModalProps {
  visible: boolean;
  warehouse: Warehouse | null;
  onCancel: () => void;
  onViewStock?: (warehouseId: string) => void;
}

const ViewWarehouseModal: React.FC<ViewWarehouseModalProps> = ({
  visible,
  warehouse,
  onCancel,
  onViewStock,
}) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "main":
        return "blue";
      case "branch":
        return "green";
      case "distribution":
        return "orange";
      default:
        return "default";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "main":
        return "Main Warehouse";
      case "branch":
        return "Branch Warehouse";
      case "distribution":
        return "Distribution Center";
      default:
        return type;
    }
  };

  return (
    <Modal
      title="Warehouse Details"
      open={visible}
      onCancel={onCancel}
      width={700}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Close
        </Button>,
        warehouse && onViewStock && (
          <Button
            key="stock"
            type="primary"
            onClick={() => onViewStock(warehouse.id)}
          >
            View Stock
          </Button>
        ),
      ]}
    >
      <Descriptions
        column={2}
        bordered
        size="middle"
        labelStyle={{ fontWeight: 600, width: "40%" }}
      >
        <Descriptions.Item label="Warehouse Name" span={2}>
          {warehouse?.name || "N/A"}
        </Descriptions.Item>

        <Descriptions.Item label="Warehouse Code">
          <span className="font-semibold text-blue-600">
            {warehouse?.code || "N/A"}
          </span>
        </Descriptions.Item>

        <Descriptions.Item label="Type">
          <Tag color={getTypeColor(warehouse?.type || "")}>
            {getTypeLabel(warehouse?.type || "")}
          </Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Status" span={2}>
          <span
            className={`px-3 py-1 rounded-lg text-sm border ${
              warehouse?.status === "active"
                ? "border-green-500 text-green-500 bg-green-50/70"
                : "border-red-500 text-red-500 bg-red-50/70"
            }`}
          >
            {warehouse?.status === "active" ? "Active" : "Inactive"}
          </span>
        </Descriptions.Item>

        <Descriptions.Item label="Capacity">
          {warehouse?.capacity
            ? `${warehouse.capacity.toLocaleString()} units`
            : "N/A"}
        </Descriptions.Item>

        <Descriptions.Item label="Current Stock">
          {warehouse?.currentStock
            ? `${warehouse.currentStock.toLocaleString()} units`
            : "0 units"}
        </Descriptions.Item>

        <Descriptions.Item label="Address" span={2}>
          <Space>
            <EnvironmentOutlined />
            <span>{warehouse?.address || "N/A"}</span>
          </Space>
        </Descriptions.Item>

        <Descriptions.Item label="City">
          {warehouse?.city || "N/A"}
        </Descriptions.Item>

        <Descriptions.Item label="State/Province">
          {warehouse?.state || "N/A"}
        </Descriptions.Item>

        <Descriptions.Item label="Postal Code">
          {warehouse?.postalCode || "N/A"}
        </Descriptions.Item>

        <Descriptions.Item label="Country">
          {warehouse?.country || "N/A"}
        </Descriptions.Item>

        <Descriptions.Item label="Phone" span={2}>
          {warehouse?.phone ? (
            <Space>
              <PhoneOutlined />
              <span>{warehouse.phone}</span>
            </Space>
          ) : (
            "N/A"
          )}
        </Descriptions.Item>

        <Descriptions.Item label="Email" span={2}>
          {warehouse?.email ? (
            <Space>
              <MailOutlined />
              <a href={`mailto:${warehouse.email}`}>{warehouse.email}</a>
            </Space>
          ) : (
            "N/A"
          )}
        </Descriptions.Item>

        <Descriptions.Item label="Manager Name">
          {warehouse?.managerName || "N/A"}
        </Descriptions.Item>

        <Descriptions.Item label="Manager Phone">
          {warehouse?.managerPhone || "N/A"}
        </Descriptions.Item>

        <Descriptions.Item label="Description" span={2}>
          {warehouse?.description || "N/A"}
        </Descriptions.Item>

        <Descriptions.Item label="Created At">
          {warehouse?.createdAt
            ? dayjs(warehouse.createdAt).format("DD MMM YYYY HH:mm")
            : "N/A"}
        </Descriptions.Item>

        <Descriptions.Item label="Updated At">
          {warehouse?.updatedAt
            ? dayjs(warehouse.updatedAt).format("DD MMM YYYY HH:mm")
            : "N/A"}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default ViewWarehouseModal;
