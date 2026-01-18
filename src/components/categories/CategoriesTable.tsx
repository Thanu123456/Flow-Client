import React, { useState } from "react";
import { Button, Space, Badge, Tooltip } from "antd";
import { EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import type { SortOrder } from "antd/es/table/interface";
import type { Category } from "../../types/entities/category.types";
import dayjs from "dayjs";
import ViewCategoryModal from "./ViewCategoryModal";
import DeleteCategoryModal from "./DeleteCategoryModal";
import { CommonTable } from "../common/Table";
import type { TableColumn } from "../common/Table/Table.types";

interface CategoriesTableProps {
  categories: Category[];
  loading: boolean;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  onPageChange: (page: number, pageSize: number) => void;
  onEdit: (category: Category) => void;
  onSubCategoryCountClick: (category: Category) => void;
  refreshData: () => void;
}

const CategoriesTable: React.FC<CategoriesTableProps> = ({
  categories,
  loading,
  pagination,
  onPageChange,
  onEdit,
  onSubCategoryCountClick,
  refreshData,
}) => {
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);

  // Modal states
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );

  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [categoryToView, setCategoryToView] = useState<Category | null>(null);

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    setSelectedDate(date);
  };

  const showDeleteModal = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteModalVisible(true);
  };

  const showViewModal = (category: Category) => {
    setCategoryToView(category);
    setViewModalVisible(true);
  };

  const columns: TableColumn<Category>[] = [
    {
      title: <div className="text-center w-full">Category Name</div>,
      dataIndex: "name",
      key: "name",
      sorter: (a: Category, b: Category) => a.name.localeCompare(b.name),
      sortDirections: ["ascend", "descend"] as SortOrder[],
      render: (text: string, record: Category) => (
        <Button type="link" onClick={() => showViewModal(record)}>
          {text}
        </Button>
      ),
    },
    {
      title: <div className="text-center w-full">Code</div>,
      dataIndex: "code",
      key: "code",
      align: "center" as const,
      sorter: (a: Category, b: Category) => a.code.localeCompare(b.code),
      sortDirections: ["ascend", "descend"] as SortOrder[],
      render: (text: string) => (
        <span className="font-semibold text-blue-600">{text}</span>
      ),
    },
    {
      title: <div className="text-center w-full"># Sub-Cats</div>,
      dataIndex: "subcategoryCount",
      key: "subcategoryCount",
      align: "center" as const,
      sorter: (a: Category, b: Category) =>
        (a.subcategoryCount ?? 0) - (b.subcategoryCount ?? 0),
      sortDirections: ["ascend", "descend"] as SortOrder[],
      render: (count: number, record: Category) => (
        <Badge
          count={count || 0}
          showZero
          style={{
            backgroundColor: count > 0 ? "#52c41a" : "#d9d9d9",
            cursor: count > 0 ? "pointer" : "default",
          }}
          onClick={() => {
            if (count > 0) {
              onSubCategoryCountClick(record);
            }
          }}
        />
      ),
    },
    {
      title: <div className="text-center w-full">Created At</div>,
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center" as const,
      showDateFilter: true,
      sorter: (a: Category, b: Category) =>
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
          className={`px-3 py-1 rounded-lg text-sm border ${status === "active"
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
      render: (_: React.ReactNode, record: Category) => (
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
      <CommonTable<Category>
        columns={columns}
        dataSource={categories}
        loading={loading}
        pagination={pagination}
        onPageChange={onPageChange}
        selectedDate={selectedDate}
        onDateFilterChange={handleDateChange}
      />

      {/* Delete Modal */}
      <DeleteCategoryModal
        visible={deleteModalVisible}
        category={categoryToDelete}
        onCancel={() => setDeleteModalVisible(false)}
        onSuccess={refreshData}
      />

      {/* View Modal */}
      <ViewCategoryModal
        visible={viewModalVisible}
        category={categoryToView}
        onCancel={() => setViewModalVisible(false)}
      />
    </>
  );
};

export default CategoriesTable;
