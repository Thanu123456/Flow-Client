import type { TableProps as AntTableProps } from "antd";
import type { ColumnsType } from "antd/es/table";

export interface DataTableProps<T = any>
  extends Omit<AntTableProps<T>, "columns" | "dataSource"> {
  /** Table column definitions */
  columns: ColumnsType<T>;
  /** Data array for table rows */
  data: T[];
  /** Optional CSS className */
  className?: string;
}
