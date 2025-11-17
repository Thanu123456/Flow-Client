import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Input,
  Select,
  Space,
  message,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  UpOutlined,
  DownOutlined,
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

const { Search } = Input;
const { Option } = Select;

const BrandsPage: React.FC = () => {
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<any>(null);
  const [collapsed, setCollapsed] = useState(false);
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

  const debouncedSearchTerm = useDebounce(searchTerm, 5);
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
  const handleViewBrand = (brand: any) => console.log("View brand:", brand);

  const handleAddSuccess = () => getBrands(paginationParams);
  const handleEditSuccess = () => getBrands(paginationParams);

  const handleExportPDF = async () => {
    try {
      const blob = await brandService.exportToPDF(paginationParams);

      /**
       * Converts the binary PDF data into a temporary local URL (like blob:http://localhost:3000/abcd1234).
       * This lets the browser treat it like a downloadable file.
       */

      const url = window.URL.createObjectURL(blob);

      /**
       * Dynamically creates a hidden <a> tag.
       * Sets the href to the blob URL.
       * Adds the download attribute → tells browser to save file instead of opening it.
       */

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Brands.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();

      /**
       * Appends the <a> element to the DOM.
       * Simulates a user click to start the download.
       * Removes the <a> element afterward (cleanup).
       */

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
    <div className="brands-page">
      <Card
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Manage your Brands</span>
          </div>
        }
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddBrand}
            >
              Add Brand
            </Button>
            <Tooltip title="Download PDF">
              <Button
                icon={<FilePdfOutlined style={{ color: "#FF0000" }} />}
                onClick={handleExportPDF}
              >
                PDF
              </Button>
            </Tooltip>
            <Tooltip title="Download Excel">
              <Button
                icon={<FileExcelOutlined style={{ color: "#107C41" }} />}
                onClick={handleExportExcel}
              >
                Excel
              </Button>
            </Tooltip>
            <Button
              icon={<ReloadOutlined style={{ color: "blue" }} />}
              onClick={handleRefresh}
            >
              Refresh
            </Button>
            <Button
              icon={collapsed ? <DownOutlined /> : <UpOutlined />}
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? "Expand" : "Collapse"}
            </Button>
          </Space>
        }
      >
        {!collapsed && (
          <Row gutter={[16, 16]} justify="end" style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12} md={8}>
              <Search
                placeholder="Search by brand name"
                allowClear
                enterButton
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Col>

            <Col xs={24} sm={12} md={4}>
              <Select
                placeholder="Filter by status"
                allowClear
                style={{ width: "100%" }}
                value={statusFilter}
                onChange={(value) =>
                  setStatusFilter(value as "active" | "inactive" | undefined)
                }
              >
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
              </Select>
            </Col>
          </Row>
        )}
        <BrandsTable
          brands={brands}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onEdit={handleEditBrand}
          onView={handleViewBrand}
          refreshData={handleRefresh}
        />
      </Card>

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
    </div>
  );
};

export default BrandsPage;
