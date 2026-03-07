import React, { useState, useEffect, useCallback } from 'react';
import { message, Space } from 'antd';
import { PlusOutlined, ReloadOutlined, FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons';
import { useSupplierStore } from '../../store/management/supplierStore';
import { supplierService } from '../../services/management/supplierService';
import SuppliersTable from './SuppliersTable';
import AddSupplierModal from './AddSupplierModal';
import EditSupplierModal from './EditSupplierModal';
import SupplierDetailsModal from './SupplierDetailsModal';
import type { Supplier } from '../../types/entities/supplier.types';
import { useDebounce } from '../../hooks/ui/useDebounce';
import { PageLayout } from '../common/PageLayout';
import { CommonButton } from '../common/Button';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const debouncedSearch = useDebounce(searchTerm, 300);

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
    setSearchTerm('');
    setStatusFilter(undefined);
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
        search: searchTerm || undefined,
        includeInactive: statusFilter === 'all' ? true : statusFilter === 'inactive',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'suppliers.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
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
        search: searchTerm || undefined,
        includeInactive: statusFilter === 'all' ? true : statusFilter === 'inactive',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'suppliers.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      message.error('Failed to export Excel');
    }
  };

  return (
    <>
      <PageLayout
        title="Manage Suppliers"
        searchConfig={{
          placeholder: "Search Suppliers...",
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
            ],
          },
        ]}
        actions={
          <Space>
            <CommonButton
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setAddModalVisible(true)}
            >
              Add Supplier
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
      </PageLayout>

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
    </>
  );
};

export default SuppliersPage;
