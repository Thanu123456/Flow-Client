import type {
  MenuProps,
  BreadcrumbProps,
  TabsProps,
  PaginationProps,
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
  /** Type of navigation */
  type?: NavigationType;

  /** Common */
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void; // Add this line
  items?: any[];
  activeKey?: string;

  /** Breadcrumb */
  breadcrumbItems?: BreadcrumbProps["items"];

  /** Tabs */
  onTabChange?: (key: string) => void;

  /** Pagination */
  totalItems?: number;
  pageSize?: number;
  currentPage?: number;
  onPageChange?: (page: number, pageSize?: number) => void;
}
