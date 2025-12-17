// src/components/Brands/BrandsPage.tsx (Refactored)
import React, { useState, useEffect } from "react";
import { message, Space } from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
} from "@ant-design/icons";
import { useDebounce } from "../../hooks/ui/useDebounce";
import { useBrandStore } from "../../store/management/brandStore";
import type { BrandPaginationParams } from "../../types/entities/brand.types";
import BrandsTable from "./BrandsTable";
import AddBrandModal from "./AddBrandModal";
import EditBrandModal from "./EditBrandModal";
import { brandService } from "../../services/management/brandService";
import { PageLayout } from "../common/PageLayout";
import { CommonButton } from "../common/Button";

interface BrandsPageProps {
  onHeaderCollapseChange?: (collapsed: boolean) => void;
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
}

const BrandsPage: React.FC<BrandsPageProps> = ({
  onHeaderCollapseChange,
  sidebarOpen = false,
  setSidebarOpen,
}) => {
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<any>(null);
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
    useState<BrandPaginationParams>({
      page: 1,
      limit: 10,
      search: "",
      status: undefined,
    });

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { brands, loading, pagination, getBrands } = useBrandStore();

  useEffect(() => {
    const params = {
      ...paginationParams,
      search: debouncedSearchTerm,
      status: statusFilter,
    };
    setPaginationParams(params);
    getBrands(params);
  }, [debouncedSearchTerm, statusFilter, getBrands]);

  const handlePageChange = (page: number, pageSize: number) => {
    const params = { ...paginationParams, page, limit: pageSize };
    setPaginationParams(params);
    getBrands(params);
  };

  const handleRefresh = () => getBrands(paginationParams);
  const handleAddBrand = () => setAddModalVisible(true);
  const handleEditBrand = (brand: any) => {
    setSelectedBrand(brand);
    setEditModalVisible(true);
  };

  const handleAddSuccess = () => getBrands(paginationParams);
  const handleEditSuccess = () => getBrands(paginationParams);

  const handleExportPDF = async () => {
    try {
      const blob = await brandService.exportToPDF(paginationParams);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Brands.pdf");
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
      const blob = await brandService.exportToExcel(paginationParams);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Brands.xlsx");
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
        title="Manage Brands"
        collapsed={collapsed}
        onCollapsedChange={handleCollapsedChange}
        searchConfig={{
          placeholder: "Search By Brand Name",
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
              onClick={handleAddBrand}
            >
              Add Brand
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
        <BrandsTable
          brands={brands}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onEdit={handleEditBrand}
          onView={(brand) => console.log("View brand:", brand)}
          refreshData={handleRefresh}
        />
      </PageLayout>

      <AddBrandModal
        visible={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        onSuccess={handleAddSuccess}
      />
      <EditBrandModal
        visible={editModalVisible}
        brand={selectedBrand}
        onCancel={() => setEditModalVisible(false)}
        onSuccess={handleEditSuccess}
      />
    </>
  );
};

export default BrandsPage;
