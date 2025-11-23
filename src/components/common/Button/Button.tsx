import React from "react";
import { Button as AntButton, Tooltip } from "antd";
import type { CommonButtonProps } from "./Button.types";

const CommonButton: React.FC<CommonButtonProps> = ({
  tooltip,
  tooltipPlacement = "top",
  children,
  ...restProps
}) => {
  const button = <AntButton {...restProps}>{children}</AntButton>;

  if (tooltip) {
    return (
      <Tooltip title={tooltip} placement={tooltipPlacement}>
        {button}
      </Tooltip>
    );
  }

  return button;
};

export default CommonButton;
