import React from 'react';
import { Modal, Tag, Typography, Card, Empty, Space } from 'antd';
import type { Role } from '../../types/entities/role.types';

const { Text } = Typography;

interface ViewPermissionsModalProps {
  visible: boolean;
  role: Role | null;
  onClose: () => void;
}

const ViewPermissionsModal: React.FC<ViewPermissionsModalProps> = ({
  visible,
  role,
  onClose,
}) => {
  const getModuleIcon = (moduleName: string) => {
    const icons: Record<string, string> = {
      dashboard: '📊',
      pos: '🛒',
      inventory: '📦',
      sales: '🛍️',
      purchases: '📥',
      customers: '👥',
      suppliers: '🚚',
      reports: '📊',
      settings: '⚙️',
      users: '👤',
    };
    return icons[moduleName.toLowerCase()] || '📋';
  };

  // Group permissions by module
  const permissionsByModule = role?.permissions.reduce((acc, permission) => {
    const module = permission.module;
    if (!acc[module]) {
      acc[module] = [];
    }
    acc[module].push(permission);
    return acc;
  }, {} as Record<string, typeof role.permissions>) || {};

  const moduleNames = Object.keys(permissionsByModule).sort();

  return (
    <Modal
      title={
        <Space>
          <span>Permissions for</span>
          <Text strong>{role?.name}</Text>
          {role?.isSystem && <Tag color="blue">System Role</Tag>}
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      {!role?.permissions.length ? (
        <Empty description="No permissions assigned to this role" />
      ) : (
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {moduleNames.map((module) => (
            <Card
              key={module}
              size="small"
              style={{ marginBottom: 8 }}
              title={
                <Space>
                  <span>{getModuleIcon(module)}</span>
                  <Text strong style={{ textTransform: 'capitalize' }}>
                    {module.replace(/_/g, ' ')}
                  </Text>
                  <Tag>{permissionsByModule[module].length}</Tag>
                </Space>
              }
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {permissionsByModule[module].map((permission) => (
                  <Tag key={permission.id} color="green">
                    {permission.name}
                  </Tag>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <Text type="secondary">
          Total: {role?.permissions.length || 0} permissions across {moduleNames.length} modules
        </Text>
      </div>
    </Modal>
  );
};

export default ViewPermissionsModal;
