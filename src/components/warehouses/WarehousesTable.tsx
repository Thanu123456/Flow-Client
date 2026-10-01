import React, { useState } from "react";
import { Space, Tooltip, Badge, Tag } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  StarFilled,
  StarOutlined,
  UndoOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { Modal, App } from "antd";
import { useTableSelection } from "../../hooks/useTableSelection";
import type { Warehouse } from "../../types/entities/warehouse.types";
import { useWarehouseStore } from "../../store/management/warehouseStore";
import { warehouseService } from "../../services/management/warehouseService";
import { apiErrorMessage } from "../../utils/apiError";
import { isSellableWarehouseType, warehouseTypeColor, warehouseTypeLabel } from "../../utils/warehouse";
import { CommonTable } from "../common/Table";
import type { TableColumn } from "../common/Table/Table.types";
import { formatStockByUnit } from "./stockFormat";
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
  /** Opens the warehouse detail page. */
  onView: (warehouse: Warehouse) => void;
  onProductCountClick: (warehouseId: string) => void;
  refreshData: () => void;
}

const iconBtn =
  "flex items-center justify-center w-7 h-7 bg-white shadow-sm rounded-md cursor-pointer hover:bg-blue-50";

const WarehousesTable: React.FC<WarehousesTableProps> = ({
  warehouses,
  loading,
  pagination,
  onPageChange,
  onEdit,
  onView,
  onProductCountClick,
  refreshData,
}) => {
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const { selectedRowKeys, rowSelection, clearSelection } = useTableSelection<Warehouse>();
  const { deleteWarehouse } = useWarehouseStore();
  const { message } = App.useApp();

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
    } catch (e) {
      message.error(apiErrorMessage(e, "Failed to delete warehouse"));
    }
  };

  const handleRestore = async (warehouse: Warehouse) => {
    try {
      await warehouseService.restoreWarehouse(warehouse.id);
      message.success(`"${warehouse.name}" restored`);
      refreshData();
    } catch (e) {
      message.error(apiErrorMessage(e, "Failed to restore warehouse"));
    }
  };

  const handleSetDefault = async (warehouse: Warehouse) => {
    try {
      await warehouseService.setDefaultWarehouse(warehouse.id);
      message.success(`"${warehouse.name}" is now the default warehouse`);
      refreshData();
    } catch (e) {
      message.error(apiErrorMessage(e, "Failed to set the default warehouse"));
    }
  };

  const handleBulkDelete = () => {
    Modal.confirm({
      title: "Delete Multiple Warehouses",
      icon: <WarningOutlined style={{ color: "red" }} />,
      content: `Are you sure you want to delete ${selectedRowKeys.length} selected warehouses? They can be restored later from the "Deleted" filter.`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        const ids = selectedRowKeys.map(String);
        const results = await Promise.allSettled(
          ids.map((id) => warehouseService.deleteWarehouse(id))
        );
        const failed = results.filter((r): r is PromiseRejectedResult => r.status === "rejected");
        const deleted = ids.length - failed.length;
        if (deleted > 0) message.success(`Deleted ${deleted} warehouse(s)`);
        if (failed.length > 0) {
          const reason = apiErrorMessage(failed[0].reason, "");
          message.error(`${failed.length} could not be deleted${reason ? `: ${reason}` : ""}`);
        }
        clearSelection();
        refreshData();
      },
    });
  };

  const columns: TableColumn<Warehouse>[] = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      render: (code: string | undefined) => <span className="font-mono text-xs">{code || "-"}</span>,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: Warehouse) => (
        <Space size={6} wrap>
          <a onClick={() => !record.deletedAt && onView(record)} className={record.deletedAt ? "text-gray-400 cursor-default" : ""}>
            {name}
          </a>
          {record.isDefault && (
            <Tooltip title="Default warehouse">
              <Tag color="gold" icon={<StarFilled />} style={{ marginInlineEnd: 0 }}>Default</Tag>
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: "Type",
      dataIndex: "warehouseType",
      key: "warehouseType",
      render: (t: string) => <Tag color={warehouseTypeColor(t)}>{warehouseTypeLabel(t)}</Tag>,
    },
    {
      title: "Manager",
      dataIndex: "managerName",
      key: "managerName",
      render: (n: string | undefined) => n || "-",
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
      dataIndex: "stockByUnit",
      key: "stockByUnit",
      align: "center" as const,
      render: (stock: Warehouse["stockByUnit"]) => formatStockByUnit(stock),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center" as const,
      render: (status: string, record: Warehouse) =>
        record.deletedAt ? (
          <span className="px-3 py-1 rounded-lg text-sm border border-gray-400 text-gray-500 bg-gray-50">Deleted</span>
        ) : (
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
      render: (_: React.ReactNode, record: Warehouse) =>
        record.deletedAt ? (
          <Tooltip title="Restore">
            <div className={iconBtn} onClick={() => handleRestore(record)}>
              <UndoOutlined style={{ color: "#52c41a" }} />
            </div>
          </Tooltip>
        ) : (
          <Space size="middle">
            <Tooltip title="Details: stock, movements, transfers, bins">
              <div className={iconBtn} onClick={() => onView(record)}>
                <EyeOutlined style={{ color: "black" }} />
              </div>
            </Tooltip>
            <Tooltip title="Edit">
              <div className={iconBtn} onClick={() => onEdit(record)}>
                <EditOutlined style={{ color: "#1890ff" }} />
              </div>
            </Tooltip>
            {!record.isDefault && record.status === "active" && isSellableWarehouseType(record.warehouseType) && (
              <Tooltip title="Make default warehouse">
                <div className={iconBtn} onClick={() => handleSetDefault(record)}>
                  <StarOutlined style={{ color: "#faad14" }} />
                </div>
              </Tooltip>
            )}
            <Tooltip title={record.isDefault ? "Make another warehouse the default first" : "Delete"}>
              <div
                className={`${iconBtn} ${record.isDefault ? "opacity-40 cursor-not-allowed" : ""}`}
                onClick={() => !record.isDefault && handleDeleteClick(record)}
              >
                <DeleteOutlined style={{ color: "red" }} />
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
