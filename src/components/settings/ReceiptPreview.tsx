import React from "react";
import { theme } from "antd";
import type { BusinessProfile } from "../../types/entities/settings.types";

interface PreviewValues {
  receiptPaperSize?: string;
  receiptTopMarginMm?: number;
  receiptShowLogo?: boolean;
  receiptShowBarcode?: boolean;
  receiptShowAddressPhone?: boolean;
  receiptShowCashier?: boolean;
  receiptShowTaxBreakdown?: boolean;
  receiptHeaderText?: string;
  receiptFooterText?: string;
}

interface Props {
  values: PreviewValues;
  profile: BusinessProfile | null;
}

const line = (dashed = false): React.CSSProperties => ({
  borderTop: `1px ${dashed ? "dashed" : "solid"} #999`,
  margin: "6px 0",
});

/** A static mock of the printed receipt that reacts to the receipt settings form. */
const ReceiptPreview: React.FC<Props> = ({ values, profile }) => {
  const { token } = theme.useToken();
  const width = values.receiptPaperSize === "58mm" ? 210 : values.receiptPaperSize === "A4" ? 320 : 280;
  const shopName = profile?.shopName || "Your Shop Name";
  const address = [profile?.addressLine1, profile?.city].filter(Boolean).join(", ") || "123 Main Street, Colombo";
  const phone = profile?.phone || "011 234 5678";

  return (
    <div
      style={{
        position: "sticky",
        top: 16,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      <span style={{ fontSize: 12, color: token.colorTextTertiary }}>
        Preview · {values.receiptPaperSize || "80mm"}
      </span>
      <div
        style={{
          width,
          background: "#fff",
          color: "#111",
          fontFamily: "'Courier New', monospace",
          fontSize: 12,
          lineHeight: 1.45,
          padding: "16px 14px 18px",
          paddingTop: 16 + Math.max(0, Math.min(24, values.receiptTopMarginMm ?? 2)) * 2,
          boxShadow: token.boxShadow,
          borderRadius: 4,
        }}
      >
        {values.receiptShowLogo && (
          <div
            style={{
              width: 44,
              height: 44,
              margin: "0 auto 6px",
              border: "1px solid #bbb",
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 9,
              color: "#999",
              overflow: "hidden",
            }}
          >
            {profile?.logoUrl ? (
              <img src={profile.logoUrl} alt="" style={{ maxWidth: "100%", maxHeight: "100%" }} />
            ) : (
              "LOGO"
            )}
          </div>
        )}
        <div style={{ textAlign: "center", fontWeight: 700 }}>{shopName}</div>
        {values.receiptShowAddressPhone && (
          <div style={{ textAlign: "center", fontSize: 11 }}>
            {address}
            <br />
            Tel: {phone}
          </div>
        )}
        {values.receiptHeaderText ? (
          <div style={{ textAlign: "center", fontSize: 11, marginTop: 4 }}>
            {values.receiptHeaderText}
          </div>
        ) : null}

        <div style={line()} />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Invoice</span>
          <span>INV-00042</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Date</span>
          <span>2026-08-30 14:12</span>
        </div>
        {values.receiptShowCashier && (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Cashier</span>
            <span>A. Perera</span>
          </div>
        )}

        <div style={line(true)} />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Rice 5kg x1</span>
          <span>1,250.00</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Tea 400g x2</span>
          <span>960.00</span>
        </div>
        <div style={line(true)} />

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Subtotal</span>
          <span>2,210.00</span>
        </div>
        {values.receiptShowTaxBreakdown && (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>VAT 15%</span>
            <span>331.50</span>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
          <span>TOTAL</span>
          <span>{values.receiptShowTaxBreakdown ? "2,541.50" : "2,210.00"}</span>
        </div>

        <div style={line()} />
        <div style={{ textAlign: "center", fontSize: 11 }}>
          {values.receiptFooterText || "Thank you for shopping with us!"}
        </div>
        {values.receiptShowBarcode && (
          <div
            style={{
              marginTop: 8,
              height: 34,
              background:
                "repeating-linear-gradient(90deg,#111 0 2px,#fff 2px 4px,#111 4px 5px,#fff 5px 9px)",
            }}
          />
        )}
        {values.receiptShowBarcode && (
          <div style={{ textAlign: "center", fontSize: 10, letterSpacing: 2 }}>INV-00042</div>
        )}
      </div>
    </div>
  );
};

export default ReceiptPreview;
