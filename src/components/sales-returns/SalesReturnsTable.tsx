import React from 'react';
import { Table, Tag, Button, Empty } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { SaleReturn } from '../../types/entities/saleReturn.types';

const PAYMENT_COLORS: Record<string, string> = {
  cash: 'green',
  card: 'blue',
  cod: 'orange',
  credit: 'purple',
  hold: 'default',
};

interface SaleReturnsTableProps {
  data: SaleReturn[];
  loading: boolean;
  onView: (record: SaleReturn) => void;
}

const SalesReturnsTable: React.FC<SaleReturnsTableProps> = ({ data, loading, onView }) => {
  const columns: ColumnsType<SaleReturn> = [
    {
      title: 'Ref #',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      width: 180,
      render: (text) => <strong style={{ color: '#f5222d' }}>{text || '—'}</strong>,
    },
    {
      title: 'Customer',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 150,
      render: (text) => text || 'Walk-in',
    },
    {
      title: 'Subtotal',
      dataIndex: 'subtotal',
      key: 'subtotal',
      width: 120,
      align: 'right',
      render: (v: number) => `LKR ${v.toFixed(2)}`,
    },
    {
      title: 'Total Refunded',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 130,
      align: 'right',
      render: (v: number) => (
        <strong style={{ color: '#f5222d' }}>{`LKR ${v.toFixed(2)}`}</strong>
      ),
    },
    {
      title: 'Method',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      width: 100,
      render: (method: string) => (
        <Tag color={PAYMENT_COLORS[method?.toLowerCase()] ?? 'default'}>
          {method?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      width: 90,
      render: () => <Tag color="red">REFUNDED</Tag>,
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => onView(record)}
        >
          View
        </Button>
      ),
    },
  ];

  if (!loading && data.length === 0) {
    return <Empty description="No refunds found" />;
  }

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      pagination={{ pageSize: 15, showSizeChanger: true, showTotal: (t) => `${t} records` }}
      size="small"
      scroll={{ x: 1000 }}
    />
  );
};

export default SalesReturnsTable;
