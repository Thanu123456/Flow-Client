import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Input, Select, Space, Row, Col, message, Typography,
} from 'antd';

import { ReloadOutlined, DollarOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useSupplierCreditStore } from '../../store/management/supplierCreditStore';
import PageLayout from '../common/PageLayout/PageLayout';
import { CommonButton } from '../common/Button';
import type { CreditSupplier, BalanceFilter } from '../../types/entities/supplierCredit.types';
import SupplierPaymentModal from './SupplierPaymentModal';

const { Search } = Input;
const { Text } = Typography;

const formatBalance = (balanceStr: string) => {
  const n = parseFloat(balanceStr || '0');
  if (n > 0) return <span style={{ color: '#cf1322', fontWeight: 600 }}>Credit: {n.toFixed(2)}</span>;
  if (n < 0) return <span style={{ color: '#389e0d', fontWeight: 600 }}>Debit: {Math.abs(n).toFixed(2)}</span>;
  return <span style={{ color: '#8c8c8c' }}>0.00</span>;
};

const CreditSupplierPage: React.FC = () => {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const { suppliers, loading, error, fetchCreditSuppliers } = useSupplierCreditStore();

  const [searchText, setSearchText] = useState('');
  const [balanceFilter, setBalanceFilter] = useState<BalanceFilter>('all');

  const [payModalVisible, setPayModalVisible] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<CreditSupplier | null>(null);

  const fetch = useCallback(() => {
    fetchCreditSuppliers(searchText || undefined, balanceFilter);
  }, [fetchCreditSuppliers, searchText, balanceFilter]);

  useEffect(() => { fetch(); }, [fetch]);

  useEffect(() => {
    if (error) messageApi.error(error);
  }, [error]);

  const handlePayClick = (supplier: CreditSupplier) => {
    setSelectedSupplier(supplier);
    setPayModalVisible(true);
  };

  const handleModalClose = () => {
    setPayModalVisible(false);
    setSelectedSupplier(null);
  };

  const handlePaymentSuccess = () => {
    fetch();
  };

  const columns = [
    {
      title: 'SUPPLIER NAME',
      dataIndex: 'displayName',
      key: 'displayName',
      render: (v: string) => <Text strong>{v}</Text>,
    },
    {
      title: 'PHONE NUMBER',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'LAST PAID AMOUNT',
      dataIndex: 'lastTransactionAmount',
      key: 'lastTransactionAmount',
      align: 'right' as const,
      render: (v?: string) =>
        v ? parseFloat(v).toFixed(2) : <span style={{ color: '#bfbfbf' }}>N/A</span>,
    },
    {
      title: 'LAST PAID DATE',
      dataIndex: 'lastTransactionDate',
      key: 'lastTransactionDate',
      render: (v?: string) =>
        v ? dayjs(v).format('YYYY-MM-DD') : <span style={{ color: '#bfbfbf' }}>N/A</span>,
    },
    {
      title: 'NOTE',
      dataIndex: 'lastTransactionNote',
      key: 'lastTransactionNote',
      render: (v?: string) => v || <span style={{ color: '#bfbfbf' }}>N/A</span>,
    },
    {
      title: 'CREDIT/DEBIT BALANCE',
      dataIndex: 'outstandingBalance',
      key: 'outstandingBalance',
      align: 'right' as const,
      render: (v: string) => formatBalance(v),
    },
    {
      title: 'ACTION',
      key: 'action',
      align: 'center' as const,
      render: (_: any, record: CreditSupplier) => (
        <CommonButton
          type="default"
          size="small"
          icon={<DollarOutlined />}
          onClick={() => handlePayClick(record)}
        >
          Pay Supplier
        </CommonButton>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <PageLayout
        title="Credit Supplier"
        actions={
          <Space>
            <CommonButton
              icon={<ReloadOutlined style={{ color: 'blue' }} />}
              onClick={fetch}
            >
              Refresh
            </CommonButton>
            <CommonButton
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/credit-supplier/payment')}
            >
              Create Payment
            </CommonButton>
          </Space>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <Row gutter={[12, 12]} align="middle">
            <Col xs={24} sm={12} md={8}>
              <Search
                placeholder="Search supplier name or phone..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onSearch={fetch}
                allowClear
              />
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Select
                style={{ width: '100%' }}
                value={balanceFilter}
                onChange={(v) => setBalanceFilter(v as BalanceFilter)}
                options={[
                  { value: 'all', label: 'All' },
                  { value: 'credit', label: 'Credit' },
                  { value: 'debit', label: 'Debit' },
                ]}
              />
            </Col>
          </Row>
        </div>

        <Table
          columns={columns}
          dataSource={suppliers}
          rowKey="id"
          loading={loading}
          size="small"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `${total} suppliers`,
          }}
          locale={{ emptyText: 'No suppliers with outstanding balance' }}
        />
      </PageLayout>

      <SupplierPaymentModal
        visible={payModalVisible}
        supplier={selectedSupplier}
        onClose={handleModalClose}
        onSuccess={handlePaymentSuccess}
      />
    </>
  );
};

export default CreditSupplierPage;
