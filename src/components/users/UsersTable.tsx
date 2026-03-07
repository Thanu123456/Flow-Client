import { Button, Space, Tooltip, Popconfirm, Avatar, Modal, message } from 'antd';
import { EditOutlined, DeleteOutlined, KeyOutlined, UserOutlined, EyeOutlined, HistoryOutlined, WarningOutlined } from '@ant-design/icons';
import { CommonTable } from '../common/Table';
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
  onViewActivity?: (user: User) => void;
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
  onViewActivity,
  pagination,
}) => {
  const handleBulkDelete = () => {
    Modal.confirm({
      title: "Delete Multiple Users",
      icon: <WarningOutlined style={{ color: "red" }} />,
      content: `Are you sure you want to delete ${selectedRowKeys.length} selected users? This action cannot be undone.`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          message.success(`Successfully deleted ${selectedRowKeys.length} users`);
          onSelectChange([]);
        } catch (error) {
          message.error("Failed to delete users");
        }
      },
    });
  };

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
        <span
          className={`px-3 py-1 rounded-lg text-sm border ${enabled
            ? "border-cyan-500 text-cyan-500 bg-cyan-50/70"
            : "border-gray-300 text-gray-500 bg-gray-50/70"
            }`}
        >
          {enabled ? 'Enabled' : 'Disabled'}
        </span>
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
        const styleMap: Record<string, string> = {
          active: "border-green-500 text-green-500 bg-green-50/70",
          inactive: "border-orange-500 text-orange-500 bg-orange-50/70",
          locked: "border-red-500 text-red-500 bg-red-50/70",
          pending: "border-blue-500 text-blue-500 bg-blue-50/70",
        };
        return (
          <span
            className={`px-3 py-1 rounded-lg text-sm border ${styleMap[status] || "border-gray-300 text-gray-500 bg-gray-50/70"}`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
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
          {onViewActivity && (
            <Tooltip title="Activity Log">
              <Button
                type="text"
                icon={<HistoryOutlined />}
                onClick={() => onViewActivity(record)}
              />
            </Tooltip>
          )}
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

  return (
    <CommonTable<User>
      columns={columns as any}
      dataSource={data}
      rowKey="id"
      loading={loading}
      onBulkDelete={handleBulkDelete}
      bulkDeleteText={`Delete (${selectedRowKeys.length})`}
      rowSelection={{
        selectedRowKeys,
        onChange: (keys: any) => onSelectChange(keys as string[]),
        getCheckboxProps: (record: User) => ({
          disabled: record.userType === 'owner',
        }),
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

export default UsersTable;
