import React from 'react';
import { Table, Button, Space, Tooltip } from 'antd';
import { EyeOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import type { Registration } from '../../../types/auth/superadmin.types';
import dayjs from 'dayjs';

interface Props {
  data: Registration[];
  loading: boolean;
  onView: (registration: Registration) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  total: number;
  pagination: { current: number; pageSize: number };
  onTableChange: (pagination: any) => void;
}

const PendingRegistrationsTable: React.FC<Props> = ({
  data,
  loading,
  onView,
  onApprove,
  onReject,
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
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string | undefined) => {
        const statusValue = status || 'pending';
        const styleMap: Record<string, string> = {
          approved: 'border-green-500 text-green-500 bg-green-50/70',
          pending: 'border-orange-500 text-orange-500 bg-orange-50/70',
          rejected: 'border-red-500 text-red-500 bg-red-50/70'
        };
        const labelMap: Record<string, string> = {
          approved: 'Approved',
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
      title: 'Applied At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Registration) => (
        <Space size="middle">
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => onView(record)}
            />
          </Tooltip>
          <Tooltip title="Approve">
            <Button
              type="text"
              icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              onClick={() => onApprove(record.id)}
            />
          </Tooltip>
          <Tooltip title="Reject">
            <Button
              type="text"
              icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
              onClick={() => onReject(record.id)}
            />
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

export default PendingRegistrationsTable;
