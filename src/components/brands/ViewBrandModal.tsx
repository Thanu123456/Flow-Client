import React from "react";
import { Image, Descriptions } from "antd";
import { FaRegImages } from "react-icons/fa";
import type { Brand } from "../../types/entities/brand.types";
import { ViewModal } from "../common/Modal";

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
  return (
    <ViewModal<Brand>
      visible={visible}
      title="Brand Details"
      data={brand}
      onCancel={onCancel}
      width={600}
    >
      {(brandData) => (
        <>
          {/* IMAGE */}
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            {brandData?.imageUrl ? (
              <Image
                width={180}
                height={180}
                src={brandData.imageUrl}
                alt={brandData.name}
                style={{ objectFit: "contain", borderRadius: 8 }}
                preview={false}
              />
            ) : (
              <div className="w-44 h-44 flex items-center justify-center rounded-md border-2 border-dashed border-red-400 bg-gray-50 mx-auto">
                <FaRegImages size={32} className="text-gray-400" />
              </div>
            )}
          </div>

          {/* DESCRIPTION FIELDS */}
          <Descriptions
            column={1}
            bordered
            size="middle"
            labelStyle={{ fontWeight: 600 }}
          >
            <Descriptions.Item label="Brand Name">
              {brandData?.name ?? "N/A"}
            </Descriptions.Item>

            <Descriptions.Item label="Description">
              {brandData?.description ?? "N/A"}
            </Descriptions.Item>

            <Descriptions.Item label="Product Count">
              {brandData?.productCount ?? 0}
            </Descriptions.Item>

            <Descriptions.Item label="Status">
              <span
                className={`px-3 py-1 rounded-lg text-sm border ${
                  brandData?.status === "active"
                    ? "border-green-500 text-green-500 bg-green-50/70"
                    : "border-red-500 text-red-500 bg-red-50/70"
                }`}
              >
                {brandData?.status === "active" ? "Active" : "Inactive"}
              </span>
            </Descriptions.Item>

            <Descriptions.Item label="Created At">
              {brandData?.createdAt
                ? new Date(brandData.createdAt).toLocaleDateString()
                : "N/A"}
            </Descriptions.Item>

            <Descriptions.Item label="Updated At">
              {brandData?.updatedAt
                ? new Date(brandData.updatedAt).toLocaleDateString()
                : "N/A"}
            </Descriptions.Item>
          </Descriptions>
        </>
      )}
    </ViewModal>
  );
};

export default ViewBrandModal;
