import type { MovementType, WarehouseType } from "../types/entities/warehouse.types";

export const WAREHOUSE_TYPE_OPTIONS: { value: WarehouseType; label: string; hint: string }[] = [
  { value: "store", label: "Store", hint: "A shop floor / branch — can be sold from at the POS" },
  { value: "distribution", label: "Distribution", hint: "Central or regional stock — can be sold from at the POS" },
  { value: "returns", label: "Returns", hint: "Holds customer returns awaiting inspection — not sold from" },
  { value: "damaged", label: "Damaged", hint: "Damaged / quarantined stock — not sold from" },
  { value: "in_transit", label: "In transit", hint: "Virtual holding area for goods on the move — not sold from" },
];

export const warehouseTypeLabel = (t?: WarehouseType | string) =>
  WAREHOUSE_TYPE_OPTIONS.find((o) => o.value === t)?.label ?? "Store";

export const warehouseTypeColor = (t?: WarehouseType | string) =>
  ({ store: "blue", distribution: "geekblue", returns: "orange", damaged: "red", in_transit: "purple" } as Record<string, string>)[t ?? "store"] ?? "blue";

/** Only store / distribution warehouses can be sold from or be the default. */
export const isSellableWarehouseType = (t?: WarehouseType | string) => t === "store" || t === "distribution";

export const MOVEMENT_LABELS: Record<MovementType, { label: string; color: string }> = {
  purchase: { label: "Purchase (GRN)", color: "green" },
  sale: { label: "Sale", color: "blue" },
  sale_return: { label: "Sale return", color: "cyan" },
  purchase_return: { label: "Purchase return", color: "orange" },
  adjustment_in: { label: "Adjustment in", color: "green" },
  adjustment_out: { label: "Adjustment out", color: "red" },
  transfer_in: { label: "Transfer in", color: "purple" },
  transfer_out: { label: "Transfer out", color: "purple" },
};

export const fmtQty = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 3 });
export const fmtMoney = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
