import React from 'react';
import { Space, Tooltip, Avatar, Modal, message, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, ShopOutlined, EyeOutlined, WarningOutlined } from '@ant-design/icons';
import { CommonTable } from '../common/Table';
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

  const handleBulkDelete = () => {
    Modal.confirm({
      title: "Delete Multiple Suppliers",
      icon: <WarningOutlined style={{ color: "red" }} />,
      content: `Are you sure you want to delete ${selectedRowKeys.length} selected suppliers? This action cannot be undone.`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          // Perform bulk delete logic here
          message.success(`Successfully deleted ${selectedRowKeys.length} suppliers`);
          onSelectChange([]);
        } catch (error) {
          message.error("Failed to delete suppliers");
        }
      },
    });
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
      title: 'Terms',
      dataIndex: 'paymentTerms',
      key: 'paymentTerms',
      render: (terms: PaymentTerms) => (
        <span
          className="px-3 py-1 rounded-lg text-sm border border-blue-500 text-blue-500 bg-blue-50/70"
        >
          {getPaymentTermsLabel(terms)}
        </span>
      ),
    },
    {
      title: '# Purchases',
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
      render: (_: any, record: Supplier) => (
        <Space size="middle">
          <Tooltip title="View Details">
            <div
              className="flex items-center justify-center w-7 h-7 bg-white shadow-sm rounded-md cursor-pointer hover:bg-blue-50"
              onClick={() => onView(record)}
            >
              <EyeOutlined style={{ color: "black" }} />
            </div>
          </Tooltip>
          <Tooltip title="Edit">
            <div
              className="flex items-center justify-center w-7 h-7 bg-white shadow-sm rounded-md cursor-pointer hover:bg-blue-50"
              onClick={() => onEdit(record)}
            >
              <EditOutlined style={{ color: "#1890ff" }} />
            </div>
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
              <div
                className="flex items-center justify-center w-7 h-7 bg-white shadow-sm rounded-md cursor-pointer hover:bg-blue-50"
              >
                <DeleteOutlined style={{ color: 'red' }} />
              </div>
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <CommonTable<Supplier>
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

export default SuppliersTable;
