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

  // Cash control
  // Hides expected cash from the cashier while counting the drawer at shift
  // close (a common theft-deterrence pattern) — on by default.
  blindCashCount: boolean;
  // Ended shifts with |variance| beyond this amount email the tenant admin.
  cashVarianceAlertThreshold: number;

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

  // Digital receipt delivery
  // Email is sent client-side via EmailJS (its "public key" is meant to be
  // used from the browser — not a secret). SMS goes through notify.lk
  // server-side, since its api_key genuinely is one: this object only ever
  // carries whether it's configured (notifylkApiKeySet), never the key itself.
  receiptEmailEnabled: boolean;
  receiptSmsEnabled: boolean;
  receiptQrEnabled: boolean;
  emailjsServiceId: string;
  emailjsTemplateId: string;
  emailjsPublicKey: string;
  notifylkUserId: string;
  notifylkSenderId: string;
  notifylkApiKeySet: boolean;

  updatedAt?: string;
  updatedByName?: string;
}

// Partial update payload — only send what changed.
export type PosSettingsUpdate = Partial<
  Omit<PosSettings, "id" | "tenantId" | "updatedAt" | "updatedByName" | "notifylkApiKeySet">
> & {
  // Write-only — omit to leave the stored notify.lk API key unchanged; the
  // GET side never echoes it back, so there's nothing to "keep as-is" by resending.
  notifylkApiKey?: string;
};

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
  updatedAt?: string;
}

export type BusinessProfileUpdate = Omit<BusinessProfile, "id" | "updatedAt">;

// Resolved config for the POS client — GET /admin/settings/effective
export interface EffectiveSettings {
  settings: PosSettings;
  business: {
    shopName: string;
    address: string;
    phone: string;
    email: string;
    logoUrl: string;
    currency: string;
  };
}
