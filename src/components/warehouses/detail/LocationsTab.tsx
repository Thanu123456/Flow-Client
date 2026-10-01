import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Table, Tag, Button, Space, Modal, Form, Input, InputNumber, Select, Switch, Progress, Popconfirm, App, Tooltip, Empty } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, InboxOutlined } from "@ant-design/icons";
import { warehouseService } from "../../../services/management/warehouseService";
import { apiErrorMessage } from "../../../utils/apiError";
import { fmtQty } from "../../../utils/warehouse";
import type {
  LocationFormData, LocationStockRow, WarehouseLocation, WarehouseStockRow,
} from "../../../types/entities/warehouse.types";

const { TextArea } = Input;

interface Props {
  warehouseId: string;
  reloadKey?: number;
  onChanged?: () => void;
}

type Node = WarehouseLocation & { children?: Node[] };

/** Zones and bins with capacity, and what is put away in each bin. */
const LocationsTab: React.FC<Props> = ({ warehouseId, reloadKey, onChanged }) => {
  const { message } = App.useApp();
  const [locations, setLocations] = useState<WarehouseLocation[]>([]);
  const [loading, setLoading] = useState(false);

  const [editing, setEditing] = useState<{ mode: "create" | "edit"; type: "zone" | "bin"; loc?: WarehouseLocation } | null>(null);
  const [form] = Form.useForm<LocationFormData>();
  const [saving, setSaving] = useState(false);

  const [contents, setContents] = useState<WarehouseLocation | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setLocations(await warehouseService.getLocations(warehouseId));
    } catch (e) {
      message.error(apiErrorMessage(e, "Failed to load locations"));
    } finally {
      setLoading(false);
    }
  }, [warehouseId, message]);

  useEffect(() => { load(); }, [load, reloadKey]);

  const tree = useMemo<Node[]>(() => {
    const zones = locations.filter((l) => l.locationType === "zone").map<Node>((z) => ({ ...z, children: [] }));
    const byId = new Map(zones.map((z) => [z.id, z]));
    const loose: Node[] = [];
    for (const b of locations.filter((l) => l.locationType === "bin")) {
      const parent = b.parentId ? byId.get(b.parentId) : undefined;
      if (parent) parent.children!.push({ ...b });
      else loose.push({ ...b });
    }
    zones.forEach((z) => { if (z.children!.length === 0) delete z.children; });
    return [...zones, ...loose];
  }, [locations]);

  const zoneOptions = locations.filter((l) => l.locationType === "zone").map((z) => ({ value: z.id, label: `${z.code}${z.name ? ` — ${z.name}` : ""}` }));

  const openCreate = (type: "zone" | "bin", parentId?: string) => {
    setEditing({ mode: "create", type });
    form.resetFields();
    form.setFieldsValue({ isActive: true, parentId });
  };
  const openEdit = (loc: WarehouseLocation) => {
    setEditing({ mode: "edit", type: loc.locationType, loc });
    form.resetFields();
    form.setFieldsValue({ code: loc.code, name: loc.name, capacity: loc.capacity ?? undefined, notes: loc.notes, parentId: loc.parentId, isActive: loc.isActive });
  };

  const save = async () => {
    if (!editing) return;
    try {
      const v = await form.validateFields();
      setSaving(true);
      const payload: LocationFormData = {
        locationType: editing.type,
        parentId: editing.type === "bin" ? v.parentId : undefined,
        code: v.code,
        name: v.name,
        capacity: v.capacity ?? null,
        notes: v.notes,
        isActive: v.isActive,
      };
      if (editing.mode === "create") await warehouseService.createLocation(warehouseId, payload);
      else await warehouseService.updateLocation(warehouseId, editing.loc!.id, payload);
      message.success(editing.mode === "create" ? "Location created" : "Location updated");
      setEditing(null);
      load();
      onChanged?.();
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error(apiErrorMessage(e, "Failed to save location"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (loc: WarehouseLocation) => {
    try {
      await warehouseService.deleteLocation(warehouseId, loc.id);
      message.success("Location deleted");
      load();
      onChanged?.();
    } catch (e) {
      message.error(apiErrorMessage(e, "Failed to delete location"));
    }
  };

  return (
    <>
      <Space className="mb-3" wrap>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreate("zone")}>Add zone</Button>
        <Button icon={<PlusOutlined />} onClick={() => openCreate("bin")}>Add bin</Button>
      </Space>

      <Table<Node>
        size="middle"
        loading={loading}
        dataSource={tree}
        rowKey="id"
        pagination={false}
        expandable={{ defaultExpandAllRows: true }}
        locale={{ emptyText: <Empty description="No zones or bins yet — add a zone (e.g. Aisle A) then bins inside it" /> }}
        columns={[
          {
            title: "Location",
            render: (_: unknown, l) => (
              <Space>
                <Tag color={l.locationType === "zone" ? "geekblue" : "blue"}>{l.locationType === "zone" ? "Zone" : "Bin"}</Tag>
                <span className="font-medium">{l.code}</span>
                {l.name && <span className="text-gray-500">{l.name}</span>}
                {!l.isActive && <Tag>Inactive</Tag>}
              </Space>
            ),
          },
          {
            title: "Put away",
            width: 260,
            render: (_: unknown, l) =>
              l.locationType === "zone" ? (
                <span className="text-gray-400">{l.childCount} bin{l.childCount === 1 ? "" : "s"}</span>
              ) : l.capacity ? (
                <Tooltip title={`${fmtQty(l.usedQty)} of ${fmtQty(l.capacity)}`}>
                  <Progress
                    size="small"
                    percent={Math.min(100, Math.round((l.usedQty / l.capacity) * 100))}
                    status={l.usedQty > l.capacity ? "exception" : "normal"}
                    format={() => `${fmtQty(l.usedQty)} / ${fmtQty(l.capacity!)}`}
                  />
                </Tooltip>
              ) : (
                `${fmtQty(l.usedQty)}${l.productCount ? ` (${l.productCount} product${l.productCount === 1 ? "" : "s"})` : ""}`
              ),
          },
          {
            title: "Capacity",
            dataIndex: "capacity",
            align: "right" as const,
            render: (c?: number) => (c === undefined ? "—" : fmtQty(c)),
          },
          {
            title: "",
            width: 150,
            render: (_: unknown, l) => (
              <Space>
                {l.locationType === "bin" && (
                  <Tooltip title="What's in this bin">
                    <Button type="text" icon={<InboxOutlined />} onClick={() => setContents(l)} />
                  </Tooltip>
                )}
                {l.locationType === "zone" && (
                  <Tooltip title="Add a bin to this zone">
                    <Button type="text" icon={<PlusOutlined />} onClick={() => openCreate("bin", l.id)} />
                  </Tooltip>
                )}
                <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(l)} />
                <Popconfirm title={`Delete ${l.code}?`} okText="Delete" okButtonProps={{ danger: true }} onConfirm={() => remove(l)}>
                  <Button type="text" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />
      <div className="mt-2 text-xs text-gray-500">
        Put-away is informational: sales are not reserved from a bin, so bin quantities can drift from the warehouse total —
        re-assign when you restock.
      </div>

      <Modal
        open={!!editing}
        title={editing ? `${editing.mode === "create" ? "Add" : "Edit"} ${editing.type}` : ""}
        onCancel={() => setEditing(null)}
        onOk={save}
        confirmLoading={saving}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item name="code" label="Code" rules={[{ required: true, message: "Enter a code" }, { max: 30 }]} normalize={(v) => (typeof v === "string" ? v.toUpperCase() : v)}>
            <Input placeholder={editing?.type === "zone" ? "e.g. A" : "e.g. A-01"} maxLength={30} />
          </Form.Item>
          <Form.Item name="name" label="Name (optional)" rules={[{ max: 100 }]}>
            <Input placeholder={editing?.type === "zone" ? "e.g. Aisle A" : "e.g. Top shelf"} maxLength={100} />
          </Form.Item>
          {editing?.type === "bin" && (
            <Form.Item name="parentId" label="Zone (optional)">
              <Select allowClear placeholder="No zone" options={zoneOptions} />
            </Form.Item>
          )}
          <Form.Item name="capacity" label="Capacity (optional)" tooltip="Most quantity this location can hold">
            <InputNumber min={0} style={{ width: "100%" }} placeholder="No limit" />
          </Form.Item>
          <Form.Item name="notes" label="Notes" rules={[{ max: 500 }]}>
            <TextArea rows={2} maxLength={500} />
          </Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      <BinContentsModal
        warehouseId={warehouseId}
        bin={contents}
        onClose={() => setContents(null)}
        onChanged={() => { load(); onChanged?.(); }}
      />
    </>
  );
};

/** Put products away into a bin and see what it holds. */
const BinContentsModal: React.FC<{
  warehouseId: string;
  bin: WarehouseLocation | null;
  onClose: () => void;
  onChanged: () => void;
}> = ({ warehouseId, bin, onClose, onChanged }) => {
  const { message } = App.useApp();
  const [rows, setRows] = useState<LocationStockRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<WarehouseStockRow[]>([]);
  const [pick, setPick] = useState<string | undefined>();
  const [qty, setQty] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!bin) return;
    setLoading(true);
    try {
      setRows(await warehouseService.getLocationStock(warehouseId, bin.id));
    } catch (e) {
      message.error(apiErrorMessage(e, "Failed to load bin contents"));
    } finally {
      setLoading(false);
    }
  }, [bin, warehouseId, message]);

  const search = async (q: string) => {
    try {
      const res = await warehouseService.getStock(warehouseId, { page: 1, limit: 20, search: q, sort: "name" });
      setOptions(res.data.filter((r) => r.quantity > 0));
    } catch {
      setOptions([]);
    }
  };

  useEffect(() => {
    if (bin) {
      setPick(undefined);
      setQty(null);
      load();
      search("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bin]);

  const keyOf = (r: { productId: string; variationId?: string }) => `${r.productId}|${r.variationId ?? ""}`;

  const assign = async (productId: string, variationId: string | undefined, quantity: number) => {
    if (!bin) return;
    setSaving(true);
    try {
      await warehouseService.setLocationStock(warehouseId, bin.id, productId, quantity, variationId);
      message.success(quantity > 0 ? "Put away saved" : "Removed from bin");
      setPick(undefined);
      setQty(null);
      load();
      onChanged();
    } catch (e) {
      message.error(apiErrorMessage(e, "Failed to update the bin"));
    } finally {
      setSaving(false);
    }
  };

  const addSelected = () => {
    const r = options.find((o) => keyOf(o) === pick);
    if (!r || !qty || qty <= 0) {
      message.warning("Choose a product and a quantity");
      return;
    }
    assign(r.productId, r.variationId, qty);
  };

  return (
    <Modal open={!!bin} onCancel={onClose} footer={null} width={640} destroyOnHidden title={bin ? `Bin ${bin.code}${bin.capacity ? ` · capacity ${fmtQty(bin.capacity)}` : ""}` : ""}>
      <Space.Compact style={{ width: "100%" }} className="mb-3">
        <Select
          style={{ width: "55%" }}
          showSearch
          filterOption={false}
          value={pick}
          onChange={setPick}
          onSearch={search}
          placeholder="Product to put away"
          options={options.map((o) => ({ value: keyOf(o), label: `${o.productName}${o.variationLabel ? ` · ${o.variationLabel}` : ""} (${fmtQty(o.quantity)} on hand)` }))}
        />
        <InputNumber style={{ width: "25%" }} min={0} value={qty} onChange={(v) => setQty(v as number | null)} placeholder="Qty" />
        <Button type="primary" loading={saving} onClick={addSelected}>Put away</Button>
      </Space.Compact>

      <Table<LocationStockRow>
        size="small"
        loading={loading}
        rowKey={(r) => keyOf(r)}
        pagination={false}
        dataSource={rows}
        locale={{ emptyText: "Nothing put away in this bin yet" }}
        columns={[
          { title: "Product", render: (_: unknown, r) => `${r.productName}${r.variationLabel ? ` · ${r.variationLabel}` : ""}` },
          {
            title: "Quantity",
            width: 160,
            render: (_: unknown, r) => (
              <InputNumber
                min={0}
                defaultValue={r.quantity}
                onBlur={(e) => {
                  const v = Number(e.target.value);
                  if (!Number.isNaN(v) && v !== r.quantity) assign(r.productId, r.variationId, v);
                }}
                style={{ width: "100%" }}
              />
            ),
          },
          {
            title: "",
            width: 50,
            render: (_: unknown, r) => <Button type="text" danger icon={<DeleteOutlined />} onClick={() => assign(r.productId, r.variationId, 0)} />,
          },
        ]}
      />
    </Modal>
  );
};

export default LocationsTab;
