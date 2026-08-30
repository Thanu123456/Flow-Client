import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Table, Button, Tag, Space, Typography, InputNumber, message, Descriptions,
  Popconfirm, Alert, Divider,
} from "antd";
import { ArrowLeftOutlined, SaveOutlined, CheckCircleOutlined, StopOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { stockTakeService } from "../../services/inventory/stockTakeService";
import type { StockTake, StockTakeItem } from "../../types/entities/stockAdjustment.types";

const money = (n: number) =>
  `Rs. ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const STATUS_COLOR: Record<string, string> = {
  in_progress: "blue", counted: "gold", posted: "green", cancelled: "default",
};

const StockTakeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [st, setSt] = useState<StockTake | null>(null);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [posting, setPosting] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await stockTakeService.get(id);
      setSt(data);
      const seed: Record<string, number> = {};
      data.items.forEach((it) => { if (it.countedQty !== null) seed[it.id] = it.countedQty; });
      setCounts(seed);
    } catch {
      message.error("Failed to load stock take");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const editable = st?.status === "in_progress" || st?.status === "counted";

  const dirtyItems = useMemo(() => {
    if (!st) return [];
    return st.items
      .filter((it) => counts[it.id] !== undefined && counts[it.id] !== (it.countedQty ?? undefined))
      .map((it) => ({ item_id: it.id, counted_qty: counts[it.id] }));
  }, [st, counts]);

  const varianceValue = useMemo(() => {
    if (!st) return 0;
    return st.items.reduce((sum, it) => {
      const c = counts[it.id];
      if (c === undefined) return sum;
      return sum + (c - it.systemQty) * it.unitCost;
    }, 0);
  }, [st, counts]);

  const save = async (markDone: boolean) => {
    if (!id) return;
    setSaving(true);
    try {
      const updated = await stockTakeService.saveCounts(id, dirtyItems, markDone);
      setSt(updated);
      message.success(markDone ? "Counts saved & marked done" : "Counts saved");
    } catch (e: any) {
      message.error(e?.response?.data?.error?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const post = async () => {
    if (!id) return;
    setPosting(true);
    try {
      if (dirtyItems.length) await stockTakeService.saveCounts(id, dirtyItems, false);
      const updated = await stockTakeService.post(id);
      setSt(updated);
      message.success("Stock take posted — variance adjustments created");
    } catch (e: any) {
      message.error(e?.response?.data?.error?.message ?? "Post failed");
    } finally {
      setPosting(false);
    }
  };

  const cancel = async () => {
    if (!id) return;
    try {
      await stockTakeService.cancel(id);
      message.success("Stock take cancelled");
      load();
    } catch (e: any) {
      message.error(e?.message ?? "Cancel failed");
    }
  };

  const columns = [
    {
      title: "Product",
      key: "product",
      render: (_: any, r: StockTakeItem) => (
        <div>
          <div style={{ fontWeight: 600 }}>{r.productName}</div>
          {r.variationType && <Tag>{r.variationType}</Tag>}
          {r.productSKU && <span style={{ color: "#9ca3af", fontSize: 12 }}>{r.productSKU}</span>}
        </div>
      ),
    },
    { title: "System Qty", dataIndex: "systemQty", key: "sys", align: "right" as const, render: (v: number, r: StockTakeItem) => `${v} ${r.unitName ?? ""}` },
    {
      title: "Counted Qty",
      key: "counted",
      align: "right" as const,
      render: (_: any, r: StockTakeItem) =>
        editable ? (
          <InputNumber
            min={0}
            value={counts[r.id]}
            onChange={(v) => setCounts((p) => ({ ...p, [r.id]: v ?? 0 }))}
            style={{ width: 110 }}
            placeholder="—"
          />
        ) : (
          r.countedQty ?? <span style={{ color: "#9ca3af" }}>not counted</span>
        ),
    },
    {
      title: "Variance",
      key: "variance",
      align: "right" as const,
      render: (_: any, r: StockTakeItem) => {
        const c = counts[r.id];
        if (c === undefined) return <span style={{ color: "#9ca3af" }}>—</span>;
        const d = c - r.systemQty;
        if (d === 0) return <Tag>0</Tag>;
        return <Tag color={d > 0 ? "green" : "red"}>{d > 0 ? "+" : ""}{d}</Tag>;
      },
    },
    { title: "Unit Cost", dataIndex: "unitCost", key: "cost", align: "right" as const, render: (v: number) => money(v) },
  ];

  if (loading || !st) {
    return <div style={{ padding: 24, color: "#9ca3af" }}>Loading…</div>;
  }

  const countedN = st.items.filter((it) => counts[it.id] !== undefined).length;

  return (
    <div style={{ padding: 24 }}>
      <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate("/stock-takes")} style={{ padding: 0, marginBottom: 4 }}>
        Back to Stock Takes
      </Button>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <Typography.Title level={4} style={{ margin: 0 }}>
            {st.referenceNumber} <Tag color={STATUS_COLOR[st.status]}>{st.status.replace("_", " ")}</Tag>
          </Typography.Title>
          <Typography.Text type="secondary">{st.warehouseName}{st.categoryName ? ` · ${st.categoryName}` : ""}</Typography.Text>
        </div>
        <Space>
          {editable && (
            <>
              <Button icon={<SaveOutlined />} loading={saving} onClick={() => save(false)} disabled={!dirtyItems.length}>
                Save Counts
              </Button>
              <Button loading={saving} onClick={() => save(true)}>Mark Done</Button>
              <Popconfirm
                title="Post this stock take?"
                description="Surpluses and shortages will be posted as linked stock adjustments."
                onConfirm={post}
                okText="Post"
              >
                <Button type="primary" icon={<CheckCircleOutlined />} loading={posting}>Post Variance</Button>
              </Popconfirm>
              <Popconfirm title="Cancel this stock take?" onConfirm={cancel}>
                <Button danger icon={<StopOutlined />}>Cancel</Button>
              </Popconfirm>
            </>
          )}
        </Space>
      </div>

      <Descriptions bordered size="small" column={3} style={{ marginBottom: 16 }}>
        <Descriptions.Item label="Lines">{st.itemCount}</Descriptions.Item>
        <Descriptions.Item label="Counted">{countedN} / {st.itemCount}</Descriptions.Item>
        <Descriptions.Item label="Net variance value">
          <strong style={{ color: varianceValue < 0 ? "#ef4444" : varianceValue > 0 ? "#16a34a" : undefined }}>
            {money(varianceValue)}
          </strong>
        </Descriptions.Item>
        {st.notes && <Descriptions.Item label="Notes" span={3}>{st.notes}</Descriptions.Item>}
      </Descriptions>

      {st.status === "posted" && (
        <Alert
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
          message="Posted"
          description={
            <Space split={<Divider type="vertical" />}>
              {st.adjustmentInId && <a onClick={() => navigate("/adjustments")}>Surplus adjustment created</a>}
              {st.adjustmentOutId && <a onClick={() => navigate("/adjustments")}>Shortage adjustment created</a>}
              {!st.adjustmentInId && !st.adjustmentOutId && "No variance — no adjustment was needed"}
            </Space>
          }
        />
      )}

      <Table
        dataSource={st.items}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 50 }}
        size="middle"
        style={{ background: "#fff", borderRadius: 12 }}
      />
    </div>
  );
};

export default StockTakeDetailPage;
