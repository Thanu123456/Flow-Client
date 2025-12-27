import React from 'react';
import { Table, Tag, Button, Space, Tooltip, Popconfirm, Avatar } from 'antd';
import { EditOutlined, DeleteOutlined, KeyOutlined, UserOutlined } from '@ant-design/icons';
import type { User } from '../../types/entities/user.types';

interface Props {
  data: User[];
  loading: boolean;
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  onResetPIN: (id: string) => void;
}

const UsersTable: React.FC<Props> = ({ 
  data, 
  loading, 
  onEdit, 
  onDelete, 
  onResetPIN 
}) => {
  const columns = [
    {
      title: 'User',
      key: 'user',
      render: (_: any, record: User) => (
        <Space>
          <Avatar src={record.profile_image_url} icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 'bold' }}>{record.full_name}</div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role_name',
      key: 'role_name',
      render: (role: string, record: User) => role || (record.user_type === 'owner' ? 'Owner' : 'No Role'),
    },
    {
      title: 'Kiosk',
      dataIndex: 'kiosk_enabled',
      key: 'kiosk_enabled',
      render: (enabled: boolean) => (
        <Tag color={enabled ? 'cyan' : 'default'}>
          {enabled ? 'ENABLED' : 'DISABLED'}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : status === 'locked' ? 'red' : 'orange'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: User) => (
        <Space size="middle">
          {record.user_type !== 'owner' && (
            <>
              <Tooltip title="Reset PIN">
                <Button 
                    type="text" 
                    icon={<KeyOutlined />} 
                    onClick={() => onResetPIN(record.id)} 
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
                    title="Delete User"
                    description="Are you sure you want to delete this user?"
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
            </>
          )}
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
      pagination={false}
    />
  );
};

export default UsersTable;
