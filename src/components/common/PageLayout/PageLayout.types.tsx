// src/components/Common/PageLayout/PageLayout.types.ts
import type { ReactNode } from "react";

export interface SearchConfig {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

export interface FilterOption {
  label: string;
  value: string | number;
}

export interface FilterConfig {
  placeholder: string;
  value: any;
  onChange: (value: any) => void;
  options: FilterOption[];
}

export interface PageLayoutProps {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  searchConfig?: SearchConfig;
  filterConfig?: FilterConfig[];
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  showCollapseButton?: boolean;
}
