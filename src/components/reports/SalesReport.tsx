import { forwardRef } from 'react';
import dayjs from 'dayjs';
import type { SalesReportResponse } from '../../types/entities/report.types';

interface Props {
  report: SalesReportResponse;
}

const fmt = (n: number) =>
  `LKR ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtQty = (n: number) => (n % 1 === 0 ? n.toString() : n.toFixed(3));

const sectionTitle: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: 700,
  color: '#0b3d91',
  marginBottom: '10px',
  marginTop: '28px',
};

const thStyle: React.CSSProperties = { padding: '8px', textAlign: 'left' };
const thRightStyle: React.CSSProperties = { ...thStyle, textAlign: 'right' };
const tdStyle: React.CSSProperties = { padding: '8px' };
const tdRightStyle: React.CSSProperties = { ...tdStyle, textAlign: 'right' };

const SummaryCard = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
  <div
    style={{
      border: '1px solid #e5e5e5',
      borderRadius: '8px',
      padding: '12px 14px',
      background: highlight ? '#0b3d91' : '#fff',
      color: highlight ? '#fff' : '#1f1f1f',
    }}
  >
    <div style={{ fontSize: '11px', color: highlight ? 'rgba(255,255,255,0.8)' : '#888', marginBottom: '4px' }}>
      {label}
    </div>
    <div style={{ fontSize: '15px', fontWeight: 700 }}>{value}</div>
  </div>
);

const SalesReport = forwardRef<HTMLDivElement, Props>(({ report }, ref) => {
  const dateLabel =
    report.date_from && report.date_to
      ? `${dayjs(report.date_from).format('DD MMM YYYY')} - ${dayjs(report.date_to).format('DD MMM YYYY')}`
      : report.date_from
      ? `From ${dayjs(report.date_from).format('DD MMM YYYY')}`
      : report.date_to
      ? `Up to ${dayjs(report.date_to).format('DD MMM YYYY')}`
      : 'All Time';

  const { summary, payment_breakdown: payment, product_performance: products, category_breakdown: categories, hourly_density: hourly } = report;

  return (
    <div
      ref={ref}
      style={{
        width: '800px',
        padding: '32px',
        fontFamily: 'Arial, sans-serif',
        fontSize: '13px',
        color: '#1f1f1f',
        background: '#fff',
      }}
    >
      {/* Header */}
      <div
        data-pdf-header="true"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #1677ff 0%, #0b3d91 100%)',
          borderRadius: '12px',
          padding: '24px 28px',
          color: '#fff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            {report.company.logo_url ? (
              <img
                src={report.company.logo_url}
                alt={report.company.shop_name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span style={{ fontSize: '26px' }}>🏢</span>
            )}
          </div>
          <div>
            <div style={{ fontSize: '19px', fontWeight: 700 }}>{report.company.shop_name}</div>
            <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '4px' }}>
              {report.company.phone && <span>{report.company.phone}</span>}
              {report.company.email && <span style={{ marginLeft: '12px' }}>{report.company.email}</span>}
            </div>
            {report.company.address && (
              <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '2px' }}>{report.company.address}</div>
            )}
          </div>
        </div>
        <div
          style={{
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '8px',
            padding: '10px 18px',
            textAlign: 'right',
          }}
        >
          <div style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '0.5px' }}>SALES REPORT</div>
        </div>
      </div>

      {/* Report Details */}
      <div data-pdf-block="true">
        <div style={{ ...sectionTitle, marginTop: '24px' }}>Sales Report Details</div>
        <div style={{ border: '1px solid #e5e5e5', borderRadius: '8px', padding: '12px 16px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ padding: '4px 0', color: '#666' }}>Report Period:</td>
                <td style={{ padding: '4px 0', fontWeight: 600, textAlign: 'right' }}>{dateLabel}</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0', color: '#666' }}>Generated:</td>
                <td style={{ padding: '4px 0', fontWeight: 600, textAlign: 'right' }}>
                  {dayjs(report.generated_at).format('DD MMM YYYY, HH:mm')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Tier 1: Summary */}
      <div data-pdf-block="true">
        <div style={sectionTitle}>Tier 1 &mdash; Financial Summary</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          <SummaryCard label="Gross Sales" value={fmt(summary.gross_sales)} />
          <SummaryCard label="Total Discounts" value={fmt(summary.total_discounts)} />
          <SummaryCard label="Delivery Charges" value={fmt(summary.delivery_charges)} />
          <SummaryCard label="Total Refunds" value={fmt(summary.total_refunds)} />
          <SummaryCard label="Invoice Count" value={summary.invoice_count.toLocaleString()} />
          <SummaryCard label="Average Ticket Value" value={fmt(summary.average_ticket_value)} />
        </div>
        <div style={{ marginTop: '10px' }}>
          <SummaryCard label="Net Sales (Gross − Discounts − Refunds)" value={fmt(summary.net_sales)} highlight />
        </div>
      </div>

      {/* Tier 2: Payment Reconciliation */}
      <div data-pdf-block="true">
        <div style={sectionTitle}>Tier 2 &mdash; Payment Reconciliation</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#1677ff', color: '#fff' }}>
              <th style={thStyle}>Payment Channel</th>
              <th style={thRightStyle}>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={tdStyle}>Cash Collected</td>
              <td style={tdRightStyle}>{fmt(payment.cash_collected)}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={tdStyle}>Card Transactions</td>
              <td style={tdRightStyle}>{fmt(payment.card_transactions)}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={tdStyle}>QR / Mobile Wallets</td>
              <td style={tdRightStyle}>{fmt(payment.qr_mobile_wallets)}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={tdStyle}>Store Credit / On-Account</td>
              <td style={tdRightStyle}>{fmt(payment.store_credit_on_account)}</td>
            </tr>
            {!!payment.other && (
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={tdStyle}>Other</td>
                <td style={tdRightStyle}>{fmt(payment.other)}</td>
              </tr>
            )}
            <tr style={{ background: '#f5f8ff', fontWeight: 700 }}>
              <td style={tdStyle}>Total Settlement Checksum</td>
              <td style={tdRightStyle}>{fmt(payment.total_settlement_checksum)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Transaction Detail */}
      <div data-pdf-heading="true" style={sectionTitle}>Transaction Detail</div>
      <table data-pdf-split-table="true" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#1677ff', color: '#fff' }}>
            <th style={{ ...thStyle, width: '32px' }}>#</th>
            <th style={thStyle}>Description</th>
            <th style={thStyle}>Reference</th>
            <th style={thRightStyle}>Qty</th>
            <th style={thRightStyle}>Price</th>
            <th style={thRightStyle}>Total</th>
          </tr>
        </thead>
        <tbody>
          {report.items.map((item, idx) => (
            <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={tdStyle}>{idx + 1}</td>
              <td style={tdStyle}>
                <div style={{ fontWeight: 600 }}>
                  Bill #{item.invoice_number} - {item.customer_name}
                </div>
                <div style={{ fontSize: '11px', color: '#888', textTransform: 'capitalize' }}>
                  {item.payment_method}
                </div>
              </td>
              <td style={tdStyle}>{item.invoice_number}</td>
              <td style={tdRightStyle}>{fmtQty(item.quantity)}</td>
              <td style={tdRightStyle}>{fmt(item.unit_price)}</td>
              <td style={{ ...tdRightStyle, fontWeight: 600 }}>{fmt(item.total)}</td>
            </tr>
          ))}
          {report.items.length === 0 && (
            <tr>
              <td colSpan={6} style={{ padding: '16px', textAlign: 'center', color: '#999' }}>
                No transactions found for the selected filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Tier 3: Product Performance */}
      <div data-pdf-heading="true" style={sectionTitle}>Tier 3 &mdash; Product Performance</div>
      <table data-pdf-split-table="true" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#1677ff', color: '#fff' }}>
            <th style={thStyle}>SKU</th>
            <th style={thStyle}>Product</th>
            <th style={thRightStyle}>Qty Sold</th>
            <th style={thRightStyle}>Unit Cost*</th>
            <th style={thRightStyle}>Unit Retail</th>
            <th style={thRightStyle}>Margin %</th>
            <th style={thRightStyle}>Revenue</th>
          </tr>
        </thead>
        <tbody>
          {products.slice(0, 20).map((p) => (
            <tr key={p.product_id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={tdStyle}>{p.sku || '—'}</td>
              <td style={tdStyle}>{p.product_name}</td>
              <td style={tdRightStyle}>{fmtQty(p.quantity_sold)}</td>
              <td style={tdRightStyle}>{fmt(p.unit_cost)}</td>
              <td style={tdRightStyle}>{fmt(p.unit_retail)}</td>
              <td style={tdRightStyle}>{p.net_margin_pct.toFixed(1)}%</td>
              <td style={{ ...tdRightStyle, fontWeight: 600 }}>{fmt(p.revenue)}</td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan={7} style={{ padding: '16px', textAlign: 'center', color: '#999' }}>
                No product movement in the selected period.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div data-pdf-block="true" style={{ fontSize: '10px', color: '#999', marginTop: '4px' }}>
        *Unit Cost is the product's current cost snapshot, not the historical cost at time of sale.
      </div>

      {/* Tier 3: Category Breakdown */}
      <div data-pdf-heading="true" style={sectionTitle}>Tier 3 &mdash; Category / Department Breakdown</div>
      <table data-pdf-split-table="true" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#1677ff', color: '#fff' }}>
            <th style={thStyle}>Category</th>
            <th style={thRightStyle}>Qty Sold</th>
            <th style={thRightStyle}>Revenue</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c.category_id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={tdStyle}>{c.category_name}</td>
              <td style={tdRightStyle}>{fmtQty(c.quantity_sold)}</td>
              <td style={{ ...tdRightStyle, fontWeight: 600 }}>{fmt(c.revenue)}</td>
            </tr>
          ))}
          {categories.length === 0 && (
            <tr>
              <td colSpan={3} style={{ padding: '16px', textAlign: 'center', color: '#999' }}>
                No category data in the selected period.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Tier 3: Hourly Sales Density */}
      <div data-pdf-heading="true" style={sectionTitle}>Tier 3 &mdash; Hourly Sales Density</div>
      <table data-pdf-split-table="true" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#1677ff', color: '#fff' }}>
            <th style={thStyle}>Hour</th>
            <th style={thRightStyle}>Invoices</th>
            <th style={thRightStyle}>Revenue</th>
          </tr>
        </thead>
        <tbody>
          {hourly.map((h) => (
            <tr key={h.hour} style={{ borderBottom: '1px solid #eee' }}>
              <td style={tdStyle}>{String(h.hour).padStart(2, '0')}:00 - {String(h.hour + 1).padStart(2, '0')}:00</td>
              <td style={tdRightStyle}>{h.invoice_count}</td>
              <td style={tdRightStyle}>{fmt(h.revenue)}</td>
            </tr>
          ))}
          {hourly.length === 0 && (
            <tr>
              <td colSpan={3} style={{ padding: '16px', textAlign: 'center', color: '#999' }}>
                No hourly data in the selected period.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Notes */}
      <div data-pdf-block="true">
        <div style={sectionTitle}>Notes</div>
        <div style={{ background: '#f7f7f7', borderRadius: '8px', padding: '12px 16px', fontSize: '12px', color: '#666' }}>
          Note: All transactions &middot; Generated {dayjs(report.generated_at).format('MMM DD, YYYY, HH:mm A')}
          &middot; Total Transactions: {report.total_transactions}
          <br />
          Tax is not included &mdash; this system does not capture tax at the point of sale.
        </div>
      </div>

      {/* Footer */}
      <div
        data-pdf-footer="true"
        style={{
          marginTop: '32px',
          textAlign: 'center',
          fontSize: '11px',
          color: '#999',
          borderTop: '1px solid #eee',
          paddingTop: '12px',
        }}
      >
        Generated by FlowPOS - Powered by E Scope International (Pvt) Ltd | 075 711 9340
      </div>
    </div>
  );
});

SalesReport.displayName = 'SalesReport';
export default SalesReport;
