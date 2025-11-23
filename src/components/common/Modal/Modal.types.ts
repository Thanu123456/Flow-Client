import type { ModalProps } from "antd";
import type { FormInstance } from "antd";
import type { ReactNode } from "react";

export interface BaseModalProps extends Omit<ModalProps, "onOk"> {
  visible: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
  loading?: boolean;
}

export interface AddModalProps<T = any> extends BaseModalProps {
  title?: string;
  onSubmit: (values: any) => Promise<void>;
  width?: number;
  children?: ReactNode | ((form: FormInstance) => ReactNode);
  initialValues?: Partial<T>;
  form?: FormInstance;
  submitButtonText?: string;
  cancelButtonText?: string;
}

export interface EditModalProps<T = any> extends BaseModalProps {
  title?: string;
  data: T | null;
  onSubmit: (values: any, originalData: T) => Promise<void>;
  width?: number;
  children?: ReactNode | ((form: FormInstance, data: T | null) => ReactNode);
  form?: FormInstance;
  submitButtonText?: string;
  cancelButtonText?: string;
  mapDataToForm?: (data: T) => any;
}

export interface DeleteModalProps<T = any> extends BaseModalProps {
  title?: string;
  data: T | null;
  onDelete: (data: T) => Promise<void>;
  okText?: string;
  cancelText?: string;
  renderContent?: (data: T | null) => ReactNode;
  getImageUrl?: (data: T | null) => string | undefined;
  getName?: (data: T | null) => string | undefined;
  customMessage?: ReactNode;
}

export interface ConfirmModalProps<T = any> extends BaseModalProps {
  title?: string;
  data: T | null;
  onConfirm: (data: T) => Promise<void>;
  okText?: string;
  cancelText?: string;
  renderContent?: (data: T | null) => ReactNode;
  customMessage?: ReactNode;
  confirmType?: "success" | "warning" | "info";
}
