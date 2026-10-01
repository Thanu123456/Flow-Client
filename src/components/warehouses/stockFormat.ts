import type { UnitStock } from "../../types/entities/warehouse.types";

const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 3 });

/** "120 pcs, 15.5 kg" — one figure per unit; quantities in different units are never summed. */
export const formatStockByUnit = (stock?: UnitStock[]): string =>
  !stock || stock.length === 0
    ? "0"
    : stock.map((s) => (s.unit ? `${fmt(s.quantity)} ${s.unit}` : fmt(s.quantity))).join(", ");
