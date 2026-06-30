import React from "react";
import { Modal, Descriptions, Table, Tag, Badge, Space, Typography, Divider } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useStockAdjustmentStore } from "../../store/inventory/stockAdjustmentStore";
import type { AdjustmentItem } from "../../types/entities/stockAdjustment.types";

const REFERENCE_LABELS: Record<string, string> = {
  purchase: "Purchase",
  sales: "Sales",
  damage: "Damage",
  expiry: "Expiry",
  return: "Return",
  other: "Other",
};

interface Props {
  open: boolean;
  onClose: () => void;
}

const StockAdjustmentDetailsModal: React.FC<Props> = ({ open, onClose }) => {
  const { selectedAdjustment, loading } = useStockAdjustmentStore();
  const adj = selectedAdjustment;

  const itemColumns = [
    {
      title: "Product",
      key: "product",
      render: (_: any, row: AdjustmentItem) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.productName}</div>
          {row.variationType && <Tag style={{ marginTop: 2 }}>{row.variationType}</Tag>}
          {row.productSKU && (
            <span style={{ color: "#9ca3af", fontSize: 12 }}>{row.productSKU}</span>
          )}
        </div>
      ),
    },
    {
      title: "Warehouse",
      dataIndex: "warehouseName",
      key: "warehouse",
    },
    {
      title: "Quantity",
      key: "quantity",
      align: "center" as const,
      render: (_: any, row: AdjustmentItem) => (
        <Tag color={adj?.movementType === "in" ? "green" : "red"}>
          {adj?.movementType === "in" ? "+" : "-"}{row.quantity} {row.unitName ?? ""}
        </Tag>
      ),
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
      render: (v: string) => v || <span style={{ color: "#9ca3af" }}>—</span>,
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={760}
      title={
        <Space>
          {adj?.movementType === "in" ? (
            <Tag color="green" icon={<ArrowUpOutlined />} style={{ fontSize: 13 }}>Stock In</Tag>
          ) : (
            <Tag color="red" icon={<ArrowDownOutlined />} style={{ fontSize: 13 }}>Stock Out</Tag>
          )}
          <Typography.Text strong style={{ fontSize: 15 }}>
            {adj?.adjustmentNumber ?? "Adjustment Details"}
          </Typography.Text>
        </Space>
      }
      styles={{ body: { paddingTop: 8 } }}
    >
      {loading || !adj ? (
        <div style={{ textAlign: "center", padding: "32px 0", color: "#9ca3af" }}>Loading...</div>
      ) : (
        <>
          <Descriptions column={2} bordered size="small" style={{ marginBottom: 16 }}>
            <Descriptions.Item label="Adjustment No.">
              <span style={{ fontFamily: "monospace", fontWeight: 600 }}>{adj.adjustmentNumber}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Movement">
              {adj.movementType === "in" ? (
                <Tag color="green" icon={<ArrowUpOutlined />}>Stock In</Tag>
              ) : (
                <Tag color="red" icon={<ArrowDownOutlined />}>Stock Out</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Reference Type">
              <Tag>{REFERENCE_LABELS[adj.referenceType] ?? adj.referenceType}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Priority">
              {adj.movementType === "in" && adj.priority ? (
                <Badge
                  color={adj.priority === "high" ? "#ef4444" : "#6366f1"}
                  text={
                    <span style={{ fontWeight: 600, color: adj.priority === "high" ? "#ef4444" : "#6366f1" }}>
                      {adj.priority.toUpperCase()}
                    </span>
                  }
                />
              ) : (
                <span style={{ color: "#9ca3af" }}>N/A</span>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Reason" span={2}>
              {adj.reason || <span style={{ color: "#9ca3af" }}>—</span>}
            </Descriptions.Item>
            {adj.notes && (
              <Descriptions.Item label="Notes" span={2}>{adj.notes}</Descriptions.Item>
            )}
            <Descriptions.Item label="Created By">
              {adj.createdByName || adj.createdBy}
            </Descriptions.Item>
            <Descriptions.Item label="Date">
              {dayjs(adj.createdAt).format("YYYY-MM-DD HH:mm")}
            </Descriptions.Item>
          </Descriptions>

          <Divider style={{ margin: "12px 0" }}>Items ({adj.itemCount})</Divider>

          <Table
            dataSource={adj.items}
            columns={itemColumns}
            rowKey="id"
            pagination={false}
            size="small"
          />
        </>
      )}
    </Modal>
  );
};

export default StockAdjustmentDetailsModal;
