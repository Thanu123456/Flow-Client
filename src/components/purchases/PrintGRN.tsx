import React, { forwardRef } from 'react';
import type { GRN } from '../../types/entities/purchase.types';
import dayjs from 'dayjs';

interface Props {
  grn: GRN;
}

const PrintGRN = forwardRef<HTMLDivElement, Props>(({ grn }, ref) => {
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
        <h2 style={{ margin: 0, fontSize: '20px' }}>GOODS RECEIPT NOTE</h2>
        <p style={{ margin: '4px 0 0', color: '#666' }}>GRN #{grn.grnNumber}</p>
      </div>

      {/* Info Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ padding: '4px 0', color: '#666', width: '120px' }}>Warehouse:</td>
                <td style={{ padding: '4px 0', fontWeight: 600 }}>{grn.warehouseName}</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0', color: '#666' }}>Supplier:</td>
                <td style={{ padding: '4px 0', fontWeight: 600 }}>
                  {grn.supplierName || 'Walk-in Purchase'}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0', color: '#666' }}>Created By:</td>
                <td style={{ padding: '4px 0' }}>{grn.createdByName}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ padding: '4px 0', color: '#666', width: '120px' }}>GRN Date:</td>
                <td style={{ padding: '4px 0', fontWeight: 600 }}>
                  {dayjs(grn.grnDate).format('DD MMM YYYY')}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0', color: '#666' }}>Status:</td>
                <td style={{ padding: '4px 0', fontWeight: 600, textTransform: 'capitalize' }}>
                  {grn.status}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0', color: '#666' }}>Payment:</td>
                <td style={{ padding: '4px 0', textTransform: 'capitalize' }}>
                  {grn.paymentMethod}
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
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Qty</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Unit</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Cost</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Net</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Expiry</th>
          </tr>
        </thead>
        <tbody>
          {grn.items.map((item, idx) => (
            <React.Fragment key={item.id}>
              <tr>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{idx + 1}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  <div style={{ fontWeight: 600 }}>{item.productName}</div>
                  {item.productSKU && (
                    <div style={{ fontSize: '11px', color: '#666' }}>SKU: {item.productSKU}</div>
                  )}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.variationType || '-'}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{item.quantity}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>
                  {item.unitShortName || item.unitName || '-'}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{fmt(item.costPrice)}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right', fontWeight: 600 }}>
                  {fmt(item.netPrice)}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {item.expiryDate ? dayjs(item.expiryDate).format('DD MMM YYYY') : 'N/A'}
                </td>
              </tr>
              {item.hasSerialNumbers && item.serialNumbers && item.serialNumbers.length > 0 && (
                <tr>
                  <td />
                  <td colSpan={7} style={{ border: '1px solid #ddd', padding: '6px 8px', backgroundColor: '#fafafa', fontSize: '12px' }}>
                    <strong>S/N:</strong> {item.serialNumbers.join(', ')}
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {/* Payment Summary */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <table style={{ borderCollapse: 'collapse', minWidth: '280px' }}>
          <tbody>
            <tr>
              <td style={{ padding: '4px 12px', color: '#666' }}>Total Amount:</td>
              <td style={{ padding: '4px 12px', textAlign: 'right', fontFamily: 'monospace' }}>Rs. {fmt(grn.totalAmount)}</td>
            </tr>
            {grn.discountAmount > 0 && (
              <tr>
                <td style={{ padding: '4px 12px', color: '#666' }}>Discount:</td>
                <td style={{ padding: '4px 12px', textAlign: 'right', fontFamily: 'monospace', color: '#52c41a' }}>
                  - Rs. {fmt(grn.discountAmount)}
                </td>
              </tr>
            )}
            <tr style={{ borderTop: '2px solid #000' }}>
              <td style={{ padding: '6px 12px', fontWeight: 700 }}>Net Amount:</td>
              <td style={{ padding: '6px 12px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>
                Rs. {fmt(grn.netAmount)}
              </td>
            </tr>
            {grn.debitBalanceUsed > 0 && (
              <tr>
                <td style={{ padding: '4px 12px', color: '#666' }}>Debit Balance Used:</td>
                <td style={{ padding: '4px 12px', textAlign: 'right', fontFamily: 'monospace' }}>Rs. {fmt(grn.debitBalanceUsed)}</td>
              </tr>
            )}
            <tr>
              <td style={{ padding: '4px 12px', color: '#666' }}>Paid Amount:</td>
              <td style={{ padding: '4px 12px', textAlign: 'right', fontFamily: 'monospace' }}>Rs. {fmt(grn.paidAmount)}</td>
            </tr>
            {grn.creditAmount > 0 && (
              <tr>
                <td style={{ padding: '4px 12px', color: '#e74c3c' }}>Credit Balance:</td>
                <td style={{ padding: '4px 12px', textAlign: 'right', fontFamily: 'monospace', color: '#e74c3c' }}>
                  Rs. {fmt(grn.creditAmount)}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {grn.paymentMethod === 'cheque' && grn.chequeNumber && (
        <div style={{ marginTop: '16px', padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }}>
          <strong>Cheque Details:</strong>
          <div style={{ marginTop: '4px' }}>
            <span>No: {grn.chequeNumber}</span>
            {grn.chequeDate && <span style={{ marginLeft: '16px' }}>Date: {dayjs(grn.chequeDate).format('DD MMM YYYY')}</span>}
            {grn.chequeNote && <div style={{ marginTop: '4px' }}>Note: {grn.chequeNote}</div>}
          </div>
        </div>
      )}

      {grn.notes && (
        <div style={{ marginTop: '16px' }}>
          <strong>Notes:</strong>
          <p style={{ margin: '4px 0 0', color: '#666' }}>{grn.notes}</p>
        </div>
      )}

      <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        <div style={{ borderTop: '1px solid #000', paddingTop: '8px', textAlign: 'center' }}>Received By</div>
        <div style={{ borderTop: '1px solid #000', paddingTop: '8px', textAlign: 'center' }}>Authorized By</div>
      </div>

      <div style={{ marginTop: '24px', textAlign: 'center', color: '#999', fontSize: '11px' }}>
        Generated on {dayjs().format('DD MMM YYYY HH:mm')}
      </div>
    </div>
  );
});

PrintGRN.displayName = 'PrintGRN';
export default PrintGRN;
