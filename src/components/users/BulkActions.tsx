import React from 'react';
import { Dropdown, Button } from 'antd';
import {
  DownOutlined,
  CheckCircleOutlined,
  StopOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';

interface BulkActionsProps {
  selectedCount: number;
  onActivate: () => void;
  onDeactivate: () => void;
  onDelete: () => void;
  disabled?: boolean;
}

const BulkActions: React.FC<BulkActionsProps> = ({
  selectedCount,
  onActivate,
  onDeactivate,
  onDelete,
  disabled = false,
}) => {
  const items: MenuProps['items'] = [
    {
      key: 'activate',
      icon: <CheckCircleOutlined />,
      label: 'Activate Selected',
      onClick: onActivate,
    },
    {
      key: 'deactivate',
      icon: <StopOutlined />,
      label: 'Deactivate Selected',
      onClick: onDeactivate,
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Delete Selected',
      danger: true,
      onClick: onDelete,
    },
  ];

  return (
    <Dropdown
      menu={{ items }}
      disabled={disabled || selectedCount === 0}
      trigger={['click']}
    >
      <Button>
        Bulk Actions ({selectedCount}) <DownOutlined />
      </Button>
    </Dropdown>
  );
};

export default BulkActions;
