import React from "react";
import { Modal, Descriptions, Tag, Tooltip } from "antd";
import type { Variation } from "../../types/entities/variation.types";
import dayjs from "dayjs";

interface ViewVariationModalProps {
  visible: boolean;
  variation: Variation | null;
  onCancel: () => void;
}

const ViewVariationModal: React.FC<ViewVariationModalProps> = ({
  visible,
  variation,
  onCancel,
}) => {
  return (
    <Modal
      title="Variation Details"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <Descriptions
        column={1}
        bordered
        size="middle"
        labelStyle={{ fontWeight: 600, width: "40%" }}
      >
        <Descriptions.Item label="Variation Name">
          {variation?.name || "N/A"}
        </Descriptions.Item>

        <Descriptions.Item label="Values Count">
          <Tag color="blue">{variation?.values.length || 0} values</Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Variation Values">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {variation?.values && variation.values.length > 0 ? (
              variation.values.map((value) => (
                <Tooltip
                  key={value.id}
                  title={
                    <div>
                      <div>Created: {value.createdAt ? dayjs(value.createdAt).format("DD MMM YYYY HH:mm") : "N/A"}</div>
                      <div>Updated: {value.updatedAt ? dayjs(value.updatedAt).format("DD MMM YYYY HH:mm") : "N/A"}</div>
                    </div>
                  }
                >
                  <Tag color="geekblue" style={{ marginBottom: 8 }}>
                    {value.value}
                  </Tag>
                </Tooltip>
              ))
            ) : (
              <span>No values</span>
            )}
          </div>
        </Descriptions.Item>

        <Descriptions.Item label="Status">
          <span
            className={`px-3 py-1 rounded-lg text-sm border ${variation?.status === "active"
              ? "border-green-500 text-green-500 bg-green-50/70"
              : "border-red-500 text-red-500 bg-red-50/70"
              }`}
          >
            {variation?.status === "active" ? "Active" : "Inactive"}
          </span>
        </Descriptions.Item>

        <Descriptions.Item label="Created At">
          {variation?.createdAt && variation.createdAt !== "0001-01-01T00:00:00Z"
            ? dayjs(variation.createdAt).format("DD MMM YYYY HH:mm")
            : "N/A"}
        </Descriptions.Item>

        <Descriptions.Item label="Updated At">
          {variation?.updatedAt && variation.updatedAt !== "0001-01-01T00:00:00Z"
            ? dayjs(variation.updatedAt).format("DD MMM YYYY HH:mm")
            : "N/A"}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default ViewVariationModal;
