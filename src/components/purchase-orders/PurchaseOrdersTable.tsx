import React from 'react';
import { Tag, Tooltip, Space } from 'antd';
import { EyeOutlined, EditOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { CommonTable } from '../common/Table';
import type { POListItem, POStatus } from '../../types/entities/purchaseOrder.types';
import dayjs from 'dayjs';

interface Props {
  data: POListItem[];
  loading: boolean;
  onView: (po: POListItem) => void;
  onEdit: (po: POListItem) => void;
  onReceive: (po: POListItem) => void;
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (page: number, pageSize: number) => void;
}

const statusColor: Record<POStatus, string> = {
  draft: 'default',
  approved: 'blue',
  partially_received: 'gold',
  received: 'green',
  closed: 'purple',
  cancelled: 'red',
};

const statusLabel: Record<POStatus, string> = {
  draft: 'Draft',
  approved: 'Approved',
  partially_received: 'Partially Received',
  received: 'Received',
  closed: 'Closed',
  cancelled: 'Cancelled',
};

const PurchaseOrdersTable: React.FC<Props> = ({
  data, loading, onView, onEdit, onReceive, pagination, onPageChange,
}) => {
  const columns = [
    {
      title: 'PO Number',
      dataIndex: 'poNumber',
      key: 'poNumber',
      render: (num: string) => (
        <span style={{ fontWeight: 600, fontFamily: 'monospace', color: '#1890ff' }}>{num}</span>
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
      title: 'Items',
      dataIndex: 'itemCount',
      key: 'itemCount',
      align: 'center' as const,
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
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'center' as const,
      render: (status: POStatus) => (
        <Tag color={statusColor[status]} style={{ borderRadius: '12px', padding: '0 12px' }}>
          {statusLabel[status]}
        </Tag>
      ),
    },
    {
      title: 'Order Date',
      dataIndex: 'orderDate',
      key: 'orderDate',
      render: (date: string) => dayjs(date).format('DD MMM YYYY'),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center' as const,
      render: (_: any, record: POListItem) => (
        <Space size={6}>
          <Tooltip title="View Details">
            <div
              className="flex items-center justify-center w-7 h-7 bg-white shadow-sm rounded-md cursor-pointer hover:bg-blue-50"
              onClick={() => onView(record)}
            >
              <EyeOutlined style={{ color: 'black' }} />
            </div>
          </Tooltip>
          {record.status === 'draft' && (
            <Tooltip title="Edit">
              <div
                className="flex items-center justify-center w-7 h-7 bg-white shadow-sm rounded-md cursor-pointer hover:bg-orange-50"
                onClick={() => onEdit(record)}
              >
                <EditOutlined style={{ color: '#fa8c16' }} />
              </div>
            </Tooltip>
          )}
          {(record.status === 'approved' || record.status === 'partially_received') && (
            <Tooltip title="Receive (create GRN)">
              <div
                className="flex items-center justify-center w-7 h-7 bg-white shadow-sm rounded-md cursor-pointer hover:bg-green-50"
                onClick={() => onReceive(record)}
              >
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
              </div>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <CommonTable<POListItem>
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
    />
  );
};

export default PurchaseOrdersTable;
