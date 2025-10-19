export type AlertType = 'success' | 'info' | 'warning' | 'error';

export interface AlertProps {
  type: AlertType;
  message: string;
  description?: string;
  closable?: boolean;
  showIcon?: boolean;
  onClose?: () => void;
  className?: string;
  action?: React.ReactNode;
}

export interface ToastProps {
  type: AlertType;
  message: string;
  description?: string;
  duration?: number;
  onClose?: () => void;
  placement?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'top' | 'bottom';
  key?: string;
}

export interface ToastConfig {
  maxCount?: number;
  top?: number;
  bottom?: number;
  placement?: ToastProps['placement'];
  duration?: number;
}