import { Tag, Button, Space, Tooltip, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { CommonTable } from '../common/Table';
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
    <CommonTable<Role>
      columns={columns as any}
      dataSource={data}
      rowKey="id"
      loading={loading}
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

export default RolesTable;
