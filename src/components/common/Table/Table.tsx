import { Table as AntTable, Button, Popover, DatePicker } from "antd";
import { CalendarOutlined, DeleteOutlined, ClearOutlined } from "@ant-design/icons";
import type { CommonTableProps } from "./Table.types";

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
  onBulkDelete,
  bulkDeleteText = "Delete Selected",
  sticky = { offsetHeader: 0 },
  rowSelection,
  ...restProps
}: CommonTableProps<T>) {
  const enhancedColumns = columns.map((col) => {
    // Add date filter to column if specified
    if (col.showDateFilter && onDateFilterChange) {
      return {
        ...col,
        title: (
          <div className="flex items-center justify-center gap-2">
            <span>{col.title as any}</span>
            <Popover
              trigger="click"
              placement="bottomLeft"
              content={
                <DatePicker
                  onChange={onDateFilterChange}
                  value={selectedDate}
                  allowClear
                  placement="bottomRight"
                />
              }
            >
              <Button
                type="text"
                icon={<CalendarOutlined className="!text-white" />}
                size="small"
              />
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
      position: ["bottomRight"] as any,
    }
    : false;

  return (
    <div className="flex flex-col gap-4">
      {/* Bulk Selection Bar */}
      {rowSelection && rowSelection.selectedRowKeys && rowSelection.selectedRowKeys.length > 0 && (
        <div className="flex items-center justify-between p-3.5 bg-blue-50/80 border border-blue-100 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-300 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-4 ml-2">
            <div className="flex items-center justify-center bg-blue-500 text-white w-6 h-6 rounded-full text-[12px] font-bold shadow-sm shadow-blue-500/20">
              {rowSelection.selectedRowKeys.length}
            </div>
            <span className="text-[13px] font-bold text-blue-900 tracking-tight uppercase">
              Items Selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="text"
              size="small"
              icon={<ClearOutlined />}
              onClick={() => rowSelection.onChange?.([], [], { type: 'all' } as any)}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider"
            >
              Clear
            </Button>

            {onBulkDelete && (
              <Button
                danger
                type="primary"
                size="middle"
                icon={<DeleteOutlined className="animate-pulse" />}
                onClick={onBulkDelete}
                className="rounded-xl font-bold shadow-lg shadow-red-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all px-6"
              >
                {bulkDeleteText}
              </Button>
            )}
          </div>
        </div>
      )}

      <AntTable<T>
        columns={enhancedColumns}
        dataSource={dataSource}
        className="custom-blue-header rounded-2xl overflow-hidden border border-slate-100"
        rowKey={rowKey}
        loading={loading}
        scroll={scroll}
        pagination={paginationConfig}
        sticky={sticky}
        rowSelection={rowSelection}
        {...restProps}
      />
    </div>
  );
}

export default CommonTable;
