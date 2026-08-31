import { axiosInstance } from "../api/axiosInstance";
import type {
  BusinessProfile,
  BusinessProfileUpdate,
  EffectiveSettings,
  PosSettings,
  PosSettingsUpdate,
} from "../../types/entities/settings.types";

const toNum = (v: any, fallback = 0): number => {
  const n = typeof v === "string" ? parseFloat(v) : v;
  return Number.isFinite(n) ? n : fallback;
};

const unwrap = (res: any) => res.data?.data ?? res.data;

const transformSettings = (s: any): PosSettings => ({
  id: s.id,
  tenantId: s.tenant_id,
  allowNoStockBills: !!s.allow_no_stock_bills,
  defaultPriceMode: s.default_price_mode || "retail",
  cashDrawerEnabled: !!s.cash_drawer_enabled,
  salesMaxDiscountPct: toNum(s.sales_max_discount_pct, 100),
  salesHoldExpiryHours: toNum(s.sales_hold_expiry_hours, 24),
  receiptPaperSize: s.receipt_paper_size || "80mm",
  receiptTopMarginMm: toNum(s.receipt_top_margin_mm, 2),
  receiptShowLogo: s.receipt_show_logo ?? true,
  receiptShowBarcode: s.receipt_show_barcode ?? true,
  receiptShowAddressPhone: s.receipt_show_address_phone ?? true,
  receiptShowCashier: s.receipt_show_cashier ?? true,
  receiptShowTaxBreakdown: !!s.receipt_show_tax_breakdown,
  receiptLanguage: s.receipt_language || "en",
  receiptHeaderText: s.receipt_header_text || "",
  receiptFooterText: s.receipt_footer_text || "",
  receiptCopies: toNum(s.receipt_copies, 1),
  updatedAt: s.updated_at,
  updatedByName: s.updated_by_name || "",
});

const settingsPayload = (u: PosSettingsUpdate): Record<string, any> => {
  const map: Record<keyof PosSettingsUpdate, string> = {
    allowNoStockBills: "allow_no_stock_bills",
    defaultPriceMode: "default_price_mode",
    cashDrawerEnabled: "cash_drawer_enabled",
    salesMaxDiscountPct: "sales_max_discount_pct",
    salesHoldExpiryHours: "sales_hold_expiry_hours",
    receiptPaperSize: "receipt_paper_size",
    receiptTopMarginMm: "receipt_top_margin_mm",
    receiptShowLogo: "receipt_show_logo",
    receiptShowBarcode: "receipt_show_barcode",
    receiptShowAddressPhone: "receipt_show_address_phone",
    receiptShowCashier: "receipt_show_cashier",
    receiptShowTaxBreakdown: "receipt_show_tax_breakdown",
    receiptLanguage: "receipt_language",
    receiptHeaderText: "receipt_header_text",
    receiptFooterText: "receipt_footer_text",
    receiptCopies: "receipt_copies",
  };
  const payload: Record<string, any> = {};
  (Object.keys(u) as (keyof PosSettingsUpdate)[]).forEach((k) => {
    if (u[k] !== undefined) payload[map[k]] = u[k];
  });
  return payload;
};

const transformProfile = (t: any): BusinessProfile => ({
  id: t.id,
  shopName: t.shop_name || "",
  businessType: t.business_type || "retail",
  businessRegistrationNumber: t.business_registration_number || "",
  taxVatNumber: t.tax_vat_number || "",
  addressLine1: t.address_line1 || "",
  addressLine2: t.address_line2 || "",
  city: t.city || "",
  postalCode: t.postal_code || "",
  country: t.country || "",
  phone: t.phone || "",
  email: t.email || "",
  currency: t.currency || "LKR",
  timezone: t.timezone || "Asia/Colombo",
  language: t.language || "en",
  logoUrl: t.logo_url || "",
  updatedAt: t.updated_at,
});

const profilePayload = (p: BusinessProfileUpdate): Record<string, any> => ({
  shop_name: p.shopName,
  business_type: p.businessType,
  business_registration_number: p.businessRegistrationNumber || undefined,
  tax_vat_number: p.taxVatNumber || undefined,
  address_line1: p.addressLine1,
  address_line2: p.addressLine2 || undefined,
  city: p.city,
  postal_code: p.postalCode || undefined,
  country: p.country,
  phone: p.phone || undefined,
  email: p.email || undefined,
  currency: p.currency,
  timezone: p.timezone,
  language: p.language,
  logo_url: p.logoUrl || undefined,
});

export const settingsService = {
  getSettings: async (): Promise<PosSettings> => {
    const res = await axiosInstance.get("/admin/settings");
    return transformSettings(unwrap(res));
  },

  updateSettings: async (update: PosSettingsUpdate): Promise<PosSettings> => {
    const res = await axiosInstance.patch("/admin/settings", settingsPayload(update));
    return transformSettings(unwrap(res));
  },

  getEffectiveSettings: async (): Promise<EffectiveSettings> => {
    const res = await axiosInstance.get("/admin/settings/effective");
    const d = unwrap(res);
    return {
      settings: transformSettings(d.settings ?? {}),
      business: {
        shopName: d.business?.shop_name || "",
        address: d.business?.address || "",
        phone: d.business?.phone || "",
        email: d.business?.email || "",
        logoUrl: d.business?.logo_url || "",
        currency: d.business?.currency || "LKR",
      },
    };
  },

  getBusinessProfile: async (): Promise<BusinessProfile> => {
    const res = await axiosInstance.get("/admin/settings/business-profile");
    return transformProfile(unwrap(res));
  },

  updateBusinessProfile: async (
    update: BusinessProfileUpdate
  ): Promise<BusinessProfile> => {
    const res = await axiosInstance.patch(
      "/admin/settings/business-profile",
      profilePayload(update)
    );
    return transformProfile(unwrap(res));
  },
};
