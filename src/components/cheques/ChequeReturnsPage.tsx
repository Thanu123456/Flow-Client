import React, { useEffect, useState } from "react";
import { Table, Button, Typography, Tag, Input, DatePicker, message } from "antd";
import { ReloadOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs, { Dayjs } from "dayjs";
import { useDebounce } from "../../hooks/ui/useDebounce";
import { useChequeStore } from "../../store/transactions/chequeStore";
import type { ChequeReturn } from "../../types/entities/cheque.types";

const { RangePicker } = DatePicker;

const rs = (n: number) =>
  `Rs. ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const METHOD_TAG: Record<string, { color: string; label: string }> = {
  cheque: { color: "blue", label: "New Cheque" },
  cash: { color: "green", label: "Cash" },
  credit: { color: "gold", label: "Credit" },
};

const ChequeReturnsPage: React.FC = () => {
  const navigate = useNavigate();
  const { returns, loading, returnsPagination, error, getReturns, clearError } = useChequeStore();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [page, setPage] = useState(1);
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);

  useEffect(() => {
    getReturns({
      page,
      limit: 10,
      search: debouncedSearch,
      from: range?.[0] ? range[0].format("YYYY-MM-DD") : undefined,
      to: range?.[1] ? range[1].format("YYYY-MM-DD") : undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, page, range]);

  useEffect(() => {
    if (error) {
      message.error(error);
      clearError();
    }
  }, [error, clearError]);

  const columns = [
    {
      title: "Return Date",
      dataIndex: "returnDate",
      key: "returnDate",
      render: (v: string) => dayjs(v).format("YYYY-MM-DD"),
    },
    { title: "Cheque No", dataIndex: "chequeNumber", key: "chequeNumber", render: (v: string) => v || "—" },
    { title: "GRN", dataIndex: "grnNumber", key: "grnNumber", render: (v: string) => v || "—" },
    {
      title: "Supplier",
      dataIndex: "supplierName",
      key: "supplierName",
      render: (v: string) => v || <span style={{ color: "#9ca3af" }}>—</span>,
    },
    {
      title: "Cheque Value",
      dataIndex: "amount",
      key: "amount",
      align: "right" as const,
      render: (v: number) => rs(v),
    },
    {
      title: "Settled Via",
      dataIndex: "settlementMethod",
      key: "settlementMethod",
      align: "center" as const,
      render: (v: string, r: ChequeReturn) => (
        <>
          <Tag color={METHOD_TAG[v]?.color}>{METHOD_TAG[v]?.label ?? v}</Tag>
          {v === "cheque" && r.newChequeNumber && (
            <div style={{ fontSize: 12, color: "#8c8c8c" }}>
              #{r.newChequeNumber}
              {r.newChequeDate ? ` · ${dayjs(r.newChequeDate).format("YYYY-MM-DD")}` : ""}
            </div>
          )}
        </>
      ),
    },
    {
      title: "Paid Now",
      dataIndex: "settlementAmount",
      key: "settlementAmount",
      align: "right" as const,
      render: (v: number) => rs(v),
    },
    {
      title: "Note",
      dataIndex: "note",
      key: "note",
      render: (v: string) => v || <span style={{ color: "#9ca3af" }}>—</span>,
    },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/cheques")}
        style={{ padding: 0, marginBottom: 4 }}
      >
        Back to Cheque Register
      </Button>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        Cheque Return History
      </Typography.Title>

      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <Input.Search
          placeholder="Cheque no, GRN, supplier or note"
          allowClear
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{ maxWidth: 300 }}
        />
        <RangePicker
          value={range as any}
          onChange={(v) => { setRange(v as [Dayjs, Dayjs] | null); setPage(1); }}
        />
        <Button icon={<ReloadOutlined />} onClick={() => { setSearch(""); setRange(null); setPage(1); }}>
          Refresh
        </Button>
      </div>

      <Table
        rowKey="id"
        dataSource={returns}
        columns={columns}
        loading={loading}
        size="middle"
        style={{ background: "#fff", borderRadius: 12 }}
        pagination={{
          current: returnsPagination.page,
          pageSize: returnsPagination.limit,
          total: returnsPagination.total,
          onChange: setPage,
          showSizeChanger: false,
        }}
      />
    </div>
  );
};

export default ChequeReturnsPage;
