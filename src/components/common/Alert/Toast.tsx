import React, { createContext, useContext } from 'react';
import { notification } from 'antd';
import type { ToastProps, ToastConfig } from './Alert.types';

interface ToastContextType {
  showToast: (props: ToastProps) => void;
  showSuccess: (message: string, description?: string) => void;
  showError: (message: string, description?: string) => void;
  showWarning: (message: string, description?: string) => void;
  showInfo: (message: string, description?: string) => void;
  closeToast: (key: string) => void;
  destroyAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
  config?: ToastConfig;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children, config }) => {
  const [api, contextHolder] = notification.useNotification(config);

  const showToast = ({
    type,
    message,
    description,
    duration,
    onClose,
    placement,
    key,
  }: ToastProps) => {
    return api[type]({
      message,
      description,
      duration,
      onClose,
      placement,
      key,
    });
  };

  const showSuccess = (message: string, description?: string) => {
    return showToast({ type: 'success', message, description });
  };

  const showError = (message: string, description?: string) => {
    return showToast({ type: 'error', message, description });
  };

  const showWarning = (message: string, description?: string) => {
    return showToast({ type: 'warning', message, description });
  };

  const showInfo = (message: string, description?: string) => {
    return showToast({ type: 'info', message, description });
  };

  const closeToast = (key: string) => {
    api.destroy(key);
  };

  const destroyAll = () => {
    api.destroy();
  };

  const value = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    closeToast,
    destroyAll,
  };

  return (
    <ToastContext.Provider value={value}>
      {contextHolder}
      {children}
    </ToastContext.Provider>
  );
};

// Standalone toast functions for use without provider
export const toast = {
  success: (message: string, description?: string, options?: Partial<ToastProps>) => {
    return notification.success({
      message,
      description,
      ...options,
    });
  },
  error: (message: string, description?: string, options?: Partial<ToastProps>) => {
    return notification.error({
      message,
      description,
      ...options,
    });
  },
  warning: (message: string, description?: string, options?: Partial<ToastProps>) => {
    return notification.warning({
      message,
      description,
      ...options,
    });
  },
  info: (message: string, description?: string, options?: Partial<ToastProps>) => {
    return notification.info({
      message,
      description,
      ...options,
    });
  },
  open: (props: ToastProps) => {
    return notification.open(props);
  },
  destroy: (key?: string) => {
    if (key) {
      notification.destroy(key);
    } else {
      notification.destroy();
    }
  },
};