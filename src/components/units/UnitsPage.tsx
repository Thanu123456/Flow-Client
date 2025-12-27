// src/components/Units/UnitsPage.tsx
import React, { useState, useEffect } from "react";
import { message, Space } from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
} from "@ant-design/icons";
import { useDebounce } from "../../hooks/ui/useDebounce";
import { useUnitStore } from "../../store/management/unitStore";
import type {
  UnitPaginationParams,
  Unit,
} from "../../types/entities/unit.types";
import UnitsTable from "./UnitsTable";
import AddUnitModal from "./AddUnitModal";
import EditUnitModal from "./EditUnitModal";
import ViewUnitModal from "./ViewUnitModal"; // Import View Modal
import DeleteUnitModal from "./DeleteUnitModal"; // Import Delete Modal
import { unitService } from "../../services/management/unitService";
import { PageLayout } from "../common/PageLayout";
import { CommonButton } from "../common/Button";
import { useNavigate } from "react-router-dom";

interface UnitsPageProps {
  onHeaderCollapseChange?: (collapsed: boolean) => void;
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
}

const UnitsPage: React.FC<UnitsPageProps> = ({
  onHeaderCollapseChange,
  sidebarOpen: _sidebarOpen = false,
  setSidebarOpen: _setSidebarOpen,
}) => {
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false); // State for view modal
  const [deleteModalVisible, setDeleteModalVisible] = useState(false); // State for delete modal
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleCollapsedChange = (newCollapsed: boolean) => {
    setCollapsed(newCollapsed);
    onHeaderCollapseChange?.(newCollapsed);
  };
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "active" | "inactive" | undefined
  >(undefined);
  const [paginationParams, setPaginationParams] =
    useState<UnitPaginationParams>({
      page: 1,
      limit: 10,
      search: "",
      status: undefined,
    });

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { units, loading, pagination, getUnits } = useUnitStore();

  useEffect(() => {
    const params = {
      ...paginationParams,
      search: debouncedSearchTerm,
      status: statusFilter,
    };
    setPaginationParams(params);
    getUnits(params);
  }, [debouncedSearchTerm, statusFilter, getUnits]);

  const handlePageChange = (page: number, pageSize: number) => {
    const params = { ...paginationParams, page, limit: pageSize };
    setPaginationParams(params);
    getUnits(params);
  };

  const handleRefresh = () => getUnits(paginationParams);
  const handleAddUnit = () => setAddModalVisible(true);
  const handleEditUnit = (unit: Unit) => {
    setSelectedUnit(unit);
    setEditModalVisible(true);
  };
  const handleViewUnit = (unit: Unit) => {
    // Handler for view action
    setSelectedUnit(unit);
    setViewModalVisible(true);
  };
  const handleDeleteUnit = (unit: Unit) => {
    // Handler for delete action
    if ((unit.productCount ?? 0) > 0) {
      message.warning("Cannot delete unit with associated products.");
      return;
    }
    setSelectedUnit(unit);
    setDeleteModalVisible(true);
  };

  const handleAddSuccess = () => getUnits(paginationParams);
  const handleEditSuccess = () => getUnits(paginationParams);
  const handleDeleteSuccess = () => getUnits(paginationParams);

  const handleProductCountClick = (unitId: string) => {
    navigate(`/products?unitId=${unitId}`);
  };

  const handleExportPDF = async () => {
    try {
      const blob = await unitService.exportToPDF(paginationParams);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Units.pdf");
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
      const blob = await unitService.exportToExcel(paginationParams);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Units.xlsx");
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
        title="Manage Units"
        collapsed={collapsed}
        onCollapsedChange={handleCollapsedChange}
        searchConfig={{
          placeholder: "Search By Unit Name",
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
              onClick={handleAddUnit}
            >
              Add Unit
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
        <UnitsTable
          units={units}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onEdit={handleEditUnit}
          onView={handleViewUnit} // Pass view handler
          onDelete={handleDeleteUnit} // Pass delete handler
          onProductCountClick={handleProductCountClick}
        />
      </PageLayout>

      <AddUnitModal
        visible={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        onSuccess={handleAddSuccess}
      />
      <EditUnitModal
        visible={editModalVisible}
        unit={selectedUnit}
        onCancel={() => setEditModalVisible(false)}
        onSuccess={handleEditSuccess}
      />
      <ViewUnitModal
        visible={viewModalVisible}
        unit={selectedUnit}
        onCancel={() => setViewModalVisible(false)}
      />
      <DeleteUnitModal
        visible={deleteModalVisible}
        unit={selectedUnit}
        onCancel={() => setDeleteModalVisible(false)}
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
};

export default UnitsPage;
