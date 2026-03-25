import React from 'react';
import { Table, Space, Tooltip, Popconfirm } from 'antd';
import {
  EyeOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import type { Tenant } from '../../../types/auth/superadmin.types';
import dayjs from 'dayjs';

interface Props {
  data: Tenant[];
  loading: boolean;
  onView: (tenant: Tenant) => void;
  onActivate: (id: string) => void;
  onSuspend: (id: string) => void;
  onDelete: (id: string) => void;
  total: number;
  pagination: { current: number; pageSize: number };
  onTableChange: (pagination: any) => void;
}

const TenantsTable: React.FC<Props> = ({
  data,
  loading,
  onView,
  onActivate,
  onSuspend,
  onDelete,
  total,
  pagination,
  onTableChange
}) => {
  const columns = [
    {
      title: 'Shop Name',
      dataIndex: 'shop_name',
      key: 'shop_name',
    },
    {
      title: 'Owner',
      dataIndex: 'owner_name',
      key: 'owner_name',
    },
    {
      title: 'Schema',
      dataIndex: 'schema_name',
      key: 'schema_name',
      render: (schema: string | undefined) => schema ? <code>{schema}</code> : <span style={{ color: '#999' }}>-</span>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string | undefined) => {
        const statusValue = status || 'pending';
        const styleMap: Record<string, string> = {
          active: 'border-green-500 text-green-500 bg-green-50/70',
          suspended: 'border-red-500 text-red-500 bg-red-50/70',
          pending: 'border-orange-500 text-orange-500 bg-orange-50/70',
          rejected: 'border-red-500 text-red-500 bg-red-50/70'
        };
        const labelMap: Record<string, string> = {
          active: 'Active',
          suspended: 'Suspended',
          pending: 'Pending',
          rejected: 'Rejected'
        };
        return (
          <span
            className={`px-3 py-1 rounded-lg text-sm border ${styleMap[statusValue] || 'border-gray-500 text-gray-500 bg-gray-50/70'}`}
          >
            {labelMap[statusValue] || 'Unknown'}
          </span>
        );
      },
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Tenant) => (
        <Space size="middle">
          <Tooltip title="View Details">
            <div
              className="flex items-center justify-center w-7 h-7 bg-white shadow-sm rounded-md cursor-pointer hover:bg-blue-50"
              onClick={() => onView(record)}
            >
              <EyeOutlined style={{ color: "black" }} />
            </div>
          </Tooltip>
          {record.status === 'suspended' ? (
            <Tooltip title="Activate">
              <div
                className="flex items-center justify-center w-7 h-7 bg-white shadow-sm rounded-md cursor-pointer hover:bg-blue-50"
                onClick={() => onActivate(record.id)}
              >
                <PlayCircleOutlined style={{ color: '#52c41a' }} />
              </div>
            </Tooltip>
          ) : (
            <Tooltip title="Suspend">
              <div
                className="flex items-center justify-center w-7 h-7 bg-white shadow-sm rounded-md cursor-pointer hover:bg-blue-50"
                onClick={() => onSuspend(record.id)}
              >
                <PauseCircleOutlined style={{ color: '#faad14' }} />
              </div>
            </Tooltip>
          )}
          <Tooltip title="Delete">
            <Popconfirm
              title="Delete Tenant"
              description="Are you sure you want to permanently delete this tenant and all their data?"
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
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      pagination={{
        ...pagination,
        total,
        showSizeChanger: true,
      }}
      onChange={onTableChange}
    />
  );
};

export default TenantsTable;
