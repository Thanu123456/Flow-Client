import React from 'react';
import { Table, Tag, Button, Space, Tooltip, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, KeyOutlined, EyeOutlined } from '@ant-design/icons';
import type { Role } from '../../types/entities/role.types';

interface Props {
  data: Role[];
  loading: boolean;
  onEdit: (role: Role) => void;
  onDelete: (id: string) => void;
  onViewPermissions: (role: Role) => void;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
}

const RolesTable: React.FC<Props> = ({
  data,
  loading,
  onEdit,
  onDelete,
  onViewPermissions,
  pagination,
}) => {
  const columns = [
    {
      title: 'Role Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Role) => (
        <Space>
          {text}
          {record.isSystem && <Tag color="blue">System</Tag>}
        </Space>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => text || '-',
    },
    {
      title: 'Users',
      dataIndex: 'userCount',
      key: 'userCount',
      render: (count: number) => count || 0,
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
      render: (_: any, record: Role) => (
        <Space size="middle">
          <Tooltip title="View Permissions">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => onViewPermissions(record)}
            />
          </Tooltip>
          <Tooltip title={record.isSystem ? "System roles cannot be edited" : "Edit"}>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
              disabled={record.isSystem}
            />
          </Tooltip>
          <Tooltip title={
            record.isSystem
              ? "System roles cannot be deleted"
              : record.userCount > 0
                ? "Cannot delete role with assigned users"
                : "Delete"
          }>
            <Popconfirm
              title="Delete Role"
              description="Are you sure you want to delete this role?"
              onConfirm={() => onDelete(record.id)}
              disabled={record.isSystem || record.userCount > 0}
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="text"
                icon={<DeleteOutlined style={{ color: record.isSystem || record.userCount > 0 ? undefined : '#ff4d4f' }} />}
                disabled={record.isSystem || record.userCount > 0}
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
      pagination={pagination ? {
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
        onChange: pagination.onChange,
        showSizeChanger: true,
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} roles`,
      } : false}
    />
  );
};

export default RolesTable;
