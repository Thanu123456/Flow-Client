import type { WarrantyPeriod, WarrantyType } from "../types/entities/warranty.types";

export const PERIOD_OPTIONS: { value: WarrantyPeriod; label: string }[] = [
  { value: "day", label: "Day(s)" },
  { value: "week", label: "Week(s)" },
  { value: "month", label: "Month(s)" },
  { value: "year", label: "Year(s)" },
  { value: "lifetime", label: "Lifetime" },
];

export const TYPE_OPTIONS: { value: WarrantyType; label: string }[] = [
  { value: "manufacturer", label: "Manufacturer" },
  { value: "store", label: "Store" },
  { value: "extended", label: "Extended (paid)" },
];

/** Largest duration the server accepts per period (mirrors maxWarrantyDuration in warranty_service.go). */
export const MAX_DURATION: Record<Exclude<WarrantyPeriod, "lifetime">, number> = {
  day: 36500,
  week: 5200,
  month: 1200,
  year: 100,
};

export const typeLabel = (t?: WarrantyType | string) =>
  TYPE_OPTIONS.find((o) => o.value === t)?.label ?? "Manufacturer";

export const typeColor = (t?: WarrantyType | string) =>
  t === "store" ? "purple" : t === "extended" ? "gold" : "blue";

/** "Lifetime", "1 Year", "6 Months" … */
export const formatTerm = (duration: number, period: WarrantyPeriod | string): string => {
  if (period === "lifetime") return "Lifetime";
  const unit = period === "day" ? "Day" : period === "week" ? "Week" : period === "year" ? "Year" : "Month";
  return `${duration} ${unit}${duration === 1 ? "" : "s"}`;
};
