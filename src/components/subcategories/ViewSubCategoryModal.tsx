import React from "react";
import { Modal, Descriptions, Badge, Image } from "antd";
import { FaRegImages } from "react-icons/fa";
import type { SubCategory } from "../../types/entities/subCategory.types";
import dayjs from "dayjs";

interface ViewSubCategoryModalProps {
  visible: boolean;
  subCategory: SubCategory | null;
  onCancel: () => void;
}

const ViewSubCategoryModal: React.FC<ViewSubCategoryModalProps> = ({
  visible,
  subCategory,
  onCancel,
}) => {
  return (
    <Modal
      title="Sub-Category Details"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        {subCategory?.imageUrl ? (
          <Image
            width={180}
            height={180}
            src={subCategory.imageUrl}
            alt={subCategory.name}
            style={{ objectFit: "contain", borderRadius: 8 }}
            preview={false}
          />
        ) : (
          <div className="w-44 h-44 flex items-center justify-center rounded-md border-2 border-dashed border-gray-400 bg-gray-50 mx-auto">
            <FaRegImages size={32} className="text-gray-400" />
          </div>
        )}
      </div>

      <Descriptions
        column={1}
        bordered
        size="middle"
        labelStyle={{ fontWeight: 600, width: "40%" }}
      >
        <Descriptions.Item label="Sub-Category Name">
          {subCategory?.name || "N/A"}
        </Descriptions.Item>

        <Descriptions.Item label="Category Name">
          {subCategory?.categoryName || subCategory?.category?.name || "N/A"}
        </Descriptions.Item>

        <Descriptions.Item label="Category Code">
          <span className="font-semibold text-blue-600">
            {subCategory?.categoryCode || subCategory?.category?.code || "N/A"}
          </span>
        </Descriptions.Item>

        <Descriptions.Item label="Product Count">
          <Badge
            count={subCategory?.productCount ?? 0}
            showZero
            style={{ backgroundColor: "#52c41a" }}
          />
        </Descriptions.Item>

        <Descriptions.Item label="Status">
          <span
            className={`px-3 py-1 rounded-lg text-sm border ${
              subCategory?.status === "active"
                ? "border-green-500 text-green-500 bg-green-50/70"
                : "border-red-500 text-red-500 bg-red-50/70"
            }`}
          >
            {subCategory?.status === "active" ? "Active" : "Inactive"}
          </span>
        </Descriptions.Item>

        <Descriptions.Item label="Created At">
          {subCategory?.createdAt
            ? dayjs(subCategory.createdAt).format("DD MMM YYYY")
            : "N/A"}
        </Descriptions.Item>

        <Descriptions.Item label="Updated At">
          {subCategory?.updatedAt
            ? dayjs(subCategory.updatedAt).format("DD MMM YYYY")
            : "N/A"}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default ViewSubCategoryModal;
