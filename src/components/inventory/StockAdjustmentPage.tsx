import React, { useEffect, useState, useCallback } from "react";
import {
  Table, Button, Tag, Input, Select, DatePicker, Space,
  Popconfirm, Typography, Tooltip, Badge,
} from "antd";
import {
  PlusOutlined, SearchOutlined, ReloadOutlined, EyeOutlined,
  DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { useStockAdjustmentStore } from "../../store/inventory/stockAdjustmentStore";
import StockAdjustmentDetailsModal from "./StockAdjustmentDetailsModal";
import type { AdjustmentMovementType } from "../../types/entities/stockAdjustment.types";

const { RangePicker } = DatePicker;
const { Option } = Select;

const REFERENCE_LABELS: Record<string, string> = {
  purchase: "Purchase",
  sales: "Sales",
  damage: "Damage",
  expiry: "Expiry",
  return: "Return",
  other: "Other",
};

const StockAdjustmentPage: React.FC = () => {
  const navigate = useNavigate();
  const { adjustments, loading, submitting, pagination, listAdjustments, deleteAdjustment, getAdjustment, clearSelected } =
    useStockAdjustmentStore();

  const [search, setSearch] = useState("");
  const [movementFilter, setMovementFilter] = useState<AdjustmentMovementType | "">("");
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const load = useCallback(
    (page = 1) => {
      listAdjustments({
        page,
        perPage: pagination.perPage,
        search,
        movementType: movementFilter || undefined,
        dateFrom: dateRange?.[0],
        dateTo: dateRange?.[1],
      });
    },
    [search, movementFilter, dateRange, pagination.perPage, listAdjustments]
  );

  useEffect(() => {
    listAdjustments({ page: 1, perPage: pagination.perPage });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => load(1);
  const handleReset = () => {
    setSearch("");
    setMovementFilter("");
    setDateRange(null);
    listAdjustments({ page: 1, perPage: pagination.perPage });
  };

  const handleView = async (id: string) => {
    await getAdjustment(id);
    setDetailId(id);
  };

  const handleDelete = async (id: string) => {
    await deleteAdjustment(id);
  };

  const columns = [
    {
      title: "Adj. No.",
      dataIndex: "adjustmentNumber",
      key: "adjustmentNumber",
      render: (v: string) => <span style={{ fontFamily: "monospace", fontWeight: 600 }}>{v}</span>,
    },
    {
      title: "Movement",
      dataIndex: "movementType",
      key: "movementType",
      render: (v: AdjustmentMovementType) =>
        v === "in" ? (
          <Tag color="green" icon={<ArrowUpOutlined />}>Stock In</Tag>
        ) : (
          <Tag color="red" icon={<ArrowDownOutlined />}>Stock Out</Tag>
        ),
    },
    {
      title: "Reference",
      dataIndex: "referenceType",
      key: "referenceType",
      render: (v: string) => <Tag>{REFERENCE_LABELS[v] ?? v}</Tag>,
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      render: (v: string | undefined, row: any) => {
        if (row.movementType !== "in" || !v) return <span style={{ color: "#9ca3af" }}>—</span>;
        return (
          <Badge
            color={v === "high" ? "#ef4444" : "#6366f1"}
            text={<span style={{ fontWeight: 600, color: v === "high" ? "#ef4444" : "#6366f1" }}>{v.toUpperCase()}</span>}
          />
        );
      },
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
      ellipsis: true,
      render: (v: string) => v || <span style={{ color: "#9ca3af" }}>—</span>,
    },
    {
      title: "Items",
      dataIndex: "itemCount",
      key: "itemCount",
      align: "center" as const,
      render: (v: number) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: "Created By",
      dataIndex: "createdByName",
      key: "createdByName",
      render: (v: string) => v || "—",
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (v: string) => dayjs(v).format("YYYY-MM-DD HH:mm"),
    },
    {
      title: "Actions",
      key: "actions",
      align: "center" as const,
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleView(record.id)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Delete this adjustment?"
              description="Stock will NOT be reversed. Create a counter-adjustment to undo stock changes."
              onConfirm={() => handleDelete(record.id)}
              okText="Delete"
              okButtonProps={{ danger: true }}
            >
              <Button size="small" danger icon={<DeleteOutlined />} loading={submitting} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <Typography.Title level={4} style={{ margin: 0 }}>Stock Adjustments</Typography.Title>
          <Typography.Text type="secondary">Manage inventory in/out adjustments with priority tracking</Typography.Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/adjustments/add")}
        >
          New Adjustment
        </Button>
      </div>

      {/* Filters */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: "16px 20px",
          marginBottom: 16,
          border: "1px solid #f0f0f0",
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <Input
          placeholder="Search by number or reason..."
          prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onPressEnter={handleSearch}
          style={{ width: 260 }}
          allowClear
        />
        <Select
          placeholder="Movement type"
          value={movementFilter || undefined}
          onChange={(v) => setMovementFilter(v ?? "")}
          style={{ width: 160 }}
          allowClear
        >
          <Option value="in">Stock In</Option>
          <Option value="out">Stock Out</Option>
        </Select>
        <RangePicker
          onChange={(_, strings) => setDateRange(strings[0] ? [strings[0], strings[1]] : null)}
          style={{ width: 240 }}
        />
        <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
          Search
        </Button>
        <Button icon={<ReloadOutlined />} onClick={handleReset}>
          Reset
        </Button>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f0f0f0", overflow: "hidden" }}>
        <Table
          dataSource={adjustments}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.perPage,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `${total} adjustments`,
            onChange: (page, pageSize) => {
              useStockAdjustmentStore.setState((s) => ({
                pagination: { ...s.pagination, page, perPage: pageSize },
              }));
              load(page);
            },
          }}
          size="middle"
        />
      </div>

      {/* Detail modal */}
      {detailId && (
        <StockAdjustmentDetailsModal
          open={!!detailId}
          onClose={() => {
            setDetailId(null);
            clearSelected();
          }}
        />
      )}
    </div>
  );
};

export default StockAdjustmentPage;
