import React from "react";
import { Space, Tooltip, Badge } from "antd";
import { EditOutlined, EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import type { SortOrder } from "antd/es/table/interface";
import type { Unit } from "../../types/entities/unit.types";
import { CommonTable } from "../common/Table";
import type { TableColumn } from "../common/Table/Table.types";

interface UnitsTableProps {
  units: Unit[];
  loading: boolean;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  onEdit: (unit: Unit) => void;
  onView: (unit: Unit) => void;
  onDelete: (unit: Unit) => void;
  onProductCountClick: (unitId: string) => void;
}

const HARDCODED_UNITS = ["Box", "Kilogram", "Liter", "Meter"];

const isHardcodedUnit = (name: string) =>
  HARDCODED_UNITS.some((u) => u.toLowerCase() === name.toLowerCase());

const UnitsTable: React.FC<UnitsTableProps> = ({
  units,
  loading,
  pagination,
  onEdit,
  onView,
  onDelete,
  onProductCountClick,
}) => {
  const columns: TableColumn<Unit>[] = [
    {
      title: <div className="text-center w-full">Unit Name</div>,
      dataIndex: "name",
      key: "name",
      sorter: (a: Unit, b: Unit) => a.name.localeCompare(b.name),
      sortDirections: ["ascend", "descend"] as SortOrder[],
      render: (text: string) => text,
    },
    {
      title: <div className="text-center w-full">Short Name</div>,
      dataIndex: "shortName",
      key: "shortName",
      align: "center" as const,
      render: (text: string) => text,
    },
    {
      title: <div className="text-center w-full">No. of Products</div>,
      dataIndex: "productCount",
      key: "productCount",
      align: "center" as const,
      render: (count: number, record: Unit) => (
        <Badge
          count={count || 0}
          showZero
          style={{
            backgroundColor: count > 0 ? "#1890ff" : "#d9d9d9",
            cursor: count > 0 ? "pointer" : "default",
          }}
          onClick={() => count > 0 && onProductCountClick(record.id)}
        />
      ),
    },
    {
      title: <div className="text-center w-full">Status</div>,
      dataIndex: "status",
      key: "status",
      align: "center" as const,
      render: (status: string) => (
        <span
          className={`px-3 py-1 rounded-lg text-sm border ${status === "active"
            ? "border-green-500 text-green-500 bg-green-50/70"
            : "border-red-500 text-red-500 bg-red-50/70"
            }`}
        >
          {status === "active" ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      title: <div className="text-center w-full">Actions</div>,
      key: "actions",
      align: "center" as const,
      render: (_: React.ReactNode, record: Unit) => {
        const isHardcoded = isHardcodedUnit(record.name);
        return (
          <Space>
            <div
              className="flex items-center justify-center w-7 h-7 bg-white shadow-sm rounded-md cursor-pointer hover:bg-blue-50"
              onClick={() => onView(record)}
            >
              <Tooltip title="View">
                <EyeOutlined style={{ color: "black" }} />
              </Tooltip>
            </div>
            {!isHardcoded && (
              <>
                <div
                  className="flex items-center justify-center w-7 h-7 bg-white shadow-sm rounded-md cursor-pointer hover:bg-blue-50"
                  onClick={() => onEdit(record)}
                >
                  <Tooltip title="Edit">
                    <EditOutlined style={{ color: "#1890ff" }} />
                  </Tooltip>
                </div>
                <div
                  className="flex items-center justify-center w-7 h-7 bg-white shadow-sm rounded-md cursor-pointer hover:bg-blue-50"
                  onClick={() => (record.productCount ?? 0) === 0 && onDelete(record)}
                  style={{ opacity: (record.productCount ?? 0) > 0 ? 0.5 : 1 }}
                >
                  <Tooltip
                    title={
                      (record.productCount ?? 0) > 0
                        ? "Cannot delete unit with associated products"
                        : "Delete"
                    }
                  >
                    <DeleteOutlined style={{ color: "red" }} />
                  </Tooltip>
                </div>
              </>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <CommonTable<Unit>
      columns={columns}
      dataSource={units}
      loading={loading}
      simplePagination={true}
      pagination={{
        ...pagination,
        total: units.length,
        page: 1,
        limit: units.length,
        totalPages: 1
      }}
      footer={() => (
        <div style={{ textAlign: 'center', color: '#8c8c8c', padding: '12px', fontSize: '13px', fontWeight: 500 }}>
          — End of Results —
        </div>
      )}
    />
  );
};

export default UnitsTable;
