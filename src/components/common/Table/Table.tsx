import React from "react";
import {
  Table as AntTable,
  Space,
  Tooltip,
  Button,
  Popover,
  DatePicker,
} from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import type { TableProps as AntTableProps } from "antd";
import type { CommonTableProps, TableColumn } from "./Table.types";
import dayjs from "dayjs";

function CommonTable<T extends Record<string, any>>({
  columns,
  dataSource,
  loading,
  pagination,
  onPageChange,
  rowKey = "id",
  scroll = { y: "calc(100vh - 320px)", x: 1000 },
  showDateFilter = false,
  onDateFilterChange,
  selectedDate,
  sticky = { offsetHeader: 0 },
  ...restProps
}: CommonTableProps<T>) {
  const enhancedColumns = columns.map((col) => {
    // Add date filter to column if specified
    if (col.showDateFilter && onDateFilterChange) {
      return {
        ...col,
        title: (
          <div className="flex items-center justify-center gap-2">
            <span>{col.title}</span>
            <Popover
              trigger="click"
              content={
                <DatePicker
                  onChange={onDateFilterChange}
                  value={selectedDate}
                  allowClear
                />
              }
            >
              <Button type="text" icon={<CalendarOutlined />} size="small" />
            </Popover>
          </div>
        ),
      };
    }
    return col;
  });

  const paginationConfig = pagination
    ? {
        current: pagination.page,
        pageSize: pagination.limit,
        total: pagination.total,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total: number, range: [number, number]) =>
          `${range[0]}-${range[1]} of ${total} items`,
        pageSizeOptions: ["10", "25", "50", "100"],
        onChange: onPageChange,
        position: ["bottomRight"] as const,
      }
    : false;

  return (
    <AntTable<T>
      columns={enhancedColumns}
      dataSource={dataSource}
      className="custom-blue-header"
      rowKey={rowKey}
      loading={loading}
      scroll={scroll}
      pagination={paginationConfig}
      sticky={sticky}
      {...restProps}
    />
  );
}

export default CommonTable;
