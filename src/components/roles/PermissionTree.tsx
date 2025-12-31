import React from 'react';
import { Checkbox, Typography, Card } from 'antd';
import type { PermissionModule } from '../../types/entities/role.types';

const { Text } = Typography;

interface PermissionTreeProps {
  permissionModules: PermissionModule[];
  selectedPermissionIds: string[];
  onChange: (selectedIds: string[]) => void;
  disabled?: boolean;
}

const PermissionTree: React.FC<PermissionTreeProps> = ({
  permissionModules,
  selectedPermissionIds,
  onChange,
  disabled = false,
}) => {
  const handleModuleSelectAll = (module: PermissionModule, checked: boolean) => {
    const modulePermissionIds = module.permissions.map(p => p.id);
    if (checked) {
      const newSelected = [...new Set([...selectedPermissionIds, ...modulePermissionIds])];
      onChange(newSelected);
    } else {
      const newSelected = selectedPermissionIds.filter(id => !modulePermissionIds.includes(id));
      onChange(newSelected);
    }
  };

  const handlePermissionToggle = (permissionId: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedPermissionIds, permissionId]);
    } else {
      onChange(selectedPermissionIds.filter(id => id !== permissionId));
    }
  };

  const isModuleFullySelected = (module: PermissionModule) => {
    return module.permissions.every(p => selectedPermissionIds.includes(p.id));
  };

  const isModulePartiallySelected = (module: PermissionModule) => {
    const hasSelected = module.permissions.some(p => selectedPermissionIds.includes(p.id));
    const hasUnselected = module.permissions.some(p => !selectedPermissionIds.includes(p.id));
    return hasSelected && hasUnselected;
  };

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

  return (
    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
      {permissionModules.map((module) => (
        <Card
          key={module.module}
          size="small"
          style={{ marginBottom: 8 }}
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Checkbox
                checked={isModuleFullySelected(module)}
                indeterminate={isModulePartiallySelected(module)}
                onChange={(e) => handleModuleSelectAll(module, e.target.checked)}
                disabled={disabled}
              />
              <span>{getModuleIcon(module.module)}</span>
              <Text strong style={{ textTransform: 'capitalize' }}>
                {module.module.replace(/_/g, ' ')}
              </Text>
            </div>
          }
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {module.permissions.map((permission) => (
              <Checkbox
                key={permission.id}
                checked={selectedPermissionIds.includes(permission.id)}
                onChange={(e) => handlePermissionToggle(permission.id, e.target.checked)}
                disabled={disabled}
                style={{ marginLeft: 24 }}
              >
                <span title={permission.description}>{permission.name}</span>
              </Checkbox>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default PermissionTree;
