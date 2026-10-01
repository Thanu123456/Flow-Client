import React, { useEffect, useState } from "react";
import { Modal, Select, Input, InputNumber, Table, Button, Alert, App, Space } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { warehouseService } from "../../../services/management/warehouseService";
import { stockTransferService } from "../../../services/inventory/stockTransferService";
import { useWarehouseStore } from "../../../store/management/warehouseStore";
import { apiErrorMessage } from "../../../utils/apiError";
import { fmtQty } from "../../../utils/warehouse";
import type { StockTransfer, WarehouseStockRow } from "../../../types/entities/warehouse.types";

const { TextArea } = Input;

interface Line {
  key: string;
  productId: string;
  variationId?: string;
  name: string;
  unit?: string;
  available: number;
  quantity: number;
}

interface Props {
  open: boolean;
  /** The warehouse stock is moved out of. */
  fromWarehouseId: string;
  fromWarehouseName: string;
  onClose: () => void;
  onDone: (t: StockTransfer) => void;
}

/** Move stock from this warehouse to another. Cost and expiry of the moved batches are preserved. */
const TransferModal: React.FC<Props> = ({ open, fromWarehouseId, fromWarehouseName, onClose, onDone }) => {
  const { message } = App.useApp();
  const { allWarehouses, getAllWarehouses } = useWarehouseStore();
  const [toId, setToId] = useState<string | undefined>();
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [options, setOptions] = useState<WarehouseStockRow[]>([]);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setToId(undefined);
      setNotes("");
      setLines([]);
      setOptions([]);
      if (allWarehouses.length === 0) getAllWarehouses();
      search("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const search = async (q: string) => {
    setSearching(true);
    try {
      const res = await warehouseService.getStock(fromWarehouseId, { page: 1, limit: 20, search: q, sort: "name" });
      setOptions(res.data.filter((r) => r.quantity > 0));
    } catch {
      setOptions([]);
    } finally {
      setSearching(false);
    }
  };

  const keyOf = (r: { productId: string; variationId?: string }) => `${r.productId}-${r.variationId ?? ""}`;

  const addLine = (key: string) => {
    const r = options.find((o) => keyOf(o) === key);
    if (!r || lines.some((l) => l.key === key)) return;
    setLines((ls) => [
      ...ls,
      {
        key,
        productId: r.productId,
        variationId: r.variationId,
        name: `${r.productName}${r.variationLabel ? ` · ${r.variationLabel}` : ""}`,
        unit: r.unit,
        available: r.quantity,
        quantity: 1,
      },
    ]);
  };

  const submit = async () => {
    if (!toId) {
      message.warning("Choose the destination warehouse");
      return;
    }
    if (lines.length === 0) {
      message.warning("Add at least one product");
      return;
    }
    const bad = lines.find((l) => !(l.quantity > 0) || l.quantity > l.available);
    if (bad) {
      message.warning(`Check the quantity for ${bad.name} (max ${fmtQty(bad.available)})`);
      return;
    }
    setSubmitting(true);
    try {
      const t = await stockTransferService.create({
        fromWarehouseId,
        toWarehouseId: toId,
        notes: notes.trim() || undefined,
        items: lines.map((l) => ({ productId: l.productId, variationId: l.variationId, quantity: l.quantity })),
      });
      message.success(`Transfer ${t.transferNumber} completed`);
      onDone(t);
    } catch (e) {
      message.error(apiErrorMessage(e, "Transfer failed"));
    } finally {
      setSubmitting(false);
    }
  };

  const destinations = allWarehouses.filter((w) => w.id !== fromWarehouseId && w.status === "active");

  return (
    <Modal
      open={open}
      title={`Transfer stock from ${fromWarehouseName}`}
      onCancel={onClose}
      onOk={submit}
      okText="Transfer stock"
      confirmLoading={submitting}
      width={760}
      destroyOnHidden
    >
      <Alert
        type="info"
        showIcon
        className="mb-3"
        message="The transfer happens immediately. The destination receives the same batches at the same cost and expiry; there is no gain or loss in the books."
      />
      <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <div className="mb-1 font-medium">To warehouse</div>
          <Select
            style={{ width: "100%" }}
            placeholder="Select destination"
            value={toId}
            onChange={setToId}
            showSearch
            optionFilterProp="label"
            options={destinations.map((w) => ({ value: w.id, label: `${w.name}${w.code ? ` (${w.code})` : ""}` }))}
          />
        </div>
        <div>
          <div className="mb-1 font-medium">Add product</div>
          <Select
            style={{ width: "100%" }}
            showSearch
            filterOption={false}
            value={null as any}
            placeholder="Search products with stock here"
            loading={searching}
            onSearch={search}
            onChange={(v: any) => addLine(String(v))}
            options={options
              .filter((o) => !lines.some((l) => l.key === keyOf(o)))
              .map((o) => ({
                value: keyOf(o),
                label: `${o.productName}${o.variationLabel ? ` · ${o.variationLabel}` : ""} — ${fmtQty(o.quantity)} ${o.unit ?? ""} available`,
              }))}
          />
        </div>
      </div>

      <Table<Line>
        size="small"
        rowKey="key"
        pagination={false}
        dataSource={lines}
        locale={{ emptyText: "No products added yet" }}
        columns={[
          { title: "Product", dataIndex: "name" },
          { title: "Available", dataIndex: "available", align: "right" as const, render: (a: number, l) => `${fmtQty(a)} ${l.unit ?? ""}` },
          {
            title: "Transfer qty",
            width: 150,
            render: (_: unknown, l) => (
              <InputNumber
                min={0}
                max={l.available}
                value={l.quantity}
                onChange={(v) => setLines((ls) => ls.map((x) => (x.key === l.key ? { ...x, quantity: Number(v) || 0 } : x)))}
                style={{ width: "100%" }}
              />
            ),
          },
          {
            title: "",
            width: 50,
            render: (_: unknown, l) => (
              <Button type="text" danger icon={<DeleteOutlined />} onClick={() => setLines((ls) => ls.filter((x) => x.key !== l.key))} />
            ),
          },
        ]}
      />

      <Space direction="vertical" style={{ width: "100%" }} className="mt-3">
        <div className="font-medium">Notes (optional)</div>
        <TextArea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={1000} />
      </Space>
    </Modal>
  );
};

export default TransferModal;
