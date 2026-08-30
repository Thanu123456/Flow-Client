import React, { useEffect, useMemo, useState } from "react";
import {
  Table, Button, Space, Typography, Tag, Input, Select, DatePicker, Card, Row, Col,
  message, Popconfirm, Statistic,
} from "antd";
import {
  ReloadOutlined, CheckCircleOutlined, RollbackOutlined, HistoryOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs, { Dayjs } from "dayjs";
import { useDebounce } from "../../hooks/ui/useDebounce";
import { useChequeStore } from "../../store/transactions/chequeStore";
import type { ChequeRegisterRow } from "../../types/entities/cheque.types";
import ReturnChequeModal from "./ReturnChequeModal";

const { RangePicker } = DatePicker;

const rs = (n: number) =>
  `Rs. ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const DUE_TAG: Record<string, { color: string; label: string }> = {
  paid: { color: "green", label: "Paid" },
  overdue: { color: "red", label: "Overdue" },
  due_soon: { color: "orange", label: "Due Soon" },
  upcoming: { color: "gold", label: "Upcoming" },
  no_date: { color: "default", label: "No Date" },
};

const ROW_BG: Record<string, string> = {
  paid: "#f6ffed",
  overdue: "#fff1f0",
  due_soon: "#fff7e6",
};

const ChequesPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    cheques, summary, loading, submitting, pagination, error,
    getRegister, getSummary, markPaid, clearError,
  } = useChequeStore();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<"pending" | "paid" | undefined>();
  const [dueBucket, setDueBucket] = useState<"overdue" | "due_soon" | "upcoming" | undefined>();
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);

  const [returnTarget, setReturnTarget] = useState<ChequeRegisterRow | null>(null);

  const load = () => {
    getRegister({
      page,
      limit: 10,
      search: debouncedSearch,
      status,
      dueBucket,
      from: range?.[0] ? range[0].format("YYYY-MM-DD") : undefined,
      to: range?.[1] ? range[1].format("YYYY-MM-DD") : undefined,
    });
    getSummary();
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, page, status, dueBucket, range]);

  useEffect(() => {
    if (error) {
      message.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleMarkPaid = async (row: ChequeRegisterRow) => {
    try {
      await markPaid(row.grnId);
      message.success("Cheque marked as cleared");
      load();
    } catch {
      /* surfaced via effect */
    }
  };

  const columns = useMemo(
    () => [
      { title: "Cheque No", dataIndex: "chequeNumber", key: "chequeNumber", render: (v: string) => v || "—" },
      { title: "GRN", dataIndex: "grnNumber", key: "grnNumber" },
      {
        title: "Cheque Date",
        dataIndex: "chequeDate",
        key: "chequeDate",
        render: (v: string) => (v ? dayjs(v).format("YYYY-MM-DD") : "—"),
      },
      {
        title: "Supplier",
        dataIndex: "supplierName",
        key: "supplierName",
        render: (v: string) => v || <span style={{ color: "#9ca3af" }}>—</span>,
      },
      {
        title: "Amount",
        dataIndex: "amount",
        key: "amount",
        align: "right" as const,
        render: (v: number) => rs(v),
      },
      {
        title: "Days Left",
        dataIndex: "daysRemaining",
        key: "daysRemaining",
        align: "center" as const,
        render: (v: number | undefined, r: ChequeRegisterRow) => {
          if (r.dueState === "paid") return "—";
          if (v === undefined || v === null) return "N/A";
          return v < 0 ? `${Math.abs(v)}d overdue` : `${v}d`;
        },
      },
      {
        title: "Status",
        dataIndex: "dueState",
        key: "dueState",
        align: "center" as const,
        render: (v: string, r: ChequeRegisterRow) => (
          <Space size={4}>
            <Tag color={DUE_TAG[v]?.color}>{DUE_TAG[v]?.label ?? v}</Tag>
            {r.isPostDated && r.chequeStatus === "pending" && <Tag>PDC</Tag>}
          </Space>
        ),
      },
      {
        title: "Actions",
        key: "actions",
        align: "center" as const,
        width: 170,
        render: (_: unknown, r: ChequeRegisterRow) => {
          const done = r.chequeStatus !== "pending";
          return (
            <Space>
              <Popconfirm
                title="Mark this cheque as cleared?"
                onConfirm={() => handleMarkPaid(r)}
                disabled={done}
              >
                <Button size="small" type="primary" ghost icon={<CheckCircleOutlined />} disabled={done}>
                  Paid
                </Button>
              </Popconfirm>
              <Button
                size="small"
                danger
                icon={<RollbackOutlined />}
                disabled={done}
                onClick={() => setReturnTarget(r)}
              >
                Return
              </Button>
            </Space>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [submitting]
  );

  return (
    <div style={{ padding: 24, maxWidth: 1280, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          Cheque Register
        </Typography.Title>
        <div style={{ flex: 1 }} />
        <Button icon={<HistoryOutlined />} onClick={() => navigate("/cheque-returns")}>
          Return History
        </Button>
      </div>

      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic title="Pending to Pay" value={summary ? rs(summary.pendingAmount) : "—"} />
            <div style={{ fontSize: 12, color: "#8c8c8c" }}>{summary?.pendingCount ?? 0} cheque(s)</div>
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic title="Paid Cheques" value={summary ? rs(summary.paidAmount) : "—"} valueStyle={{ color: "#3f8600" }} />
            <div style={{ fontSize: 12, color: "#8c8c8c" }}>{summary?.paidCount ?? 0} cheque(s)</div>
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic title="Overdue" value={summary?.overdueCount ?? 0} valueStyle={{ color: "#cf1322" }} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic title="Due Within 3 Days" value={summary?.dueSoonCount ?? 0} valueStyle={{ color: "#d46b08" }} />
          </Card>
        </Col>
      </Row>

      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <Input.Search
          placeholder="Cheque no, GRN or supplier"
          allowClear
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{ maxWidth: 260 }}
        />
        <Select
          placeholder="All statuses"
          allowClear
          value={status}
          onChange={(v) => { setStatus(v); setPage(1); }}
          style={{ minWidth: 150 }}
          options={[
            { label: "Pending", value: "pending" },
            { label: "Paid", value: "paid" },
          ]}
        />
        <Select
          placeholder="Any due"
          allowClear
          value={dueBucket}
          onChange={(v) => { setDueBucket(v); setPage(1); }}
          style={{ minWidth: 150 }}
          options={[
            { label: "Overdue", value: "overdue" },
            { label: "Due soon (≤3d)", value: "due_soon" },
            { label: "Upcoming", value: "upcoming" },
          ]}
        />
        <RangePicker
          value={range as any}
          onChange={(v) => { setRange(v as [Dayjs, Dayjs] | null); setPage(1); }}
        />
        <Button
          icon={<ReloadOutlined />}
          onClick={() => {
            setSearch(""); setStatus(undefined); setDueBucket(undefined); setRange(null); setPage(1);
          }}
        >
          Refresh
        </Button>
      </div>

      <Table
        rowKey="grnId"
        dataSource={cheques}
        columns={columns}
        loading={loading}
        size="middle"
        style={{ background: "#fff", borderRadius: 12 }}
        onRow={(r) => ({ style: { background: ROW_BG[r.dueState] } })}
        pagination={{
          current: pagination.page,
          pageSize: pagination.limit,
          total: pagination.total,
          onChange: setPage,
          showSizeChanger: false,
        }}
      />

      <ReturnChequeModal
        open={!!returnTarget}
        cheque={returnTarget}
        onCancel={() => setReturnTarget(null)}
        onSuccess={() => {
          setReturnTarget(null);
          load();
        }}
      />
    </div>
  );
};

export default ChequesPage;
