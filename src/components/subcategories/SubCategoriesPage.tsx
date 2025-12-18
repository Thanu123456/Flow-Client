// src/components/SubCategories/SubCategoriesPage.tsx
import React, { useState, useEffect } from "react";
import { message, Space } from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
} from "@ant-design/icons";
import { useDebounce } from "../../hooks/ui/useDebounce";
import { useSubCategoryStore } from "../../store/management/subCategoryStore";
import { useCategoryStore } from "../../store/management/categoryStore";
import type {
  SubCategoryPaginationParams,
  SubCategory,
} from "../../types/entities/subCategory.types";
import SubCategoriesTable from "./SubCategoriesTable";
import AddSubCategoryModal from "./AddSubCategoryModal";
import EditSubCategoryModal from "./EditSubCategoryModal";
import { subCategoryService } from "../../services/management/subCategoryService";
import { PageLayout } from "../common/PageLayout";
import { CommonButton } from "../common/Button";
import { useSearchParams } from "react-router-dom";

const SubCategoriesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preSelectedCategoryId = searchParams.get("category") || undefined;

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] =
    useState<SubCategory | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "active" | "inactive" | undefined
  >(undefined);
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(
    preSelectedCategoryId
  );
  const [paginationParams, setPaginationParams] =
    useState<SubCategoryPaginationParams>({
      page: 1,
      limit: 10,
      search: "",
      status: undefined,
      categoryId: preSelectedCategoryId,
    });

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { subCategories, loading, pagination, getSubCategories } =
    useSubCategoryStore();
  const { categories, getCategories } = useCategoryStore();

  useEffect(() => {
    // Load categories for filter dropdown
    getCategories({ page: 1, limit: 1000, status: "active" });
  }, [getCategories]);

  useEffect(() => {
    const params = {
      ...paginationParams,
      search: debouncedSearchTerm,
      status: statusFilter,
      categoryId: categoryFilter,
    };
    setPaginationParams(params);
    getSubCategories(params);
  }, [debouncedSearchTerm, statusFilter, categoryFilter, getSubCategories]);

  const handlePageChange = (page: number, pageSize: number) => {
    const params = { ...paginationParams, page, limit: pageSize };
    setPaginationParams(params);
    getSubCategories(params);
  };

  const handleRefresh = () => getSubCategories(paginationParams);

  const handleAddSubCategory = () => setAddModalVisible(true);

  const handleEditSubCategory = (subCategory: SubCategory) => {
    setSelectedSubCategory(subCategory);
    setEditModalVisible(true);
  };

  const handleAddSuccess = () => getSubCategories(paginationParams);
  const handleEditSuccess = () => getSubCategories(paginationParams);

  const handleExportPDF = async () => {
    try {
      const blob = await subCategoryService.exportToPDF(paginationParams);
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
      const blob = await subCategoryService.exportToExcel(paginationParams);
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
        title="Manage Sub-Categories"
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        searchConfig={{
          placeholder: "Search by Sub-Category Name",
          value: searchTerm,
          onChange: setSearchTerm,
        }}
        filterConfig={[
          {
            placeholder: "Filter by Status",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: "Active", value: "active" },
              { label: "In-active", value: "inactive" },
            ],
          },
          {
            placeholder: "Filter by Category",
            value: categoryFilter,
            onChange: setCategoryFilter,
            options: categories.map((cat) => ({
              label: cat.name,
              value: cat.id,
            })),
          },
        ]}
        actions={
          <Space>
            <CommonButton
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddSubCategory}
            >
              Add Sub-Category
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
          subCategories={subCategories}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onEdit={handleEditSubCategory}
          refreshData={handleRefresh}
        />
      </PageLayout>

      <AddSubCategoryModal
        visible={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        onSuccess={handleAddSuccess}
        preSelectedCategoryId={preSelectedCategoryId}
      />

      <EditSubCategoryModal
        visible={editModalVisible}
        subCategory={selectedSubCategory}
        onCancel={() => setEditModalVisible(false)}
        onSuccess={handleEditSuccess}
      />
    </>
  );
};

export default SubCategoriesPage;
