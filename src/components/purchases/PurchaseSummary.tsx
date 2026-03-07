import React from 'react';
import { Card, Radio, Row, Col, Form, InputNumber, Input, DatePicker, Typography, Divider, Alert } from 'antd';
import type { PaymentMethod } from '../../types/entities/purchase.types';

const { Text } = Typography;

interface Props {
  totalAmount: number;
  supplierBalance: number;
  paymentMethod: PaymentMethod;
  discountAmount: number;
  paidAmount: number;
  debitBalanceUsed: number;
  chequeNumber: string;
  chequeDate: string;
  chequeNote: string;
  hasSupplier: boolean;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onDiscountChange: (val: number) => void;
  onPaidAmountChange: (val: number) => void;
  onDebitBalanceUsedChange: (val: number) => void;
  onChequeNumberChange: (val: string) => void;
  onChequeDateChange: (val: string) => void;
  onChequeNoteChange: (val: string) => void;
}

const fmt = (n: number) =>
  `Rs. ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const PurchaseSummary: React.FC<Props> = ({
  totalAmount,
  supplierBalance,
  paymentMethod,
  discountAmount,
  paidAmount,
  debitBalanceUsed,
  chequeNumber,
  chequeDate,
  chequeNote,
  hasSupplier,
  onPaymentMethodChange,
  onDiscountChange,
  onPaidAmountChange,
  onDebitBalanceUsedChange,
  onChequeNumberChange,
  onChequeDateChange,
  onChequeNoteChange,
}) => {
  const netAmount = Math.max(0, totalAmount - discountAmount);
  const supplierDebit = supplierBalance < 0 ? Math.abs(supplierBalance) : 0;
  const creditBalance = supplierBalance > 0 ? supplierBalance : 0;

  // Compute remaining after debit balance
  const remaining = Math.max(0, netAmount - debitBalanceUsed);
  const creditAmount = Math.max(0, remaining - paidAmount);

  const labelStyle: React.CSSProperties = { color: '#666', fontSize: '13px' };
  const valueStyle: React.CSSProperties = { fontFamily: 'monospace', fontSize: '14px', fontWeight: 600 };

  const SummaryRow: React.FC<{ label: string; value: number; color?: string }> = ({
    label,
    value,
    color,
  }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
      <span style={labelStyle}>{label}</span>
      <span style={{ ...valueStyle, color: color || 'inherit' }}>{fmt(value)}</span>
    </div>
  );

  return (
    <Card title="Payment Summary" size="small">
      {/* Amounts Summary */}
      <div style={{ marginBottom: '16px' }}>
        <SummaryRow label="Total Cost Value:" value={totalAmount} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
          <span style={labelStyle}>Discount:</span>
          <InputNumber
            min={0}
            max={totalAmount}
            value={discountAmount}
            onChange={(v) => onDiscountChange(v ?? 0)}
            prefix="Rs."
            precision={2}
            style={{ width: 150 }}
          />
        </div>
        {hasSupplier && (
          <SummaryRow
            label="Supplier Balance:"
            value={supplierBalance}
            color={supplierBalance > 0 ? '#ff4d4f' : supplierBalance < 0 ? '#52c41a' : undefined}
          />
        )}
        <Divider style={{ margin: '8px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
          <span style={{ fontSize: '14px', fontWeight: 700 }}>Net Amount:</span>
          <span style={{ ...valueStyle, fontSize: '16px' }}>{fmt(netAmount)}</span>
        </div>
      </div>

      {/* Payment Method */}
      <div style={{ marginBottom: '16px' }}>
        <Text style={labelStyle}>Payment Method:</Text>
        <div style={{ marginTop: '8px' }}>
          <Radio.Group
            value={paymentMethod}
            onChange={(e) => onPaymentMethodChange(e.target.value)}
            buttonStyle="solid"
          >
            <Radio.Button value="cash">Cash</Radio.Button>
            <Radio.Button value="cheque">Cheque</Radio.Button>
            <Radio.Button value="credit" disabled={!hasSupplier}>
              Credit
            </Radio.Button>
          </Radio.Group>
          {paymentMethod === 'credit' && !hasSupplier && (
            <Alert
              message="Credit payment requires a supplier"
              type="warning"
              showIcon
              style={{ marginTop: 8 }}
            />
          )}
        </div>
      </div>

      <Row gutter={[16, 12]}>
        {/* Debit Balance Used (only if supplier has debit) */}
        {hasSupplier && supplierDebit > 0 && (
          <Col xs={24} md={12}>
            <Form.Item
              label={`Use Supplier Debit (Max: ${fmt(supplierDebit)})`}
              style={{ marginBottom: 0 }}
            >
              <InputNumber
                min={0}
                max={Math.min(supplierDebit, netAmount)}
                value={debitBalanceUsed}
                onChange={(v) => onDebitBalanceUsedChange(v ?? 0)}
                prefix="Rs."
                precision={2}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        )}

        {/* Paid Amount */}
        <Col xs={24} md={12}>
          <Form.Item label="Paid Amount" style={{ marginBottom: 0 }}>
            <InputNumber
              min={0}
              value={paidAmount}
              onChange={(v) => onPaidAmountChange(v ?? 0)}
              prefix="Rs."
              precision={2}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>

        {/* Cheque fields */}
        {paymentMethod === 'cheque' && (
          <>
            <Col xs={24} md={12}>
              <Form.Item label="Cheque Number *" style={{ marginBottom: 0 }}>
                <Input
                  value={chequeNumber}
                  onChange={(e) => onChequeNumberChange(e.target.value)}
                  placeholder="Enter cheque number"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Cheque Date" style={{ marginBottom: 0 }}>
                <DatePicker
                  style={{ width: '100%' }}
                  value={chequeDate ? require('dayjs')(chequeDate) : null}
                  onChange={(_, dateStr) => onChequeDateChange(dateStr as string)}
                  format="YYYY-MM-DD"
                />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item label="Cheque Note" style={{ marginBottom: 0 }}>
                <Input
                  value={chequeNote}
                  onChange={(e) => onChequeNoteChange(e.target.value)}
                  placeholder="Optional note"
                />
              </Form.Item>
            </Col>
          </>
        )}
      </Row>

      {/* Running totals */}
      {(paidAmount > 0 || debitBalanceUsed > 0 || creditAmount > 0) && (
        <div style={{ marginTop: '16px', backgroundColor: '#fafafa', padding: '12px', borderRadius: '4px' }}>
          {debitBalanceUsed > 0 && <SummaryRow label="Debit Balance Used:" value={debitBalanceUsed} />}
          {paidAmount > 0 && <SummaryRow label="Paying Now:" value={paidAmount} />}
          {creditAmount > 0 && (
            <SummaryRow label="Goes to Credit:" value={creditAmount} color="#ff4d4f" />
          )}
          {creditBalance > 0 && paidAmount > remaining && (
            <SummaryRow
              label="Excess (New Debit):"
              value={paidAmount - remaining}
              color="#52c41a"
            />
          )}
        </div>
      )}
    </Card>
  );
};

export default PurchaseSummary;
