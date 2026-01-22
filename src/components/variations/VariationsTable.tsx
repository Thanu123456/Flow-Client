import React, { useState } from "react";
import { Button, Space, Tag, Tooltip, Badge } from "antd";
import { EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import type { SortOrder } from "antd/es/table/interface";
import type { Variation } from "../../types/entities/variation.types";
import dayjs from "dayjs";
import ViewVariationModal from "./ViewVariationModal";
import DeleteVariationModal from "./DeleteVariationModal";
import { CommonTable } from "../common/Table";
import type { TableColumn } from "../common/Table/Table.types";

interface VariationsTableProps {
  variations: Variation[];
  loading: boolean;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  onPageChange: (page: number, pageSize: number) => void;
  onEdit: (variation: Variation) => void;
  refreshData: () => void;
}

const VariationsTable: React.FC<VariationsTableProps> = ({
  variations,
  loading,
  pagination,
  onPageChange,
  onEdit,
  refreshData,
}) => {
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);

  // Modal states
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [variationToDelete, setVariationToDelete] = useState<Variation | null>(
    null
  );

  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [variationToView, setVariationToView] = useState<Variation | null>(
    null
  );

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    setSelectedDate(date);
  };

  const showDeleteModal = (variation: Variation) => {
    setVariationToDelete(variation);
    setDeleteModalVisible(true);
  };

  const showViewModal = (variation: Variation) => {
    setVariationToView(variation);
    setViewModalVisible(true);
  };

  const columns: TableColumn<Variation>[] = [
    {
      title: <div className="text-center w-full">Variation Name</div>,
      dataIndex: "name",
      key: "name",
      sorter: (a: Variation, b: Variation) => a.name.localeCompare(b.name),
      sortDirections: ["ascend", "descend"] as SortOrder[],
      render: (text: string, record: Variation) => (
        <Button type="link" onClick={() => showViewModal(record)}>
          {text}
        </Button>
      ),
    },
    {
      title: <div className="text-center w-full">Values</div>,
      key: "values",
      render: (_: any, record: Variation) => (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {record.values.slice(0, 3).map((value) => (
            <Tag key={value.id} color="geekblue">
              {value.value}
            </Tag>
          ))}
          {record.values.length > 3 && (
            <Tooltip
              title={record.values
                .slice(3)
                .map((v) => v.value)
                .join(", ")}
            >
              <Tag color="blue">+{record.values.length - 3} more</Tag>
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      title: <div className="text-center w-full">Values Count</div>,
      key: "valuesCount",
      align: "center" as const,
      sorter: (a: Variation, b: Variation) => a.values.length - b.values.length,
      sortDirections: ["ascend", "descend"] as SortOrder[],
      render: (_: any, record: Variation) => (
        <Badge
          count={record.values.length}
          showZero
          style={{ backgroundColor: "#52c41a" }}
        />
      ),
    },
    {
      title: <div className="text-center w-full">Status</div>,
      dataIndex: "status",
      key: "status",
      width: 120,
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
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      align: "center" as const,
      showDateFilter: true,
      sorter: (a: Variation, b: Variation) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      sortDirections: ["ascend", "descend"] as SortOrder[],
      render: (date: string) => dayjs(date).format("DD MMM YYYY"),
    },
    {
      title: <div className="text-center w-full">Actions</div>,
      key: "actions",
      width: 120,
      align: "center" as const,
      render: (_: React.ReactNode, record: Variation) => (
        <Space>
          <div
            className="flex items-center justify-center w-7 h-7 bg-white shadow-sm rounded-md cursor-pointer hover:bg-gray-50"
            onClick={() => showViewModal(record)}
          >
            <Tooltip title="View">
              <EyeOutlined />
            </Tooltip>
          </div>

          <div
            className="flex items-center justify-center w-7 h-7 bg-white shadow-sm rounded-md cursor-pointer hover:bg-blue-50"
            onClick={() => onEdit(record)}
          >
            <Tooltip title="Edit">
              <EditOutlined style={{ color: "#1890ff" }} />
            </Tooltip>
          </div>

          <div
            className="flex items-center justify-center w-7 h-7 bg-white shadow-sm rounded-md cursor-pointer hover:bg-red-50"
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
      <CommonTable<Variation>
        columns={columns}
        dataSource={variations}
        loading={loading}
        pagination={pagination}
        onPageChange={onPageChange}
        selectedDate={selectedDate}
        onDateFilterChange={handleDateChange}
      />

      {/* Delete Modal */}
      <DeleteVariationModal
        visible={deleteModalVisible}
        variation={variationToDelete}
        onCancel={() => setDeleteModalVisible(false)}
        onSuccess={refreshData}
      />

      {/* View Modal */}
      <ViewVariationModal
        visible={viewModalVisible}
        variation={variationToView}
        onCancel={() => setViewModalVisible(false)}
      />
    </>
  );
};

export default VariationsTable;
