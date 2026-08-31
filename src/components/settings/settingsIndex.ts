// Searchable index of every setting — powers the search box above the rail.
// `field` matches the SettingField `name`, which renders id="setting-<field>".

export type SettingSection = "business-profile" | "receipt" | "sales";

export interface SettingEntry {
  section: SettingSection;
  sectionLabel: string;
  field: string;
  label: string;
  description: string;
  keywords?: string[];
}

export const SETTINGS_INDEX: SettingEntry[] = [
  // Business Profile
  { section: "business-profile", sectionLabel: "Business Profile", field: "shopName", label: "Shop name", description: "Printed at the top of every receipt.", keywords: ["company", "store", "name"] },
  { section: "business-profile", sectionLabel: "Business Profile", field: "businessType", label: "Business type", description: "Retail, wholesale, pharmacy…", keywords: ["category"] },
  { section: "business-profile", sectionLabel: "Business Profile", field: "businessRegistrationNumber", label: "Business registration number", description: "Shown on tax invoices.", keywords: ["brn", "reg"] },
  { section: "business-profile", sectionLabel: "Business Profile", field: "taxVatNumber", label: "Tax / VAT number", description: "Shown on tax invoices.", keywords: ["gst", "vat", "tin"] },
  { section: "business-profile", sectionLabel: "Business Profile", field: "addressLine1", label: "Address", description: "Shop address for receipts and reports.", keywords: ["location", "street"] },
  { section: "business-profile", sectionLabel: "Business Profile", field: "city", label: "City", description: "Shop city.", keywords: ["town"] },
  { section: "business-profile", sectionLabel: "Business Profile", field: "postalCode", label: "Postal code", description: "Shop postal / ZIP code.", keywords: ["zip"] },
  { section: "business-profile", sectionLabel: "Business Profile", field: "country", label: "Country", description: "Shop country." },
  { section: "business-profile", sectionLabel: "Business Profile", field: "phone", label: "Phone", description: "Shown on the receipt header.", keywords: ["telephone", "contact"] },
  { section: "business-profile", sectionLabel: "Business Profile", field: "email", label: "Email", description: "Shop contact email.", keywords: ["contact"] },
  { section: "business-profile", sectionLabel: "Business Profile", field: "currency", label: "Currency", description: "Used across the POS and reports.", keywords: ["lkr", "money"] },
  { section: "business-profile", sectionLabel: "Business Profile", field: "timezone", label: "Timezone", description: "Timestamps on sales and shifts.", keywords: ["time"] },
  { section: "business-profile", sectionLabel: "Business Profile", field: "language", label: "Language", description: "Interface language.", keywords: ["locale"] },
  { section: "business-profile", sectionLabel: "Business Profile", field: "logoUrl", label: "Logo", description: "Shown on receipts and reports.", keywords: ["brand", "image"] },

  // Receipt & Invoice
  { section: "receipt", sectionLabel: "Receipt & Invoice", field: "receiptPaperSize", label: "Paper size", description: "58 mm, 80 mm thermal roll or A4.", keywords: ["thermal", "printer", "80mm", "58mm", "a4"] },
  { section: "receipt", sectionLabel: "Receipt & Invoice", field: "receiptTopMarginMm", label: "Top margin", description: "Nudge to align with pre-printed paper.", keywords: ["margin", "offset", "alignment", "gap"] },
  { section: "receipt", sectionLabel: "Receipt & Invoice", field: "receiptCopies", label: "Copies", description: "Number of receipts printed per sale.", keywords: ["duplicate", "print"] },
  { section: "receipt", sectionLabel: "Receipt & Invoice", field: "receiptLanguage", label: "Receipt language", description: "Language of the printed receipt text.", keywords: ["sinhala", "tamil", "english"] },
  { section: "receipt", sectionLabel: "Receipt & Invoice", field: "receiptShowLogo", label: "Show logo on receipt", description: "Print the shop logo at the top.", keywords: ["brand"] },
  { section: "receipt", sectionLabel: "Receipt & Invoice", field: "receiptShowAddressPhone", label: "Show address & phone", description: "Print the shop address and phone in the header." },
  { section: "receipt", sectionLabel: "Receipt & Invoice", field: "receiptShowCashier", label: "Show cashier name", description: "Print who served the sale.", keywords: ["staff", "operator"] },
  { section: "receipt", sectionLabel: "Receipt & Invoice", field: "receiptShowBarcode", label: "Show invoice barcode", description: "Print a scannable barcode of the invoice number.", keywords: ["scan"] },
  { section: "receipt", sectionLabel: "Receipt & Invoice", field: "receiptShowTaxBreakdown", label: "Show tax breakdown", description: "Print a per-rate tax summary.", keywords: ["vat", "gst"] },
  { section: "receipt", sectionLabel: "Receipt & Invoice", field: "receiptHeaderText", label: "Receipt header line", description: "Custom line under the address — a tagline or hotline." },
  { section: "receipt", sectionLabel: "Receipt & Invoice", field: "receiptFooterText", label: "Receipt footer line", description: "Custom line below the total — e.g. a returns policy.", keywords: ["thank you", "policy"] },

  // Sales & Checkout
  { section: "sales", sectionLabel: "Sales & Checkout", field: "defaultPriceMode", label: "Default price mode", description: "Which price list a new sale opens on.", keywords: ["retail", "wholesale", "pricing"] },
  { section: "sales", sectionLabel: "Sales & Checkout", field: "salesMaxDiscountPct", label: "Max discount without approval", description: "Discount cap a cashier can apply unaided.", keywords: ["discount", "approval", "limit"] },
  { section: "sales", sectionLabel: "Sales & Checkout", field: "salesHoldExpiryHours", label: "Held bill expiry", description: "Parked sales older than this are cleared automatically.", keywords: ["hold", "park", "suspend"] },
  { section: "sales", sectionLabel: "Sales & Checkout", field: "allowNoStockBills", label: "Allow selling out-of-stock items", description: "Let a sale proceed when stock is insufficient.", keywords: ["negative", "oversell"] },
  { section: "sales", sectionLabel: "Sales & Checkout", field: "cashDrawerEnabled", label: "Cash drawer integration", description: "Open a connected drawer on cash sales.", keywords: ["till", "drawer"] },
];

export function searchSettings(query: string): SettingEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/);
  return SETTINGS_INDEX.map((e) => {
    const hay = [e.label, e.description, e.sectionLabel, ...(e.keywords ?? [])]
      .join(" ")
      .toLowerCase();
    const score = terms.reduce((acc, t) => acc + (hay.includes(t) ? 1 : 0), 0);
    return { e, score };
  })
    .filter((r) => r.score === terms.length)
    .sort((a, b) => {
      const al = a.e.label.toLowerCase().startsWith(terms[0]) ? 0 : 1;
      const bl = b.e.label.toLowerCase().startsWith(terms[0]) ? 0 : 1;
      return al - bl;
    })
    .map((r) => r.e)
    .slice(0, 8);
}
