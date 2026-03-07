import React from "react";
import { Modal, Descriptions, Badge } from "antd";
import type { Unit } from "../../types/entities/unit.types";
import dayjs from "dayjs";


interface ViewUnitModalProps {
  visible: boolean;
  unit: Unit | null;
  onCancel: () => void;
}

const ViewUnitModal: React.FC<ViewUnitModalProps> = ({
  visible,
  unit,
  onCancel,
}) => {
  return (
    <Modal
      title="Unit Details"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      {unit && (
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Unit Name">
            {unit.name}
          </Descriptions.Item>
          <Descriptions.Item label="Short Name">
            {unit.shortName}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <span
              className={`px-3 py-1 rounded-lg text-sm border ${unit.status === "active"
                ? "border-green-500 text-green-500 bg-green-50/70"
                : "border-red-500 text-red-500 bg-red-50/70"
                }`}
            >
              {unit.status === "active" ? "Active" : "Inactive"}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Number of Products">
            <Badge
              count={unit.productCount || 0}
              showZero
              style={{
                backgroundColor: (unit.productCount || 0) > 0 ? "#1890ff" : "#d9d9d9",
              }}
            />
          </Descriptions.Item>
          <Descriptions.Item label="Created At">
            {dayjs(unit.createdAt).format("YYYY-MM-DD HH:mm:ss")}
          </Descriptions.Item>
        </Descriptions>
      )}
    </Modal>
  );
};

export default ViewUnitModal;
