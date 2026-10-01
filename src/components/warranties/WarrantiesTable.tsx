import React from 'react';
import { Space, Tooltip, Popconfirm, Modal } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, WarningOutlined } from '@ant-design/icons';
import { CommonTable } from '../common/Table';
import { Tag } from 'antd';
import { formatTerm, typeColor, typeLabel } from '../../utils/warranty';
import type { Warranty } from '../../types/entities/warranty.types';
import dayjs from 'dayjs';

interface Props {
  data: Warranty[];
  loading: boolean;
  selectedRowKeys: string[];
  onSelectChange: (keys: string[]) => void;
  onEdit: (warranty: Warranty) => void;
  onDelete: (id: string) => void;
  onView: (warranty: Warranty) => void;
  onBulkDelete: (ids: string[]) => Promise<void>;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  onSortChange: (sortBy?: string, sortDir?: 'asc' | 'desc') => void;
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
  onBulkDelete,
  sortBy,
  sortDir,
  onSortChange,
  pagination,
}) => {
  const handleBulkDelete = () => {
    Modal.confirm({
      title: "Delete Multiple Warranties",
      icon: <WarningOutlined style={{ color: "red" }} />,
      content: `Are you sure you want to delete ${selectedRowKeys.length} selected warranties? This action cannot be undone.`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        await onBulkDelete(selectedRowKeys);
        onSelectChange([]);
      },
    });
  };

  // Column key -> backend sort_by (see warrantySortExpressions in warranty_repository.go)
  const SORT_KEYS: Record<string, string> = {
    name: 'name',
    duration: 'duration',
    createdAt: 'created_at',
    isActive: 'status',
  };
  const orderFor = (backendKey: string) =>
    sortBy === backendKey ? (sortDir === 'desc' ? 'descend' : 'ascend') : null;

  const handleTableChange = (_p: any, _f: any, sorter: any) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    const key = typeof s?.columnKey === 'string' ? SORT_KEYS[s.columnKey] : undefined;
    if (key && s?.order) onSortChange(key, s.order === 'descend' ? 'desc' : 'asc');
    else onSortChange(undefined, undefined);
  };

  const columns = [
    {
      title: 'Warranty Name',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      sortOrder: orderFor('name'),
      render: (name: string) => (
        <span style={{ fontWeight: 'bold' }}>{name}</span>
      ),
    },
    {
      title: 'Duration',
      key: 'duration',
      sorter: true,
      sortOrder: orderFor('duration'),
      render: (_: any, record: Warranty) => (
        <span>{formatTerm(record.duration, record.period)}</span>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'warrantyType',
      key: 'warrantyType',
      render: (t: string) => <Tag color={typeColor(t)}>{typeLabel(t)}</Tag>,
    },
    {
      title: 'Products',
      dataIndex: 'productCount',
      key: 'productCount',
      align: 'center' as const,
      render: (n: number) => (
        <span className={n > 0 ? 'font-semibold' : 'text-gray-400'}>{n ?? 0}</span>
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
      sorter: true,
      sortOrder: orderFor('created_at'),
      render: (date: string) => date ? dayjs(date).format('DD MMM YYYY') : '-',
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      sorter: true,
      sortOrder: orderFor('status'),
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
              title="Delete Warranty"
              description="Are you sure you want to delete this warranty? This will fail if the warranty has associated products."
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
    <CommonTable<Warranty>
      columns={columns as any}
      dataSource={data}
      rowKey="id"
      loading={loading}
      onBulkDelete={handleBulkDelete}
      onChange={handleTableChange}
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
