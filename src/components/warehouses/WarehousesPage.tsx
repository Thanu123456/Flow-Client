import React, { useState, useEffect } from "react";
import { message, Space } from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useDebounce } from "../../hooks/ui/useDebounce";
import { useWarehouseStore } from "../../store/management/warehouseStore";
import type { WarehousePaginationParams, WarehouseStatusFilter, WarehouseType } from "../../types/entities/warehouse.types";
import { WAREHOUSE_TYPE_OPTIONS } from "../../utils/warehouse";
import ImportWarehousesModal from "./ImportWarehousesModal";
import WarehousesTable from "./WarehousesTable";
import AddWarehouseModal from "./AddWarehouseModal";
import EditWarehouseModal from "./EditWarehouseModal";
import { warehouseService } from "../../services/management/warehouseService";
import { PageLayout } from "../common/PageLayout";
import { CommonButton } from "../common/Button";
import type { Warehouse } from "../../types/entities/warehouse.types";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  const handleCollapsedChange = (newCollapsed: boolean) => {
    setCollapsed(newCollapsed);
    onHeaderCollapseChange?.(newCollapsed);
  };
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<WarehouseStatusFilter | undefined>(undefined);
  const [typeFilter, setTypeFilter] = useState<WarehouseType | undefined>(undefined);
  const [importVisible, setImportVisible] = useState(false);
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
      warehouseType: typeFilter,
    };
    setPaginationParams(params);
    getWarehouses(params);
  }, [debouncedSearchTerm, statusFilter, typeFilter, getWarehouses]);

  const handlePageChange = (page: number, pageSize: number) => {
    const params = { ...paginationParams, page, limit: pageSize };
    setPaginationParams(params);
    getWarehouses(params);
  };

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = async () => {
    setSearchTerm("");
    setStatusFilter(undefined);
    setTypeFilter(undefined);
    const params = { ...paginationParams, page: 1, search: "", status: undefined, warehouseType: undefined };
    setPaginationParams(params);
    setRefreshing(true);
    try {
      await getWarehouses(params);
    } catch {
      // error state handled in store
    } finally {
      setRefreshing(false);
    }
  };
  const handleAddWarehouse = () => setAddModalVisible(true);
  const handleEditWarehouse = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setEditModalVisible(true);
  };

  const handleAddSuccess = () => getWarehouses(paginationParams);
  const handleEditSuccess = () => getWarehouses(paginationParams);
  const handleProductCountClick = (warehouseId: string) => {
    navigate(`/products?warehouseId=${warehouseId}`);
  };

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
              { label: "Inactive", value: "inactive" },
              { label: "Deleted (restorable)", value: "deleted" },
            ],
          },
          {
            placeholder: "Filter By Type",
            value: typeFilter,
            onChange: setTypeFilter,
            options: WAREHOUSE_TYPE_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
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
              icon={<UploadOutlined />}
              onClick={() => setImportVisible(true)}
              tooltip="Import from Excel / CSV"
            >
              Import
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
              loading={refreshing}
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
          onView={(warehouse) => navigate(`/warehouses/${warehouse.id}`)}
          onProductCountClick={handleProductCountClick}
          refreshData={handleRefresh}
        />
      </PageLayout>

      <AddWarehouseModal
        visible={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        onSuccess={handleAddSuccess}
      />
      <ImportWarehousesModal
        visible={importVisible}
        onCancel={() => setImportVisible(false)}
        onDone={() => getWarehouses(paginationParams)}
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
