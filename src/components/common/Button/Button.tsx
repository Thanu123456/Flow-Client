import React from "react";
import { Button as AntButton, Dropdown, Tooltip } from "antd";
import { DownOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import type {
  BaseButtonProps,
  IconButtonProps,
  ActionButtonProps,
  FABProps,
} from "./Button.types";

// Variant to Ant Design type mapping
const getAntButtonType = (variant?: string) => {
  switch (variant) {
    case "primary":
      return "primary";
    case "danger":
      return "primary";
    case "ghost":
      return "text";
    case "link":
      return "link";
    case "secondary":
    default:
      return "default";
  }
};

// Get button classes based on variant
const getVariantClasses = (variant?: string, disabled?: boolean) => {
  if (disabled) return "";

  switch (variant) {
    case "danger":
      return "bg-red-600 hover:bg-red-700 border-red-600 hover:border-red-700 text-white";
    case "success":
      return "bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700 text-white";
    case "secondary":
      return "border-gray-300 hover:border-blue-500 hover:text-blue-500";
    case "ghost":
      return "hover:text-blue-500";
    default:
      return "";
  }
};

// Get size classes
const getSizeClasses = (size?: string) => {
  switch (size) {
    case "small":
      return "text-xs px-2 py-1";
    case "large":
      return "text-base px-6 py-2 h-12";
    default:
      return "text-sm px-4 py-2";
  }
};

// Base Button Component
export const Button: React.FC<BaseButtonProps> = ({
  variant = "primary",
  size = "medium",
  fullWidth = false,
  className = "",
  disabled,
  children,
  ...props
}) => {
  const antType = getAntButtonType(variant);
  const variantClasses = getVariantClasses(variant, disabled);
  const sizeClasses = getSizeClasses(size);
  const widthClass = fullWidth ? "w-full" : "";

  return (
    <AntButton
      type={antType as any}
      disabled={disabled}
      className={`
        ${variantClasses} 
        ${sizeClasses} 
        ${widthClass} 
        ${className}
        transition-all duration-200 font-medium
      `.trim()}
      {...props}
    >
      {children}
    </AntButton>
  );
};

// Primary Button
export const PrimaryButton: React.FC<BaseButtonProps> = (props) => (
  <Button variant="primary" {...props} />
);

// Secondary Button
export const SecondaryButton: React.FC<BaseButtonProps> = (props) => (
  <Button variant="secondary" {...props} />
);

// Danger Button
export const DangerButton: React.FC<BaseButtonProps> = (props) => (
  <Button variant="danger" {...props} />
);

// Success Button
export const SuccessButton: React.FC<BaseButtonProps> = (props) => (
  <Button variant="success" {...props} />
);

// Ghost Button
export const GhostButton: React.FC<BaseButtonProps> = (props) => (
  <Button variant="ghost" {...props} />
);

// Link Button
export const LinkButton: React.FC<BaseButtonProps> = (props) => (
  <Button variant="link" {...props} />
);

// Icon Button
export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  tooltip,
  shape = "default",
  size = "medium",
  className = "",
  ...props
}) => {
  const button = (
    <Button
      size={size}
      icon={icon}
      className={`
        ${shape === "circle" ? "rounded-full" : ""} 
        ${className}
        flex items-center justify-center
      `.trim()}
      {...props}
    />
  );

  return tooltip ? <Tooltip title={tooltip}>{button}</Tooltip> : button;
};

// Loading Button (same as base button with loading prop)
export const LoadingButton: React.FC<BaseButtonProps> = (props) => (
  <Button {...props} />
);

// Action Button with Dropdown
export const ActionButton: React.FC<ActionButtonProps> = ({
  children = "Actions",
  dropdownItems = [],
  disabled,
  ...props
}) => {
  const menuItems: MenuProps["items"] = dropdownItems.map((item) => ({
    key: item.key,
    label: item.label,
    icon: item.icon,
    danger: item.danger,
    disabled: item.disabled,
    onClick: item.onClick,
  }));

  return (
    <Dropdown
      menu={{ items: menuItems }}
      disabled={disabled}
      trigger={["click"]}
    >
      <Button {...props} disabled={disabled}>
        <div className="flex items-center gap-2">
          {children}
          <DownOutlined className="text-xs" />
        </div>
      </Button>
    </Dropdown>
  );
};

// Floating Action Button
export const FloatingActionButton: React.FC<FABProps> = ({
  icon,
  position = "bottom-right",
  tooltip,
  onClick,
  className = "",
  ...props
}) => {
  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
    "top-right": "top-6 right-6",
    "top-left": "top-6 left-6",
  };

  const button = (
    <Button
      variant="primary"
      onClick={onClick}
      icon={icon}
      className={`
        fixed ${positionClasses[position]} 
        w-14 h-14 rounded-full shadow-lg 
        hover:shadow-xl transform hover:scale-110 
        transition-all duration-200 z-50
        flex items-center justify-center
        ${className}
      `.trim()}
      {...props}
    />
  );

  return tooltip ? <Tooltip title={tooltip}>{button}</Tooltip> : button;
};

// Default export
export default Button;
