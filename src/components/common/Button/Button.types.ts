import type { ButtonProps } from "antd";
import type { TooltipPlacement } from "antd/es/tooltip";

export interface CommonButtonProps extends ButtonProps {
  tooltip?: string;
  tooltipPlacement?: TooltipPlacement;
}
