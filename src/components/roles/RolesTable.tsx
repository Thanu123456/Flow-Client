import React from 'react';
import { Table, Tag, Button, Space, Tooltip, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, KeyOutlined } from '@ant-design/icons';
import type { Role } from '../../types/entities/role.types';

interface Props {
  data: Role[];
  loading: boolean;
  onEdit: (role: Role) => void;
  onDelete: (id: string) => void;
  onManagePermissions: (role: Role) => void;
}

const RolesTable: React.FC<Props> = ({ 
  data, 
  loading, 
  onEdit, 
  onDelete, 
  onManagePermissions 
}) => {
  const columns = [
    {
      title: 'Role Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Role) => (
        <Space>
          {text}
          {record.is_system && <Tag color="blue">System</Tag>}
        </Space>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Users',
      dataIndex: 'user_count',
      key: 'user_count',
      render: (count: number) => count || 0,
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'ACTIVE' : 'INACTIVE'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Role) => (
        <Space size="middle">
          <Tooltip title="Manage Permissions">
            <Button 
                type="text" 
                icon={<KeyOutlined />} 
                onClick={() => onManagePermissions(record)} 
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button 
                type="text" 
                icon={<EditOutlined />} 
                onClick={() => onEdit(record)} 
                disabled={record.is_system}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
                title="Delete Role"
                description="Are you sure you want to delete this role?"
                onConfirm={() => onDelete(record.id)}
                disabled={record.is_system || (record.user_count || 0) > 0}
                okText="Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
            >
                <Button 
                    type="text" 
                    icon={<DeleteOutlined style={{ color: record.is_system || (record.user_count || 0) > 0 ? undefined : '#ff4d4f' }} />} 
                    disabled={record.is_system || (record.user_count || 0) > 0}
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
      pagination={false}
    />
  );
};

export default RolesTable;
