import type { TableProps as AntTableProps, ColumnType } from "antd/es/table";
import type { Dayjs } from "dayjs";

export interface PaginationConfig {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TableColumn<T = any> extends ColumnType<T> {
  showDateFilter?: boolean;
}

export interface CommonTableProps<T>
  extends Omit<AntTableProps<T>, "columns" | "pagination"> {
  columns: TableColumn<T>[];
  dataSource: T[];
  loading?: boolean;
  pagination?: PaginationConfig;
  onPageChange?: (page: number, pageSize: number) => void;
  rowKey?: string | ((record: T) => string);
  showDateFilter?: boolean;
  onDateFilterChange?: (date: Dayjs | null) => void;
  selectedDate?: Dayjs | null;
}
