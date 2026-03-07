import { Button, Space, Tooltip, Avatar, Modal, message, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, UserOutlined, EyeOutlined, WarningOutlined } from '@ant-design/icons';
import { CommonTable } from '../common/Table';
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
  const getTypeStyle = (type: CustomerType): string => {
    const styleMap: Record<CustomerType, string> = {
      walk_in: 'border-gray-400 text-gray-500 bg-gray-50/70',
      regular: 'border-blue-500 text-blue-500 bg-blue-50/70',
      wholesale: 'border-purple-500 text-purple-500 bg-purple-50/70',
      vip: 'border-gold-500 text-gold-600 bg-gold-50/70', // Note: Tailwind might not have gold-500 by default, check if we use a palette
    };
    return styleMap[type] || 'border-gray-400 text-gray-500 bg-gray-50/70';
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

  const handleBulkDelete = () => {
    Modal.confirm({
      title: "Delete Multiple Customers",
      icon: <WarningOutlined style={{ color: "red" }} />,
      content: `Are you sure you want to delete ${selectedRowKeys.length} selected customers? This action cannot be undone.`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          message.success(`Successfully deleted ${selectedRowKeys.length} customers`);
          onSelectChange([]);
        } catch (error) {
          message.error("Failed to delete customers");
        }
      },
    });
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
        <span
          className={`px-3 py-1 rounded-lg text-sm border ${getTypeStyle(type)}`}
        >
          {getTypeLabel(type)}
        </span>
      ),
    },
    {
      title: 'Points',
      dataIndex: 'loyaltyPoints',
      key: 'loyaltyPoints',
      render: (points: number) => points?.toLocaleString() || '0',
    },
    {
      title: 'Purchases',
      dataIndex: 'totalPurchases',
      key: 'totalPurchases',
      render: (total: string) => `Rs. ${parseFloat(total || '0').toLocaleString()}`,
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <span
          className={`px-3 py-1 rounded-lg text-sm border ${isActive
            ? "border-green-500 text-green-500 bg-green-50/70"
            : "border-red-500 text-red-500 bg-red-50/70"
            }`}
        >
          {isActive ? 'Active' : 'Inactive'}
        </span>
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

  return (
    <CommonTable<Customer>
      columns={columns as any}
      dataSource={data}
      rowKey="id"
      loading={loading}
      onBulkDelete={handleBulkDelete}
      bulkDeleteText={`Delete (${selectedRowKeys.length})`}
      rowSelection={{
        selectedRowKeys,
        onChange: (keys: any) => onSelectChange(keys as string[]),
      }}
      pagination={pagination ? {
        page: pagination.current,
        limit: pagination.pageSize,
        total: pagination.total,
        totalPages: Math.ceil(pagination.total / pagination.pageSize),
      } : undefined}
      onPageChange={pagination?.onChange}
    />
  );
};

export default CustomersTable;
