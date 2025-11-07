import { Alert as AntdAlert } from 'antd';
import type { AlertProps } from './Alert.types';

export const Alert = ({
  type,
  message,
  description,
  closable = true,
  showIcon = true,
  onClose,
  className,
  action,
}: AlertProps) => {
  return (
    <AntdAlert
      type={type}
      message={message}
      description={description}
      closable={closable}
      showIcon={showIcon}
      onClose={onClose}
      className={className}
      action={action}
    />
  );
};