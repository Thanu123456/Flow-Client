import type { AdjustmentStatus } from "../../types/entities/stockAdjustment.types";

export const STATUS_META: Record<AdjustmentStatus, { color: string; label: string }> = {
  pending_approval: { color: "gold", label: "Pending Approval" },
  posted: { color: "green", label: "Posted" },
  rejected: { color: "red", label: "Rejected" },
};

export const SOURCE_LABELS: Record<string, string> = {
  manual: "Manual",
  stock_take: "Stock Take",
  expiry_write_off: "Expiry Write-off",
  reversal: "Reversal",
};

export const REFERENCE_LABELS: Record<string, string> = {
  purchase: "Purchase",
  sales: "Sales",
  damage: "Damage",
  expiry: "Expiry",
  return: "Return",
  other: "Other",
};
