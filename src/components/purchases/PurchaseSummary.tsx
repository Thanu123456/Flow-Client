import React, { useState, useEffect, useRef } from 'react';
import {
  Card, Radio, Row, Col, Form, InputNumber, Input, DatePicker,
  Typography, Divider, Alert, Modal, Space, Button,
} from 'antd';
import { EditOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { PaymentMethod } from '../../types/entities/purchase.types';
import dayjs from 'dayjs';

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
  const remaining = Math.max(0, netAmount - debitBalanceUsed);
  const creditAmount = Math.max(0, remaining - paidAmount);

  // Cheque modal state
  const [chequeModalOpen, setChequeModalOpen] = useState(false);
  const [tempChequeNumber, setTempChequeNumber] = useState('');
  const [tempChequeDate, setTempChequeDate] = useState('');
  const [tempChequeNote, setTempChequeNote] = useState('');
  const [chequeNumberError, setChequeNumberError] = useState('');
  const prevPaymentMethodRef = useRef<PaymentMethod>(paymentMethod);

  // Auto-open modal when user switches to cheque for the first time
  useEffect(() => {
    if (paymentMethod === 'cheque' && prevPaymentMethodRef.current !== 'cheque') {
      setTempChequeNumber(chequeNumber);
      setTempChequeDate(chequeDate);
      setTempChequeNote(chequeNote);
      setChequeNumberError('');
      setChequeModalOpen(true);
    }
    prevPaymentMethodRef.current = paymentMethod;
  }, [paymentMethod]);

  const handleOpenChequeModal = () => {
    setTempChequeNumber(chequeNumber);
    setTempChequeDate(chequeDate);
    setTempChequeNote(chequeNote);
    setChequeNumberError('');
    setChequeModalOpen(true);
  };

  const handleSaveCheque = () => {
    if (!tempChequeNumber.trim()) {
      setChequeNumberError('Cheque number is required');
      return;
    }
    onChequeNumberChange(tempChequeNumber.trim());
    onChequeDateChange(tempChequeDate);
    onChequeNoteChange(tempChequeNote);
    setChequeNumberError('');
    setChequeModalOpen(false);
  };

  const handleCancelCheque = () => {
    setChequeModalOpen(false);
    // Revert to cash if no cheque details saved yet
    if (!chequeNumber) {
      onPaymentMethodChange('cash');
    }
  };

  const labelStyle: React.CSSProperties = { color: '#666', fontSize: '13px' };
  const valueStyle: React.CSSProperties = { fontFamily: 'monospace', fontSize: '14px', fontWeight: 600 };

  const SummaryRow: React.FC<{ label: string; value: number; color?: string }> = ({
    label, value, color,
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
          {paymentMethod === 'cheque' && !hasSupplier && (
            <Alert
              message="Cheque payment requires a supplier"
              type="warning"
              showIcon
              style={{ marginTop: 8 }}
            />
          )}
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

      {/* Cheque details summary strip */}
      {paymentMethod === 'cheque' && (
        <div style={{ marginBottom: 16, padding: '10px 14px', backgroundColor: '#f9f0ff', borderRadius: 6, border: '1px solid #d3adf7' }}>
          {chequeNumber ? (
            <Space wrap>
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
              <Text strong>Cheque #{chequeNumber}</Text>
              {chequeDate && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Due: {dayjs(chequeDate).format('DD MMM YYYY')}
                </Text>
              )}
              {chequeNote && (
                <Text type="secondary" style={{ fontSize: 12 }}>— {chequeNote}</Text>
              )}
              <Button size="small" icon={<EditOutlined />} onClick={handleOpenChequeModal}>
                Edit
              </Button>
            </Space>
          ) : (
            <Space>
              <ExclamationCircleOutlined style={{ color: '#fa8c16' }} />
              <Text style={{ color: '#fa8c16' }}>Cheque details not entered</Text>
              <Button size="small" type="primary" onClick={handleOpenChequeModal}>
                Enter Details
              </Button>
            </Space>
          )}
        </div>
      )}

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

      {/* Cheque Details Modal */}
      <Modal
        open={chequeModalOpen}
        title="Cheque Payment Details"
        onOk={handleSaveCheque}
        onCancel={handleCancelCheque}
        okText="Save Details"
        cancelText="Cancel"
        width={460}
        maskClosable={false}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
          <Form.Item
            label="Cheque Number *"
            style={{ marginBottom: 0 }}
            validateStatus={chequeNumberError ? 'error' : ''}
            help={chequeNumberError}
          >
            <Input
              value={tempChequeNumber}
              onChange={(e) => {
                setTempChequeNumber(e.target.value);
                setChequeNumberError('');
              }}
              placeholder="Enter cheque number"
              autoFocus
            />
          </Form.Item>
          <Form.Item label="Due Date" style={{ marginBottom: 0 }}>
            <DatePicker
              style={{ width: '100%' }}
              value={tempChequeDate ? dayjs(tempChequeDate) : null}
              onChange={(_, dateStr) => setTempChequeDate(dateStr as string)}
              format="YYYY-MM-DD"
              placeholder="Select due date (optional)"
            />
          </Form.Item>
          <Form.Item label="Note" style={{ marginBottom: 0 }}>
            <Input
              value={tempChequeNote}
              onChange={(e) => setTempChequeNote(e.target.value)}
              placeholder="Optional note"
            />
          </Form.Item>
        </div>
      </Modal>
    </Card>
  );
};

export default PurchaseSummary;
