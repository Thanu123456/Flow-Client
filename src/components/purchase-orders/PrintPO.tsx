import { forwardRef } from 'react';
import type { PurchaseOrder } from '../../types/entities/purchaseOrder.types';
import dayjs from 'dayjs';

interface Props {
  po: PurchaseOrder;
}

const PrintPO = forwardRef<HTMLDivElement, Props>(({ po }, ref) => {
  const fmt = (n: number) =>
    n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div
      ref={ref}
      style={{
        padding: '32px',
        fontFamily: 'Arial, sans-serif',
        fontSize: '13px',
        color: '#000',
        maxWidth: '800px',
        margin: '0 auto',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '20px' }}>PURCHASE ORDER</h2>
        <p style={{ margin: '4px 0 0', color: '#666' }}>PO #{po.poNumber}</p>
      </div>

      {/* Info Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ padding: '4px 0', color: '#666', width: '120px' }}>Supplier:</td>
                <td style={{ padding: '4px 0', fontWeight: 600 }}>{po.supplierName || '-'}</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0', color: '#666' }}>Warehouse:</td>
                <td style={{ padding: '4px 0', fontWeight: 600 }}>{po.warehouseName || '-'}</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0', color: '#666' }}>Created By:</td>
                <td style={{ padding: '4px 0' }}>{po.createdByName || '-'}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ padding: '4px 0', color: '#666', width: '120px' }}>Order Date:</td>
                <td style={{ padding: '4px 0', fontWeight: 600 }}>
                  {dayjs(po.orderDate).format('DD MMM YYYY')}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0', color: '#666' }}>Expected Date:</td>
                <td style={{ padding: '4px 0', fontWeight: 600 }}>
                  {po.expectedDate ? dayjs(po.expectedDate).format('DD MMM YYYY') : 'N/A'}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0', color: '#666' }}>Status:</td>
                <td style={{ padding: '4px 0', fontWeight: 600, textTransform: 'capitalize' }}>
                  {po.status.replace('_', ' ')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Items Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5' }}>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>#</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Product</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Variation</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Ordered</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Received</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Unit Cost</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Line Total</th>
          </tr>
        </thead>
        <tbody>
          {po.items.map((item, idx) => (
            <tr key={item.id}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{idx + 1}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                <div style={{ fontWeight: 600 }}>{item.productName}</div>
                {item.productSKU && (
                  <div style={{ fontSize: '11px', color: '#666' }}>SKU: {item.productSKU}</div>
                )}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.variationType || '-'}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>
                {item.orderedQty} {item.unitShortName || item.unitName || ''}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{item.receivedQty}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{fmt(item.unitCost)}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right', fontWeight: 600 }}>
                {fmt(item.lineTotal)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <table style={{ borderCollapse: 'collapse', minWidth: '280px' }}>
          <tbody>
            <tr>
              <td style={{ padding: '4px 12px', color: '#666' }}>Subtotal:</td>
              <td style={{ padding: '4px 12px', textAlign: 'right', fontFamily: 'monospace' }}>Rs. {fmt(po.subtotal)}</td>
            </tr>
            {po.discountAmount > 0 && (
              <tr>
                <td style={{ padding: '4px 12px', color: '#666' }}>Discount:</td>
                <td style={{ padding: '4px 12px', textAlign: 'right', fontFamily: 'monospace', color: '#52c41a' }}>
                  - Rs. {fmt(po.discountAmount)}
                </td>
              </tr>
            )}
            <tr style={{ borderTop: '2px solid #000' }}>
              <td style={{ padding: '6px 12px', fontWeight: 700 }}>Total Amount:</td>
              <td style={{ padding: '6px 12px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>
                Rs. {fmt(po.totalAmount)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {po.notes && (
        <div style={{ marginTop: '16px' }}>
          <strong>Notes:</strong>
          <p style={{ margin: '4px 0 0', color: '#666' }}>{po.notes}</p>
        </div>
      )}

      <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        <div style={{ borderTop: '1px solid #000', paddingTop: '8px', textAlign: 'center' }}>Prepared By</div>
        <div style={{ borderTop: '1px solid #000', paddingTop: '8px', textAlign: 'center' }}>Authorized By</div>
      </div>

      <div style={{ marginTop: '24px', textAlign: 'center', color: '#999', fontSize: '11px' }}>
        Generated on {dayjs().format('DD MMM YYYY HH:mm')}
      </div>
    </div>
  );
});

PrintPO.displayName = 'PrintPO';
export default PrintPO;
