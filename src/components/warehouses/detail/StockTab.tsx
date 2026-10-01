import React, { useCallback, useEffect, useState } from "react";
import { Table, Tag, Input, Segmented, Button, Modal, InputNumber, Form, Space, Tooltip, App } from "antd";
import { EditOutlined, ReloadOutlined } from "@ant-design/icons";
import type { TableProps } from "antd";
import { useDebounce } from "../../../hooks/ui/useDebounce";
import { warehouseService } from "../../../services/management/warehouseService";
import { apiErrorMessage } from "../../../utils/apiError";
import { fmtMoney, fmtQty } from "../../../utils/warehouse";
import type { WarehouseStockRow } from "../../../types/entities/warehouse.types";

interface Props {
  warehouseId: string;
  /** "attention" shows only low / out-of-stock products (the Low stock tab). */
  mode: "all" | "attention";
  /** Bump to reload after something changed elsewhere (e.g. a transfer). */
  reloadKey?: number;
  onChanged?: () => void;
}

const STATUS_TAG: Record<string, { color: string; label: string }> = {
  ok: { color: "green", label: "OK" },
  low: { color: "orange", label: "Low" },
  out: { color: "red", label: "Out of stock" },
};

/** Products in the warehouse: quantity, value, reorder level, with inline reorder-level editing. */
const StockTab: React.FC<Props> = ({ warehouseId, mode, reloadKey, onChanged }) => {
  const { message } = App.useApp();
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 350);
  const [status, setStatus] = useState<string>(mode === "attention" ? "attention" : "all");
  const [rows, setRows] = useState<WarehouseStockRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sort, setSort] = useState<{ by?: "name" | "qty" | "value"; desc?: boolean }>({});
  const [loading, setLoading] = useState(false);

  const [editing, setEditing] = useState<WarehouseStockRow | null>(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await warehouseService.getStock(warehouseId, {
        page,
        limit,
        search: debounced,
        status: status === "all" ? undefined : (status as any),
        sort: sort.by,
        dir: sort.desc ? "desc" : "asc",
      });
      setRows(res.data);
      setTotal(res.total);
    } catch (e) {
      message.error(apiErrorMessage(e, "Failed to load stock"));
    } finally {
      setLoading(false);
    }
  }, [warehouseId, page, limit, debounced, status, sort, message]);

  useEffect(() => { load(); }, [load, reloadKey]);
  useEffect(() => { setPage(1); }, [debounced, status, sort]);

  const openEdit = (r: WarehouseStockRow) => {
    setEditing(r);
    form.setFieldsValue({ minQty: r.minQty, maxQty: r.maxQty, reorderQty: r.reorderQty });
  };

  const save = async () => {
    if (!editing) return;
    try {
      const v = await form.validateFields();
      setSaving(true);
      await warehouseService.setReorderLevel(warehouseId, {
        productId: editing.productId,
        variationId: editing.variationId,
        minQty: v.minQty ?? 0,
        maxQty: v.maxQty ?? undefined,
        reorderQty: v.reorderQty ?? undefined,
      });
      message.success("Reorder level saved");
      setEditing(null);
      load();
      onChanged?.();
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error(apiErrorMessage(e, "Failed to save reorder level"));
    } finally {
      setSaving(false);
    }
  };

  const clearOverride = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await warehouseService.clearReorderLevel(warehouseId, editing.productId, editing.variationId);
      message.success("Back to the product's own alert quantity");
      setEditing(null);
      load();
      onChanged?.();
    } catch (e) {
      message.error(apiErrorMessage(e, "Failed to clear reorder level"));
    } finally {
      setSaving(false);
    }
  };

  const handleTableChange: TableProps<WarehouseStockRow>["onChange"] = (_p, _f, sorter) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    const key = s?.columnKey as string | undefined;
    if (s?.order && (key === "name" || key === "qty" || key === "value")) setSort({ by: key, desc: s.order === "descend" });
    else setSort({});
  };
  const orderOf = (k: string) => (sort.by === k ? (sort.desc ? "descend" : "ascend") : null);

  return (
    <>
      <Space className="mb-3" wrap>
        <Input.Search
          allowClear
          placeholder="Search product, SKU or barcode"
          style={{ width: 280 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {mode === "all" && (
          <Segmented
            value={status}
            onChange={(v) => setStatus(String(v))}
            options={[
              { label: "All", value: "all" },
              { label: "In stock", value: "ok" },
              { label: "Low", value: "low" },
              { label: "Out", value: "out" },
            ]}
          />
        )}
        <Button icon={<ReloadOutlined />} onClick={load} />
      </Space>

      <Table<WarehouseStockRow>
        size="middle"
        loading={loading}
        dataSource={rows}
        rowKey={(r) => `${r.productId}-${r.variationId ?? ""}`}
        onChange={handleTableChange}
        pagination={{
          current: page, pageSize: limit, total, showSizeChanger: true,
          onChange: (p, s) => { setPage(p); setLimit(s); },
          showTotal: (t) => `${t} product${t === 1 ? "" : "s"}`,
        }}
        columns={[
          {
            title: "Product",
            key: "name",
            sorter: true,
            sortOrder: orderOf("name"),
            render: (_: unknown, r) => (
              <div>
                <div className="font-medium">{r.productName}{r.variationLabel ? ` · ${r.variationLabel}` : ""}</div>
                <div className="text-xs text-gray-500">{[r.sku, r.barcode].filter(Boolean).join(" · ")}</div>
              </div>
            ),
          },
          {
            title: "On hand",
            key: "qty",
            align: "right" as const,
            sorter: true,
            sortOrder: orderOf("qty"),
            render: (_: unknown, r) => <span className="font-semibold">{fmtQty(r.quantity)} {r.unit}</span>,
          },
          {
            title: "Reorder level",
            key: "reorder",
            align: "right" as const,
            render: (_: unknown, r) => (
              <Tooltip title={r.hasOverride ? "Warehouse-specific level" : "Using the product's alert quantity"}>
                <span className={r.hasOverride ? "font-medium text-blue-600" : "text-gray-500"}>
                  {r.minQty > 0 ? `≤ ${fmtQty(r.minQty)}` : "—"}
                  {r.maxQty !== undefined ? ` / max ${fmtQty(r.maxQty)}` : ""}
                </span>
              </Tooltip>
            ),
          },
          {
            title: "Value (cost)",
            key: "value",
            align: "right" as const,
            sorter: true,
            sortOrder: orderOf("value"),
            render: (_: unknown, r) => fmtMoney(r.value),
          },
          {
            title: "Status",
            key: "status",
            render: (_: unknown, r) => {
              const t = STATUS_TAG[r.status] ?? STATUS_TAG.ok;
              return (
                <Space size={4} wrap>
                  <Tag color={t.color}>{t.label}</Tag>
                  {r.suggestedQty !== undefined && r.suggestedQty > 0 && (
                    <Tooltip title="Suggested reorder quantity from this warehouse's reorder level">
                      <Tag>order {fmtQty(r.suggestedQty)}</Tag>
                    </Tooltip>
                  )}
                </Space>
              );
            },
          },
          {
            title: "",
            key: "edit",
            width: 60,
            render: (_: unknown, r) => (
              <Tooltip title="Set reorder level for this warehouse">
                <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(r)} />
              </Tooltip>
            ),
          },
        ]}
      />

      <Modal
        open={!!editing}
        title={editing ? `Reorder level — ${editing.productName}` : ""}
        onCancel={() => setEditing(null)}
        onOk={save}
        okText="Save"
        confirmLoading={saving}
        destroyOnHidden
        footer={(_, { OkBtn, CancelBtn }) => (
          <Space>
            {editing?.hasOverride && <Button danger onClick={clearOverride} loading={saving}>Use product default</Button>}
            <CancelBtn />
            <OkBtn />
          </Space>
        )}
      >
        <div className="mb-3 text-sm text-gray-500">
          Applies to this warehouse only. Below the minimum the product shows as <b>Low</b>.
        </div>
        <Form form={form} layout="vertical">
          <Form.Item name="minQty" label="Minimum (reorder point)" rules={[{ required: true, message: "Enter the minimum" }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="maxQty" label="Maximum (optional)">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="reorderQty" label="Reorder quantity (optional)" extra="If empty, the suggestion is maximum − on hand.">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default StockTab;
