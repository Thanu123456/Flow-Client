import React, { useCallback, useEffect, useState } from "react";
import { Table, Tag, Input, Select, Space, Button, App } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useDebounce } from "../../../hooks/ui/useDebounce";
import { warehouseService } from "../../../services/management/warehouseService";
import { apiErrorMessage } from "../../../utils/apiError";
import { MOVEMENT_LABELS, fmtQty } from "../../../utils/warehouse";
import type { MovementType, WarehouseMovement } from "../../../types/entities/warehouse.types";

interface Props {
  warehouseId: string;
  reloadKey?: number;
}

const RANGES = [
  { label: "Last 30 days", value: 30 },
  { label: "Last 90 days", value: 90 },
  { label: "Last year", value: 365 },
  { label: "All time", value: 3650 },
];

/** Every stock movement touching the warehouse: purchases, sales, returns, adjustments, transfers. */
const MovementsTab: React.FC<Props> = ({ warehouseId, reloadKey }) => {
  const { message } = App.useApp();
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 350);
  const [types, setTypes] = useState<MovementType[]>([]);
  const [days, setDays] = useState(90);
  const [rows, setRows] = useState<WarehouseMovement[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await warehouseService.getMovements(warehouseId, { page, limit, search: debounced, types, days });
      setRows(res.data);
      setTotal(res.total);
    } catch (e) {
      message.error(apiErrorMessage(e, "Failed to load movements"));
    } finally {
      setLoading(false);
    }
  }, [warehouseId, page, limit, debounced, types, days, message]);

  useEffect(() => { load(); }, [load, reloadKey]);
  useEffect(() => { setPage(1); }, [debounced, types, days]);

  return (
    <>
      <Space className="mb-3" wrap>
        <Input.Search
          allowClear
          placeholder="Search product or reference"
          style={{ width: 260 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          mode="multiple"
          allowClear
          placeholder="All movement types"
          style={{ minWidth: 260 }}
          value={types}
          onChange={setTypes}
          options={Object.entries(MOVEMENT_LABELS).map(([value, m]) => ({ value, label: m.label }))}
          maxTagCount="responsive"
        />
        <Select value={days} onChange={setDays} options={RANGES} style={{ width: 140 }} />
        <Button icon={<ReloadOutlined />} onClick={load} />
      </Space>

      <Table<WarehouseMovement>
        size="middle"
        loading={loading}
        dataSource={rows}
        rowKey={(r) => `${r.type}-${r.reference}-${r.productName}-${r.occurredAt}-${r.quantity}`}
        pagination={{
          current: page, pageSize: limit, total, showSizeChanger: true,
          onChange: (p, s) => { setPage(p); setLimit(s); },
          showTotal: (t) => `${t} movement${t === 1 ? "" : "s"}`,
        }}
        columns={[
          { title: "Date", dataIndex: "occurredAt", width: 130, render: (d: string) => dayjs(d).format("DD MMM YYYY") },
          {
            title: "Type",
            dataIndex: "type",
            render: (t: MovementType) => <Tag color={MOVEMENT_LABELS[t]?.color}>{MOVEMENT_LABELS[t]?.label ?? t}</Tag>,
          },
          { title: "Reference", dataIndex: "reference" },
          {
            title: "Product",
            render: (_: unknown, r) => `${r.productName}${r.variationLabel ? ` · ${r.variationLabel}` : ""}`,
          },
          {
            title: "Quantity",
            dataIndex: "quantity",
            align: "right" as const,
            render: (q: number) => (
              <span className={q >= 0 ? "text-green-600 font-semibold" : "text-red-500 font-semibold"}>
                {q > 0 ? "+" : ""}{fmtQty(q)}
              </span>
            ),
          },
          { title: "Note", dataIndex: "note", ellipsis: true, render: (n?: string) => n || "-" },
        ]}
      />
    </>
  );
};

export default MovementsTab;
