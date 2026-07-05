import React, { useState, useRef, useCallback } from "react";
import {
  Form, Select, Input, Button, Table, InputNumber, Typography,
  Space, Tag, Divider, Alert, AutoComplete, message, Card, Radio,
  Tooltip,
} from "antd";
import {
  ArrowUpOutlined, ArrowDownOutlined, DeleteOutlined,
  SearchOutlined, PlusOutlined, SaveOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../../services/api/axiosInstance";
import { useStockAdjustmentStore } from "../../store/inventory/stockAdjustmentStore";
import { useWarehouseStore } from "../../store/management/warehouseStore";
import type {
  AdjustmentMovementType,
  AdjustmentReferenceType,
  AdjustmentItemLocal,
  CreateAdjustmentRequest,
} from "../../types/entities/stockAdjustment.types";

const { Option } = Select;
const { TextArea } = Input;

interface ProductOption {
  value: string;
  label: string;
  productId: string;
  productName: string;
  productSKU: string;
  variationId?: string;
  variationType?: string;
  unitName?: string;
  warehouseId?: string;
  warehouseName?: string;
  currentStock: number;
}

const REFERENCE_OPTIONS: { value: AdjustmentReferenceType; label: string; forMovement: AdjustmentMovementType[] }[] = [
  { value: "purchase", label: "Purchase", forMovement: ["in"] },
  { value: "return",   label: "Return",   forMovement: ["in"] },
  { value: "other",    label: "Other",    forMovement: ["in", "out"] },
  { value: "sales",    label: "Sales",    forMovement: ["out"] },
  { value: "damage",   label: "Damage",   forMovement: ["out"] },
  { value: "expiry",   label: "Expiry",   forMovement: ["out"] },
];

const AddStockAdjustmentPage: React.FC = () => {
  const navigate = useNavigate();
  const { createAdjustment, submitting } = useStockAdjustmentStore();
  const { allWarehouses: warehouses, getAllWarehouses } = useWarehouseStore();

  const [form] = Form.useForm();
  const [movementType, setMovementType] = useState<AdjustmentMovementType>("in");
  const [items, setItems] = useState<AdjustmentItemLocal[]>([]);
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductOption | null>(null);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("");
  const [itemQty, setItemQty] = useState<number>(1);
  const [itemReason, setItemReason] = useState<string>("");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load warehouses once
  React.useEffect(() => {
    if (!warehouses.length) getAllWarehouses();
  }, []);

  const searchProducts = useCallback(async (query: string) => {
    if (!query.trim()) { setProductOptions([]); return; }
    setSearching(true);
    try {
      const res = await axiosInstance.get("/admin/products/search", { params: { q: query, limit: 20 } });
      const raw = res.data?.data ?? res.data ?? [];
      const opts: ProductOption[] = (Array.isArray(raw) ? raw : []).map((p: any) => {
        const label = p.variation_type
          ? `${p.name} – ${p.variation_type}`
          : p.name;
        return {
          value: `${p.sku ? `[${p.sku}] ` : ""}${label}`,
          label: `${p.sku ? `[${p.sku}] ` : ""}${label}`,
          productId: p.id,
          productName: p.name,
          productSKU: p.sku ?? "",
          variationId: p.variation_id ?? undefined,
          variationType: p.variation_type ?? undefined,
          unitName: p.unit_name ?? undefined,
          currentStock: parseFloat(p.current_stock ?? "0") || 0,
        };
      });
      setProductOptions(opts);
    } catch {
      setProductOptions([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleProductSearch = (value: string) => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => searchProducts(value), 300);
  };

  const handleProductSelect = (_: string, option: any) => {
    setSelectedProduct(option as ProductOption);
  };

  const handleAddItem = () => {
    if (!selectedProduct) { message.warning("Select a product first"); return; }
    if (!selectedWarehouseId) { message.warning("Select a warehouse"); return; }
    if (!itemQty || itemQty <= 0) { message.warning("Enter a valid quantity"); return; }

    const warehouse = warehouses.find((w) => w.id === selectedWarehouseId);

    // Validate stock for 'out' movements
    if (movementType === "out" && itemQty > selectedProduct.currentStock) {
      message.error(
        `Insufficient stock. Available: ${selectedProduct.currentStock}, Requested: ${itemQty}`
      );
      return;
    }

    // Merge duplicate lines
    const key = `${selectedProduct.productId}::${selectedProduct.variationId ?? ""}::${selectedWarehouseId}`;
    const existing = items.find((i) => i.key === key);
    if (existing) {
      setItems((prev) =>
        prev.map((i) => i.key === key ? { ...i, quantity: i.quantity + itemQty } : i)
      );
    } else {
      setItems((prev) => [
        ...prev,
        {
          key,
          productId: selectedProduct.productId,
          productName: selectedProduct.productName,
          productSKU: selectedProduct.productSKU,
          variationId: selectedProduct.variationId,
          variationType: selectedProduct.variationType,
          warehouseId: selectedWarehouseId,
          warehouseName: warehouse?.name ?? "",
          unitName: selectedProduct.unitName,
          currentStock: selectedProduct.currentStock,
          quantity: itemQty,
          reason: itemReason || undefined,
        },
      ]);
    }

    // Reset item entry fields
    setSelectedProduct(null);
    setItemQty(1);
    setItemReason("");
    setProductOptions([]);
    form.setFieldValue("productSearch", "");
  };

  const handleRemoveItem = (key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  };

  const handleSave = async () => {
    try {
      await form.validateFields();
    } catch {
      return;
    }
    if (!items.length) { message.warning("Add at least one item"); return; }

    const values = form.getFieldsValue();
    const req: CreateAdjustmentRequest = {
      movement_type: movementType,
      reference_type: values.referenceType,
      priority: movementType === "in" ? values.priority : undefined,
      reason: values.reason || undefined,
      notes: values.notes || undefined,
      items: items.map((i) => ({
        product_id: i.productId,
        warehouse_id: i.warehouseId,
        variation_id: i.variationId || undefined,
        quantity: i.quantity,
        reason: i.reason || undefined,
      })),
    };

    try {
      await createAdjustment(req);
      message.success("Adjustment created successfully");
      navigate("/adjustments");
    } catch (err: any) {
      message.error(err?.message ?? "Failed to create adjustment");
    }
  };

  const itemColumns = [
    {
      title: "Product",
      key: "product",
      render: (_: any, row: AdjustmentItemLocal) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.productName}</div>
          {row.variationType && <Tag style={{ marginTop: 2 }}>{row.variationType}</Tag>}
          {row.productSKU && <span style={{ color: "#9ca3af", fontSize: 12 }}>{row.productSKU}</span>}
        </div>
      ),
    },
    {
      title: "Warehouse",
      dataIndex: "warehouseName",
      key: "warehouse",
    },
    {
      title: "Current Stock",
      dataIndex: "currentStock",
      key: "currentStock",
      align: "center" as const,
      render: (v: number, row: AdjustmentItemLocal) => (
        <Tag color={movementType === "out" && row.quantity > v ? "red" : "default"}>
          {v} {row.unitName ?? ""}
        </Tag>
      ),
    },
    {
      title: "Qty",
      dataIndex: "quantity",
      key: "quantity",
      align: "center" as const,
      render: (v: number, row: AdjustmentItemLocal) => (
        <InputNumber
          min={0.01}
          value={v}
          onChange={(val) =>
            setItems((prev) => prev.map((i) => i.key === row.key ? { ...i, quantity: val ?? v } : i))
          }
          style={{ width: 90 }}
        />
      ),
    },
    {
      title: "Unit",
      dataIndex: "unitName",
      key: "unit",
      render: (v: string) => v || "—",
    },
    {
      title: "",
      key: "del",
      align: "center" as const,
      render: (_: any, row: AdjustmentItemLocal) => (
        <Button
          size="small"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(row.key)}
        />
      ),
    },
  ];

  const availableRefOptions = REFERENCE_OPTIONS.filter((r) => r.forMovement.includes(movementType));

  return (
    <div style={{ padding: "24px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>New Stock Adjustment</Typography.Title>
        <Typography.Text type="secondary">Adjust inventory levels with priority-based batch tracking</Typography.Text>
      </div>

      <Form form={form} layout="vertical">
        {/* ── Movement type selector ── */}
        <Card
          style={{ borderRadius: 12, marginBottom: 16, border: "1px solid #f0f0f0" }}
          bodyStyle={{ padding: "20px 24px" }}
        >
          <Form.Item label={<strong>Movement Type</strong>} required style={{ marginBottom: 0 }}>
            <Radio.Group
              value={movementType}
              onChange={(e) => {
                setMovementType(e.target.value);
                form.resetFields(["referenceType", "priority"]);
                setItems([]);
              }}
              buttonStyle="solid"
            >
              <Radio.Button value="in" style={{ height: 40, lineHeight: "38px", minWidth: 120, textAlign: "center" }}>
                <ArrowUpOutlined /> &nbsp; Stock In
              </Radio.Button>
              <Radio.Button value="out" style={{ height: 40, lineHeight: "38px", minWidth: 120, textAlign: "center" }}>
                <ArrowDownOutlined /> &nbsp; Stock Out
              </Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Card>

        {/* ── Header fields ── */}
        <Card
          style={{ borderRadius: 12, marginBottom: 16, border: "1px solid #f0f0f0" }}
          bodyStyle={{ padding: "20px 24px" }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <Form.Item
              label="Reference Type"
              name="referenceType"
              rules={[{ required: true, message: "Select a reference type" }]}
            >
              <Select placeholder="Select reference type">
                {availableRefOptions.map((r) => (
                  <Option key={r.value} value={r.value}>{r.label}</Option>
                ))}
              </Select>
            </Form.Item>

            {movementType === "in" && (
              <Form.Item
                label={
                  <span>
                    Priority{" "}
                    <Tooltip title="High priority stock is deducted first during sales. Use 'Low' for slow-moving or clearance items.">
                      <span style={{ color: "#6366f1", cursor: "help", fontSize: 12 }}>(?)</span>
                    </Tooltip>
                  </span>
                }
                name="priority"
                rules={[{ required: true, message: "Select a priority" }]}
              >
                <Select placeholder="Select priority">
                  <Option value="high">
                    <Tag color="red">HIGH</Tag> — Sell first (FIFO top)
                  </Option>
                  <Option value="low">
                    <Tag color="blue">LOW</Tag> — Sell last (slow-moving)
                  </Option>
                </Select>
              </Form.Item>
            )}

            <Form.Item label="Reason" name="reason">
              <Input placeholder="Optional reason for this adjustment" />
            </Form.Item>
          </div>

          <Form.Item label="Notes" name="notes" style={{ marginBottom: 0 }}>
            <TextArea rows={2} placeholder="Additional notes..." />
          </Form.Item>
        </Card>

        {/* ── Add item section ── */}
        <Card
          title={<strong>Add Items</strong>}
          style={{ borderRadius: 12, marginBottom: 16, border: "1px solid #f0f0f0" }}
          bodyStyle={{ padding: "20px 24px" }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr auto", gap: 12, alignItems: "flex-end" }}>
            <Form.Item label="Product Search" name="productSearch" style={{ marginBottom: 0 }}>
              <AutoComplete
                options={productOptions}
                onSearch={handleProductSearch}
                onSelect={handleProductSelect}
                notFoundContent={searching ? "Searching..." : "No products found"}
              >
                <Input
                  prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
                  placeholder="Search by name, SKU or barcode..."
                />
              </AutoComplete>
            </Form.Item>

            <Form.Item label="Warehouse" style={{ marginBottom: 0 }}>
              <Select
                placeholder="Select warehouse"
                value={selectedWarehouseId || undefined}
                onChange={setSelectedWarehouseId}
                showSearch
                filterOption={(input, opt) =>
                  String(opt?.children ?? "").toLowerCase().includes(input.toLowerCase())
                }
              >
                {warehouses.map((w) => (
                  <Option key={w.id} value={w.id}>{w.name}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Quantity" style={{ marginBottom: 0 }}>
              <InputNumber
                min={0.01}
                value={itemQty}
                onChange={(v) => setItemQty(v ?? 1)}
                style={{ width: "100%" }}
                placeholder="Qty"
              />
            </Form.Item>

            <Form.Item label="Item Reason" style={{ marginBottom: 0 }}>
              <Input
                value={itemReason}
                onChange={(e) => setItemReason(e.target.value)}
                placeholder="Optional"
              />
            </Form.Item>

            <Form.Item label=" " style={{ marginBottom: 0 }}>
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={handleAddItem}
                style={{ height: 32 }}
              >
                Add
              </Button>
            </Form.Item>
          </div>

          {selectedProduct && (
            <Alert
              type={movementType === "in" ? "info" : "warning"}
              style={{ marginTop: 12 }}
              message={
                <Space>
                  <span><strong>{selectedProduct.productName}</strong>{selectedProduct.variationType ? ` – ${selectedProduct.variationType}` : ""}</span>
                  <span style={{ color: "#6b7280" }}>Current stock: <strong>{selectedProduct.currentStock}</strong> {selectedProduct.unitName}</span>
                </Space>
              }
              showIcon
            />
          )}
        </Card>

        {/* ── Items table ── */}
        {items.length > 0 && (
          <Card
            title={
              <Space>
                <strong>Items to Adjust</strong>
                <Tag color="blue">{items.length} item{items.length !== 1 ? "s" : ""}</Tag>
              </Space>
            }
            style={{ borderRadius: 12, marginBottom: 16, border: "1px solid #f0f0f0" }}
            bodyStyle={{ padding: 0 }}
          >
            <Table
              dataSource={items}
              columns={itemColumns}
              rowKey="key"
              pagination={false}
              size="middle"
              rowClassName={(row) =>
                movementType === "out" && row.quantity > row.currentStock ? "row-error" : ""
              }
            />
          </Card>
        )}

        {/* ── Action bar ── */}
        <Divider />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <Button onClick={() => navigate("/adjustments")}>Cancel</Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={submitting}
            onClick={handleSave}
            disabled={!items.length}
          >
            Save Adjustment
          </Button>
        </div>
      </Form>

      <style>{`
        .row-error td { background: #fff1f0 !important; }
      `}</style>
    </div>
  );
};

export default AddStockAdjustmentPage;
