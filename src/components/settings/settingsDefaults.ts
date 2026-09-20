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
  blindCashCount: true,
  cashVarianceAlertThreshold: 500,
  receiptEmailEnabled: false,
  receiptSmsEnabled: false,
  receiptQrEnabled: true,
  emailjsServiceId: "",
  emailjsTemplateId: "",
  emailjsPublicKey: "",
  notifylkUserId: "",
  notifylkSenderId: "",
  // notifylkApiKey deliberately omitted — "Reset to defaults" shouldn't
  // touch a saved secret; see SalesSettings.handleSave for how a blank
  // value here is kept from ever wiping it out.
} as const;
