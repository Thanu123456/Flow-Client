import React from "react";
import { Modal, Descriptions, Badge } from "antd";
import type { Category } from "../../types/entities/category.types";
import dayjs from "dayjs";

interface ViewCategoryModalProps {
  visible: boolean;
  category: Category | null;
  onCancel: () => void;
}

const ViewCategoryModal: React.FC<ViewCategoryModalProps> = ({
  visible,
  category,
  onCancel,
}) => {
  return (
    <Modal
      title="Category Details"
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
        <Descriptions.Item label="Category Name">
          {category?.name || "N/A"}
        </Descriptions.Item>

        <Descriptions.Item label="Category Code">
          <span className="font-semibold text-blue-600">
            {category?.code || "N/A"}
          </span>
        </Descriptions.Item>

        <Descriptions.Item label="Description">
          {category?.description || "N/A"}
        </Descriptions.Item>

        <Descriptions.Item label="Sub-Categories Count">
          <Badge
            count={category?.subCategoryCount ?? 0}
            showZero
            style={{ backgroundColor: "#52c41a" }}
          />
        </Descriptions.Item>

        <Descriptions.Item label="Status">
          <span
            className={`px-3 py-1 rounded-lg text-sm border ${
              category?.status === "active"
                ? "border-green-500 text-green-500 bg-green-50/70"
                : "border-red-500 text-red-500 bg-red-50/70"
            }`}
          >
            {category?.status === "active" ? "Active" : "Inactive"}
          </span>
        </Descriptions.Item>

        <Descriptions.Item label="Created At">
          {category?.createdAt
            ? dayjs(category.createdAt).format("DD MMM YYYY")
            : "N/A"}
        </Descriptions.Item>

        <Descriptions.Item label="Updated At">
          {category?.updatedAt
            ? dayjs(category.updatedAt).format("DD MMM YYYY")
            : "N/A"}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default ViewCategoryModal;
