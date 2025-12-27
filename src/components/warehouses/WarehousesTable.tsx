import React, { useState } from "react";
import { Button, Space, Tag, Tooltip, message } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import type { SortOrder } from "antd/es/table/interface";
import type { Warehouse } from "../../types/entities/warehouse.types";
import dayjs from "dayjs";
import ViewWarehouseModal from "./ViewWarehouseModal";
import DeleteWarehouseModal from "./DeleteWarehouseModal";
import WarehouseStockList from "./WarehouseStockList";
import { CommonTable } from "../common/Table";
import type { TableColumn } from "../common/Table/Table.types";

interface WarehousesTableProps {
  warehouses: Warehouse[];
  loading: boolean;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  onPageChange: (page: number, pageSize: number) => void;
  onEdit: (warehouse: Warehouse) => void;
  refreshData: () => void;
}

const WarehousesTable: React.FC<WarehousesTableProps> = ({
  warehouses,
  loading,
  pagination,
  onPageChange,
  onEdit,
  refreshData,
}) => {
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);

  // Modal states
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [warehouseToDelete, setWarehouseToDelete] = useState<Warehouse | null>(
    null
  );

  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [warehouseToView, setWarehouseToView] = useState<Warehouse | null>(
    null
  );

  const [stockListVisible, setStockListVisible] = useState(false);
  const [warehouseForStock, setWarehouseForStock] = useState<Warehouse | null>(
    null
  );

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    setSelectedDate(date);
  };

  const showDeleteModal = (warehouse: Warehouse) => {
    setWarehouseToDelete(warehouse);
    setDeleteModalVisible(true);
  };

  const showViewModal = (warehouse: Warehouse) => {
    setWarehouseToView(warehouse);
    setViewModalVisible(true);
  };

  const showStockList = (warehouse: Warehouse) => {
    setWarehouseForStock(warehouse);
    setStockListVisible(true);
  };

  const handleViewStock = (warehouseId: string) => {
    const warehouse = warehouses.find((w) => w.id === warehouseId);
    if (warehouse) {
      setViewModalVisible(false);
      showStockList(warehouse);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "main":
        return "blue";
      case "branch":
        return "green";
      case "distribution":
        return "orange";
      default:
        return "default";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "main":
        return "Main";
      case "branch":
        return "Branch";
      case "distribution":
        return "Distribution";
      default:
        return type;
    }
  };

  const columns: TableColumn<Warehouse>[] = [
    {
      title: (
        <div className="text-center w-full text-base font-medium">
          Warehouse Name
        </div>
      ),
      dataIndex: "name",
      key: "name",
      sorter: (a: Warehouse, b: Warehouse) => a.name.localeCompare(b.name),
      sortDirections: ["ascend", "descend"] as SortOrder[],
      render: (text: string, record: Warehouse) => (
        <Button type="link" onClick={() => showViewModal(record)}>
          {text}
        </Button>
      ),
    },
    {
      title: (
        <div className="text-center w-full text-base font-medium">Code</div>
      ),
      dataIndex: "code",
      key: "code",
      width: 120,
      align: "center" as const,
      sorter: (a: Warehouse, b: Warehouse) => a.code.localeCompare(b.code),
      sortDirections: ["ascend", "descend"] as SortOrder[],
      render: (text: string) => (
        <span className="font-semibold text-blue-600">{text}</span>
      ),
    },
    {
      title: (
        <div className="text-center w-full text-base font-medium">Type</div>
      ),
      dataIndex: "type",
      key: "type",
      width: 140,
      align: "center" as const,
      filters: [
        { text: "Main", value: "main" },
        { text: "Branch", value: "branch" },
        { text: "Distribution", value: "distribution" },
      ],
      onFilter: (value, record) => record.type === value,
      render: (type: string) => (
        <Tag color={getTypeColor(type)}>{getTypeLabel(type)}</Tag>
      ),
    },
    {
      title: (
        <div className="text-center w-full text-base font-medium">Location</div>
      ),
      key: "location",
      align: "center" as const,
      render: (_: any, record: Warehouse) => (
        <span>
          {record.city}, {record.state}
        </span>
      ),
    },
    {
      title: (
        <div className="text-center w-full text-base font-medium">Capacity</div>
      ),
      dataIndex: "capacity",
      key: "capacity",
      width: 120,
      align: "right" as const,
      sorter: (a: Warehouse, b: Warehouse) =>
        (a.capacity || 0) - (b.capacity || 0),
      sortDirections: ["ascend", "descend"] as SortOrder[],
      render: (capacity: number) =>
        capacity ? `${capacity.toLocaleString()}` : "N/A",
    },
    {
      title: (
        <div className="text-center w-full text-base font-medium">
          Current Stock
        </div>
      ),
      dataIndex: "currentStock",
      key: "currentStock",
      width: 130,
      align: "right" as const,
      sorter: (a: Warehouse, b: Warehouse) =>
        (a.currentStock || 0) - (b.currentStock || 0),
      sortDirections: ["ascend", "descend"] as SortOrder[],
      render: (stock: number, record: Warehouse) => (
        <Tooltip title="Click to view stock details">
          <Button
            type="link"
            onClick={() => showStockList(record)}
            style={{ padding: 0, fontWeight: 600 }}
          >
            {stock ? stock.toLocaleString() : "0"}
          </Button>
        </Tooltip>
      ),
    },
    {
      title: (
        <div className="text-center w-full text-base font-medium">Status</div>
      ),
      dataIndex: "status",
      key: "status",
      width: 100,
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
      width: 130,
      align: "center" as const,
      showDateFilter: true,
      sorter: (a: Warehouse, b: Warehouse) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      sortDirections: ["ascend", "descend"] as SortOrder[],
      render: (date: string) => dayjs(date).format("DD MMM YYYY"),
    },
    {
      title: (
        <div className="text-center w-full text-base font-medium">Actions</div>
      ),
      key: "actions",
      width: 120,
      align: "center" as const,
      fixed: "right" as const,
      render: (_: React.ReactNode, record: Warehouse) => (
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
      <CommonTable<Warehouse>
        columns={columns}
        dataSource={warehouses}
        loading={loading}
        pagination={pagination}
        onPageChange={onPageChange}
        selectedDate={selectedDate}
        onDateFilterChange={handleDateChange}
        scroll={{ x: 1400 }}
      />

      {/* Delete Modal */}
      <DeleteWarehouseModal
        visible={deleteModalVisible}
        warehouse={warehouseToDelete}
        onCancel={() => setDeleteModalVisible(false)}
        onSuccess={refreshData}
      />

      {/* View Modal */}
      <ViewWarehouseModal
        visible={viewModalVisible}
        warehouse={warehouseToView}
        onCancel={() => setViewModalVisible(false)}
        onViewStock={handleViewStock}
      />

      {/* Stock List Modal */}
      <WarehouseStockList
        visible={stockListVisible}
        warehouseId={warehouseForStock?.id || null}
        warehouseName={warehouseForStock?.name}
        onCancel={() => setStockListVisible(false)}
      />
    </>
  );
};

export default WarehousesTable;
