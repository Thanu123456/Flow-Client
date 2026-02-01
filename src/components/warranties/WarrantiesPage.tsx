import React, { useState, useEffect, useCallback } from 'react';
import { Card, Input, Button, Space, Select, message, Row, Col, Modal, Descriptions, Tag } from 'antd';
import { PlusOutlined, ReloadOutlined, FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons';
import { useWarrantyStore } from '../../store/management/warrantyStore';
import { warrantyService } from '../../services/management/warrantyService';
import WarrantiesTable from './WarrantiesTable';
import AddWarrantyModal from './AddWarrantyModal';
import EditWarrantyModal from './EditWarrantyModal';
import type { Warranty } from '../../types/entities/warranty.types';
import { useDebounce } from '../../hooks/ui/useDebounce';
import dayjs from 'dayjs';

const { Search } = Input;

const WarrantiesPage: React.FC = () => {
  const { warranties, loading, pagination, getWarranties, deleteWarranty } = useWarrantyStore();

  // Modal states
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedWarranty, setSelectedWarranty] = useState<Warranty | null>(null);

  // Selection states
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  // Filter states
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const debouncedSearch = useDebounce(searchText, 300);

  const fetchWarranties = useCallback(async (page = 1, limit = 10) => {
    await getWarranties({
      page,
      limit,
      search: debouncedSearch || undefined,
      includeInactive: statusFilter === 'all' ? true : statusFilter === 'inactive',
    });
  }, [getWarranties, debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchWarranties(1, pagination.limit);
  }, [debouncedSearch, statusFilter]);

  const handlePageChange = (page: number, pageSize: number) => {
    fetchWarranties(page, pageSize);
  };

  const handleRefresh = () => {
    setSearchText('');
    setStatusFilter('all');
    setSelectedRowKeys([]);
    fetchWarranties(1, pagination.limit);
  };

  const handleEdit = (warranty: Warranty) => {
    setSelectedWarranty(warranty);
    setEditModalVisible(true);
  };

  const handleView = (warranty: Warranty) => {
    setSelectedWarranty(warranty);
    setViewModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteWarranty(id);
      message.success('Warranty deleted successfully');
      fetchWarranties(pagination.page, pagination.limit);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to delete warranty');
    }
  };

  const handleAddSuccess = () => {
    setAddModalVisible(false);
    fetchWarranties(1, pagination.limit);
  };

  const handleEditSuccess = () => {
    setEditModalVisible(false);
    setSelectedWarranty(null);
    fetchWarranties(pagination.page, pagination.limit);
  };

  const handleExportPDF = async () => {
    try {
      const blob = await warrantyService.exportToPDF({
        page: 1,
        limit: 1000,
        search: searchText || undefined,
        includeInactive: statusFilter === 'all' ? true : statusFilter === 'inactive',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'warranties.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      message.error('Failed to export PDF');
    }
  };

  const handleExportExcel = async () => {
    try {
      const blob = await warrantyService.exportToExcel({
        page: 1,
        limit: 1000,
        search: searchText || undefined,
        includeInactive: statusFilter === 'all' ? true : statusFilter === 'inactive',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'warranties.xlsx';
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
              placeholder="Search warranties..."
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
                Add Warranty
              </Button>
            </Space>
          </Col>
        </Row>

        <WarrantiesTable
          data={warranties}
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

      <AddWarrantyModal
        visible={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        onSuccess={handleAddSuccess}
      />

      <EditWarrantyModal
        visible={editModalVisible}
        warranty={selectedWarranty}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedWarranty(null);
        }}
        onSuccess={handleEditSuccess}
      />

      <Modal
        title="Warranty Details"
        open={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false);
          setSelectedWarranty(null);
        }}
        footer={null}
        width={600}
      >
        {selectedWarranty && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Warranty Name">{selectedWarranty.name}</Descriptions.Item>
            <Descriptions.Item label="Duration">
              {selectedWarranty.duration} {selectedWarranty.period === 'month' ? 'Month(s)' : 'Year(s)'}
            </Descriptions.Item>
            <Descriptions.Item label="Period">
              <Tag color="blue">{selectedWarranty.period === 'month' ? 'Monthly' : 'Yearly'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Description">
              {selectedWarranty.description || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={selectedWarranty.isActive ? 'green' : 'red'}>
                {selectedWarranty.isActive ? 'Active' : 'Inactive'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Created At">
              {selectedWarranty.createdAt ? dayjs(selectedWarranty.createdAt).format('DD MMM YYYY, HH:mm') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Updated At">
              {selectedWarranty.updatedAt ? dayjs(selectedWarranty.updatedAt).format('DD MMM YYYY, HH:mm') : '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default WarrantiesPage;