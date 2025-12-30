import React, { useState, useEffect } from "react";
import { message, Space } from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
} from "@ant-design/icons";
import { useDebounce } from "../../hooks/ui/useDebounce";
import { useSubcategoryStore } from "../../store/management/subCategoryStore";
import type { SubcategoryPaginationParams } from "../../types/entities/subcategory.types";
import SubCategoriesTable from "./SubCategoriesTable";
import AddSubCategoryModal from "./AddSubCategoryModal";
import EditSubCategoryModal from "./EditSubCategoryModal";
import { subcategoryService } from "../../services/management/subCategoryService";
import { PageLayout } from "../common/PageLayout";
import { CommonButton } from "../common/Button";
import type { Subcategory } from "../../types/entities/subcategory.types";

interface SubCategoriesPageProps {
  onHeaderCollapseChange?: (collapsed: boolean) => void;
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
}

const SubCategoriesPage: React.FC<SubCategoriesPageProps> = ({
  onHeaderCollapseChange,
  sidebarOpen: _sidebarOpen = false,
  setSidebarOpen: _setSidebarOpen,
}) => {
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
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
    useState<SubcategoryPaginationParams>({
      page: 1,
      limit: 10,
      search: "",
      status: undefined,
    });

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { subcategories, loading, pagination, getSubcategories } = useSubcategoryStore();

  useEffect(() => {
    const params = {
      ...paginationParams,
      search: debouncedSearchTerm,
      status: statusFilter,
    };
    setPaginationParams(params);
    getSubcategories(params);
  }, [debouncedSearchTerm, statusFilter, getSubcategories]);

  const handlePageChange = (page: number, pageSize: number) => {
    const params = { ...paginationParams, page, limit: pageSize };
    setPaginationParams(params);
    getSubcategories(params);
  };

  const handleRefresh = () => getSubcategories(paginationParams);
  const handleAddSubcategory = () => setAddModalVisible(true);
  const handleEditSubcategory = (subcategory: Subcategory) => {
    setSelectedSubcategory(subcategory);
    setEditModalVisible(true);
  };

  const handleAddSuccess = () => getSubcategories(paginationParams);
  const handleEditSuccess = () => getSubcategories(paginationParams);

  const handleExportPDF = async () => {
    try {
      const blob = await subcategoryService.exportToPDF(paginationParams);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "SubCategories.pdf");
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
      const blob = await subcategoryService.exportToExcel(paginationParams);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "SubCategories.xlsx");
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
        title="Manage SubCategories"
        collapsed={collapsed}
        onCollapsedChange={handleCollapsedChange}
        searchConfig={{
          placeholder: "Search By SubCategory Name",
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
              onClick={handleAddSubcategory}
            >
              Add SubCategory
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
        <SubCategoriesTable
          subcategories={subcategories}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onEdit={handleEditSubcategory}
          onView={(subcategory) => console.log("View subcategory:", subcategory)}
          refreshData={handleRefresh}
        />
      </PageLayout>

      <AddSubCategoryModal
        visible={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        onSuccess={handleAddSuccess}
      />
      <EditSubCategoryModal
        visible={editModalVisible}
        subcategory={selectedSubcategory}
        onCancel={() => setEditModalVisible(false)}
        onSuccess={handleEditSuccess}
      />
    </>
  );
};

export default SubCategoriesPage;
