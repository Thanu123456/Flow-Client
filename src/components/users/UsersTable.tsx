import React from 'react';
import { Table, Tag, Button, Space, Tooltip, Popconfirm, Avatar, Checkbox } from 'antd';
import { EditOutlined, DeleteOutlined, KeyOutlined, UserOutlined, EyeOutlined } from '@ant-design/icons';
import type { User } from '../../types/entities/user.types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface Props {
  data: User[];
  loading: boolean;
  selectedRowKeys: string[];
  onSelectChange: (keys: string[]) => void;
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  onResetPIN: (user: User) => void;
  onView: (user: User) => void;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
}

const UsersTable: React.FC<Props> = ({
  data,
  loading,
  selectedRowKeys,
  onSelectChange,
  onEdit,
  onDelete,
  onResetPIN,
  onView,
  pagination,
}) => {
  const columns = [
    {
      title: 'User',
      key: 'user',
      render: (_: any, record: User) => (
        <Space>
          <Avatar src={record.profileImageUrl} icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 'bold' }}>{record.fullName}</div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'User ID',
      dataIndex: 'userId',
      key: 'userId',
      render: (userId: string) => userId || '-',
    },
    {
      title: 'Role',
      dataIndex: 'roleName',
      key: 'roleName',
      render: (role: string, record: User) => role || (record.userType === 'owner' ? 'Owner' : 'No Role'),
    },
    {
      title: 'Kiosk',
      dataIndex: 'kioskEnabled',
      key: 'kioskEnabled',
      render: (enabled: boolean) => (
        <Tag color={enabled ? 'cyan' : 'default'}>
          {enabled ? 'Enabled' : 'Disabled'}
        </Tag>
      ),
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      render: (date: string) => date ? dayjs(date).fromNow() : 'Never',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          active: 'green',
          inactive: 'orange',
          locked: 'red',
          pending: 'blue',
        };
        return (
          <Tag color={colorMap[status] || 'default'}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Tag>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: User) => (
        <Space size="middle">
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => onView(record)}
            />
          </Tooltip>
          {record.userType !== 'owner' && (
            <>
              {record.kioskEnabled && (
                <Tooltip title="Reset PIN">
                  <Button
                    type="text"
                    icon={<KeyOutlined />}
                    onClick={() => onResetPIN(record)}
                  />
                </Tooltip>
              )}
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

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => onSelectChange(keys as string[]),
    getCheckboxProps: (record: User) => ({
      disabled: record.userType === 'owner',
    }),
  };

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      rowSelection={rowSelection}
      pagination={pagination ? {
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
        onChange: pagination.onChange,
        showSizeChanger: true,
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`,
      } : false}
    />
  );
};

export default UsersTable;
