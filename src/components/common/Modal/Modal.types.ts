import type { CSSProperties } from "react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  footer?: React.ReactNode;
  style?: CSSProperties;
  content?:React.ReactNode;
  icon?:React.ReactNode;
  onOk: () => void;
}

export interface ConfirmModalProps extends Omit<ModalProps, 'children'> {
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
  onConfirm: () => void;
}

export interface FormModalProps extends ModalProps {
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  submitText?: string;
  cancelText?: string;
}

export interface DetailModalProps extends Omit<ModalProps, 'children' | 'onOk'> {
  //data: Record<string, string>;
  tabs?: Array<{
    id: string;
    label: string;
    content: React.ReactNode;
  }>;
}

export interface ImageModalProps extends Omit<ModalProps, "children" | "onOk"> {
  src: string;
  alt?: string;
  allowDownload?: boolean;
}

export interface DrawerProps extends Omit<ModalProps, 'size' | 'children' | 'onOk'> {
  position: 'left' | 'right';
  width?: string | number;
}

export interface BottomSheetProps extends Omit<ModalProps, 'onOk' | 'children'> {
  snapPoints?: Array<number | string>;
  defaultSnap?: number | string;
  enableSwipeToClose?: boolean;
}

export interface FullScreenModalProps extends Omit<ModalProps, "children" | "onOk">{
  backgroundColor?: string,

}