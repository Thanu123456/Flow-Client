import React, { useCallback, useEffect, useState } from "react";
import { Table, Button, Tag, Select, Space, Typography, message, Alert } from "antd";
import { ReloadOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { stockAdjustmentService } from "../../services/inventory/stockAdjustmentService";
import { useWarehouseStore } from "../../store/management/warehouseStore";
import type { StockLedgerDiscrepancy } from "../../types/entities/stockAdjustment.types";

const { Option } = Select;

const StockReconcilePage: React.FC = () => {
  const navigate = useNavigate();
  const { allWarehouses: warehouses, getAllWarehouses } = useWarehouseStore();
  const [rows, setRows] = useState<StockLedgerDiscrepancy[]>([]);
  const [loading, setLoading] = useState(false);
  const [warehouseId, setWarehouseId] = useState<string>("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await stockAdjustmentService.reconcile(warehouseId || undefined));
    } catch {
      message.error("Failed to run reconciliation");
    } finally {
      setLoading(false);
    }
  }, [warehouseId]);

  useEffect(() => {
    if (!warehouses.length) getAllWarehouses();
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns = [
    {
      title: "Product",
      key: "product",
      render: (_: any, r: StockLedgerDiscrepancy) => (
        <div>
          <div style={{ fontWeight: 600 }}>{r.productName}</div>
          {r.variationType && <Tag>{r.variationType}</Tag>}
          {r.productSKU && <span style={{ color: "#9ca3af", fontSize: 12 }}>{r.productSKU}</span>}
        </div>
      ),
    },
    { title: "Warehouse", dataIndex: "warehouseName", key: "warehouse" },
    { title: "Aggregate Stock", dataIndex: "aggregateQty", key: "agg", align: "right" as const, render: (v: number, r: StockLedgerDiscrepancy) => `${v} ${r.unitName ?? ""}` },
    { title: "Sum of Batches", dataIndex: "batchQty", key: "batch", align: "right" as const, render: (v: number, r: StockLedgerDiscrepancy) => `${v} ${r.unitName ?? ""}` },
    {
      title: "Difference", dataIndex: "difference", key: "diff", align: "right" as const,
      render: (v: number) => <Tag color={v > 0 ? "orange" : "red"}>{v > 0 ? "+" : ""}{v}</Tag>,
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate("/adjustments")} style={{ padding: 0, marginBottom: 4 }}>
        Back to Adjustments
      </Button>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <Typography.Title level={4} style={{ margin: 0 }}>Batch Ledger Reconciliation</Typography.Title>
          <Typography.Text type="secondary">
            Rows where the aggregate stock counter disagrees with the summed batch quantities
          </Typography.Text>
        </div>
        <Space>
          <Select placeholder="All warehouses" value={warehouseId || undefined} onChange={(v) => setWarehouseId(v ?? "")} allowClear style={{ width: 220 }}>
            {warehouses.map((w) => <Option key={w.id} value={w.id}>{w.name}</Option>)}
          </Select>
          <Button type="primary" icon={<ReloadOutlined />} onClick={load}>Run</Button>
        </Space>
      </div>

      {!loading && rows.length === 0 && (
        <Alert type="success" showIcon style={{ marginBottom: 16 }}
          message="Ledger is consistent" description="Every aggregate stock figure matches its batch total." />
      )}
      {rows.length > 0 && (
        <Alert type="warning" showIcon style={{ marginBottom: 16 }}
          message={`${rows.length} discrepancy row(s)`}
          description="The aggregate counter is authoritative for availability; a positive difference means batch data lags behind. Correct persistent drift with a stock take." />
      )}

      <Table
        dataSource={rows}
        columns={columns}
        rowKey={(r) => `${r.productId}-${r.variationId ?? ""}-${r.warehouseId}`}
        loading={loading}
        pagination={{ pageSize: 25 }}
        size="middle"
        style={{ background: "#fff", borderRadius: 12 }}
      />
    </div>
  );
};

export default StockReconcilePage;
