import React from 'react';
import { Table, Tag, Button, Space, Tooltip, Popconfirm, Avatar } from 'antd';
import { EditOutlined, DeleteOutlined, UserOutlined, EyeOutlined } from '@ant-design/icons';
import type { Customer, CustomerType } from '../../types/entities/customer.types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface Props {
  data: Customer[];
  loading: boolean;
  selectedRowKeys: string[];
  onSelectChange: (keys: string[]) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
  onView: (customer: Customer) => void;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
}

const CustomersTable: React.FC<Props> = ({
  data,
  loading,
  selectedRowKeys,
  onSelectChange,
  onEdit,
  onDelete,
  onView,
  pagination,
}) => {
  const getTypeColor = (type: CustomerType): string => {
    const colorMap: Record<CustomerType, string> = {
      walk_in: 'default',
      regular: 'blue',
      wholesale: 'purple',
      vip: 'gold',
    };
    return colorMap[type] || 'default';
  };

  const getTypeLabel = (type: CustomerType): string => {
    const labelMap: Record<CustomerType, string> = {
      walk_in: 'Walk-in',
      regular: 'Regular',
      wholesale: 'Wholesale',
      vip: 'VIP',
    };
    return labelMap[type] || type;
  };

  const columns = [
    {
      title: 'Customer',
      key: 'customer',
      render: (_: any, record: Customer) => (
        <Space>
          <Avatar src={record.imageUrl} icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 'bold' }}>{record.fullName}</div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.phone}</div>
          </div>
        </Space>
      ),
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
      title: 'Type',
      dataIndex: 'customerType',
      key: 'customerType',
      render: (type: CustomerType) => (
        <Tag color={getTypeColor(type)}>
          {getTypeLabel(type)}
        </Tag>
      ),
    },
    {
      title: 'Loyalty Points',
      dataIndex: 'loyaltyPoints',
      key: 'loyaltyPoints',
      render: (points: number) => points?.toLocaleString() || '0',
    },
    {
      title: 'Total Purchases',
      dataIndex: 'totalPurchases',
      key: 'totalPurchases',
      render: (total: string) => `Rs. ${parseFloat(total || '0').toLocaleString()}`,
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
      render: (_: any, record: Customer) => (
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
              title="Delete Customer"
              description="Are you sure you want to delete this customer?"
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
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} customers`,
      } : false}
    />
  );
};

export default CustomersTable;
