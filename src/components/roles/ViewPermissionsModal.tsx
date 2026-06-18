import React, { useState, useEffect } from 'react';
import { Modal, Tag, Typography, Card, Empty, Space, Spin } from 'antd';
import { roleService } from '../../services/management/roleService';
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
  const [freshRole, setFreshRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && role) {
      setLoading(true);
      roleService
        .getRoleById(role.id)
        .then((data) => setFreshRole(data))
        .catch(() => setFreshRole(role))
        .finally(() => setLoading(false));
    } else {
      setFreshRole(null);
    }
  }, [visible, role]);

  const displayRole = freshRole ?? role;

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

  const permissionsByModule =
    displayRole?.permissions.reduce(
      (acc, permission) => {
        const module = permission.module;
        if (!acc[module]) acc[module] = [];
        acc[module].push(permission);
        return acc;
      },
      {} as Record<string, typeof displayRole.permissions>
    ) || {};

  const moduleNames = Object.keys(permissionsByModule).sort();

  return (
    <Modal
      title={
        <Space>
          <span>Permissions for</span>
          <Text strong>{displayRole?.name}</Text>
          {displayRole?.isSystem && <Tag color="blue">System Role</Tag>}
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin />
        </div>
      ) : !displayRole?.permissions.length ? (
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
          Total: {displayRole?.permissions.length || 0} permissions across{' '}
          {moduleNames.length} modules
        </Text>
      </div>
    </Modal>
  );
};

export default ViewPermissionsModal;
