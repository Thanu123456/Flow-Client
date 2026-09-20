import QRCode from "qrcode";

// Every place that needs a receipt QR code just needs this one URL — kept in
// one spot so the shape (/receipt/:tenantId/:saleId) only has to match the
// backend route (public_routes.go) and the frontend route (AppRoutes.tsx) once.
export function buildReceiptUrl(tenantId: string, saleId: string): string {
  return `${window.location.origin}/receipt/${tenantId}/${saleId}`;
}

// Renders a receipt QR code as a data: URL — cheap enough to regenerate on
// demand (no need to cache), and works equally in an <img>, on the print
// view, or on the customer-facing display.
export async function receiptQrDataUrl(tenantId: string, saleId: string): Promise<string> {
  const url = buildReceiptUrl(tenantId, saleId);
  return QRCode.toDataURL(url, { margin: 1, width: 160 });
}
