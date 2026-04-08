import React from 'react';
import { Tag, Tooltip } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { CommonTable } from '../common/Table';
import type { GRNListItem, GRNStatus, PaymentMethod } from '../../types/entities/purchase.types';
import dayjs from 'dayjs';

interface Props {
  data: GRNListItem[];
  loading: boolean;
  onView: (grn: GRNListItem) => void;
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (page: number, pageSize: number) => void;
}

const statusColor: Record<GRNStatus, string> = {
  draft: 'default',
  completed: 'green',
  cancelled: 'red',
};

const paymentColor: Record<PaymentMethod, string> = {
  cash: 'blue',
  cheque: 'purple',
  credit: 'orange',
};

const PurchasesTable: React.FC<Props> = ({
  data,
  loading,
  onView,
  pagination,
  onPageChange,
}) => {
  const columns = [
    {
      title: 'GRN Number',
      dataIndex: 'grnNumber',
      key: 'grnNumber',
      render: (num: string) => (
        <span style={{ fontWeight: 600, fontFamily: 'monospace', color: '#1890ff' }}>{num}</span>
      ),
    },
    {
      title: 'Supplier',
      dataIndex: 'supplierName',
      key: 'supplierName',
      render: (name?: string) => name || <span style={{ color: '#8c8c8c' }}>Walk-in Purchase</span>,
    },
    {
      title: 'Warehouse',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
    },
    {
      title: 'Payment',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      align: 'center' as const,
      render: (method: PaymentMethod) => (
        <Tag color={paymentColor[method]} style={{ borderRadius: '4px' }}>
          {method.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      align: 'right' as const,
      render: (amount: number) => (
        <span style={{ fontFamily: 'monospace' }}>
          Rs. {amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: 'Net Amount',
      dataIndex: 'netAmount',
      key: 'netAmount',
      align: 'right' as const,
      render: (amount: number) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#1890ff' }}>
          Rs. {amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'center' as const,
      render: (status: GRNStatus) => (
        <Tag color={statusColor[status]} style={{ borderRadius: '12px', padding: '0 12px' }}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'grnDate',
      key: 'grnDate',
      render: (date: string) => dayjs(date).format('DD MMM YYYY'),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center' as const,
      render: (_: any, record: GRNListItem) => (
        <Tooltip title="View Details">
          <div
            className="flex items-center justify-center w-7 h-7 bg-white shadow-sm rounded-md cursor-pointer hover:bg-blue-50"
            onClick={() => onView(record)}
          >
            <EyeOutlined style={{ color: "black" }} />
          </div>
        </Tooltip>
      ),
    },
  ];

  return (
    <CommonTable<GRNListItem>
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      pagination={{
        page: pagination.page,
        limit: pagination.perPage,
        total: pagination.total,
        totalPages: pagination.totalPages,
      }}
      onPageChange={onPageChange}
      scroll={{ x: 1000 }}
      rowClassName={(record: GRNListItem) =>
        record.status === 'draft' ? 'opacity-60' : ''
      }
    />
  );
};

export default PurchasesTable;
