import React, { useState } from "react";
import { Space, Tooltip, Badge } from "antd";
import { EditOutlined, EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import type { SortOrder } from "antd/es/table/interface";
import type { Unit } from "../../types/entities/unit.types";
import dayjs from "dayjs";
import { CommonTable } from "../common/Table";
import type { TableColumn } from "../common/Table/Table.types";

interface UnitsTableProps {
  units: Unit[];
  loading: boolean;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  onPageChange: (page: number, pageSize: number) => void;
  onEdit: (unit: Unit) => void;
  onView: (unit: Unit) => void;
  onDelete: (unit: Unit) => void;
  onProductCountClick: (unitId: string) => void;
}

const UnitsTable: React.FC<UnitsTableProps> = ({
  units,
  loading,
  pagination,
  onPageChange,
  onEdit,
  onView,
  onDelete,
  onProductCountClick,
}) => {
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    setSelectedDate(date);
  };

  const columns: TableColumn<Unit>[] = [
    {
      title: <div className="text-center w-full">Unit Name</div>,
      dataIndex: "unitName",
      key: "unitName",
      sorter: (a: Unit, b: Unit) => a.unitName.localeCompare(b.shortUnitName),
      sortDirections: ["ascend", "descend"] as SortOrder[],
      render: (text: string) => text,
    },
    {
      title: <div className="text-center w-full">Short Name</div>,
      dataIndex: "shortUnitName",
      key: "shortUnitName",
      align: "center" as const,
      render: (text: string) => text,
    },
    {
      title: <div className="text-center w-full">Products Count</div>,
      dataIndex: "productCount",
      key: "productCount",
      align: "center" as const,
      render: (count: number, record: Unit) => (
        <Badge
          count={count || 0}
          style={{
            backgroundColor: count > 0 ? "#1890ff" : "#d9d9d9",
            cursor: count > 0 ? "pointer" : "default",
          }}
          onClick={() => count > 0 && onProductCountClick(record.id)}
        />
      ),
    },
    {
      title: <div className="text-center w-full">Created At</div>,
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center" as const,
      showDateFilter: true,
      render: (date: string) => dayjs(date).format("YYYY/MM/DD"),
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
      title: <div className="text-center w-full">Actions</div>,
      key: "actions",
      align: "center" as const,
      render: (_: React.ReactNode, record: Unit) => (
        <Space>
          <div
            className="flex items-center justify-center w-7 h-7 bg-white shadow-sm rounded-md cursor-pointer"
            onClick={() => onView(record)}
          >
            <Tooltip title="View">
              <EyeOutlined style={{ color: "#52c41a" }} />
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
            onClick={() => onDelete(record)} // Added for Delete action
            style={{ opacity: (record.productCount ?? 0) > 0 ? 0.5 : 1 }}
          >
            <Tooltip
              title={
                (record.productCount ?? 0) > 0
                  ? "Cannot delete unit with associated products"
                  : "Delete"
              }
            >
              <DeleteOutlined style={{ color: "red" }} />
            </Tooltip>
          </div>
        </Space>
      ),
    },
  ];

  return (
    <CommonTable<Unit>
      columns={columns}
      dataSource={units}
      loading={loading}
      pagination={pagination}
      onPageChange={onPageChange}
      selectedDate={selectedDate}
      onDateFilterChange={handleDateChange}
    />
  );
};

export default UnitsTable;
