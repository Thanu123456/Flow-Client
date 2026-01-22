import React, { useState, useEffect, useCallback } from 'react';
import { Card, Input, Button, Space, Select, message, Row, Col } from 'antd';
import { PlusOutlined, ReloadOutlined, FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons';
import { useCustomerStore } from '../../store/management/customerStore';
import { customerService } from '../../services/management/customerService';
import CustomersTable from './CustomersTable';
import AddCustomerModal from './AddCustomerModal';
import EditCustomerModal from './EditCustomerModal';
import CustomerProfileModal from './CustomerProfileModal';
import type { Customer, CustomerType } from '../../types/entities/customer.types';
import { useDebounce } from '../../hooks/ui/useDebounce';

const { Search } = Input;

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
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const debouncedSearch = useDebounce(searchText, 300);

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
    setSearchText('');
    setTypeFilter('all');
    setStatusFilter('all');
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
        search: searchText || undefined,
        customerType: typeFilter !== 'all' ? typeFilter as CustomerType : undefined,
        includeInactive: statusFilter === 'all' ? true : statusFilter === 'inactive',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'customers.pdf';
      a.click();
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
        search: searchText || undefined,
        customerType: typeFilter !== 'all' ? typeFilter as CustomerType : undefined,
        includeInactive: statusFilter === 'all' ? true : statusFilter === 'inactive',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'customers.xlsx';
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
              placeholder="Search customers..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Select
              style={{ width: '100%' }}
              value={typeFilter}
              onChange={setTypeFilter}
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'walk_in', label: 'Walk-in' },
                { value: 'regular', label: 'Regular' },
                { value: 'wholesale', label: 'Wholesale' },
                { value: 'vip', label: 'VIP' },
              ]}
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
          <Col xs={24} sm={24} md={24} lg={10} style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
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
                Add Customer
              </Button>
            </Space>
          </Col>
        </Row>

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
      </Card>

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
    </div>
  );
};

export default CustomersPage;
