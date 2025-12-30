import React, { useState } from "react";
import { Button, Space, Image, message, Tooltip } from "antd";
import { EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { FaRegImages } from "react-icons/fa";
import type { SortOrder } from "antd/es/table/interface";
import type { Subcategory } from "../../types/entities/subcategory.types";
import dayjs from "dayjs";
import { CommonTable } from "../common/Table";
import type { TableColumn } from "../common/Table/Table.types";
import ViewSubCategoryModal from "./ViewSubCategoryModal";
import DeleteSubCategoryModal from "./DeleteSubCategoryModal";

interface SubCategoriesTableProps {
  subcategories: Subcategory[];
  loading: boolean;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  onPageChange: (page: number, pageSize: number) => void;
  onEdit: (subcategory: Subcategory) => void;
  onView: (subcategory: Subcategory) => void;
  refreshData: () => void;
}

const SubCategoriesTable: React.FC<SubCategoriesTableProps> = ({
  subcategories,
  loading,
  pagination,
  onPageChange,
  onEdit,
  refreshData,
}) => {
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [subcategoryToDelete, setSubcategoryToDelete] = useState<Subcategory | null>(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [subcategoryToView, setSubcategoryToView] = useState<Subcategory | null>(null);

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    setSelectedDate(date);
  };

  const showDeleteModal = (subcategory: Subcategory) => {
    if ((subcategory.productCount ?? 0) > 0) {
      message.warning("This subcategory has products associated and cannot be deleted.");
      return;
    }
    setSubcategoryToDelete(subcategory);
    setDeleteModalVisible(true);
  };

  const showViewModal = (subcategory: Subcategory) => {
    setSubcategoryToView(subcategory);
    setViewModalVisible(true);
  };

  const columns: TableColumn<Subcategory>[] = [
    {
      title: <div className="text-center w-full">SubCategory</div>,
      dataIndex: "name",
      key: "subcategory",
      sorter: (a: Subcategory, b: Subcategory) => a.name.localeCompare(b.name),
      sortDirections: ["ascend", "descend"] as SortOrder[],
      render: (text: string, record: Subcategory) => {
        const capitalizedText = text
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(" ");
        const displayName = capitalizedText.length > 15 ? `${capitalizedText.substring(0, 15)}...` : capitalizedText;
        const nameElement = (
          <Button type="link" onClick={() => showViewModal(record)}>
            {displayName}
          </Button>
        );

        return (
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
            {capitalizedText.length > 15 ? (
              <Tooltip title={capitalizedText}>{nameElement}</Tooltip>
            ) : (
              nameElement
            )}
          </Space>
        );
      },
    },
    {
      title: <div className="text-center w-full">Category</div>,
      dataIndex: "categoryName",
      key: "categoryName",
      align: "center" as const,
      render: (categoryName: string) => categoryName || "N/A",
    },
    {
      title: <div className="text-center w-full">Description</div>,
      dataIndex: "description",
      key: "description",
      align: "center" as const,
      render: (description: string) => {
        if (!description?.trim()) return "N/A";
        const trimmedDescription = description.trim();
        const displayDescription =
          trimmedDescription.length > 15 ? `${trimmedDescription.substring(0, 15)}...` : trimmedDescription;
        return trimmedDescription.length > 15 ? (
          <Tooltip title={trimmedDescription}>{displayDescription}</Tooltip>
        ) : (
          displayDescription
        );
      },
    },
    {
      title: <div className="text-center w-full">Product Count</div>,
      dataIndex: "productCount",
      key: "productCount",
      align: "center" as const,
      render: (count: number) => count || 0,
    },
    {
      title: <div className="text-center w-full">Status</div>,
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
          {status === "active" ? "Active" : "In-active"}
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
      title: <div className="text-center w-full">Actions</div>,
      key: "actions",
      align: "center" as const,
      render: (_: React.ReactNode, record: Subcategory) => (
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
      <CommonTable<Subcategory>
        columns={columns}
        dataSource={subcategories}
        loading={loading}
        pagination={pagination}
        onPageChange={onPageChange}
        selectedDate={selectedDate}
        onDateFilterChange={handleDateChange}
      />

      <ViewSubCategoryModal
        visible={viewModalVisible}
        subcategory={subcategoryToView}
        onCancel={() => setViewModalVisible(false)}
      />

      <DeleteSubCategoryModal
        visible={deleteModalVisible}
        subcategory={subcategoryToDelete}
        onCancel={() => setDeleteModalVisible(false)}
        onSuccess={refreshData}
      />
    </>
  );
};

export default SubCategoriesTable;
