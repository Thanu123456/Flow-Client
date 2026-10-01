export type WarehouseType = "store" | "distribution" | "returns" | "damaged" | "in_transit";

export interface UnitStock {
  unit: string;
  quantity: number;
}

export interface Warehouse {
  id: string;
  name: string;
  code?: string;
  warehouseType: WarehouseType;
  managerUserId?: string;
  managerName?: string;
  /** The shop's default warehouse (exactly one live warehouse has this). */
  isDefault: boolean;
  /** Total quantity the warehouse can hold; undefined = not set. */
  capacity?: number;
  contactPerson?: string;
  email?: string;
  mobile?: string;
  phone?: string;
  city?: string;
  address?: string;
  status: "active" | "inactive";
  totalProducts?: number;
  /** On-hand quantity grouped by unit of measure (never a mixed-unit sum). */
  stockByUnit?: UnitStock[];
  createdAt: string;
  updatedAt: string;
  /** Set when the warehouse is soft-deleted (visible under the "Deleted" filter). */
  deletedAt?: string;
}

export interface WarehouseFormData {
  name: string;
  code?: string;
  warehouseType?: WarehouseType;
  /** "" clears the manager on update. */
  managerUserId?: string;
  /** null clears the capacity on update. */
  capacity?: number | null;
  isDefault?: boolean;
  contactPerson?: string;
  email?: string;
  mobile?: string;
  phone?: string;
  city?: string;
  address?: string;
  status: "active" | "inactive";
  /** updatedAt the form was loaded with — lets the server detect concurrent edits. */
  updatedAt?: string;
}

export interface WarehouseFilters {
  search?: string;
  status?: "active" | "inactive";
}

export type WarehouseStatusFilter = "active" | "inactive" | "deleted";

export interface WarehousePaginationParams {
  page: number;
  limit: number;
  search?: string;
  status?: WarehouseStatusFilter;
  warehouseType?: WarehouseType;
}

export interface WarehouseResponse {
  data: Warehouse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ── detail view ─────────────────────────────────────────────────────────────

export interface WarehouseOverview {
  productsInStock: number;
  outOfStock: number;
  lowStock: number;
  stockByUnit: UnitStock[];
  /** On-hand value at cost (live batch cost; product cost for unbatched stock). */
  valuation: number;
  totalUnits: number;
  capacity?: number;
  utilizationPct?: number;
  zones: number;
  bins: number;
  transfersOut30d: number;
  transfersIn30d: number;
}

export type StockStatus = "ok" | "low" | "out";

export interface WarehouseStockRow {
  productId: string;
  variationId?: string;
  productName: string;
  variationLabel?: string;
  sku?: string;
  barcode?: string;
  unit?: string;
  quantity: number;
  minQty: number;
  maxQty?: number;
  reorderQty?: number;
  hasOverride: boolean;
  value: number;
  status: StockStatus;
  suggestedQty?: number;
}

export type MovementType =
  | "purchase"
  | "sale"
  | "sale_return"
  | "purchase_return"
  | "adjustment_in"
  | "adjustment_out"
  | "transfer_in"
  | "transfer_out";

export interface WarehouseMovement {
  occurredAt: string;
  type: MovementType;
  reference: string;
  productName: string;
  variationLabel?: string;
  /** Signed: + into the warehouse, - out of it. */
  quantity: number;
  note?: string;
}

export interface WarehouseLocation {
  id: string;
  warehouseId: string;
  parentId?: string;
  locationType: "zone" | "bin";
  code: string;
  name?: string;
  capacity?: number;
  notes?: string;
  isActive: boolean;
  usedQty: number;
  productCount: number;
  childCount: number;
}

export interface LocationStockRow {
  productId: string;
  variationId?: string;
  productName: string;
  variationLabel?: string;
  sku?: string;
  quantity: number;
}

export interface LocationFormData {
  locationType?: "zone" | "bin";
  parentId?: string;
  code: string;
  name?: string;
  capacity?: number | null;
  notes?: string;
  isActive: boolean;
}

export interface ReorderLevelInput {
  productId: string;
  variationId?: string;
  minQty: number;
  maxQty?: number;
  reorderQty?: number;
}

export interface ImportRowError {
  row: number;
  name?: string;
  message: string;
}

export interface WarehouseImportResult {
  totalRows: number;
  created: number;
  skipped: number;
  errors: ImportRowError[];
}

// ── stock transfers ─────────────────────────────────────────────────────────

export interface StockTransferItem {
  productId: string;
  variationId?: string;
  productName: string;
  variationLabel?: string;
  sku?: string;
  unit?: string;
  quantity: number;
  unitCost: number;
}

export interface StockTransfer {
  id: string;
  transferNumber: string;
  fromWarehouseId: string;
  fromWarehouse: string;
  toWarehouseId: string;
  toWarehouse: string;
  status: string;
  notes?: string;
  createdByName?: string;
  createdAt: string;
  itemCount: number;
  totalQuantity: number;
  totalValue: number;
  items?: StockTransferItem[];
}
