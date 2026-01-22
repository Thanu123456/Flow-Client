import React from 'react';
import { Table, Tag, Button, Space, Tooltip, Popconfirm, Avatar } from 'antd';
import { EditOutlined, DeleteOutlined, ShopOutlined, EyeOutlined } from '@ant-design/icons';
import type { Supplier, PaymentTerms } from '../../types/entities/supplier.types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface Props {
  data: Supplier[];
  loading: boolean;
  selectedRowKeys: string[];
  onSelectChange: (keys: string[]) => void;
  onEdit: (supplier: Supplier) => void;
  onDelete: (id: string) => void;
  onView: (supplier: Supplier) => void;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
}

const SuppliersTable: React.FC<Props> = ({
  data,
  loading,
  selectedRowKeys,
  onSelectChange,
  onEdit,
  onDelete,
  onView,
  pagination,
}) => {
  const getPaymentTermsLabel = (terms: PaymentTerms): string => {
    const labelMap: Record<PaymentTerms, string> = {
      cod: 'COD',
      net_7: 'Net 7',
      net_15: 'Net 15',
      net_30: 'Net 30',
      net_60: 'Net 60',
      net_90: 'Net 90',
    };
    return labelMap[terms] || terms;
  };

  const columns = [
    {
      title: 'Supplier',
      key: 'supplier',
      render: (_: any, record: Supplier) => (
        <Space>
          <Avatar src={record.imageUrl} icon={<ShopOutlined />} />
          <div>
            <div style={{ fontWeight: 'bold' }}>{record.displayName}</div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.phone}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Company',
      dataIndex: 'companyName',
      key: 'companyName',
      render: (company: string) => company || '-',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email: string) => email || '-',
    },
    {
      title: 'City',
      dataIndex: 'city',
      key: 'city',
      render: (city: string) => city || '-',
    },
    {
      title: 'Payment Terms',
      dataIndex: 'paymentTerms',
      key: 'paymentTerms',
      render: (terms: PaymentTerms) => (
        <Tag color="blue">{getPaymentTermsLabel(terms)}</Tag>
      ),
    },
    {
      title: 'Total Purchases',
      dataIndex: 'totalPurchases',
      key: 'totalPurchases',
      render: (total: string) => `Rs. ${parseFloat(total || '0').toLocaleString()}`,
    },
    {
      title: 'Outstanding',
      dataIndex: 'outstandingBalance',
      key: 'outstandingBalance',
      render: (balance: string) => {
        const amount = parseFloat(balance || '0');
        return (
          <span style={{ color: amount > 0 ? '#ff4d4f' : undefined }}>
            Rs. {amount.toLocaleString()}
          </span>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Supplier) => (
        <Space size="middle">
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => onView(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Delete Supplier"
              description="Are you sure you want to delete this supplier? This will fail if the supplier has purchase records."
              onConfirm={() => onDelete(record.id)}
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="text"
                icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => onSelectChange(keys as string[]),
  };

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      rowSelection={rowSelection}
      pagination={pagination ? {
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
        onChange: pagination.onChange,
        showSizeChanger: true,
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} suppliers`,
      } : false}
    />
  );
};

export default SuppliersTable;
