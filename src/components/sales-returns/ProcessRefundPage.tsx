import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Steps, Card, Input, Table, InputNumber, Select,
  Descriptions, Tag, Space, Typography, Row, Col, Divider, Alert,
  message,
} from 'antd';
import { SearchOutlined, RollbackOutlined, ExclamationCircleFilled, ArrowLeftOutlined } from '@ant-design/icons';
import { PageLayout } from '../common/PageLayout';
import { CommonButton } from '../common/Button';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useSaleReturnStore } from '../../store/transactions/saleReturnStore';
import type { OriginalSaleItem } from '../../types/entities/saleReturn.types';

const { Text, Title } = Typography;
const { TextArea } = Input;

const PAYMENT_METHODS = [
  { value: 'cash',   label: 'Cash' },
  { value: 'card',   label: 'Card' },
  { value: 'credit', label: 'Credit (Customer Account)' },
];

const PAYMENT_COLORS: Record<string, string> = {
  cash: 'green', card: 'blue', cod: 'orange', credit: 'purple',
};

const ProcessRefundPage: React.FC = () => {
  const { saleId } = useParams<{ saleId?: string }>();
  const navigate = useNavigate();

  const {
    originalSale, searching, submitting,
    findOriginalSale, loadOriginalSale, processRefund, clearOriginalSale,
  } = useSaleReturnStore();

  const [step, setStep]                 = useState(0);
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [selectedKeys, setSelectedKeys]   = useState<React.Key[]>([]);
  const [returnQtys, setReturnQtys]       = useState<Record<string, number>>({});
  const [refundMethod, setRefundMethod]   = useState('cash');
  const [refundAmount, setRefundAmount]   = useState(0);
  const [refundReason, setRefundReason]   = useState('');

  // Auto-load when navigated from Sales History with a saleId param
  useEffect(() => {
    if (saleId) {
      loadOriginalSale(saleId);
    }
    return () => { clearOriginalSale(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saleId]);

  // When original sale loads, pre-select items that still have available qty
  useEffect(() => {
    if (originalSale) {
      const qtys: Record<string, number> = {};
      const selectableKeys: React.Key[] = [];
      originalSale.items.forEach((item) => {
        const avail = item.availableQty ?? item.quantity;
        qtys[item.id] = avail;
        if (avail > 0) selectableKeys.push(item.id);
      });
      setReturnQtys(qtys);
      setSelectedKeys(selectableKeys);
      if (saleId && step === 0) setStep(1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originalSale]);

  const returnTotal = useMemo(() => {
    if (!originalSale) return 0;
    return originalSale.items
      .filter((i) => selectedKeys.includes(i.id))
      .reduce((sum, item) => sum + (returnQtys[item.id] ?? 0) * item.price, 0);
  }, [originalSale, selectedKeys, returnQtys]);

  useEffect(() => { setRefundAmount(returnTotal); }, [returnTotal]);

  // ── Step 1 handlers ──────────────────────────────────────────────────────
  const handleSearch = async () => {
    if (!invoiceSearch.trim()) { message.warning('Enter an invoice number'); return; }
    const found = await findOriginalSale(invoiceSearch.trim());
    if (found) setStep(1);
  };

  // ── Step 2 handlers ──────────────────────────────────────────────────────
  const handleToStep3 = () => {
    if (selectedKeys.length === 0) {
      message.warning('Select at least one item to return');
      return;
    }
    const hasQty = selectedKeys.some((k) => (returnQtys[k as string] ?? 0) > 0);
    if (!hasQty) {
      message.warning('Enter a return quantity greater than 0');
      return;
    }
    setStep(2);
  };

  // ── Step 3 handlers ──────────────────────────────────────────────────────
  const handleConfirm = async () => {
    if (!originalSale) return;

    if (!refundReason.trim()) {
      message.error('Reason for refund is required');
      return;
    }

    if (refundMethod === 'credit' && !originalSale.customerId) {
      message.error('Credit refund requires a customer linked to the original sale');
      return;
    }

    const selectedItems = originalSale.items
      .filter((i) => selectedKeys.includes(i.id))
      .map((i) => ({
        product_id:   i.productId,
        variation_id: i.variationId,
        quantity:     returnQtys[i.id] ?? 0,
        price:        i.price,
      }))
      .filter((i) => i.quantity > 0);

    if (!selectedItems.length) {
      message.warning('No items with quantity > 0');
      return;
    }

    const finalPaid = refundMethod === 'cash' ? refundAmount : returnTotal;

    const refundId = await processRefund({
      original_sale_id: originalSale.id,
      customer_id:      originalSale.customerId,
      payment_method:   refundMethod,
      total_amount:     returnTotal,
      paid_amount:      finalPaid,
      reason:           refundReason.trim(),
      products:         selectedItems,
    });

    if (refundId) {
      clearOriginalSale();
      navigate('/sales-returns');
    }
  };

  // ── Item selection table columns ─────────────────────────────────────────
  const itemColumns: ColumnsType<OriginalSaleItem> = [
    {
      title: 'Product',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Original Qty',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 110,
      align: 'right',
      render: (v: number) => (v % 1 === 0 ? v : v.toFixed(3)),
    },
    {
      title: 'Available',
      key: 'availableQty',
      width: 100,
      align: 'right',
      render: (_: unknown, record: OriginalSaleItem) => {
        const avail = record.availableQty ?? record.quantity;
        return (
          <Text type={avail === 0 ? 'danger' : undefined} strong={avail === 0}>
            {avail % 1 === 0 ? avail : avail.toFixed(3)}
          </Text>
        );
      },
    },
    {
      title: 'Return Qty',
      key: 'returnQty',
      width: 130,
      align: 'right',
      render: (_: unknown, record: OriginalSaleItem) => {
        const avail = record.availableQty ?? record.quantity;
        return (
          <InputNumber
            size="small"
            min={0}
            max={avail}
            step={0.001}
            value={returnQtys[record.id] ?? avail}
            onChange={(v) =>
              setReturnQtys((prev) => ({ ...prev, [record.id]: v ?? 0 }))
            }
            disabled={!selectedKeys.includes(record.id) || avail === 0}
            style={{ width: 90 }}
          />
        );
      },
    },
    {
      title: 'Unit Price',
      dataIndex: 'price',
      key: 'price',
      width: 110,
      align: 'right',
      render: (v: number) => `LKR ${v.toFixed(2)}`,
    },
    {
      title: 'Return Amount',
      key: 'returnAmount',
      width: 130,
      align: 'right',
      render: (_: unknown, record: OriginalSaleItem) => {
        const qty = selectedKeys.includes(record.id)
          ? (returnQtys[record.id] ?? 0)
          : 0;
        return (
          <Text style={{ color: qty > 0 ? '#f5222d' : undefined }}>
            LKR {(qty * record.price).toFixed(2)}
          </Text>
        );
      },
    },
    {
      title: 'Status',
      key: 'status',
      width: 180,
      render: (_: unknown, record: OriginalSaleItem) => {
        const avail = record.availableQty ?? record.quantity;
        if (avail === 0) {
          return (
            <Tag color="red" icon={<ExclamationCircleFilled />}>
              No quantity available for return
            </Tag>
          );
        }
        return <Tag color="green">Returnable</Tag>;
      },
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <PageLayout
      title="Process Refund"
      actions={
        <CommonButton
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/sales-returns')}
        >
          Back to List
        </CommonButton>
      }
    >
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <Steps
          current={step}
          style={{ marginBottom: 32 }}
          items={[
            { title: 'Find Original Sale' },
            { title: 'Select Items' },
            { title: 'Confirm Refund' },
          ]}
        />

        {/* ── STEP 1: Find Sale ─────────────────────────────────────────── */}
        {step === 0 && (
          <Card>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Text type="secondary">
                Enter the original sale invoice number to begin a return.
              </Text>
              <Space.Compact style={{ maxWidth: 480 }}>
                <Input
                  placeholder="e.g. INV-1714000000"
                  value={invoiceSearch}
                  onChange={(e) => setInvoiceSearch(e.target.value)}
                  onPressEnter={handleSearch}
                  size="large"
                />
                <CommonButton
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={handleSearch}
                  loading={searching}
                  size="large"
                >
                  Search
                </CommonButton>
              </Space.Compact>
            </Space>
          </Card>
        )}

        {/* ── STEP 2: Select Items ──────────────────────────────────────── */}
        {step === 1 && originalSale && (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {/* Original sale summary */}
            <Card size="small" title="Original Sale">
              <Descriptions size="small" column={3}>
                <Descriptions.Item label="Invoice #">
                  <strong>{originalSale.invoiceNumber}</strong>
                </Descriptions.Item>
                <Descriptions.Item label="Customer">
                  {originalSale.customerName || 'Walk-in'}
                </Descriptions.Item>
                <Descriptions.Item label="Date">
                  {dayjs(originalSale.createdAt).format('YYYY-MM-DD HH:mm')}
                </Descriptions.Item>
                <Descriptions.Item label="Total">
                  <strong>LKR {originalSale.totalAmount.toFixed(2)}</strong>
                </Descriptions.Item>
                <Descriptions.Item label="Payment">
                  <Tag color={PAYMENT_COLORS[originalSale.paymentMethod?.toLowerCase()] ?? 'default'}>
                    {originalSale.paymentMethod?.toUpperCase()}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Item selection table */}
            <Card title="Select Items to Return">
              {originalSale.items.some((item) => (item.availableQty ?? item.quantity) === 0) && (
                <Alert
                  message="Some items cannot be returned because they have already been fully refunded or have no returnable quantity."
                  type="warning"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
              )}
              <Table
                rowSelection={{
                  selectedRowKeys: selectedKeys,
                  onChange: (keys) => {
                    // Only allow selecting rows with available qty > 0
                    const filtered = keys.filter((k) => {
                      const item = originalSale.items.find((i) => i.id === k);
                      return (item?.availableQty ?? item?.quantity ?? 0) > 0;
                    });
                    setSelectedKeys(filtered);
                  },
                  getCheckboxProps: (record: OriginalSaleItem) => ({
                    disabled: (record.availableQty ?? record.quantity) === 0,
                  }),
                }}
                columns={itemColumns}
                dataSource={originalSale.items}
                rowKey="id"
                pagination={false}
                size="small"
                rowClassName={(record: OriginalSaleItem) =>
                  (record.availableQty ?? record.quantity) === 0 ? 'ant-table-row-disabled' : ''
                }
              />
              <Divider />
              <div style={{ textAlign: 'right' }}>
                <Text>Return Total: </Text>
                <Text strong style={{ fontSize: 18, color: '#f5222d' }}>
                  LKR {returnTotal.toFixed(2)}
                </Text>
              </div>
            </Card>

            <Space>
              <CommonButton onClick={() => { setStep(0); clearOriginalSale(); }}>Back</CommonButton>
              <CommonButton type="primary" onClick={handleToStep3}>
                Next: Confirm Refund
              </CommonButton>
            </Space>
          </Space>
        )}

        {/* ── STEP 3: Confirm ───────────────────────────────────────────── */}
        {step === 2 && originalSale && (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Card title="Refund Details">
              <Row gutter={24}>
                <Col xs={24} sm={12}>
                  <div style={{ marginBottom: 8 }}>
                    <Text strong>Refund Method</Text>
                  </div>
                  <Select
                    value={refundMethod}
                    onChange={setRefundMethod}
                    style={{ width: '100%' }}
                    options={PAYMENT_METHODS}
                  />
                </Col>
                <Col xs={24} sm={12}>
                  <div style={{ marginBottom: 8 }}>
                    <Text strong>Refund Amount</Text>
                    {refundMethod !== 'cash' && (
                      <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                        (pre-filled for non-cash)
                      </Text>
                    )}
                  </div>
                  <InputNumber
                    value={refundAmount}
                    onChange={(v) => setRefundAmount(v ?? 0)}
                    min={0}
                    max={returnTotal}
                    step={0.01}
                    prefix="LKR"
                    style={{ width: '100%' }}
                    disabled={refundMethod !== 'cash'}
                  />
                </Col>
              </Row>

              {/* ── Reason for Refund (CRITICAL REQUIRED FIELD) ── */}
              <Row style={{ marginTop: 20 }}>
                <Col xs={24}>
                  <div style={{ marginBottom: 8 }}>
                    <Text strong>
                      <ExclamationCircleFilled style={{ color: '#f5222d', marginRight: 6 }} />
                      Reason for Refund
                    </Text>
                    <Text type="danger" style={{ marginLeft: 4, fontSize: 12 }}>* Required</Text>
                  </div>
                  <TextArea
                    id="refund-reason"
                    rows={3}
                    placeholder="Enter the reason for this refund (e.g. defective product, wrong item delivered)…"
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    status={!refundReason.trim() ? 'error' : undefined}
                    maxLength={500}
                    showCount
                  />
                  {!refundReason.trim() && (
                    <Text type="danger" style={{ fontSize: 12 }}>Please enter a reason for the refund.</Text>
                  )}
                </Col>
              </Row>

              <Divider />

              <div style={{ textAlign: 'right', lineHeight: '2.2em' }}>
                <div>
                  Items selected: <strong>{selectedKeys.length}</strong>
                </div>
                <div style={{ fontSize: 16 }}>
                  Total Refund:{' '}
                  <strong style={{ color: '#f5222d' }}>
                    LKR {returnTotal.toFixed(2)}
                  </strong>
                </div>
              </div>
            </Card>

            {refundMethod === 'credit' && !originalSale.customerId && (
              <Alert
                type="error"
                message="Credit refund requires a customer linked to the original sale."
              />
            )}

            <Space>
              <CommonButton onClick={() => setStep(1)}>Back</CommonButton>
              <CommonButton
                type="primary"
                danger
                icon={<RollbackOutlined />}
                loading={submitting}
                onClick={handleConfirm}
                disabled={refundMethod === 'credit' && !originalSale.customerId}
              >
                Confirm Refund
              </CommonButton>
            </Space>
          </Space>
        )}
      </div>
    </PageLayout>
  );
};

export default ProcessRefundPage;
