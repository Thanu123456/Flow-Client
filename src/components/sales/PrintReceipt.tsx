import React, { forwardRef } from 'react';
import type { SaleDetailItem } from '../../types/entities/sale.types';
import dayjs from 'dayjs';
import { useTenant } from '../../contexts/TenantContext';
import ReceiptQRCode from '../pos/ReceiptQRCode';

interface Props {
  sale: SaleDetailItem;
  duplicate?: boolean;
}

// A narrow, receipt-style print view (not the wide A4 layout PrintGRN uses) —
// meant to read like an actual till receipt when printed on a thermal or
// small-format printer.
const PrintReceipt = forwardRef<HTMLDivElement, Props>(({ sale, duplicate }, ref) => {
  const { tenant } = useTenant();
  const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div
      ref={ref}
      style={{
        padding: '16px',
        fontFamily: "'Courier New', monospace",
        fontSize: '13px',
        color: '#000',
        maxWidth: '320px',
        margin: '0 auto',
      }}
    >
      {duplicate && (
        <div style={{ textAlign: 'center', border: '2px solid #000', padding: '4px', marginBottom: '12px', fontWeight: 700, letterSpacing: '2px' }}>
          DUPLICATE
        </div>
      )}

      <div style={{ textAlign: 'center', marginBottom: '12px' }}>
        <div style={{ fontWeight: 700, fontSize: '16px' }}>SALES RECEIPT</div>
        <div style={{ marginTop: '4px' }}>Bill No: {sale.invoice_number || '—'}</div>
        <div>{dayjs(sale.created_at).format('DD MMM YYYY HH:mm')}</div>
      </div>

      <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }} />

      <div>Customer: {sale.customer_name || 'Walk-in'}</div>
      <div style={{ textTransform: 'capitalize' }}>Payment: {sale.payment_method}</div>

      <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }} />

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', paddingBottom: '4px' }}>Item</th>
            <th style={{ textAlign: 'right', paddingBottom: '4px' }}>Qty</th>
            <th style={{ textAlign: 'right', paddingBottom: '4px' }}>Price</th>
            <th style={{ textAlign: 'right', paddingBottom: '4px' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {sale.items.map((item) => (
            <tr key={item.id}>
              <td style={{ padding: '2px 0' }}>{item.name}</td>
              <td style={{ textAlign: 'right' }}>{item.quantity % 1 === 0 ? item.quantity : item.quantity.toFixed(3)}</td>
              <td style={{ textAlign: 'right' }}>{fmt(item.price)}</td>
              <td style={{ textAlign: 'right' }}>{fmt(item.quantity * item.price)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }} />

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            <td>Subtotal</td>
            <td style={{ textAlign: 'right' }}>{fmt(sale.subtotal)}</td>
          </tr>
          {sale.discount_amount > 0 && (
            <tr>
              <td>Discount</td>
              <td style={{ textAlign: 'right' }}>-{fmt(sale.discount_amount)}</td>
            </tr>
          )}
          {sale.delivery_charge > 0 && (
            <tr>
              <td>Delivery</td>
              <td style={{ textAlign: 'right' }}>+{fmt(sale.delivery_charge)}</td>
            </tr>
          )}
          <tr style={{ fontWeight: 700, borderTop: '1px solid #000' }}>
            <td style={{ paddingTop: '4px' }}>Total</td>
            <td style={{ textAlign: 'right', paddingTop: '4px' }}>Rs. {fmt(sale.total_amount)}</td>
          </tr>
          <tr>
            <td>Paid</td>
            <td style={{ textAlign: 'right' }}>{fmt(sale.paid_amount)}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }} />

      {tenant?.id && sale.id && (
        <div style={{ textAlign: 'center', marginTop: '12px' }}>
          <ReceiptQRCode tenantId={tenant.id} saleId={sale.id} size={80} />
          <div style={{ fontSize: '10px', marginTop: '4px' }}>Scan for a digital copy</div>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '12px' }}>Thank you for your business!</div>
      {duplicate && (
        <div style={{ textAlign: 'center', marginTop: '4px', color: '#666', fontSize: '11px' }}>
          Reprinted {dayjs().format('DD MMM YYYY HH:mm')}
        </div>
      )}
    </div>
  );
});

PrintReceipt.displayName = 'PrintReceipt';
export default PrintReceipt;
