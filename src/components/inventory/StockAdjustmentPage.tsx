import React, { useEffect, useState, useCallback } from "react";
import {
  Table, Button, Tag, Input, Select, DatePicker, Space,
  Popconfirm, Typography, Tooltip, Badge, Modal, message,
} from "antd";
import {
  PlusOutlined, SearchOutlined, ReloadOutlined, EyeOutlined,
  DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined, WarningOutlined,
  CheckOutlined, CloseOutlined, RollbackOutlined, AuditOutlined, SettingOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { useStockAdjustmentStore } from "../../store/inventory/stockAdjustmentStore";
import { usePermissions } from "../../hooks/auth/usePermissions";
import { PERMISSIONS } from "../../types/auth/permissions";
import StockAdjustmentDetailsModal from "./StockAdjustmentDetailsModal";
import { STATUS_META, SOURCE_LABELS, REFERENCE_LABELS } from "./adjustmentMeta";
import type { AdjustmentMovementType, AdjustmentStatus } from "../../types/entities/stockAdjustment.types";

const { RangePicker } = DatePicker;
const { Option } = Select;

const StockAdjustmentPage: React.FC = () => {
  const navigate = useNavigate();
  const { adjustments, loading, submitting, pagination, listAdjustments, deleteAdjustment, getAdjustment, clearSelected, approveAdjustment, rejectAdjustment, reverseAdjustment } =
    useStockAdjustmentStore();
  const { hasPermission } = usePermissions();
  const canApprove = hasPermission(PERMISSIONS.INVENTORY_ADJUST_APPROVE);

  const [search, setSearch] = useState("");
  const [movementFilter, setMovementFilter] = useState<AdjustmentMovementType | "">("");
  const [statusFilter, setStatusFilter] = useState<AdjustmentStatus | "">("");
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const load = useCallback(
    (page = 1) => {
      listAdjustments({
        page,
        perPage: pagination.perPage,
        search,
        movementType: movementFilter || undefined,
        status: statusFilter || undefined,
        dateFrom: dateRange?.[0],
        dateTo: dateRange?.[1],
      });
    },
    [search, movementFilter, statusFilter, dateRange, pagination.perPage, listAdjustments]
  );

  useEffect(() => {
    listAdjustments({ page: 1, perPage: pagination.perPage });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => load(1);
  const handleReset = () => {
    setSearch("");
    setMovementFilter("");
    setStatusFilter("");
    setDateRange(null);
    listAdjustments({ page: 1, perPage: pagination.perPage });
  };

  const handleView = async (id: string) => {
    await getAdjustment(id);
    setDetailId(id);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAdjustment(id);
      message.success("Adjustment deleted");
    } catch (e: any) {
      message.error(e?.message ?? "Failed to delete");
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveAdjustment(id);
      message.success("Adjustment approved & posted");
      load(pagination.page);
    } catch (e: any) {
      message.error(e?.message ?? "Failed to approve");
    }
  };

  const handleReject = (id: string) => {
    let reason = "";
    Modal.confirm({
      title: "Reject this adjustment?",
      content: (
        <Input.TextArea
          rows={3}
          placeholder="Reason for rejection (required)"
          onChange={(e) => { reason = e.target.value; }}
        />
      ),
      okText: "Reject",
      okButtonProps: { danger: true },
      onOk: async () => {
        if (!reason.trim()) { message.error("A reason is required"); return Promise.reject(); }
        await rejectAdjustment(id, reason.trim());
        message.success("Adjustment rejected");
        load(pagination.page);
      },
    });
  };

  const handleReverse = (id: string, number: string) => {
    let notes = "";
    Modal.confirm({
      title: `Reverse ${number}?`,
      content: (
        <div>
          <p style={{ marginTop: 0 }}>A new equal-and-opposite adjustment will be posted and linked. The original stays as an audit record.</p>
          <Input.TextArea rows={2} placeholder="Notes (optional)" onChange={(e) => { notes = e.target.value; }} />
        </div>
      ),
      okText: "Post Reversal",
      onOk: async () => {
        try {
          const rev = await reverseAdjustment(id, notes.trim() || undefined);
          message.success(`Reversal ${rev.adjustmentNumber} posted`);
          load(pagination.page);
        } catch (e: any) {
          message.error(e?.message ?? "Failed to reverse");
          return Promise.reject();
        }
      },
    });
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
      key: "reason",
      ellipsis: true,
      render: (_: any, row: any) =>
        row.reasonLabel || row.reason || <span style={{ color: "#9ca3af" }}>—</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (v: AdjustmentStatus, row: any) => (
        <Space direction="vertical" size={0}>
          <Tag color={STATUS_META[v]?.color}>{STATUS_META[v]?.label ?? v}</Tag>
          {row.sourceType !== "manual" && (
            <span style={{ fontSize: 11, color: "#9ca3af" }}>{SOURCE_LABELS[row.sourceType] ?? row.sourceType}</span>
          )}
        </Space>
      ),
    },
    {
      title: "Items",
      dataIndex: "itemCount",
      key: "itemCount",
      align: "center" as const,
      render: (v: number) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: "Total Value",
      dataIndex: "totalAmount",
      key: "totalAmount",
      align: "right" as const,
      render: (v: number) =>
        `Rs. ${(v || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
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
            <Button size="small" icon={<EyeOutlined />} onClick={() => handleView(record.id)} />
          </Tooltip>

          {record.status === "pending_approval" && canApprove && (
            <>
              <Tooltip title="Approve & post">
                <Popconfirm title="Approve and post this adjustment?" onConfirm={() => handleApprove(record.id)} okText="Approve">
                  <Button size="small" type="primary" ghost icon={<CheckOutlined />} loading={submitting} />
                </Popconfirm>
              </Tooltip>
              <Tooltip title="Reject">
                <Button size="small" danger icon={<CloseOutlined />} onClick={() => handleReject(record.id)} />
              </Tooltip>
            </>
          )}

          {record.status === "posted" && record.sourceType !== "reversal" && (
            <Tooltip title="Reverse (post an opposite adjustment)">
              <Button size="small" icon={<RollbackOutlined />} onClick={() => handleReverse(record.id, record.adjustmentNumber)} />
            </Tooltip>
          )}

          {record.status !== "posted" && (
            <Tooltip title="Delete">
              <Popconfirm
                title="Delete this adjustment?"
                description="Only allowed because it was never posted to stock."
                onConfirm={() => handleDelete(record.id)}
                okText="Delete"
                okButtonProps={{ danger: true }}
              >
                <Button size="small" danger icon={<DeleteOutlined />} loading={submitting} />
              </Popconfirm>
            </Tooltip>
          )}
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
        <Space wrap>
          <Button icon={<AuditOutlined />} onClick={() => navigate("/stock-takes")}>Stock Takes</Button>
          <Button icon={<ReloadOutlined />} onClick={() => navigate("/adjustments/reconcile")}>Reconcile</Button>
          <Button icon={<SettingOutlined />} onClick={() => navigate("/adjustments/reasons")}>Reasons</Button>
          <Button icon={<WarningOutlined />} onClick={() => navigate("/adjustments/write-off-expired")}>
            Write Off Expired
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("/adjustments/add")}>
            New Adjustment
          </Button>
        </Space>
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
          style={{ width: 150 }}
          allowClear
        >
          <Option value="in">Stock In</Option>
          <Option value="out">Stock Out</Option>
        </Select>
        <Select
          placeholder="Status"
          value={statusFilter || undefined}
          onChange={(v) => setStatusFilter(v ?? "")}
          style={{ width: 170 }}
          allowClear
        >
          <Option value="pending_approval">Pending Approval</Option>
          <Option value="posted">Posted</Option>
          <Option value="rejected">Rejected</Option>
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
          onChanged={() => load(pagination.page)}
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
