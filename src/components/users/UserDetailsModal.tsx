import {
  Modal,
  Descriptions,
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
  const getStatusStyle = (status: string) => {
    const styles: Record<string, string> = {
      active: 'border-green-500 text-green-500 bg-green-50/70',
      inactive: 'border-gray-500 text-gray-500 bg-gray-50/70',
      locked: 'border-red-500 text-red-500 bg-red-50/70',
      pending: 'border-orange-500 text-orange-500 bg-orange-50/70',
    };
    return styles[status] || 'border-gray-500 text-gray-500 bg-gray-50/70';
  };

  const getUserTypeStyle = (userType: string) => {
    const styles: Record<string, string> = {
      super_admin: 'border-purple-500 text-purple-500 bg-purple-50/70',
      owner: 'border-blue-500 text-blue-500 bg-blue-50/70',
      employee: 'border-cyan-500 text-cyan-600 bg-cyan-50/70',
    };
    return styles[userType] || 'border-gray-500 text-gray-500 bg-gray-50/70';
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
          <span
            className={`px-3 py-1 rounded-lg text-sm border ${getStatusStyle(user.status || '')}`}
          >
            {(user.status || '').charAt(0).toUpperCase() + (user.status || '').slice(1)}
          </span>
        </Descriptions.Item>
        <Descriptions.Item label="User Type">
          <span
            className={`px-3 py-1 rounded-lg text-sm border ${getUserTypeStyle(user.userType || '')}`}
          >
            {(user.userType || '').replace(/_/g, ' ').charAt(0).toUpperCase() + (user.userType || '').replace(/_/g, ' ').slice(1)}
          </span>
        </Descriptions.Item>
        <Descriptions.Item label="Email Verified">
          {user.emailVerified ? (
            <span className="px-3 py-1 rounded-lg text-sm border border-green-500 text-green-500 bg-green-50/70 inline-flex items-center gap-1">
              <CheckCircleOutlined size={12} /> Verified
            </span>
          ) : (
            <span className="px-3 py-1 rounded-lg text-sm border border-orange-500 text-orange-500 bg-orange-50/70 inline-flex items-center gap-1">
              <CloseCircleOutlined size={12} /> Not Verified
            </span>
          )}
        </Descriptions.Item>
      </Descriptions>

      <Divider orientation="left">Role & Access</Divider>
      <Descriptions column={2} size="small">
        <Descriptions.Item label="Role">
          <span className="px-3 py-1 rounded-lg text-sm border border-blue-500 text-blue-500 bg-blue-50/70">
            {user.roleName || 'No role assigned'}
          </span>
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
            <span className="px-3 py-1 rounded-lg text-sm border border-green-500 text-green-500 bg-green-50/70">
              Enabled
            </span>
          ) : (
            <span className="px-3 py-1 rounded-lg text-sm border border-gray-400 text-gray-500 bg-gray-50/70">
              Disabled
            </span>
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
            <span className="px-3 py-1 rounded-lg text-sm border border-orange-500 text-orange-500 bg-orange-50/70">
              Yes
            </span>
          ) : (
            <span className="px-3 py-1 rounded-lg text-sm border border-green-500 text-green-500 bg-green-50/70">
              No
            </span>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Must Change PIN">
          {user.mustChangePin ? (
            <span className="px-3 py-1 rounded-lg text-sm border border-orange-500 text-orange-500 bg-orange-50/70">
              Yes
            </span>
          ) : (
            <span className="px-3 py-1 rounded-lg text-sm border border-green-500 text-green-500 bg-green-50/70">
              No
            </span>
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
              <span key={permission} className="px-3 py-1 rounded-lg text-sm border border-blue-500 text-blue-500 bg-blue-50/70">
                {permission}
              </span>
            ))}
          </div>
        </>
      )}
    </Modal>
  );
};

export default UserDetailsModal;
