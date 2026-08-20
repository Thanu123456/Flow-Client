import React from 'react';
import { Tooltip, Typography } from 'antd';
import { DollarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { CommonTable } from '../common/Table';
import type { CreditCustomer } from '../../types/entities/customerCredit.types';

const { Text } = Typography;

const formatBalance = (balanceStr: string) => {
  const n = parseFloat(balanceStr || '0');
  if (n > 0) return <span style={{ color: '#cf1322', fontWeight: 600 }}>Credit: {n.toFixed(2)}</span>;
  if (n < 0) return <span style={{ color: '#389e0d', fontWeight: 600 }}>Debit: {Math.abs(n).toFixed(2)}</span>;
  return <span style={{ color: '#8c8c8c' }}>0.00</span>;
};

interface Props {
  data: CreditCustomer[];
  loading: boolean;
  onPay: (customer: CreditCustomer) => void;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (page: number, pageSize: number) => void;
}

const CreditCustomerTable: React.FC<Props> = ({
  data,
  loading,
  onPay,
  pagination,
  onPageChange,
}) => {
  const columns = [
    {
      title: 'Customer Name',
      dataIndex: 'displayName',
      key: 'displayName',
      render: (v: string) => <Text strong>{v}</Text>,
    },
    {
      title: 'Phone Number',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Last Paid Amount',
      dataIndex: 'lastTransactionAmount',
      key: 'lastTransactionAmount',
      align: 'right' as const,
      render: (v?: string) =>
        v ? parseFloat(v).toFixed(2) : <span style={{ color: '#bfbfbf' }}>N/A</span>,
    },
    {
      title: 'Last Paid Date',
      dataIndex: 'lastTransactionDate',
      key: 'lastTransactionDate',
      render: (v?: string) =>
        v ? dayjs(v).format('YYYY-MM-DD') : <span style={{ color: '#bfbfbf' }}>N/A</span>,
    },
    {
      title: 'Note',
      dataIndex: 'lastTransactionNote',
      key: 'lastTransactionNote',
      render: (v?: string) => v || <span style={{ color: '#bfbfbf' }}>N/A</span>,
    },
    {
      title: 'Credit/Debit Balance',
      dataIndex: 'outstandingBalance',
      key: 'outstandingBalance',
      align: 'right' as const,
      render: (v: string) => formatBalance(v),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center' as const,
      render: (_: any, record: CreditCustomer) => (
        <Tooltip title="Pay / Credit">
          <div
            className="flex items-center justify-center w-7 h-7 bg-white shadow-sm rounded-md cursor-pointer hover:bg-green-50 mx-auto"
            onClick={() => onPay(record)}
          >
            <DollarOutlined style={{ color: '#389e0d' }} />
          </div>
        </Tooltip>
      ),
    },
  ];

  return (
    <CommonTable<CreditCustomer>
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      pagination={pagination}
      onPageChange={onPageChange}
      scroll={{ x: 1000 }}
      locale={{ emptyText: 'No customers with outstanding balance' }}
    />
  );
};

export default CreditCustomerTable;
