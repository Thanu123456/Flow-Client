import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Tabs, Card, Statistic, Tag, Button, Space, Spin, Progress, Result, Descriptions, App, Tooltip } from "antd";
import { ArrowLeftOutlined, EditOutlined, StarFilled, SwapOutlined, ReloadOutlined } from "@ant-design/icons";
import { warehouseService } from "../../../services/management/warehouseService";
import { usePermission } from "../../../contexts/PermissionContext";
import { PERMISSIONS } from "../../../types/auth/permissions";
import { apiErrorMessage } from "../../../utils/apiError";
import { fmtMoney, fmtQty, warehouseTypeColor, warehouseTypeLabel } from "../../../utils/warehouse";
import type { Warehouse, WarehouseOverview } from "../../../types/entities/warehouse.types";
import EditWarehouseModal from "../EditWarehouseModal";
import StockTab from "./StockTab";
import MovementsTab from "./MovementsTab";
import TransfersTab from "./TransfersTab";
import LocationsTab from "./LocationsTab";
import TransferModal from "./TransferModal";

/** One warehouse in depth: stock by product, valuation, low stock, movements, transfers, bins/zones. */
const WarehouseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { hasPermission } = usePermission();
  const canTransfer = hasPermission(PERMISSIONS.INVENTORY_TRANSFER);

  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [overview, setOverview] = useState<WarehouseOverview | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [tab, setTab] = useState("stock");
  const [reloadKey, setReloadKey] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const d = await warehouseService.getOverview(id);
      setWarehouse(d.warehouse);
      setOverview(d.overview);
      setNotFound(false);
    } catch (e: any) {
      if (e?.response?.status === 404) setNotFound(true);
      else message.error(apiErrorMessage(e, "Failed to load warehouse"));
    }
  }, [id, message]);

  useEffect(() => { load(); }, [load]);

  const refreshAll = () => {
    load();
    setReloadKey((k) => k + 1);
  };

  if (notFound) {
    return (
      <Result
        status="404"
        title="Warehouse not found"
        subTitle="It may have been deleted."
        extra={<Button type="primary" onClick={() => navigate("/warehouses")}>Back to warehouses</Button>}
      />
    );
  }

  if (!warehouse || !overview) {
    return <div className="py-20 text-center"><Spin size="large" /></div>;
  }

  const util = overview.utilizationPct;

  return (
    <div className="p-4">
      <Space className="mb-3" align="center" wrap>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/warehouses")}>Warehouses</Button>
        <h2 className="m-0 text-xl font-semibold">{warehouse.name}</h2>
        {warehouse.code && <Tag>{warehouse.code}</Tag>}
        <Tag color={warehouseTypeColor(warehouse.warehouseType)}>{warehouseTypeLabel(warehouse.warehouseType)}</Tag>
        {warehouse.isDefault && <Tag color="gold" icon={<StarFilled />}>Default</Tag>}
        <Tag color={warehouse.status === "active" ? "green" : "red"}>{warehouse.status === "active" ? "Active" : "Inactive"}</Tag>
        <Button icon={<EditOutlined />} onClick={() => setEditOpen(true)}>Edit</Button>
        {canTransfer && warehouse.status === "active" && (
          <Button type="primary" icon={<SwapOutlined />} onClick={() => setTransferOpen(true)}>Transfer stock</Button>
        )}
        <Button icon={<ReloadOutlined />} onClick={refreshAll} />
      </Space>

      <Descriptions size="small" column={{ xs: 1, sm: 2, lg: 4 }} className="mb-3">
        <Descriptions.Item label="Manager">{warehouse.managerName || "-"}</Descriptions.Item>
        <Descriptions.Item label="City">{warehouse.city || "-"}</Descriptions.Item>
        <Descriptions.Item label="Contact">{[warehouse.contactPerson, warehouse.mobile || warehouse.phone].filter(Boolean).join(" · ") || "-"}</Descriptions.Item>
        <Descriptions.Item label="Address">{warehouse.address || "-"}</Descriptions.Item>
      </Descriptions>

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <Card size="small"><Statistic title="Products in stock" value={overview.productsInStock} /></Card>
        <Card size="small"><Statistic title="Stock value (cost)" value={fmtMoney(overview.valuation)} /></Card>
        <Card size="small">
          <Statistic
            title="Low stock"
            value={overview.lowStock}
            valueStyle={overview.lowStock > 0 ? { color: "#fa8c16" } : undefined}
          />
        </Card>
        <Card size="small">
          <Statistic title="Out of stock" value={overview.outOfStock} valueStyle={overview.outOfStock > 0 ? { color: "#cf1322" } : undefined} />
        </Card>
        <Card size="small">
          <div className="text-gray-500 text-sm">On hand</div>
          <div className="text-lg font-semibold">
            {overview.stockByUnit.length === 0
              ? "0"
              : overview.stockByUnit.map((u) => `${fmtQty(u.quantity)}${u.unit ? ` ${u.unit}` : ""}`).join(", ")}
          </div>
        </Card>
        <Card size="small">
          <div className="text-gray-500 text-sm">Capacity</div>
          {overview.capacity && util !== undefined ? (
            <Tooltip title={`${fmtQty(overview.totalUnits)} of ${fmtQty(overview.capacity)}`}>
              <Progress percent={Math.min(100, Math.round(util))} size="small" status={util > 100 ? "exception" : util > 85 ? "active" : "normal"} />
            </Tooltip>
          ) : (
            <div className="text-lg font-semibold text-gray-400">Not set</div>
          )}
        </Card>
      </div>

      <Tabs
        activeKey={tab}
        onChange={setTab}
        destroyInactiveTabPane
        items={[
          {
            key: "stock",
            label: "Stock",
            children: <StockTab warehouseId={warehouse.id} mode="all" reloadKey={reloadKey} onChanged={load} />,
          },
          {
            key: "low",
            label: <span>Low stock{overview.lowStock + overview.outOfStock > 0 ? ` (${overview.lowStock + overview.outOfStock})` : ""}</span>,
            children: <StockTab warehouseId={warehouse.id} mode="attention" reloadKey={reloadKey} onChanged={load} />,
          },
          {
            key: "movements",
            label: "Movements",
            children: <MovementsTab warehouseId={warehouse.id} reloadKey={reloadKey} />,
          },
          {
            key: "transfers",
            label: <span>Transfers{overview.transfersIn30d + overview.transfersOut30d > 0 ? ` (${overview.transfersIn30d + overview.transfersOut30d} / 30d)` : ""}</span>,
            children: (
              <TransfersTab
                warehouseId={warehouse.id}
                reloadKey={reloadKey}
                canTransfer={canTransfer && warehouse.status === "active"}
                onNewTransfer={() => setTransferOpen(true)}
              />
            ),
          },
          {
            key: "locations",
            label: <span>Bins & zones{overview.zones + overview.bins > 0 ? ` (${overview.zones + overview.bins})` : ""}</span>,
            children: <LocationsTab warehouseId={warehouse.id} reloadKey={reloadKey} onChanged={load} />,
          },
        ]}
      />

      <EditWarehouseModal
        visible={editOpen}
        warehouse={warehouse}
        onCancel={() => setEditOpen(false)}
        onSuccess={refreshAll}
      />
      <TransferModal
        open={transferOpen}
        fromWarehouseId={warehouse.id}
        fromWarehouseName={warehouse.name}
        onClose={() => setTransferOpen(false)}
        onDone={() => {
          setTransferOpen(false);
          setTab("transfers");
          refreshAll();
        }}
      />
    </div>
  );
};

export default WarehouseDetailPage;
