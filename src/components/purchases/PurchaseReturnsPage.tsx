import React, { useState, useEffect, useCallback } from 'react';
import { Input, DatePicker, Space, Row, Col, message, Tag, Tooltip, Typography } from 'antd';
import { EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import { usePurchaseReturnStore } from '../../store/transactions/purchaseReturnStore';
import type { PurchaseReturn, PurchaseReturnListItem } from '../../types/entities/purchaseReturn.types';
import PageLayout from '../common/PageLayout/PageLayout';
import { CommonButton } from '../common/Button';
import { CommonTable } from '../common/Table';
import PurchaseReturnDetailsModal from './PurchaseReturnDetailsModal';
import dayjs from 'dayjs';

const { Search } = Input;
const { RangePicker } = DatePicker;
const { Text } = Typography;

const fmt = (n: number) =>
  `Rs. ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const PurchaseReturnsPage: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const { returns, loading, error, pagination, listReturns, getReturn } = usePurchaseReturnStore();

  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<PurchaseReturn | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchReturns = useCallback(
    (page = 1, perPage = 10) =>
      listReturns({ page, perPage, search: searchText, dateFrom: dateRange?.[0], dateTo: dateRange?.[1] }),
    [listReturns, searchText, dateRange]
  );

  useEffect(() => { fetchReturns(); }, [fetchReturns]);

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = async () => {
    setSearchText('');
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

  const columns = [
    {
      title: 'Return #',
      dataIndex: 'returnNumber',
      key: 'returnNumber',
      render: (v: string) => (
        <Text style={{ fontWeight: 600, fontFamily: 'monospace', color: '#f5222d' }}>{v}</Text>
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
      render: () => (
        <Tag color="green" style={{ borderRadius: '12px', padding: '0 12px' }}>COMPLETED</Tag>
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
            <Col xs={24} sm={12} md={8}>
              <Search
                placeholder="Search return #, GRN #, supplier..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
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
          scroll={{ x: 900 }}
        />

        <PurchaseReturnDetailsModal
          visible={viewModalVisible}
          ret={selectedReturn}
          onClose={() => { setViewModalVisible(false); setSelectedReturn(null); }}
        />
      </PageLayout>
    </>
  );
};

export default PurchaseReturnsPage;
