import React, { useState, useEffect, useCallback } from 'react';
import { Card, Input, Button, Space, Select, message, Row, Col } from 'antd';
import { PlusOutlined, ReloadOutlined, FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons';
import { useSupplierStore } from '../../store/management/supplierStore';
import { supplierService } from '../../services/management/supplierService';
import SuppliersTable from './SuppliersTable';
import AddSupplierModal from './AddSupplierModal';
import EditSupplierModal from './EditSupplierModal';
import SupplierDetailsModal from './SupplierDetailsModal';
import type { Supplier } from '../../types/entities/supplier.types';
import { useDebounce } from '../../hooks/ui/useDebounce';

const { Search } = Input;

const SuppliersPage: React.FC = () => {
  const { suppliers, loading, pagination, getSuppliers, deleteSupplier } = useSupplierStore();

  // Modal states
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  // Selection states
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  // Filter states
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const debouncedSearch = useDebounce(searchText, 300);

  const fetchSuppliers = useCallback(async (page = 1, limit = 10) => {
    await getSuppliers({
      page,
      limit,
      search: debouncedSearch || undefined,
      includeInactive: statusFilter === 'all' ? true : statusFilter === 'inactive',
    });
  }, [getSuppliers, debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchSuppliers(1, pagination.limit);
  }, [debouncedSearch, statusFilter]);

  const handlePageChange = (page: number, pageSize: number) => {
    fetchSuppliers(page, pageSize);
  };

  const handleRefresh = () => {
    setSearchText('');
    setStatusFilter('all');
    setSelectedRowKeys([]);
    fetchSuppliers(1, pagination.limit);
  };

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setEditModalVisible(true);
  };

  const handleView = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setViewModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSupplier(id);
      message.success('Supplier deleted successfully');
      fetchSuppliers(pagination.page, pagination.limit);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to delete supplier');
    }
  };

  const handleAddSuccess = () => {
    setAddModalVisible(false);
    fetchSuppliers(1, pagination.limit);
  };

  const handleEditSuccess = () => {
    setEditModalVisible(false);
    setSelectedSupplier(null);
    fetchSuppliers(pagination.page, pagination.limit);
  };

  const handleExportPDF = async () => {
    try {
      const blob = await supplierService.exportToPDF({
        page: 1,
        limit: 1000,
        search: searchText || undefined,
        includeInactive: statusFilter === 'all' ? true : statusFilter === 'inactive',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'suppliers.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      message.error('Failed to export PDF');
    }
  };

  const handleExportExcel = async () => {
    try {
      const blob = await supplierService.exportToExcel({
        page: 1,
        limit: 1000,
        search: searchText || undefined,
        includeInactive: statusFilter === 'all' ? true : statusFilter === 'inactive',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'suppliers.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      message.error('Failed to export Excel');
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Search
              placeholder="Search suppliers..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Select
              style={{ width: '100%' }}
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
            />
          </Col>
          <Col xs={24} sm={24} md={24} lg={14} style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Space wrap>
              <Button icon={<FilePdfOutlined />} onClick={handleExportPDF}>
                PDF
              </Button>
              <Button icon={<FileExcelOutlined />} onClick={handleExportExcel}>
                Excel
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
                Refresh
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModalVisible(true)}>
                Add Supplier
              </Button>
            </Space>
          </Col>
        </Row>

        <SuppliersTable
          data={suppliers}
          loading={loading}
          selectedRowKeys={selectedRowKeys}
          onSelectChange={setSelectedRowKeys}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            onChange: handlePageChange,
          }}
        />
      </Card>

      <AddSupplierModal
        visible={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        onSuccess={handleAddSuccess}
      />

      <EditSupplierModal
        visible={editModalVisible}
        supplier={selectedSupplier}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedSupplier(null);
        }}
        onSuccess={handleEditSuccess}
      />

      <SupplierDetailsModal
        visible={viewModalVisible}
        supplier={selectedSupplier}
        onClose={() => {
          setViewModalVisible(false);
          setSelectedSupplier(null);
        }}
      />
    </div>
  );
};

export default SuppliersPage;
