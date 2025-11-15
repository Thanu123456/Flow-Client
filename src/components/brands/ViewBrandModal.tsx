// src/components/Brands/ViewBrandModal.tsx
import React, { useEffect } from "react";
import { Modal, Image, Descriptions } from "antd";
import { FaRegImages } from "react-icons/fa";
import type { Brand } from "../../types/entities/brand.types";

interface ViewBrandModalProps {
  visible: boolean;
  brand: Brand | null;
  onCancel: () => void;
}

const ViewBrandModal: React.FC<ViewBrandModalProps> = ({
  visible,
  brand,
  onCancel,
}) => {
  useEffect(() => {
    // Any logic on open can go here
  }, [visible, brand]);

  return (
    <Modal
      title={`Brand Details`}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        {brand?.imageUrl ? (
          <Image
            width={180}
            height={180}
            src={brand.imageUrl}
            alt={brand.name}
            style={{ objectFit: "contain", borderRadius: 8 }}
            preview={false}
          />
        ) : (
          <div className="w-44 h-44 flex items-center justify-center rounded-md border-2 border-dashed border-red-400 bg-gray-50 mx-auto">
            <FaRegImages size={32} className="text-gray-400" />
          </div>
        )}
      </div>

      <Descriptions
        column={1}
        bordered
        size="middle"
        labelStyle={{ fontWeight: 600 }}
      >
        <Descriptions.Item label="Brand Name">
          {brand?.name || "N/A"}
        </Descriptions.Item>

        <Descriptions.Item label="Description">
          {brand?.description || "N/A"}
        </Descriptions.Item>

        <Descriptions.Item label="Product Count">
          {brand?.productCount ?? 0}
        </Descriptions.Item>

        <Descriptions.Item label="Status">
          <span
            className={`px-3 py-1 rounded-lg text-sm border ${
              brand?.status === "active"
                ? "border-green-500 text-green-500 bg-green-50/70"
                : "border-red-500 text-red-500 bg-red-50/70"
            }`}
          >
            {brand?.status === "active" ? "Active" : "Inactive"}
          </span>
        </Descriptions.Item>

        <Descriptions.Item label="Created At">
          {brand?.createdAt
            ? new Date(brand.createdAt).toLocaleDateString()
            : "N/A"}
        </Descriptions.Item>

        <Descriptions.Item label="Updated At">
          {brand?.updatedAt
            ? new Date(brand.updatedAt).toLocaleDateString()
            : "N/A"}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default ViewBrandModal;
