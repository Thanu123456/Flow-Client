import React, { useState, useEffect, useCallback } from 'react';
import {
  Input, Select, Space, Row, Col, message,
} from 'antd';
import { ReloadOutlined, PlusOutlined } from '@ant-design/icons';
import { useCustomerCreditStore } from '../../store/management/customerCreditStore';
import PageLayout from '../common/PageLayout/PageLayout';
import { CommonButton } from '../common/Button';
import type { CreditCustomer, BalanceFilter } from '../../types/entities/customerCredit.types';
import CustomerPaymentModal from './CustomerPaymentModal';
import CreditCustomerTable from './CreditCustomerTable';

const { Search } = Input;

const CreditCustomerPage: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const { customers, loading, error, fetchCreditCustomers } = useCustomerCreditStore();

  const [searchText, setSearchText] = useState('');
  const [balanceFilter, setBalanceFilter] = useState<BalanceFilter>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [payModalVisible, setPayModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CreditCustomer | null>(null);

  const fetch = useCallback(() => {
    fetchCreditCustomers(searchText || undefined, balanceFilter);
  }, [fetchCreditCustomers, searchText, balanceFilter]);

  useEffect(() => { fetch(); }, [fetch]);

  useEffect(() => { setPage(1); }, [searchText, balanceFilter]);

  useEffect(() => {
    if (error) messageApi.error(error);
  }, [error]);

  const handlePayClick = (customer: CreditCustomer) => {
    setSelectedCustomer(customer);
    setPayModalVisible(true);
  };

  const handleModalClose = () => {
    setPayModalVisible(false);
    setSelectedCustomer(null);
  };

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);
  };

  return (
    <>
      {contextHolder}
      <PageLayout
        title="Credit Customer"
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
              onClick={() => {
                setSelectedCustomer(null);
                setPayModalVisible(true);
              }}
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
                placeholder="Search customer name or phone..."
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

        <CreditCustomerTable
          data={customers}
          loading={loading}
          onPay={handlePayClick}
          pagination={{
            page,
            limit: pageSize,
            total: customers.length,
            totalPages: Math.ceil(customers.length / pageSize),
          }}
          onPageChange={handlePageChange}
        />
      </PageLayout>

      <CustomerPaymentModal
        visible={payModalVisible}
        customer={selectedCustomer}
        onClose={handleModalClose}
        onSuccess={fetch}
      />
    </>
  );
};

export default CreditCustomerPage;
