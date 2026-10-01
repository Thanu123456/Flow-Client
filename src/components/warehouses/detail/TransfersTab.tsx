import React, { useCallback, useEffect, useState } from "react";
import { Table, Tag, Input, Space, Button, App } from "antd";
import { PlusOutlined, ReloadOutlined, ArrowRightOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useDebounce } from "../../../hooks/ui/useDebounce";
import { stockTransferService } from "../../../services/inventory/stockTransferService";
import { apiErrorMessage } from "../../../utils/apiError";
import { fmtMoney, fmtQty } from "../../../utils/warehouse";
import type { StockTransfer } from "../../../types/entities/warehouse.types";

interface Props {
  warehouseId: string;
  reloadKey?: number;
  canTransfer: boolean;
  onNewTransfer: () => void;
}

/** Transfers into / out of this warehouse; expand a row for its products and cost. */
const TransfersTab: React.FC<Props> = ({ warehouseId, reloadKey, canTransfer, onNewTransfer }) => {
  const { message } = App.useApp();
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 350);
  const [rows, setRows] = useState<StockTransfer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<Record<string, StockTransfer>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await stockTransferService.list({ page, limit, warehouseId, search: debounced });
      setRows(res.data);
      setTotal(res.total);
    } catch (e) {
      message.error(apiErrorMessage(e, "Failed to load transfers"));
    } finally {
      setLoading(false);
    }
  }, [warehouseId, page, limit, debounced, message]);

  useEffect(() => { load(); }, [load, reloadKey]);
  useEffect(() => { setPage(1); }, [debounced]);

  const onExpand = async (expanded: boolean, record: StockTransfer) => {
    if (!expanded || details[record.id]) return;
    try {
      const full = await stockTransferService.get(record.id);
      setDetails((d) => ({ ...d, [record.id]: full }));
    } catch (e) {
      message.error(apiErrorMessage(e, "Failed to load transfer"));
    }
  };

  return (
    <>
      <Space className="mb-3" wrap>
        <Input.Search
          allowClear
          placeholder="Search transfer number or product"
          style={{ width: 280 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button icon={<ReloadOutlined />} onClick={load} />
        {canTransfer && (
          <Button type="primary" icon={<PlusOutlined />} onClick={onNewTransfer}>New transfer</Button>
        )}
      </Space>

      <Table<StockTransfer>
        size="middle"
        loading={loading}
        dataSource={rows}
        rowKey="id"
        onExpand={onExpand}
        expandable={{
          expandedRowRender: (t) => {
            const d = details[t.id];
            return (
              <Table
                size="small"
                rowKey={(i) => `${i.productId}-${i.variationId ?? ""}`}
                pagination={false}
                loading={!d}
                dataSource={d?.items ?? []}
                columns={[
                  { title: "Product", render: (_: unknown, i) => `${i.productName}${i.variationLabel ? ` · ${i.variationLabel}` : ""}` },
                  { title: "Quantity", align: "right" as const, render: (_: unknown, i) => `${fmtQty(i.quantity)} ${i.unit ?? ""}` },
                  { title: "Unit cost", align: "right" as const, render: (_: unknown, i) => fmtMoney(i.unitCost) },
                  { title: "Value", align: "right" as const, render: (_: unknown, i) => fmtMoney(i.quantity * i.unitCost) },
                ]}
              />
            );
          },
        }}
        pagination={{
          current: page, pageSize: limit, total, showSizeChanger: true,
          onChange: (p, s) => { setPage(p); setLimit(s); },
          showTotal: (t) => `${t} transfer${t === 1 ? "" : "s"}`,
        }}
        columns={[
          { title: "Transfer", dataIndex: "transferNumber", render: (n: string) => <span className="font-semibold">{n}</span> },
          { title: "Date", dataIndex: "createdAt", render: (d: string) => dayjs(d).format("DD MMM YYYY, HH:mm") },
          {
            title: "Route",
            render: (_: unknown, t) => (
              <Space size={6}>
                <span className={t.fromWarehouseId === warehouseId ? "font-semibold" : ""}>{t.fromWarehouse}</span>
                <ArrowRightOutlined className="text-gray-400" />
                <span className={t.toWarehouseId === warehouseId ? "font-semibold" : ""}>{t.toWarehouse}</span>
              </Space>
            ),
          },
          {
            title: "Direction",
            render: (_: unknown, t) => (t.fromWarehouseId === warehouseId ? <Tag color="red">Out</Tag> : <Tag color="green">In</Tag>),
          },
          { title: "Items", dataIndex: "itemCount", align: "center" as const },
          { title: "Quantity", dataIndex: "totalQuantity", align: "right" as const, render: fmtQty },
          { title: "Value", dataIndex: "totalValue", align: "right" as const, render: fmtMoney },
          { title: "By", dataIndex: "createdByName", render: (n?: string) => n || "-" },
        ]}
      />
    </>
  );
};

export default TransfersTab;
