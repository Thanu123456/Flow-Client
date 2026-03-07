import React, { useState, useEffect, useCallback } from 'react';
import { message, Space, Modal, Descriptions } from 'antd';
import { PlusOutlined, ReloadOutlined, FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons';
import { useWarrantyStore } from '../../store/management/warrantyStore';
import { warrantyService } from '../../services/management/warrantyService';
import WarrantiesTable from './WarrantiesTable';
import AddWarrantyModal from './AddWarrantyModal';
import EditWarrantyModal from './EditWarrantyModal';
import type { Warranty } from '../../types/entities/warranty.types';
import { useDebounce } from '../../hooks/ui/useDebounce';
import dayjs from 'dayjs';
import { PageLayout } from '../common/PageLayout';
import { CommonButton } from '../common/Button';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const debouncedSearch = useDebounce(searchTerm, 300);

  const fetchWarranties = useCallback(async (page = 1, limit = 10) => {
    await getWarranties({
      page,
      limit,
      search: debouncedSearch || undefined,
      status: statusFilter === 'all' ? undefined : (statusFilter as 'active' | 'inactive'),
    });
  }, [getWarranties, debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchWarranties(1, pagination.limit);
  }, [debouncedSearch, statusFilter]);

  const handlePageChange = (page: number, pageSize: number) => {
    fetchWarranties(page, pageSize);
  };

  const handleRefresh = () => {
    setSearchTerm('');
    setStatusFilter(undefined);
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
        search: searchTerm || undefined,
        status: statusFilter === 'all' ? undefined : (statusFilter as 'active' | 'inactive'),
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'warranties.pdf';
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
      const blob = await warrantyService.exportToExcel({
        page: 1,
        limit: 1000,
        search: searchTerm || undefined,
        status: statusFilter === 'all' ? undefined : (statusFilter as 'active' | 'inactive'),
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'warranties.xlsx';
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
        title="Manage Warranties"
        searchConfig={{
          placeholder: "Search Warranties...",
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
              Add Warranty
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
      </PageLayout>

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
              <span className="px-3 py-1 rounded-lg text-sm border border-blue-500 text-blue-500 bg-blue-50/70">
                {selectedWarranty.period === 'month' ? 'Monthly' : 'Yearly'}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Description">
              {selectedWarranty.description || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <span
                className={`px-3 py-1 rounded-lg text-sm border ${selectedWarranty.isActive
                  ? "border-green-500 text-green-500 bg-green-50/70"
                  : "border-red-500 text-red-500 bg-red-50/70"
                  }`}
              >
                {selectedWarranty.isActive ? 'Active' : 'Inactive'}
              </span>
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
    </>
  );
};

export default WarrantiesPage;