import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  AutoComplete, Input, Form, Switch, Table, Typography,
  message, Tag, Spin, Segmented, Row, Col, Card, Divider,
} from 'antd';
import {
  ArrowLeftOutlined, UserOutlined, DollarOutlined,
} from '@ant-design/icons';
import { useSupplierCreditStore } from '../../store/management/supplierCreditStore';
import { supplierService } from '../../services/management/supplierService';
import { supplierCreditService } from '../../services/management/supplierCreditService';
import type { Supplier } from '../../types/entities/supplier.types';
import type { SupplierSummary } from '../../types/entities/supplier.types';
import type { SupplierTransaction } from '../../types/entities/supplierCredit.types';
import { CommonButton } from '../common/Button';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

/* ── helpers ── */
const formatBalance = (val: string) => {
  const n = parseFloat(val || '0');
  if (n > 0) return { label: `Credit: ${n.toFixed(2)}`, color: '#cf1322' };
  if (n < 0) return { label: `Debit: ${Math.abs(n).toFixed(2)}`, color: '#389e0d' };
  return { label: '0.00', color: '#595959' };
};

const txnColumns = [
  {
    title: 'Date',
    dataIndex: 'transactionDate',
    key: 'date',
    width: 145,
    render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm'),
  },
  {
    title: 'Type',
    dataIndex: 'transactionType',
    key: 'type',
    width: 80,
    render: (v: string) => (
      <Tag color={v === 'credit' ? 'red' : 'green'}>
        {v === 'credit' ? 'Credit' : 'Debit'}
      </Tag>
    ),
  },
  {
    title: 'Amount',
    dataIndex: 'amount',
    key: 'amount',
    align: 'right' as const,
    width: 100,
    render: (v: string) => parseFloat(v || '0').toFixed(2),
  },
  {
    title: 'Balance After',
    dataIndex: 'balanceAfter',
    key: 'balanceAfter',
    align: 'right' as const,
    width: 115,
    render: (v: string) => {
      const n = parseFloat(v || '0');
      const color = n > 0 ? '#cf1322' : n < 0 ? '#389e0d' : undefined;
      return <span style={{ color, fontWeight: 500 }}>{n.toFixed(2)}</span>;
    },
  },
  {
    title: 'Note',
    dataIndex: 'description',
    key: 'description',
    render: (v?: string) => v || <span style={{ color: '#bfbfbf' }}>—</span>,
  },
];

/* ── component ── */
const SupplierPaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preloadId = searchParams.get('supplierId');

  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [isCredit, setIsCredit] = useState(false);

  /* supplier search */
  const [searchValue, setSearchValue] = useState('');
  const [searchOptions, setSearchOptions] = useState<{ value: string; label: string }[]>([]);
  const [searching, setSearching] = useState(false);

  /* selected supplier */
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [supplierLoading, setSupplierLoading] = useState(false);

  /* transactions */
  const [transactions, setTransactions] = useState<SupplierTransaction[]>([]);
  const [txnLoading, setTxnLoading] = useState(false);
  const [txnFilter, setTxnFilter] = useState<'All' | 'Credit' | 'Debit'>('All');

  const { submitting, createPayment } = useSupplierCreditStore();

  /* ── load supplier + transactions by ID ── */
  const loadSupplier = useCallback(async (id: string) => {
    setSupplierLoading(true);
    setTransactions([]);
    try {
      const s = await supplierService.getSupplierById(id);
      setSupplier(s);
    } catch {
      messageApi.error('Failed to load supplier');
    } finally {
      setSupplierLoading(false);
    }
  }, []);

  const loadTransactions = useCallback(async (id: string) => {
    setTxnLoading(true);
    setTransactions([]);
    try {
      const data = await supplierCreditService.listTransactions(id, 50);
      setTransactions(data);
    } catch {
      /* silently ignore — table shows empty */
    } finally {
      setTxnLoading(false);
    }
  }, []);

  /* pre-load supplier from URL param */
  useEffect(() => {
    if (preloadId) {
      loadSupplier(preloadId);
      loadTransactions(preloadId);
    }
  }, [preloadId]);

  /* ── autocomplete search ── */
  const handleSearch = async (q: string) => {
    setSearchValue(q);
    if (!q.trim()) { setSearchOptions([]); return; }
    setSearching(true);
    try {
      const results: SupplierSummary[] = await supplierService.searchSuppliers(q);
      setSearchOptions(
        results.map((s) => ({
          value: s.id,
          label: `${s.displayName} — ${s.phone}`,
        }))
      );
    } catch {
      setSearchOptions([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectSupplier = async (id: string, option: any) => {
    setSearchValue(option.label);
    setSearchOptions([]);
    form.resetFields();
    setIsCredit(false);
    setTxnFilter('All');
    await loadSupplier(id);
    await loadTransactions(id);
  };

  /* ── save payment ── */
  const handleSave = async () => {
    if (!supplier) {
      messageApi.warning('Please select a supplier first');
      return;
    }
    try {
      const values = await form.validateFields();
      await createPayment(supplier.id, {
        amount: values.amount,
        type: isCredit ? 'credit' : 'debit',
        description: values.description || undefined,
      });
      messageApi.success('Payment recorded successfully');
      form.resetFields();
      setIsCredit(false);
      /* refresh supplier balance + transactions */
      await loadSupplier(supplier.id);
      await loadTransactions(supplier.id);
    } catch (err: any) {
      if (err?.errorFields) return;
      messageApi.error(err?.response?.data?.error?.message || 'Failed to record payment');
    }
  };

  /* ── filter transactions client-side ── */
  const filtered = transactions.filter((t) => {
    if (txnFilter === 'Credit') return t.transactionType === 'credit';
    if (txnFilter === 'Debit') return t.transactionType === 'debit';
    return true;
  });

  const balance = supplier ? formatBalance(supplier.outstandingBalance) : null;

  return (
    <>
      {contextHolder}
      <div style={{ padding: '16px 20px' }}>

        {/* ── page header ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <CommonButton
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/credit-supplier')}
          >
            Back
          </CommonButton>
          <Title level={4} style={{ margin: 0 }}>Create Payment</Title>
        </div>

        <Row gutter={[20, 20]} align="top">

          {/* ──────────────── LEFT: supplier + form ──────────────── */}
          <Col xs={24} md={10} lg={8}>
            <Card size="small" bordered style={{ borderRadius: 10 }}>

              {/* Supplier search */}
              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ display: 'block', marginBottom: 6 }}>
                  <UserOutlined style={{ marginRight: 6 }} />
                  Search Supplier
                </Text>
                <AutoComplete
                  style={{ width: '100%' }}
                  options={searchOptions}
                  value={searchValue}
                  onSearch={handleSearch}
                  onSelect={handleSelectSupplier}
                  notFoundContent={searching ? <Spin size="small" /> : 'No suppliers found'}
                >
                  <Input.Search
                    placeholder="Name or phone number..."
                    loading={searching}
                    allowClear
                    onClear={() => {
                      setSearchValue('');
                      setSearchOptions([]);
                      setSupplier(null);
                      setTransactions([]);
                      form.resetFields();
                    }}
                  />
                </AutoComplete>
              </div>

              {/* Supplier info card */}
              {supplierLoading ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <Spin tip="Loading supplier..." />
                </div>
              ) : supplier ? (
                <div style={{
                  background: '#f9f9f9', border: '1px solid #e8e8e8',
                  borderRadius: 8, padding: 14, marginBottom: 16,
                }}>
                  <Row gutter={[0, 6]}>
                    <Col span={10}><Text type="secondary" style={{ fontSize: 12 }}>Supplier</Text></Col>
                    <Col span={14}><Text strong>{supplier.displayName}</Text></Col>
                    <Col span={10}><Text type="secondary" style={{ fontSize: 12 }}>Phone</Text></Col>
                    <Col span={14}><Text>{supplier.phone}</Text></Col>
                    {supplier.email && (
                      <>
                        <Col span={10}><Text type="secondary" style={{ fontSize: 12 }}>Email</Text></Col>
                        <Col span={14}><Text>{supplier.email}</Text></Col>
                      </>
                    )}
                    <Col span={10}><Text type="secondary" style={{ fontSize: 12 }}>Balance</Text></Col>
                    <Col span={14}>
                      <Text strong style={{ fontSize: 15, color: balance?.color }}>
                        {balance?.label}
                      </Text>
                    </Col>
                  </Row>
                </div>
              ) : (
                <div style={{
                  textAlign: 'center', color: '#bfbfbf', padding: '14px 0',
                  border: '1px dashed #e0e0e0', borderRadius: 8, marginBottom: 16,
                }}>
                  Search and select a supplier above
                </div>
              )}

              <Divider style={{ margin: '0 0 14px' }} />

              {/* Payment form */}
              <Form form={form} layout="vertical" size="middle" disabled={!supplier || supplierLoading}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
                  <Form.Item
                    label="Amount"
                    name="amount"
                    style={{ flex: 1, marginBottom: 12 }}
                    rules={[
                      { required: true, message: 'Enter amount' },
                      {
                        validator: (_, v) =>
                          v && parseFloat(v) > 0
                            ? Promise.resolve()
                            : Promise.reject(new Error('Must be > 0')),
                      },
                    ]}
                  >
                    <Input placeholder="0.00" type="number" min="0" step="0.01" />
                  </Form.Item>

                  <Form.Item label="Credit" style={{ marginBottom: 12 }}>
                    <Switch
                      checked={isCredit}
                      onChange={setIsCredit}
                      checkedChildren="On"
                      unCheckedChildren="Off"
                      disabled={!supplier}
                    />
                  </Form.Item>
                </div>

                <Form.Item label="Note" name="description" style={{ marginBottom: 14 }}>
                  <Input placeholder="Optional note" />
                </Form.Item>
              </Form>

              <div style={{ display: 'flex', gap: 8 }}>
                <CommonButton
                  type="primary"
                  icon={<DollarOutlined />}
                  style={{ flex: 1, background: '#389e0d', borderColor: '#389e0d' }}
                  loading={submitting}
                  disabled={!supplier}
                  onClick={handleSave}
                >
                  Save Payment
                </CommonButton>
                <CommonButton
                  style={{ flex: 1 }}
                  onClick={() => navigate('/credit-supplier')}
                  disabled={submitting}
                >
                  Cancel
                </CommonButton>
              </div>

              <div style={{ marginTop: 12, color: '#8c8c8c', fontSize: 11 }}>
                <b>Debit</b> = pay off balance &nbsp;·&nbsp; <b>Credit</b> = add credit note
              </div>
            </Card>
          </Col>

          {/* ──────────────── RIGHT: transaction history ──────────────── */}
          <Col xs={24} md={14} lg={16}>
            <Card
              size="small"
              bordered
              style={{ borderRadius: 10 }}
              title={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text strong>Recent Transactions</Text>
                  <Segmented
                    size="small"
                    value={txnFilter}
                    onChange={(v) => setTxnFilter(v as 'All' | 'Credit' | 'Debit')}
                    options={[
                      { label: 'All', value: 'All' },
                      { label: 'Credit', value: 'Credit' },
                      { label: 'Debit', value: 'Debit' },
                    ]}
                  />
                </div>
              }
            >
              {!supplier && !txnLoading ? (
                <div style={{ textAlign: 'center', color: '#bfbfbf', padding: '40px 0' }}>
                  Select a supplier to view their transactions
                </div>
              ) : (
                <Spin spinning={txnLoading} tip="Loading transactions...">
                  <Table
                    size="small"
                    columns={txnColumns}
                    dataSource={filtered}
                    rowKey="id"
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: false,
                      showTotal: (total) => `${total} transactions`,
                    }}
                    scroll={{ x: 600 }}
                    locale={{ emptyText: txnLoading ? ' ' : 'No transactions found' }}
                  />
                </Spin>
              )}
            </Card>
          </Col>

        </Row>
      </div>
    </>
  );
};

export default SupplierPaymentPage;
