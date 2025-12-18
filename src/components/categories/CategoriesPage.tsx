// src/components/Categories/CategoriesPage.tsx
import React, { useState, useEffect } from "react";
import { message, Space } from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
} from "@ant-design/icons";
import { useDebounce } from "../../hooks/ui/useDebounce";
import { useCategoryStore } from "../../store/management/categoryStore";
import type {
  CategoryPaginationParams,
  Category,
} from "../../types/entities/category.types";
import CategoriesTable from "./CategoriesTable";
import AddCategoryModal from "./AddCategoryModal";
import EditCategoryModal from "./EditCategoryModal";
import { categoryService } from "../../services/management/categoryService";
import { PageLayout } from "../common/PageLayout";
import { CommonButton } from "../common/Button";
import { useNavigate } from "react-router-dom";

interface CategoriesPageProps {
  userRole?: string; // 'owner' | 'manager' | 'staff'
}

const CategoriesPage: React.FC<CategoriesPageProps> = ({
  userRole = "owner",
}) => {
  const navigate = useNavigate();
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "active" | "inactive" | undefined
  >(undefined);
  const [paginationParams, setPaginationParams] =
    useState<CategoryPaginationParams>({
      page: 1,
      limit: 10,
      search: "",
      status: undefined,
    });

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { categories, loading, pagination, getCategories } = useCategoryStore();

  useEffect(() => {
    const params = {
      ...paginationParams,
      search: debouncedSearchTerm,
      status: statusFilter,
    };
    setPaginationParams(params);
    getCategories(params);
  }, [debouncedSearchTerm, statusFilter, getCategories]);

  const handlePageChange = (page: number, pageSize: number) => {
    const params = { ...paginationParams, page, limit: pageSize };
    setPaginationParams(params);
    getCategories(params);
  };

  const handleRefresh = () => getCategories(paginationParams);

  const handleAddCategory = () => {
    if (userRole === "staff") {
      message.warning("You don't have permission to add categories");
      return;
    }
    setAddModalVisible(true);
  };

  const handleEditCategory = (category: Category) => {
    if (userRole === "staff") {
      message.warning("You don't have permission to edit categories");
      return;
    }
    setSelectedCategory(category);
    setEditModalVisible(true);
  };

  const handleSubCategoryCountClick = (category: Category) => {
    // Navigate to sub-categories page with category filter
    navigate(`/sub-categories?category=${category.id}`);
  };

  const handleAddSuccess = () => getCategories(paginationParams);
  const handleEditSuccess = () => getCategories(paginationParams);

  const handleExportPDF = async () => {
    try {
      const blob = await categoryService.exportToPDF(paginationParams);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Categories.pdf");
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
      const blob = await categoryService.exportToExcel(paginationParams);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Categories.xlsx");
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
        title="Manage Categories"
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        searchConfig={{
          placeholder: "Search by Category Name or Code",
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
        ]}
        actions={
          <Space>
            <CommonButton
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddCategory}
              disabled={userRole === "staff"}
              tooltip={
                userRole === "staff"
                  ? "You don't have permission to add categories"
                  : "Add new category"
              }
            >
              Add Category
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
        <CategoriesTable
          categories={categories}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onEdit={handleEditCategory}
          onSubCategoryCountClick={handleSubCategoryCountClick}
          refreshData={handleRefresh}
          userRole={userRole}
        />
      </PageLayout>

      <AddCategoryModal
        visible={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        onSuccess={handleAddSuccess}
      />

      <EditCategoryModal
        visible={editModalVisible}
        category={selectedCategory}
        onCancel={() => setEditModalVisible(false)}
        onSuccess={handleEditSuccess}
      />
    </>
  );
};

export default CategoriesPage;
