import { forwardRef } from 'react';
import type { PurchaseReturn } from '../../types/entities/purchaseReturn.types';
import dayjs from 'dayjs';

interface Props {
  ret: PurchaseReturn;
}

const PrintPurchaseReturn = forwardRef<HTMLDivElement, Props>(({ ret }, ref) => {
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
        <h2 style={{ margin: 0, fontSize: '20px' }}>DEBIT NOTE</h2>
        <p style={{ margin: '4px 0 0', color: '#666' }}>
          {ret.debitNoteNumber ? `Debit Note #${ret.debitNoteNumber}` : `Return #${ret.returnNumber}`}
        </p>
        {ret.debitNoteNumber && (
          <p style={{ margin: '2px 0 0', color: '#999', fontSize: '11px' }}>Return Ref: {ret.returnNumber}</p>
        )}
      </div>

      {/* Info Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ padding: '4px 0', color: '#666', width: '140px' }}>Supplier:</td>
                <td style={{ padding: '4px 0', fontWeight: 600 }}>{ret.supplierName}</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0', color: '#666' }}>Warehouse:</td>
                <td style={{ padding: '4px 0', fontWeight: 600 }}>{ret.warehouseName}</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0', color: '#666' }}>Original GRN:</td>
                <td style={{ padding: '4px 0' }}>{ret.originalGrnNumber}</td>
              </tr>
              {ret.vendorBillNumber && (
                <tr>
                  <td style={{ padding: '4px 0', color: '#666' }}>Vendor Bill:</td>
                  <td style={{ padding: '4px 0' }}>{ret.vendorBillNumber}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ padding: '4px 0', color: '#666', width: '140px' }}>Return Date:</td>
                <td style={{ padding: '4px 0', fontWeight: 600 }}>
                  {dayjs(ret.returnDate).format('DD MMM YYYY')}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0', color: '#666' }}>Status:</td>
                <td style={{ padding: '4px 0', fontWeight: 600, textTransform: 'capitalize' }}>
                  {ret.status.replace('_', ' ')}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0', color: '#666' }}>Processed By:</td>
                <td style={{ padding: '4px 0' }}>{ret.createdByName}</td>
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
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Qty</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Cost</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Total</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Reason</th>
          </tr>
        </thead>
        <tbody>
          {ret.items.map((item, idx) => (
            <>
              <tr key={item.id}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{idx + 1}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  <div style={{ fontWeight: 600 }}>{item.productName}</div>
                  {item.variationType && (
                    <div style={{ fontSize: '11px', color: '#666' }}>{item.variationType}</div>
                  )}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{item.returnQty}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{fmt(item.costPrice)}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right', fontWeight: 600 }}>
                  {fmt(item.totalAmount)}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.reason || '-'}</td>
              </tr>
              {item.serialNumbers && item.serialNumbers.length > 0 && (
                <tr key={`${item.id}-sn`}>
                  <td />
                  <td colSpan={5} style={{ border: '1px solid #ddd', padding: '6px 8px', backgroundColor: '#fafafa', fontSize: '12px' }}>
                    <strong>S/N:</strong> {item.serialNumbers.join(', ')}
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>

      {/* Summary */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <table style={{ borderCollapse: 'collapse', minWidth: '280px' }}>
          <tbody>
            <tr style={{ borderTop: '2px solid #000' }}>
              <td style={{ padding: '6px 12px', fontWeight: 700 }}>Total Debit Amount:</td>
              <td style={{ padding: '6px 12px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>
                Rs. {fmt(ret.totalReturnAmount)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {ret.notes && (
        <div style={{ marginTop: '16px' }}>
          <strong>Notes:</strong>
          <p style={{ margin: '4px 0 0', color: '#666' }}>{ret.notes}</p>
        </div>
      )}

      <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        <div style={{ borderTop: '1px solid #000', paddingTop: '8px', textAlign: 'center' }}>Returned By</div>
        <div style={{ borderTop: '1px solid #000', paddingTop: '8px', textAlign: 'center' }}>Authorized By</div>
      </div>

      <div style={{ marginTop: '24px', textAlign: 'center', color: '#999', fontSize: '11px' }}>
        Generated on {dayjs().format('DD MMM YYYY HH:mm')}
      </div>
    </div>
  );
});

PrintPurchaseReturn.displayName = 'PrintPurchaseReturn';
export default PrintPurchaseReturn;
