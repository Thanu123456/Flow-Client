import type { ButtonProps as AntButtonProps } from "antd";
import type { ReactNode } from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "ghost"
  | "success"
  | "link";

export type ButtonSize = "small" | "medium" | "large";

// Fix: Omit 'variant' along with 'type' and 'size'
export interface BaseButtonProps
  extends Omit<AntButtonProps, "type" | "size" | "variant"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  children?: ReactNode;
}

export interface IconButtonProps extends Omit<BaseButtonProps, "children"> {
  icon: ReactNode;
  tooltip?: string;
  shape?: "circle" | "default";
}

export interface ActionButtonProps extends BaseButtonProps {
  dropdownItems?: DropdownItem[];
}

export interface FABProps extends Omit<BaseButtonProps, "children"> {
  icon: ReactNode;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  tooltip?: string;
}

export interface DropdownItem {
  key: string;
  label: string;
  icon?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}
