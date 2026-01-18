import React, { useState, useEffect } from "react";
import { message, Space } from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
} from "@ant-design/icons";
import { useDebounce } from "../../hooks/ui/useDebounce";
import { useVariationStore } from "../../store/management/variationStore";
import type {
  VariationPaginationParams,
  Variation,
} from "../../types/entities/variation.types";
import VariationsTable from "./VariationsTable";
import AddVariationModal from "./AddVariationModal";
import EditVariationModal from "./EditVariationModal";
import { variationService } from "../../services/management/variationService";
import { PageLayout } from "../common/PageLayout";
import { CommonButton } from "../common/Button";

const VariationsPage: React.FC = () => {
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState<Variation | null>(
    null
  );
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "active" | "inactive" | undefined
  >(undefined);
  const [paginationParams, setPaginationParams] =
    useState<VariationPaginationParams>({
      page: 1,
      limit: 10,
      search: "",
      status: undefined,
    });

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { variations, loading, pagination, getVariations } =
    useVariationStore();

  useEffect(() => {
    const params = {
      ...paginationParams,
      search: debouncedSearchTerm,
      status:
        statusFilter === "active"
          ? true
          : statusFilter === "inactive"
            ? false
            : undefined,
    };

    setPaginationParams(params);
    getVariations(params);
  }, [debouncedSearchTerm, statusFilter, getVariations]);


  const handlePageChange = (page: number, pageSize: number) => {
    const params = { ...paginationParams, page, limit: pageSize };
    setPaginationParams(params);
    getVariations(params);
  };

  const handleRefresh = () => getVariations(paginationParams);

  const handleAddVariation = () => setAddModalVisible(true);

  const handleEditVariation = (variation: Variation) => {
    setSelectedVariation(variation);
    setEditModalVisible(true);
  };

  const handleAddSuccess = () => getVariations(paginationParams);
  const handleEditSuccess = () => getVariations(paginationParams);

  const handleExportPDF = async () => {
    try {
      const blob = await variationService.exportToPDF(paginationParams);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Variations.pdf");
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
      const blob = await variationService.exportToExcel(paginationParams);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Variations.xlsx");
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
        title="Manage Variations"
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        searchConfig={{
          placeholder: "Search by variation name",
          value: searchTerm,
          onChange: setSearchTerm,
        }}
        filterConfig={[
          {
            placeholder: "Filter by status",
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
              onClick={handleAddVariation}
            >
              Add Variation
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
        <VariationsTable
          variations={variations}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onEdit={handleEditVariation}
          refreshData={handleRefresh}
        />
      </PageLayout>

      <AddVariationModal
        visible={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        onSuccess={handleAddSuccess}
      />

      <EditVariationModal
        visible={editModalVisible}
        variation={selectedVariation}
        onCancel={() => setEditModalVisible(false)}
        onSuccess={handleEditSuccess}
      />
    </>
  );
};

export default VariationsPage;
