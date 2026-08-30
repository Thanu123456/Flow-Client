// Tenant-admin settings: POS behaviour + business profile.
// Backend: GET/PATCH /admin/settings and /admin/settings/business-profile

export type PriceMode = "our" | "retail" | "wholesale";
export type PaperSize = "58mm" | "80mm" | "A4";
export type ReceiptLanguage = "en" | "si" | "ta";
export type BusinessType =
  | "retail"
  | "wholesale"
  | "restaurant"
  | "cafe"
  | "pharmacy"
  | "supermarket"
  | "other";

export interface PosSettings {
  id: string;
  tenantId: string;

  // Sales / checkout
  allowNoStockBills: boolean;
  defaultPriceMode: PriceMode;
  cashDrawerEnabled: boolean;
  salesMaxDiscountPct: number;
  salesHoldExpiryHours: number;

  // Receipt / invoice
  receiptPaperSize: PaperSize;
  receiptTopMarginMm: number;
  receiptShowLogo: boolean;
  receiptShowBarcode: boolean;
  receiptShowAddressPhone: boolean;
  receiptShowCashier: boolean;
  receiptShowTaxBreakdown: boolean;
  receiptLanguage: ReceiptLanguage;
  receiptHeaderText: string;
  receiptFooterText: string;
  receiptCopies: number;

  updatedAt?: string;
}

// Partial update payload — only send what changed.
export type PosSettingsUpdate = Partial<
  Omit<PosSettings, "id" | "tenantId" | "updatedAt">
>;

export interface BusinessProfile {
  id: string;
  shopName: string;
  businessType: BusinessType;
  businessRegistrationNumber: string;
  taxVatNumber: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  currency: string;
  timezone: string;
  language: string;
  logoUrl: string;
}

export type BusinessProfileUpdate = Omit<BusinessProfile, "id">;
