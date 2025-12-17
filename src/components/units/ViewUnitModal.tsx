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
            {unit.unitName}
          </Descriptions.Item>
          <Descriptions.Item label="Short Name">
            {unit.shortUnitName}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Badge
              status={unit.status === "active" ? "success" : "error"}
              text={unit.status === "active" ? "Active" : "In-active"}
            />
          </Descriptions.Item>
          <Descriptions.Item label="Number of Products">
            {unit.productCount || 0}
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
