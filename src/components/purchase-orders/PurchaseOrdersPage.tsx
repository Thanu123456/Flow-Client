import React, { useState, useEffect, useCallback } from 'react';
import { Input, Select, Space, Row, Col, message } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { usePurchaseOrderStore } from '../../store/transactions/purchaseOrderStore';
import PurchaseOrdersTable from './PurchaseOrdersTable';
import PODetailsModal from './PODetailsModal';
import type { PurchaseOrder, POListItem } from '../../types/entities/purchaseOrder.types';
import PageLayout from '../common/PageLayout/PageLayout';
import { CommonButton } from '../common/Button';

const { Search } = Input;

const PurchaseOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const {
    purchaseOrders, loading, error, pagination,
    listPOs, getPO, approvePO, cancelPO, closePO,
  } = usePurchaseOrderStore();

  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPOs = useCallback(
    (page = 1, perPage = 10) => listPOs({ page, perPage, search: searchText, status: statusFilter || undefined }),
    [listPOs, searchText, statusFilter]
  );

  useEffect(() => { fetchPOs(); }, [fetchPOs]);
  useEffect(() => { if (error) messageApi.error(error); }, [error]);

  const handleRefresh = async () => {
    setSearchText('');
    setStatusFilter('');
    setRefreshing(true);
    try {
      await listPOs({ page: 1, perPage: pagination.perPage });
    } finally {
      setRefreshing(false);
    }
  };

  const openDetails = async (record: POListItem) => {
    setLoadingDetail(true);
    try {
      const data = await getPO(record.id);
      setSelectedPO(data);
      setViewModalVisible(true);
    } catch {
      messageApi.error('Failed to load purchase order details');
    } finally {
      setLoadingDetail(false);
    }
  };

  const closeDetails = () => {
    setViewModalVisible(false);
    setSelectedPO(null);
    fetchPOs(pagination.page, pagination.perPage);
  };

  return (
    <>
      {contextHolder}
      <PageLayout
        title="Purchase Orders"
        actions={
          <Space>
            <CommonButton icon={<ReloadOutlined style={{ color: 'blue' }} />} onClick={handleRefresh} loading={refreshing}>Refresh</CommonButton>
            <CommonButton type="primary" icon={<PlusOutlined />} onClick={() => navigate('/purchase-orders/add')}>
              Add Purchase Order
            </CommonButton>
          </Space>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <Row gutter={[12, 12]} align="middle">
            <Col xs={24} sm={12} md={8}>
              <Search
                placeholder="Search PO number, supplier..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={12} sm={8} md={5}>
              <Select
                style={{ width: '100%' }}
                placeholder="Status"
                value={statusFilter || undefined}
                onChange={setStatusFilter}
                allowClear
                options={[
                  { value: 'draft', label: 'Draft' },
                  { value: 'approved', label: 'Approved' },
                  { value: 'partially_received', label: 'Partially Received' },
                  { value: 'received', label: 'Received' },
                  { value: 'closed', label: 'Closed' },
                  { value: 'cancelled', label: 'Cancelled' },
                ]}
              />
            </Col>
          </Row>
        </div>

        <PurchaseOrdersTable
          data={purchaseOrders}
          loading={loading || loadingDetail}
          onView={openDetails}
          onEdit={(record) => navigate(`/purchase-orders/${record.id}/edit`)}
          onReceive={(record) => navigate(`/purchases/add?poId=${record.id}`)}
          pagination={pagination}
          onPageChange={(page, pageSize) => fetchPOs(page, pageSize)}
        />

        <PODetailsModal
          visible={viewModalVisible}
          po={selectedPO}
          onClose={closeDetails}
          onApprove={async (id) => { await approvePO(id); messageApi.success('Purchase order approved'); closeDetails(); }}
          onCancel={async (id) => { await cancelPO(id); messageApi.success('Purchase order cancelled'); closeDetails(); }}
          onCloseOrder={async (id) => { await closePO(id); messageApi.success('Purchase order closed'); closeDetails(); }}
        />
      </PageLayout>
    </>
  );
};

export default PurchaseOrdersPage;
