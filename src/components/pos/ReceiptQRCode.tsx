import React, { useEffect, useState } from 'react';
import { receiptQrDataUrl } from '../../utils/receipts/qrCode';

interface Props {
    tenantId: string;
    saleId: string;
    size?: number;
}

// Renders the QR code linking to a sale's digital receipt (see
// DigitalReceipt.tsx / GET /receipts/:tenantId/:saleId) — used on the printed
// receipt, the post-checkout "send receipt" panel, and the customer display.
const ReceiptQRCode: React.FC<Props> = ({ tenantId, saleId, size = 96 }) => {
    const [dataUrl, setDataUrl] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        receiptQrDataUrl(tenantId, saleId)
            .then((url) => { if (!cancelled) setDataUrl(url); })
            .catch(() => { /* no QR is a cosmetic miss, not worth surfacing an error over */ });
        return () => { cancelled = true; };
    }, [tenantId, saleId]);

    if (!dataUrl) return null;

    return (
        <img
            src={dataUrl}
            alt="Scan for digital receipt"
            width={size}
            height={size}
            style={{ display: 'block' }}
        />
    );
};

export default ReceiptQRCode;
