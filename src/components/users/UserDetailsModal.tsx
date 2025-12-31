import React from 'react';
import {
  Modal,
  Descriptions,
  Tag,
  Avatar,
  Space,
  Typography,
  Divider,
} from 'antd';
import { UserOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import type { User } from '../../types/entities/user.types';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

interface UserDetailsModalProps {
  visible: boolean;
  user: User | null;
  onClose: () => void;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  visible,
  user,
  onClose,
}) => {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'green',
      inactive: 'default',
      locked: 'red',
      pending: 'orange',
    };
    return colors[status] || 'default';
  };

  const getUserTypeColor = (userType: string) => {
    const colors: Record<string, string> = {
      super_admin: 'purple',
      owner: 'blue',
      employee: 'cyan',
    };
    return colors[userType] || 'default';
  };

  const formatDate = (date?: string) => {
    if (!date) return 'Never';
    return dayjs(date).format('MMM DD, YYYY hh:mm A');
  };

  if (!user) return null;

  return (
    <Modal
      title={
        <Space>
          <Avatar
            size={40}
            src={user.profileImageUrl}
            icon={!user.profileImageUrl && <UserOutlined />}
          />
          <div>
            <Title level={5} style={{ margin: 0 }}>
              {user.fullName}
            </Title>
            <Text type="secondary">{user.email}</Text>
          </div>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Divider orientation="left">Account Information</Divider>
      <Descriptions column={2} size="small">
        <Descriptions.Item label="User ID">
          {user.userId || <Text type="secondary">Not set</Text>}
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color={getStatusColor(user.status)}>
            {user.status.toUpperCase()}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="User Type">
          <Tag color={getUserTypeColor(user.userType)}>
            {user.userType.replace('_', ' ').toUpperCase()}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Email Verified">
          {user.emailVerified ? (
            <Tag icon={<CheckCircleOutlined />} color="success">
              Verified
            </Tag>
          ) : (
            <Tag icon={<CloseCircleOutlined />} color="warning">
              Not Verified
            </Tag>
          )}
        </Descriptions.Item>
      </Descriptions>

      <Divider orientation="left">Role & Access</Divider>
      <Descriptions column={2} size="small">
        <Descriptions.Item label="Role">
          <Tag color="blue">{user.roleName || 'No role assigned'}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Warehouse">
          {user.warehouseName || <Text type="secondary">Not assigned</Text>}
        </Descriptions.Item>
        <Descriptions.Item label="Max Discount">
          {user.maxDiscountPercent !== undefined
            ? `${user.maxDiscountPercent}%`
            : <Text type="secondary">Not set</Text>}
        </Descriptions.Item>
        <Descriptions.Item label="Kiosk Access">
          {user.kioskEnabled ? (
            <Tag color="green">Enabled</Tag>
          ) : (
            <Tag color="default">Disabled</Tag>
          )}
        </Descriptions.Item>
      </Descriptions>

      <Divider orientation="left">Contact Information</Divider>
      <Descriptions column={2} size="small">
        <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
        <Descriptions.Item label="Phone">
          {user.phone || <Text type="secondary">Not provided</Text>}
        </Descriptions.Item>
      </Descriptions>

      <Divider orientation="left">Security Status</Divider>
      <Descriptions column={2} size="small">
        <Descriptions.Item label="Must Change Password">
          {user.mustChangePassword ? (
            <Tag color="warning">Yes</Tag>
          ) : (
            <Tag color="success">No</Tag>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Must Change PIN">
          {user.mustChangePin ? (
            <Tag color="warning">Yes</Tag>
          ) : (
            <Tag color="success">No</Tag>
          )}
        </Descriptions.Item>
      </Descriptions>

      <Divider orientation="left">Activity</Divider>
      <Descriptions column={2} size="small">
        <Descriptions.Item label="Last Login">
          {formatDate(user.lastLoginAt)}
        </Descriptions.Item>
        <Descriptions.Item label="Created">
          {formatDate(user.createdAt)}
        </Descriptions.Item>
        <Descriptions.Item label="Last Updated">
          {formatDate(user.updatedAt)}
        </Descriptions.Item>
      </Descriptions>

      {user.permissions && user.permissions.length > 0 && (
        <>
          <Divider orientation="left">Permissions</Divider>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {user.permissions.map((permission) => (
              <Tag key={permission} color="geekblue">
                {permission}
              </Tag>
            ))}
          </div>
        </>
      )}
    </Modal>
  );
};

export default UserDetailsModal;
