import React from 'react';
import { Button, Space, Tooltip, Popconfirm, Modal, message } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, WarningOutlined } from '@ant-design/icons';
import { CommonTable } from '../common/Table';
import type { Warranty, WarrantyPeriod } from '../../types/entities/warranty.types';
import dayjs from 'dayjs';

interface Props {
  data: Warranty[];
  loading: boolean;
  selectedRowKeys: string[];
  onSelectChange: (keys: string[]) => void;
  onEdit: (warranty: Warranty) => void;
  onDelete: (id: string) => void;
  onView: (warranty: Warranty) => void;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
}

const WarrantiesTable: React.FC<Props> = ({
  data,
  loading,
  selectedRowKeys,
  onSelectChange,
  onEdit,
  onDelete,
  onView,
  pagination,
}) => {
  const getPeriodLabel = (period: WarrantyPeriod): string => {
    const labelMap: Record<WarrantyPeriod, string> = {
      month: 'Month(s)',
      year: 'Year(s)',
    };
    return labelMap[period] || period;
  };

  const handleBulkDelete = () => {
    Modal.confirm({
      title: "Delete Multiple Warranties",
      icon: <WarningOutlined style={{ color: "red" }} />,
      content: `Are you sure you want to delete ${selectedRowKeys.length} selected warranties? This action cannot be undone.`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          // Perform bulk delete logic here
          message.success(`Successfully deleted ${selectedRowKeys.length} warranties`);
          onSelectChange([]);
          // refresh logic
        } catch (error) {
          message.error("Failed to delete warranties");
        }
      },
    });
  };

  const columns = [
    {
      title: 'Warranty Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <span style={{ fontWeight: 'bold' }}>{name}</span>
      ),
    },
    {
      title: 'Duration',
      key: 'duration',
      render: (_: any, record: Warranty) => (
        <span>{record.duration} {getPeriodLabel(record.period)}</span>
      ),
    },
    {
      title: 'Period',
      dataIndex: 'period',
      key: 'period',
      render: (period: WarrantyPeriod) => (
        <span
          className="px-3 py-1 rounded-lg text-sm border border-blue-500 text-blue-500 bg-blue-50/70"
        >
          {period === 'month' ? 'Monthly' : 'Yearly'}
        </span>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (description: string) => description || '-',
      ellipsis: true,
    },
    {
      title: 'Created Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => date ? dayjs(date).format('DD MMM YYYY') : '-',
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
      render: (_: any, record: Warranty) => (
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
              title="Delete Warranty"
              description="Are you sure you want to delete this warranty? This will fail if the warranty has associated products."
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
    <CommonTable<Warranty>
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

export default WarrantiesTable;
