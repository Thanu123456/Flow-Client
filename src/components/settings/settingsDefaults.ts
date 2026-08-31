// Factory defaults for the POS settings sections — mirrors the DB column
// defaults in tenant migration 000032. Used by "Reset to defaults".

export const RECEIPT_DEFAULTS = {
  receiptPaperSize: "80mm",
  receiptTopMarginMm: 2,
  receiptShowLogo: true,
  receiptShowBarcode: true,
  receiptShowAddressPhone: true,
  receiptShowCashier: true,
  receiptShowTaxBreakdown: false,
  receiptLanguage: "en",
  receiptHeaderText: "",
  receiptFooterText: "",
  receiptCopies: 1,
} as const;

export const SALES_DEFAULTS = {
  defaultPriceMode: "retail",
  allowNoStockBills: false,
  cashDrawerEnabled: false,
  salesMaxDiscountPct: 100,
  salesHoldExpiryHours: 24,
} as const;
