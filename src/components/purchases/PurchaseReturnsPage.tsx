import React, { useState, useEffect, useCallback } from 'react';
import { Input, DatePicker, Select, Space, Row, Col, message, Tag, Tooltip, Typography, Modal, InputNumber } from 'antd';
import { EyeOutlined, ReloadOutlined, SettingOutlined } from '@ant-design/icons';
import { usePurchaseReturnStore } from '../../store/transactions/purchaseReturnStore';
import { purchaseReturnService } from '../../services/transactions/purchaseReturnService';
import type { PurchaseReturn, PurchaseReturnListItem, PurchaseReturnStatus } from '../../types/entities/purchaseReturn.types';
import PageLayout from '../common/PageLayout/PageLayout';
import { CommonButton } from '../common/Button';
import { CommonTable } from '../common/Table';
import PurchaseReturnDetailsModal from './PurchaseReturnDetailsModal';
import { usePermissions } from '../../hooks/auth/usePermissions';
import { PERMISSIONS } from '../../types/auth/permissions';
import dayjs from 'dayjs';

const { Search } = Input;
const { RangePicker } = DatePicker;
const { Text } = Typography;

const fmt = (n: number) =>
  `Rs. ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const statusColor: Record<PurchaseReturnStatus, string> = {
  pending_approval: 'gold',
  completed: 'green',
  rejected: 'default',
  voided: 'volcano',
};

const PurchaseReturnsPage: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const { returns, loading, error, pagination, listReturns, getReturn } = usePurchaseReturnStore();
  const { hasPermission } = usePermissions();
  const canApprove = hasPermission(PERMISSIONS.PURCHASES_APPROVE);

  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<PurchaseReturn | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [threshold, setThreshold] = useState<number>(0);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  const fetchReturns = useCallback(
    (page = 1, perPage = 10) =>
      listReturns({ page, perPage, search: searchText, status: statusFilter || undefined, dateFrom: dateRange?.[0], dateTo: dateRange?.[1] }),
    [listReturns, searchText, statusFilter, dateRange]
  );

  useEffect(() => { fetchReturns(); }, [fetchReturns]);

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = async () => {
    setSearchText('');
    setStatusFilter('');
    setDateRange(null);
    setRefreshing(true);
    try {
      // Fetch with explicitly cleared filters — fetchReturns would still
      // close over the previous filter values here.
      await listReturns({ page: 1, perPage: pagination.perPage });
    } catch {
      // error state handled in store
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (error) messageApi.error(error);
  }, [error]);

  const handleView = async (record: PurchaseReturnListItem) => {
    setLoadingDetail(true);
    try {
      const data = await getReturn(record.id);
      setSelectedReturn(data);
      setViewModalVisible(true);
    } catch {
      messageApi.error('Failed to load return details');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleChanged = async () => {
    if (selectedReturn) {
      const data = await getReturn(selectedReturn.id);
      setSelectedReturn(data);
    }
    fetchReturns(pagination.page, pagination.perPage);
  };

  const openSettings = async () => {
    setSettingsOpen(true);
    setLoadingSettings(true);
    try {
      const s = await purchaseReturnService.getSettings();
      setThreshold(s.approvalThreshold);
    } catch {
      messageApi.error('Failed to load settings');
    } finally {
      setLoadingSettings(false);
    }
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      await purchaseReturnService.updateSettings(threshold);
      messageApi.success('Settings updated');
      setSettingsOpen(false);
    } catch {
      messageApi.error('Failed to update settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const columns = [
    {
      title: 'Return #',
      dataIndex: 'returnNumber',
      key: 'returnNumber',
      render: (v: string, record: PurchaseReturnListItem) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontWeight: 600, fontFamily: 'monospace', color: '#f5222d' }}>{v}</Text>
          {record.debitNoteNumber && (
            <Text type="secondary" style={{ fontSize: 11, fontFamily: 'monospace' }}>DN: {record.debitNoteNumber}</Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Original GRN',
      dataIndex: 'originalGrnNumber',
      key: 'originalGrnNumber',
      render: (v: string) => (
        <Text style={{ fontFamily: 'monospace', color: '#1890ff' }}>{v}</Text>
      ),
    },
    {
      title: 'Supplier',
      dataIndex: 'supplierName',
      key: 'supplierName',
    },
    {
      title: 'Warehouse',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
    },
    {
      title: 'Total Returned',
      dataIndex: 'totalReturnAmount',
      key: 'totalReturnAmount',
      align: 'right' as const,
      render: (v: number) => (
        <Text strong style={{ fontFamily: 'monospace', color: '#f5222d' }}>{fmt(v)}</Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'center' as const,
      render: (status: PurchaseReturnStatus) => (
        <Tag color={statusColor[status]} style={{ borderRadius: '12px', padding: '0 12px' }}>
          {status.replace('_', ' ').toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Return Date',
      dataIndex: 'returnDate',
      key: 'returnDate',
      render: (v: string) => dayjs(v).format('DD MMM YYYY'),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center' as const,
      render: (_: any, record: PurchaseReturnListItem) => (
        <Tooltip title="View Details">
          <div
            className="flex items-center justify-center w-7 h-7 bg-white shadow-sm rounded-md cursor-pointer hover:bg-blue-50"
            onClick={() => handleView(record)}
          >
            <EyeOutlined style={{ color: 'black' }} />
          </div>
        </Tooltip>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <PageLayout
        title="Purchase Returns"
        actions={
          <Space>
            {canApprove && (
              <CommonButton icon={<SettingOutlined />} onClick={openSettings}>
                Approval Settings
              </CommonButton>
            )}
            <CommonButton
              icon={<ReloadOutlined style={{ color: 'blue' }} />}
              onClick={handleRefresh}
              loading={refreshing}
            >
              Refresh
            </CommonButton>
          </Space>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <Row gutter={[12, 12]} align="middle">
            <Col xs={24} sm={12} md={7}>
              <Search
                placeholder="Search return #, debit note #, GRN #, supplier..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={12} sm={6} md={5}>
              <Select
                style={{ width: '100%' }}
                placeholder="Status"
                value={statusFilter || undefined}
                onChange={setStatusFilter}
                allowClear
                options={[
                  { value: 'pending_approval', label: 'Pending Approval' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'rejected', label: 'Rejected' },
                  { value: 'voided', label: 'Voided' },
                ]}
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <RangePicker
                style={{ width: '100%' }}
                format="YYYY-MM-DD"
                value={dateRange ? [dayjs(dateRange[0]), dayjs(dateRange[1])] : null}
                onChange={(_, strings) => {
                  const [from, to] = strings as [string, string];
                  setDateRange(from && to ? [from, to] : null);
                }}
                allowClear
              />
            </Col>
          </Row>
        </div>

        <CommonTable<PurchaseReturnListItem>
          columns={columns}
          dataSource={returns}
          rowKey="id"
          loading={loading || loadingDetail}
          pagination={{
            page: pagination.page,
            limit: pagination.perPage,
            total: pagination.total,
            totalPages: pagination.totalPages,
          }}
          onPageChange={(page, pageSize) => fetchReturns(page, pageSize)}
          scroll={{ x: 950 }}
        />

        <PurchaseReturnDetailsModal
          visible={viewModalVisible}
          ret={selectedReturn}
          onClose={() => { setViewModalVisible(false); setSelectedReturn(null); }}
          onChanged={handleChanged}
        />

        <Modal
          open={settingsOpen}
          title="Purchase Return Approval Settings"
          onCancel={() => setSettingsOpen(false)}
          onOk={saveSettings}
          okText="Save"
          confirmLoading={savingSettings}
        >
          <Text type="secondary">
            Returns valued at or above this amount are held for a second person to approve before stock, the
            supplier balance and the GL move. Set to 0 to never require approval.
          </Text>
          <div style={{ marginTop: 16 }}>
            <Text strong>Approval threshold (Rs.)</Text>
            <InputNumber
              min={0}
              value={threshold}
              onChange={(v) => setThreshold(v ?? 0)}
              style={{ width: '100%', marginTop: 8 }}
              disabled={loadingSettings}
              precision={2}
            />
          </div>
        </Modal>
      </PageLayout>
    </>
  );
};

export default PurchaseReturnsPage;
