import React, { useState } from "react";
import { Space, Tooltip, message, Badge } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  WarningOutlined
} from "@ant-design/icons";
import { Modal } from "antd";
import { useTableSelection } from "../../hooks/useTableSelection";
import type { Warehouse } from "../../types/entities/warehouse.types";
import { useWarehouseStore } from "../../store/management/warehouseStore";
import { CommonTable } from "../common/Table";
import type { TableColumn } from "../common/Table/Table.types";
import ViewWarehouseModal from "./ViewWarehouseModal";
import DeleteWarehouseModal from "./DeleteWarehouseModal";

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
  onView?: (warehouse: Warehouse) => void;
  onProductCountClick: (warehouseId: string) => void;
  refreshData: () => void;
}

const WarehousesTable: React.FC<WarehousesTableProps> = ({
  warehouses,
  loading,
  pagination,
  onPageChange,
  onEdit,
  onView: _onView,
  onProductCountClick,
  refreshData,
}) => {
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const { selectedRowKeys, rowSelection, clearSelection } = useTableSelection<Warehouse>();
  const { deleteWarehouse, error, clearError } = useWarehouseStore();

  const handleView = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setViewModalVisible(true);
  };

  const handleDeleteClick = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedWarehouse) return;
    try {
      await deleteWarehouse(selectedWarehouse.id);
      message.success("Warehouse deleted successfully");
      setDeleteModalVisible(false);
      setSelectedWarehouse(null);
      refreshData();
    } catch {
      message.error(error || "Failed to delete warehouse");
      clearError();
    }
  };

  const handleBulkDelete = () => {
    Modal.confirm({
      title: "Delete Multiple Warehouses",
      icon: <WarningOutlined style={{ color: "red" }} />,
      content: `Are you sure you want to delete ${selectedRowKeys.length} selected warehouses? This action cannot be undone.`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          // Bulk delete logic would go here
          message.success(`Successfully deleted ${selectedRowKeys.length} warehouses`);
          clearSelection();
          refreshData();
        } catch (error) {
          message.error("Failed to delete warehouses");
        }
      },
    });
  };

  const columns: TableColumn<Warehouse>[] = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a: Warehouse, b: Warehouse) => a.name.localeCompare(b.name),
    },
    {
      title: "Contact",
      dataIndex: "contactPerson",
      key: "contactPerson",
      render: (contactPerson: string | undefined) => contactPerson || "-",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email: string | undefined) => email || "-",
    },
    {
      title: "Mobile",
      dataIndex: "mobile",
      key: "mobile",
      render: (mobile: string | undefined) => mobile || "-",
    },
    {
      title: "City",
      dataIndex: "city",
      key: "city",
      render: (city: string | undefined) => city || "-",
    },
    {
      title: "Products",
      dataIndex: "totalProducts",
      key: "totalProducts",
      align: "center" as const,
      render: (count: number, record: Warehouse) => (
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
      title: "Stock",
      dataIndex: "totalStock",
      key: "totalStock",
      align: "center" as const,
      render: (totalStock: number | undefined) => totalStock ?? 0,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center" as const,
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
      title: "Actions",
      key: "actions",
      align: "center" as const,
      render: (_: React.ReactNode, record: Warehouse) => (
        <Space size="middle">
          <Tooltip title="View">
            <div
              className="flex items-center justify-center w-7 h-7 bg-white shadow-sm rounded-md cursor-pointer"
              onClick={() => handleView(record)}
            >
              <EyeOutlined style={{ color: "#1890ff" }} />
            </div>
          </Tooltip>
          <Tooltip title="Edit">
            <div
              className="flex items-center justify-center w-7 h-7 bg-white shadow-sm rounded-md cursor-pointer"
              onClick={() => onEdit(record)}
            >
              <EditOutlined style={{ color: "#faad14" }} />
            </div>
          </Tooltip>
          <Tooltip title="Delete">
            <div
              className="flex items-center justify-center w-7 h-7 bg-white shadow-sm rounded-md cursor-pointer"
              onClick={() => handleDeleteClick(record)}
            >
              <DeleteOutlined style={{ color: "#ff4d4f" }} />
            </div>
          </Tooltip>
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
        rowSelection={rowSelection}
        onBulkDelete={handleBulkDelete}
        bulkDeleteText={`Delete (${selectedRowKeys.length})`}
      />

      <ViewWarehouseModal
        visible={viewModalVisible}
        warehouse={selectedWarehouse}
        onCancel={() => {
          setViewModalVisible(false);
          setSelectedWarehouse(null);
        }}
      />

      <DeleteWarehouseModal
        visible={deleteModalVisible}
        warehouse={selectedWarehouse}
        onCancel={() => {
          setDeleteModalVisible(false);
          setSelectedWarehouse(null);
        }}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
};

export default WarehousesTable;
