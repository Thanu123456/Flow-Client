import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Table, Button, Tag, Input, Select, Space, Typography, Tooltip,
  InputNumber, Popconfirm, message, Alert,
} from "antd";
import {
  SearchOutlined, ReloadOutlined, WarningOutlined, ArrowLeftOutlined, DeleteOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { stockAdjustmentService } from "../../services/inventory/stockAdjustmentService";
import { useWarehouseStore } from "../../store/management/warehouseStore";
import type { ExpiredStockItem } from "../../types/entities/stockAdjustment.types";

const { Option } = Select;

const rowKeyOf = (r: ExpiredStockItem) => `${r.productId}::${r.variationId ?? ""}::${r.warehouseId}`;

const expiryTag = (date: string) => {
  const days = dayjs(date).startOf("day").diff(dayjs().startOf("day"), "day");
  if (days < 0) return <Tag color="red">Expired {Math.abs(days)}d ago</Tag>;
  if (days === 0) return <Tag color="red">Expires today</Tag>;
  return <Tag color="orange">Expires in {days}d</Tag>;
};

const WriteOffExpiredStockPage: React.FC = () => {
  const navigate = useNavigate();
  const { allWarehouses: warehouses, getAllWarehouses } = useWarehouseStore();

  const [rows, setRows] = useState<ExpiredStockItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [warehouseId, setWarehouseId] = useState<string>("");
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [qtyOverride, setQtyOverride] = useState<Record<string, number>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await stockAdjustmentService.listExpiredStock({ warehouseId, search });
      setRows(data);
      setSelectedKeys([]);
      setQtyOverride({});
    } catch {
      message.error("Failed to load expired stock");
    } finally {
      setLoading(false);
    }
  }, [warehouseId, search]);

  useEffect(() => {
    if (!warehouses.length) getAllWarehouses();
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const qtyFor = (r: ExpiredStockItem) => qtyOverride[rowKeyOf(r)] ?? r.expiredQty;

  const selectedRows = useMemo(
    () => rows.filter((r) => selectedKeys.includes(rowKeyOf(r))),
    [rows, selectedKeys]
  );
  const totalUnits = selectedRows.reduce((sum, r) => sum + qtyFor(r), 0);

  const handleWriteOff = async () => {
    if (!selectedRows.length) { message.warning("Select at least one line"); return; }

    // The endpoint takes one warehouse per call — group the selection.
    const byWarehouse = new Map<string, ExpiredStockItem[]>();
    for (const r of selectedRows) {
      const arr = byWarehouse.get(r.warehouseId) ?? [];
      arr.push(r);
      byWarehouse.set(r.warehouseId, arr);
    }

    setSubmitting(true);
    try {
      for (const [wid, group] of byWarehouse) {
        await stockAdjustmentService.writeOffExpired({
          warehouse_id: wid,
          items: group.map((r) => ({
            product_id: r.productId,
            variation_id: r.variationId || undefined,
            quantity: qtyFor(r),
          })),
        });
      }
      message.success(`Wrote off ${totalUnits} expired unit${totalUnits !== 1 ? "s" : ""} across ${byWarehouse.size} warehouse${byWarehouse.size !== 1 ? "s" : ""}`);
      await load();
    } catch (err: any) {
      message.error(err?.response?.data?.error?.message ?? "Failed to write off expired stock");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: "Product",
      key: "product",
      render: (_: any, r: ExpiredStockItem) => (
        <div>
          <div style={{ fontWeight: 600 }}>{r.productName}</div>
          {r.variationType && <Tag style={{ marginTop: 2 }}>{r.variationType}</Tag>}
          {r.productSKU && <span style={{ color: "#9ca3af", fontSize: 12 }}>{r.productSKU}</span>}
        </div>
      ),
    },
    { title: "Warehouse", dataIndex: "warehouseName", key: "warehouse" },
    {
      title: "Expired On Hand",
      key: "expiredQty",
      align: "center" as const,
      render: (_: any, r: ExpiredStockItem) => (
        <Tag color="red">{r.expiredQty} {r.unitName ?? ""}</Tag>
      ),
    },
    {
      title: "Batches",
      dataIndex: "batchCount",
      key: "batchCount",
      align: "center" as const,
      render: (v: number) => <Tag>{v}</Tag>,
    },
    {
      title: "Earliest Expiry",
      key: "earliestExpiry",
      render: (_: any, r: ExpiredStockItem) => (
        <Space direction="vertical" size={0}>
          <span>{dayjs(r.earliestExpiry).format("YYYY-MM-DD")}</span>
          {expiryTag(r.earliestExpiry)}
        </Space>
      ),
    },
    {
      title: "Write Off Qty",
      key: "writeOffQty",
      align: "center" as const,
      render: (_: any, r: ExpiredStockItem) => {
        const k = rowKeyOf(r);
        const selected = selectedKeys.includes(k);
        return (
          <InputNumber
            min={0.01}
            max={r.expiredQty}
            value={qtyFor(r)}
            disabled={!selected}
            onChange={(val) =>
              setQtyOverride((prev) => ({ ...prev, [k]: val ?? r.expiredQty }))
            }
            addonAfter={r.unitName ?? undefined}
            style={{ width: 130 }}
          />
        );
      },
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <Button
            type="link"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/adjustments")}
            style={{ padding: 0, marginBottom: 4 }}
          >
            Back to Adjustments
          </Button>
          <Typography.Title level={4} style={{ margin: 0 }}>Write Off Expired Stock</Typography.Title>
          <Typography.Text type="secondary">
            Removes expired batches (oldest first) and records an Expiry stock-out adjustment
          </Typography.Text>
        </div>
        <Popconfirm
          title="Write off the selected expired stock?"
          description={`${selectedRows.length} line(s), ${totalUnits} unit(s). This creates a stock-out adjustment and cannot be undone automatically.`}
          okText="Write Off"
          okButtonProps={{ danger: true }}
          onConfirm={handleWriteOff}
          disabled={!selectedRows.length}
        >
          <Button type="primary" danger icon={<DeleteOutlined />} loading={submitting} disabled={!selectedRows.length}>
            Write Off Selected{selectedRows.length ? ` (${selectedRows.length})` : ""}
          </Button>
        </Popconfirm>
      </div>

      <div
        style={{
          background: "#fff", borderRadius: 12, padding: "16px 20px", marginBottom: 16,
          border: "1px solid #f0f0f0", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center",
        }}
      >
        <Input
          placeholder="Search by product or SKU..."
          prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onPressEnter={load}
          style={{ width: 260 }}
          allowClear
        />
        <Select
          placeholder="All warehouses"
          value={warehouseId || undefined}
          onChange={(v) => setWarehouseId(v ?? "")}
          style={{ width: 220 }}
          allowClear
          showSearch
          filterOption={(input, opt) => String(opt?.children ?? "").toLowerCase().includes(input.toLowerCase())}
        >
          {warehouses.map((w) => (
            <Option key={w.id} value={w.id}>{w.name}</Option>
          ))}
        </Select>
        <Button type="primary" icon={<SearchOutlined />} onClick={load}>Search</Button>
        <Button icon={<ReloadOutlined />} onClick={() => { setSearch(""); setWarehouseId(""); }}>Reset</Button>
      </div>

      {!loading && rows.length === 0 && (
        <Alert
          type="success"
          showIcon
          icon={<WarningOutlined />}
          message="No expired stock on hand"
          description="Nothing matches the current filters."
          style={{ marginBottom: 16 }}
        />
      )}

      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f0f0f0", overflow: "hidden" }}>
        <Table
          dataSource={rows}
          columns={columns}
          rowKey={rowKeyOf}
          loading={loading}
          pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (t) => `${t} lines` }}
          rowSelection={{
            selectedRowKeys: selectedKeys,
            onChange: setSelectedKeys,
          }}
          size="middle"
          footer={() =>
            selectedRows.length ? (
              <Tooltip title="Total units to be written off">
                <strong>{selectedRows.length}</strong> line(s) selected · <strong>{totalUnits}</strong> unit(s)
              </Tooltip>
            ) : (
              <span style={{ color: "#9ca3af" }}>Select lines to write off</span>
            )
          }
        />
      </div>
    </div>
  );
};

export default WriteOffExpiredStockPage;
