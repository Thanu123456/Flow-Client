// src/components/brands/BrandsPage.tsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Input, Select, Space, message, Spin } from 'antd';
import { PlusOutlined, ReloadOutlined, MenuFoldOutlined, MenuUnfoldOutlined, FilePdfOutlined, FileExcelOutlined } from '@ant-design/icons';
import { useDebounce } from '../../hooks/ui/useDebounce';
import { useBrandStore } from '../../store/management/brandStore';
import type { BrandPaginationParams } from '../../types/entities/brand.types';
import BrandsTable from './BrandsTable';
import AddBrandModal from './AddBrandModal';
import EditBrandModal from './EditBrandModal';
import { brandService } from '../../services/management/brandService';

const { Search } = Input;
const { Option } = Select;

const BrandsPage: React.FC = () => {
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<any>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | undefined>(undefined);
  const [paginationParams, setPaginationParams] = useState<BrandPaginationParams>({
    page: 1,
    limit: 10,
    search: '',
    status: undefined,
  });
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  const {
    brands,
    loading,
    pagination,
    fetchBrands,
  } = useBrandStore();

  useEffect(() => {
    const params = {
      ...paginationParams,
      search: debouncedSearchTerm,
      status: statusFilter,
    };
    setPaginationParams(params);
    fetchBrands(params);
  }, [debouncedSearchTerm, statusFilter, fetchBrands]);

  const handlePageChange = (page: number, pageSize: number) => {
    const params = {
      ...paginationParams,
      page,
      limit: pageSize,
    };
    setPaginationParams(params);
    fetchBrands(params);
  };

  const handleRefresh = () => {
    fetchBrands(paginationParams);
  };

  const handleAddBrand = () => {
    setAddModalVisible(true);
  };

  const handleEditBrand = (brand: any) => {
    setSelectedBrand(brand);
    setEditModalVisible(true);
  };

  const handleViewBrand = (brand: any) => {
    // Implement view functionality if needed
    console.log('View brand:', brand);
  };

  const handleAddSuccess = () => {
    fetchBrands(paginationParams);
  };

  const handleEditSuccess = () => {
    fetchBrands(paginationParams);
  };

  const handleExportPDF = async () => {
    try {
      const blob = await brandService.exportToPDF(paginationParams);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'brands.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      message.success('PDF exported successfully');
    } catch (error) {
      message.error('Failed to export PDF');
    }
  };

  const handleExportExcel = async () => {
    try {
      const blob = await brandService.exportToExcel(paginationParams);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'brands.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      message.success('Excel exported successfully');
    } catch (error) {
      message.error('Failed to export Excel');
    }
  };

  return (
    <div className="brands-page">
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Manage your brands</span>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
            />
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
            <Button
              icon={<FilePdfOutlined />}
              onClick={handleExportPDF}
            >
              PDF
            </Button>
            <Button
              icon={<FileExcelOutlined />}
              onClick={handleExportExcel}
            >
              Excel
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
            >
              Refresh
            </Button>
          </Space>
        }
      >
        {!collapsed && (
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12} md={8}>
              <Search
                placeholder="Search by brand name"
                allowClear
                enterButton
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select
                  placeholder="Filter by status"
                  allowClear
                  style={{ width: '100%' }}
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value as 'active' | 'inactive' | undefined)}
                >
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                </Select>
            </Col>
          </Row>
        )}
        
        <Spin spinning={loading}>
          <BrandsTable
            brands={brands}
            loading={loading}
            pagination={pagination}
            onPageChange={handlePageChange}
            onEdit={handleEditBrand}
            onView={handleViewBrand}
            refreshData={handleRefresh}
          />
        </Spin>
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