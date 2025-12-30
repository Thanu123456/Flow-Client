import React from 'react';
import { Table, Tag, Button, Space, Tooltip, Popconfirm } from 'antd';
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
        const colorMap: Record<string, string> = {
          active: 'green',
          suspended: 'red',
          pending: 'orange',
          rejected: 'red'
        };
        return (
          <Tag color={colorMap[statusValue] || 'default'}>
            {statusValue.toUpperCase()}
          </Tag>
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
            <Button 
                type="text" 
                icon={<EyeOutlined />} 
                onClick={() => onView(record)} 
            />
          </Tooltip>
          {record.status === 'suspended' ? (
             <Tooltip title="Activate">
                <Button 
                    type="text" 
                    icon={<PlayCircleOutlined style={{ color: '#52c41a' }} />} 
                    onClick={() => onActivate(record.id)} 
                />
             </Tooltip>
          ) : (
            <Tooltip title="Suspend">
                <Button 
                    type="text" 
                    icon={<PauseCircleOutlined style={{ color: '#faad14' }} />} 
                    onClick={() => onSuspend(record.id)} 
                />
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
