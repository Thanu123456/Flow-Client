import React, { useEffect, useState } from 'react';
import { Modal, Table, Tag, Empty, Spin, Typography, Space } from 'antd';
import type { User } from '../../types/entities/user.types';
import { userService } from '../../services/management/userService';
import dayjs from 'dayjs';

const { Text } = Typography;

interface ActivityLogEntry {
  id: string;
  action: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

interface UserActivityLogProps {
  visible: boolean;
  user: User | null;
  onClose: () => void;
}

const UserActivityLog: React.FC<UserActivityLogProps> = ({
  visible,
  user,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    if (visible && user) {
      fetchActivities(1, 10);
    }
  }, [visible, user]);

  const fetchActivities = async (page: number, pageSize: number) => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await userService.getUserActivity(user.id, {
        page,
        limit: pageSize,
      });
      setActivities(response.data);
      setPagination({
        current: response.page,
        pageSize: response.limit,
        total: response.total,
      });
    } catch (error) {
      console.error('Failed to fetch user activity:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (paginationConfig: any) => {
    fetchActivities(paginationConfig.current, paginationConfig.pageSize);
  };

  const getActionColor = (action: string) => {
    const colorMap: Record<string, string> = {
      login: 'green',
      logout: 'orange',
      login_failed: 'red',
      password_changed: 'blue',
      pin_changed: 'blue',
      pin_reset: 'purple',
      profile_updated: 'cyan',
      created: 'green',
      deleted: 'red',
      role_changed: 'purple',
    };
    return colorMap[action.toLowerCase()] || 'default';
  };

  const formatAction = (action: string) => {
    return action
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const columns = [
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 150,
      render: (action: string) => (
        <Tag color={getActionColor(action)}>{formatAction(action)}</Tag>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'IP Address',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 140,
      render: (ip: string) => ip || <Text type="secondary">-</Text>,
    },
    {
      title: 'Date & Time',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => dayjs(date).format('MMM DD, YYYY hh:mm A'),
    },
  ];

  if (!user) return null;

  return (
    <Modal
      title={
        <Space>
          <span>Activity Log for</span>
          <Text strong>{user.fullName}</Text>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      {loading && activities.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin size="large" />
        </div>
      ) : activities.length === 0 ? (
        <Empty description="No activity logs found" />
      ) : (
        <Table
          columns={columns}
          dataSource={activities}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} activities`,
          }}
          onChange={handleTableChange}
          size="small"
        />
      )}
    </Modal>
  );
};

export default UserActivityLog;
