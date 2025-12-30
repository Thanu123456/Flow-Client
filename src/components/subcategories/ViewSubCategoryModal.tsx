import React from "react";
import { Modal, Descriptions, Image, Tag } from "antd";
import { FaRegImages } from "react-icons/fa";
import type { Subcategory } from "../../types/entities/subcategory.types";
import dayjs from "dayjs";

interface ViewSubCategoryModalProps {
  visible: boolean;
  subcategory: Subcategory | null;
  onCancel: () => void;
}

const ViewSubCategoryModal: React.FC<ViewSubCategoryModalProps> = ({
  visible,
  subcategory,
  onCancel,
}) => {
  if (!subcategory) return null;

  return (
    <Modal
      title="SubCategory Details"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <div className="flex flex-col items-center mb-4">
        {subcategory.imageUrl ? (
          <Image
            width={120}
            height={120}
            src={subcategory.imageUrl}
            alt={subcategory.name}
            style={{ objectFit: "contain", borderRadius: 8 }}
          />
        ) : (
          <div className="w-30 h-30 flex items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-gray-50">
            <FaRegImages size={40} className="text-gray-400" />
          </div>
        )}
      </div>

      <Descriptions bordered column={1} size="small">
        <Descriptions.Item label="Name">{subcategory.name}</Descriptions.Item>
        <Descriptions.Item label="Category">
          {subcategory.categoryName || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Description">
          {subcategory.description || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Product Count">
          {subcategory.productCount || 0}
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color={subcategory.status === "active" ? "green" : "red"}>
            {subcategory.status === "active" ? "Active" : "Inactive"}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Created At">
          {dayjs(subcategory.createdAt).format("YYYY-MM-DD HH:mm")}
        </Descriptions.Item>
        <Descriptions.Item label="Updated At">
          {dayjs(subcategory.updatedAt).format("YYYY-MM-DD HH:mm")}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default ViewSubCategoryModal;
