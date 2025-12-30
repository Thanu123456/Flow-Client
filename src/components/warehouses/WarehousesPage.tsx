import React, { useState, useEffect } from "react";
import { message, Space } from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
} from "@ant-design/icons";
import { useDebounce } from "../../hooks/ui/useDebounce";
import { useWarehouseStore } from "../../store/management/warehouseStore";
import type { WarehousePaginationParams } from "../../types/entities/warehouse.types";
import WarehousesTable from "./WarehousesTable";
import AddWarehouseModal from "./AddWarehouseModal";
import EditWarehouseModal from "./EditWarehouseModal";
import { warehouseService } from "../../services/management/warehouseService";
import { PageLayout } from "../common/PageLayout";
import { CommonButton } from "../common/Button";
import type { Warehouse } from "../../types/entities/warehouse.types";

interface WarehousesPageProps {
  onHeaderCollapseChange?: (collapsed: boolean) => void;
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
}

const WarehousesPage: React.FC<WarehousesPageProps> = ({
  onHeaderCollapseChange,
  sidebarOpen: _sidebarOpen = false,
  setSidebarOpen: _setSidebarOpen,
}) => {
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  const handleCollapsedChange = (newCollapsed: boolean) => {
    setCollapsed(newCollapsed);
    onHeaderCollapseChange?.(newCollapsed);
  };
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "active" | "inactive" | undefined
  >(undefined);
  const [paginationParams, setPaginationParams] =
    useState<WarehousePaginationParams>({
      page: 1,
      limit: 10,
      search: "",
      status: undefined,
    });

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { warehouses, loading, pagination, getWarehouses } = useWarehouseStore();

  useEffect(() => {
    const params = {
      ...paginationParams,
      search: debouncedSearchTerm,
      status: statusFilter,
    };
    setPaginationParams(params);
    getWarehouses(params);
  }, [debouncedSearchTerm, statusFilter, getWarehouses]);

  const handlePageChange = (page: number, pageSize: number) => {
    const params = { ...paginationParams, page, limit: pageSize };
    setPaginationParams(params);
    getWarehouses(params);
  };

  const handleRefresh = () => getWarehouses(paginationParams);
  const handleAddWarehouse = () => setAddModalVisible(true);
  const handleEditWarehouse = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setEditModalVisible(true);
  };

  const handleAddSuccess = () => getWarehouses(paginationParams);
  const handleEditSuccess = () => getWarehouses(paginationParams);

  const handleExportPDF = async () => {
    try {
      const blob = await warehouseService.exportToPDF(paginationParams);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Warehouses.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      message.success("PDF exported successfully");
    } catch {
      message.error("Failed to export PDF");
    }
  };

  const handleExportExcel = async () => {
    try {
      const blob = await warehouseService.exportToExcel(paginationParams);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Warehouses.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      message.success("Excel exported successfully");
    } catch {
      message.error("Failed to export Excel");
    }
  };

  return (
    <>
      <PageLayout
        title="Manage Warehouses"
        collapsed={collapsed}
        onCollapsedChange={handleCollapsedChange}
        searchConfig={{
          placeholder: "Search By Warehouse Name",
          value: searchTerm,
          onChange: setSearchTerm,
        }}
        filterConfig={[
          {
            placeholder: "Filter By Status",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: "Active", value: "active" },
              { label: "In-active", value: "inactive" },
            ],
          },
        ]}
        actions={
          <Space>
            <CommonButton
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddWarehouse}
            >
              Add Warehouse
            </CommonButton>
            <CommonButton
              icon={<FilePdfOutlined style={{ color: "#FF0000" }} />}
              onClick={handleExportPDF}
              tooltip="Download PDF"
            >
              PDF
            </CommonButton>
            <CommonButton
              icon={<FileExcelOutlined style={{ color: "#107C41" }} />}
              onClick={handleExportExcel}
              tooltip="Download Excel"
            >
              Excel
            </CommonButton>
            <CommonButton
              icon={<ReloadOutlined style={{ color: "blue" }} />}
              onClick={handleRefresh}
            >
              Refresh
            </CommonButton>
          </Space>
        }
      >
        <WarehousesTable
          warehouses={warehouses}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onEdit={handleEditWarehouse}
          onView={(warehouse) => console.log("View warehouse:", warehouse)}
          refreshData={handleRefresh}
        />
      </PageLayout>

      <AddWarehouseModal
        visible={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        onSuccess={handleAddSuccess}
      />
      <EditWarehouseModal
        visible={editModalVisible}
        warehouse={selectedWarehouse}
        onCancel={() => setEditModalVisible(false)}
        onSuccess={handleEditSuccess}
      />
    </>
  );
};

export default WarehousesPage;
