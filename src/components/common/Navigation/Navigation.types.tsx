import type {
  BreadcrumbProps,
} from "antd";

export type NavigationType =
  | "sidebar"
  | "header"
  | "menu"
  | "tabs"
  | "pagination"
  | "breadcrumb"
  | "bottom";

export interface NavigationProps {
  type?: NavigationType;

  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  items?: any[];
  activeKey?: string;

  breadcrumbItems?: BreadcrumbProps["items"];

  onTabChange?: (key: string) => void;

  totalItems?: number;
  pageSize?: number;
  currentPage?: number;
  onPageChange?: (page: number, pageSize?: number) => void;
}
