import React from "react";
import { Table } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { TableProps as AntTableProps } from "antd";
import type { DataTableProps } from "./Table.types";

export const DataTable = <T extends object>({
  columns,
  data,
  loading = false,
  pagination = { pageSize: 10 },
  rowSelection,
  bordered = true,
  onChange,
  className = "",
  size = "middle",
}: DataTableProps<T>) => {
  return (
    <div className={`w-full ${className}`}>
      <Table<T>
        columns={columns as ColumnsType<T>}
        dataSource={data}
        loading={loading}
        pagination={pagination as TablePaginationConfig}
        rowSelection={rowSelection}
        bordered={bordered}
        size={size}
        onChange={onChange}
        rowKey={(record: any) => record.key || record.id}
      />
    </div>
  );
};

export default DataTable;
