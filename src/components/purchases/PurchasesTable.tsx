import React from 'react';
import { Table, Tag, Button, Tooltip } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import type { GRNListItem, GRNStatus, PaymentMethod } from '../../types/entities/purchase.types';
import dayjs from 'dayjs';

interface Props {
  data: GRNListItem[];
  loading: boolean;
  onView: (grn: GRNListItem) => void;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
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
}) => {
  const columns = [
    {
      title: 'GRN Number',
      dataIndex: 'grnNumber',
      key: 'grnNumber',
      render: (num: string) => (
        <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{num}</span>
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
      render: (method: PaymentMethod) => (
        <Tag color={paymentColor[method]}>
          {method.charAt(0).toUpperCase() + method.slice(1)}
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
        <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>
          Rs. {amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: 'Items',
      dataIndex: 'itemCount',
      key: 'itemCount',
      align: 'center' as const,
      render: (count: number) => <Tag>{count}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: GRNStatus) => (
        <Tag color={statusColor[status]}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
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
      render: (_: any, record: GRNListItem) => (
        <Tooltip title="View Details">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => onView(record)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      scroll={{ x: 900 }}
      pagination={
        pagination
          ? {
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              onChange: pagination.onChange,
              showSizeChanger: true,
              pageSizeOptions: ['10', '25', '50', '100'],
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} purchases`,
            }
          : false
      }
    />
  );
};

export default PurchasesTable;
