// src/components/SubCategories/SubCategoriesTable.tsx
import React, { useState } from "react";
import { Button, Space, Image, Tooltip, message } from "antd";
import { EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { FaRegImages } from "react-icons/fa";
import type { SortOrder } from "antd/es/table/interface";
import type { SubCategory } from "../../types/entities/subCategory.types";
import dayjs from "dayjs";
import ViewSubCategoryModal from "./ViewSubCategoryModal";
import DeleteSubCategoryModal from "./DeleteSubCategoryModal";
import { CommonTable } from "../common/Table";
import type { TableColumn } from "../common/Table/Table.types";

interface SubCategoriesTableProps {
  subCategories: SubCategory[];
  loading: boolean;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  onPageChange: (page: number, pageSize: number) => void;
  onEdit: (subCategory: SubCategory) => void;
  refreshData: () => void;
}

const SubCategoriesTable: React.FC<SubCategoriesTableProps> = ({
  subCategories,
  loading,
  pagination,
  onPageChange,
  onEdit,
  refreshData,
}) => {
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);

  // Modal states
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [subCategoryToDelete, setSubCategoryToDelete] =
    useState<SubCategory | null>(null);

  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [subCategoryToView, setSubCategoryToView] =
    useState<SubCategory | null>(null);

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    setSelectedDate(date);
  };

  const showDeleteModal = (subCategory: SubCategory) => {
    if ((subCategory.productCount ?? 0) > 0) {
      message.warning(
        "This sub-category has products associated and cannot be deleted."
      );
      return;
    }
    setSubCategoryToDelete(subCategory);
    setDeleteModalVisible(true);
  };

  const showViewModal = (subCategory: SubCategory) => {
    setSubCategoryToView(subCategory);
    setViewModalVisible(true);
  };

  const columns: TableColumn<SubCategory>[] = [
    {
      title: <div className="text-center w-full">Sub-Category</div>,
      dataIndex: "name",
      key: "name",
      sorter: (a: SubCategory, b: SubCategory) => a.name.localeCompare(b.name),
      sortDirections: ["ascend", "descend"] as SortOrder[],
      render: (text: string, record: SubCategory) => (
        <Space>
          {record.imageUrl ? (
            <Image
              width={40}
              height={40}
              src={record.imageUrl}
              alt={text}
              style={{ objectFit: "contain", borderRadius: 4 }}
              preview={false}
            />
          ) : (
            <div className="w-10 h-10 flex items-center justify-center rounded-md border-2 border-dashed border-gray-400 bg-gray-50">
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
      title: <div className="text-center w-full">Category Code</div>,
      dataIndex: "categoryCode",
      key: "categoryCode",
      align: "center" as const,
      render: (text: string, record: SubCategory) => (
        <span className="font-semibold text-blue-600">
          {text || record.category?.code || "N/A"}
        </span>
      ),
    },
    {
      title: <div className="text-center w-full">Category Name</div>,
      dataIndex: "categoryName",
      key: "categoryName",
      align: "center" as const,
      sorter: (a: SubCategory, b: SubCategory) =>
        (a.categoryName || a.category?.name || "").localeCompare(
          b.categoryName || b.category?.name || ""
        ),
      sortDirections: ["ascend", "descend"] as SortOrder[],
      render: (text: string, record: SubCategory) =>
        text || record.category?.name || "N/A",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center" as const,
      showDateFilter: true,
      sorter: (a: SubCategory, b: SubCategory) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      sortDirections: ["ascend", "descend"] as SortOrder[],
      render: (date: string) => dayjs(date).format("DD MMM YYYY"),
    },
    {
      title: <div className="text-center w-full">Status</div>,
      dataIndex: "status",
      key: "status",
      align: "center" as const,
      filters: [
        { text: "Active", value: "active" },
        { text: "Inactive", value: "inactive" },
      ],
      onFilter: (value, record) => record.status === value,
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
      title: <div className="text-center w-full">Actions</div>,
      key: "actions",
      align: "center" as const,
      render: (_: React.ReactNode, record: SubCategory) => (
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
      <CommonTable<SubCategory>
        columns={columns}
        dataSource={subCategories}
        loading={loading}
        pagination={pagination}
        onPageChange={onPageChange}
        selectedDate={selectedDate}
        onDateFilterChange={handleDateChange}
      />

      {/* Delete Modal */}
      <DeleteSubCategoryModal
        visible={deleteModalVisible}
        subCategory={subCategoryToDelete}
        onCancel={() => setDeleteModalVisible(false)}
        onSuccess={refreshData}
      />

      {/* View Modal */}
      <ViewSubCategoryModal
        visible={viewModalVisible}
        subCategory={subCategoryToView}
        onCancel={() => setViewModalVisible(false)}
      />
    </>
  );
};

export default SubCategoriesTable;
