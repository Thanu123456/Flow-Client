// src/components/Brands/BrandsTable.tsx (Refactored with DeleteBrandModal)
import React, { useState } from "react";
import { Button, Space, Image, message, Tooltip } from "antd";
import { EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { FaRegImages } from "react-icons/fa";
import type { SortOrder } from "antd/es/table/interface";
import type { Brand } from "../../types/entities/brand.types";
import dayjs from "dayjs";
import ViewBrandModal from "./ViewBrandModal";
import DeleteBrandModal from "./DeleteBrandModal";
import { CommonTable } from "../common/Table";
import type { TableColumn } from "../common/Table/Table.types";

interface BrandsTableProps {
  brands: Brand[];
  loading: boolean;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  onPageChange: (page: number, pageSize: number) => void;
  onEdit: (brand: Brand) => void;
  onView: (brand: Brand) => void;
  refreshData: () => void;
}

const BrandsTable: React.FC<BrandsTableProps> = ({
  brands,
  loading,
  pagination,
  onPageChange,
  onEdit,
  refreshData,
}) => {
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);

  // Modal states
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);

  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [brandToView, setBrandToView] = useState<Brand | null>(null);

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    setSelectedDate(date);
  };

  const showDeleteModal = (brand: Brand) => {
    if ((brand.productCount ?? 0) > 0) {
      message.warning(
        "This brand has products associated and cannot be deleted."
      );
      return;
    }
    setBrandToDelete(brand);
    setDeleteModalVisible(true);
  };

  const showViewModal = (brand: Brand) => {
    setBrandToView(brand);
    setViewModalVisible(true);
  };

  const columns: TableColumn<Brand>[] = [
    {
      title: (
        <div className="text-center w-full text-base font-medium">Brand</div>
      ),
      dataIndex: "name",
      key: "brand",
      sorter: (a: Brand, b: Brand) => a.name.localeCompare(b.name),
      sortDirections: ["ascend", "descend"] as SortOrder[],
      render: (text: string, record: Brand) => (
        <Space>
          {record.imageUrl ? (
            <Image
              width={40}
              height={40}
              src={record.imageUrl}
              alt={text}
              style={{ objectFit: "contain" }}
              preview={false}
            />
          ) : (
            <div className="w-10 h-10 flex items-center justify-center rounded-md border-2 border-dashed border-red-400 bg-gray-50">
              <FaRegImages size={20} className="text-gray-400" />
            </div>
          )}
          <Button type="link" onClick={() => showViewModal(record)}>
            {text}
          </Button>
        </Space>
      ),
    },
    {
      title: (
        <div className="text-center w-full text-base font-medium">
          Description
        </div>
      ),
      dataIndex: "description",
      key: "description",
      align: "center" as const,
      ellipsis: true,
      render: (description: string) => description?.trim() || "N/A",
    },
    {
      title: (
        <div className="text-center w-full text-base font-medium">
          Product Count
        </div>
      ),
      dataIndex: "productCount",
      key: "productCount",
      align: "center" as const,
      render: (count: number) => count || 0,
    },
    {
      title: (
        <div className="text-center w-full text-base font-medium">Status</div>
      ),
      dataIndex: "status",
      key: "status",
      align: "center" as const,
      render: (status: string) => (
        <span
          className={`px-3 py-1 rounded-lg text-sm border ${
            status === "active"
              ? "border-green-500 text-green-500 bg-green-50/70"
              : "border-red-500 text-red-500 bg-red-50/70"
          }`}
        >
          {status === "active" ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      title: "Created Date",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center" as const,
      showDateFilter: true,
      render: (date: string) => dayjs(date).format("YYYY/MM/DD"),
    },
    {
      title: (
        <div className="text-center w-full text-base font-medium">Actions</div>
      ),
      key: "actions",
      align: "center" as const,
      render: (_: React.ReactNode, record: Brand) => (
        <Space>
          <div
            className="flex items-center justify-center w-7 h-7 bg-white shadow-sm rounded-md cursor-pointer"
            onClick={() => showViewModal(record)}
          >
            <Tooltip title="View">
              <EyeOutlined />
            </Tooltip>
          </div>

          <div
            className="flex items-center justify-center w-7 h-7 bg-white shadow-sm rounded-md cursor-pointer"
            onClick={() => onEdit(record)}
          >
            <Tooltip title="Edit">
              <EditOutlined style={{ color: "#1890ff" }} />
            </Tooltip>
          </div>

          <div
            className="flex items-center justify-center w-7 h-7 bg-white shadow-sm rounded-md cursor-pointer"
            onClick={() => showDeleteModal(record)}
            style={{ opacity: (record.productCount ?? 0) > 0 ? 0.5 : 1 }}
          >
            <Tooltip title="Delete">
              <DeleteOutlined style={{ color: "red" }} />
            </Tooltip>
          </div>
        </Space>
      ),
    },
  ];

  return (
    <>
      <CommonTable<Brand>
        columns={columns}
        dataSource={brands}
        loading={loading}
        pagination={pagination}
        onPageChange={onPageChange}
        selectedDate={selectedDate}
        onDateFilterChange={handleDateChange}
      />

      {/* Delete Modal */}
      <DeleteBrandModal
        visible={deleteModalVisible}
        brand={brandToDelete}
        onCancel={() => setDeleteModalVisible(false)}
        onSuccess={refreshData}
      />

      {/* View Modal */}
      <ViewBrandModal
        visible={viewModalVisible}
        brand={brandToView}
        onCancel={() => setViewModalVisible(false)}
      />
    </>
  );
};

export default BrandsTable;
