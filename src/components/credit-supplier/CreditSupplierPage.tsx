import React, { useState, useEffect, useCallback } from 'react';
import {
  Input, Select, Space, Row, Col, message,
} from 'antd';

import { ReloadOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSupplierCreditStore } from '../../store/management/supplierCreditStore';
import PageLayout from '../common/PageLayout/PageLayout';
import { CommonButton } from '../common/Button';
import type { CreditSupplier, BalanceFilter } from '../../types/entities/supplierCredit.types';
import SupplierPaymentModal from './SupplierPaymentModal';
import CreditSupplierTable from './CreditSupplierTable';

const { Search } = Input;

const CreditSupplierPage: React.FC = () => {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const { suppliers, loading, error, fetchCreditSuppliers } = useSupplierCreditStore();

  const [searchText, setSearchText] = useState('');
  const [balanceFilter, setBalanceFilter] = useState<BalanceFilter>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [payModalVisible, setPayModalVisible] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<CreditSupplier | null>(null);

  const fetch = useCallback(() => {
    fetchCreditSuppliers(searchText || undefined, balanceFilter);
  }, [fetchCreditSuppliers, searchText, balanceFilter]);

  useEffect(() => { fetch(); }, [fetch]);

  useEffect(() => { setPage(1); }, [searchText, balanceFilter]);

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

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);
  };

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

        <CreditSupplierTable
          data={suppliers}
          loading={loading}
          onPay={handlePayClick}
          pagination={{
            page,
            limit: pageSize,
            total: suppliers.length,
            totalPages: Math.ceil(suppliers.length / pageSize),
          }}
          onPageChange={handlePageChange}
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
