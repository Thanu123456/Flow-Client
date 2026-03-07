import React, { useState, useEffect, useCallback } from 'react';
import { message, Space } from 'antd';
import { PlusOutlined, ReloadOutlined, FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons';
import { useCustomerStore } from '../../store/management/customerStore';
import { customerService } from '../../services/management/customerService';
import CustomersTable from './CustomersTable';
import AddCustomerModal from './AddCustomerModal';
import EditCustomerModal from './EditCustomerModal';
import CustomerProfileModal from './CustomerProfileModal';
import type { Customer, CustomerType } from '../../types/entities/customer.types';
import { useDebounce } from '../../hooks/ui/useDebounce';
import { PageLayout } from '../common/PageLayout';
import { CommonButton } from '../common/Button';

const CustomersPage: React.FC = () => {
  const { customers, loading, pagination, getCustomers, deleteCustomer } = useCustomerStore();

  // Modal states
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Selection states
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const debouncedSearch = useDebounce(searchTerm, 300);

  const fetchCustomers = useCallback(async (page = 1, limit = 10) => {
    await getCustomers({
      page,
      limit,
      search: debouncedSearch || undefined,
      customerType: typeFilter !== 'all' ? typeFilter as CustomerType : undefined,
      includeInactive: statusFilter === 'all' ? true : statusFilter === 'inactive',
    });
  }, [getCustomers, debouncedSearch, typeFilter, statusFilter]);

  useEffect(() => {
    fetchCustomers(1, pagination.limit);
  }, [debouncedSearch, typeFilter, statusFilter]);

  const handlePageChange = (page: number, pageSize: number) => {
    fetchCustomers(page, pageSize);
  };

  const handleRefresh = () => {
    setSearchTerm('');
    setTypeFilter(undefined);
    setStatusFilter(undefined);
    setSelectedRowKeys([]);
    fetchCustomers(1, pagination.limit);
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setEditModalVisible(true);
  };

  const handleView = (customer: Customer) => {
    setSelectedCustomer(customer);
    setViewModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCustomer(id);
      message.success('Customer deleted successfully');
      fetchCustomers(pagination.page, pagination.limit);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to delete customer');
    }
  };

  const handleAddSuccess = () => {
    setAddModalVisible(false);
    fetchCustomers(1, pagination.limit);
  };

  const handleEditSuccess = () => {
    setEditModalVisible(false);
    setSelectedCustomer(null);
    fetchCustomers(pagination.page, pagination.limit);
  };

  const handleExportPDF = async () => {
    try {
      const blob = await customerService.exportToPDF({
        page: 1,
        limit: 1000,
        search: searchTerm || undefined,
        customerType: typeFilter !== 'all' ? typeFilter as CustomerType : undefined,
        includeInactive: statusFilter === 'all' ? true : statusFilter === 'inactive',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'customers.pdf';
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
      const blob = await customerService.exportToExcel({
        page: 1,
        limit: 1000,
        search: searchTerm || undefined,
        customerType: typeFilter !== 'all' ? typeFilter as CustomerType : undefined,
        includeInactive: statusFilter === 'all' ? true : statusFilter === 'inactive',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'customers.xlsx';
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
        title="Manage Customers"
        searchConfig={{
          placeholder: "Search Customers...",
          value: searchTerm,
          onChange: setSearchTerm,
        }}
        filterConfig={[
          {
            placeholder: "Filter By Type",
            value: typeFilter,
            onChange: setTypeFilter,
            options: [
              { value: 'walk_in', label: 'Walk-in' },
              { value: 'regular', label: 'Regular' },
              { value: 'wholesale', label: 'Wholesale' },
              { value: 'vip', label: 'VIP' },
            ],
          },
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
              Add Customer
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
        <CustomersTable
          data={customers}
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

      <AddCustomerModal
        visible={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        onSuccess={handleAddSuccess}
      />

      <EditCustomerModal
        visible={editModalVisible}
        customer={selectedCustomer}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedCustomer(null);
        }}
        onSuccess={handleEditSuccess}
      />

      <CustomerProfileModal
        visible={viewModalVisible}
        customer={selectedCustomer}
        onClose={() => {
          setViewModalVisible(false);
          setSelectedCustomer(null);
        }}
      />
    </>
  );
};

export default CustomersPage;
