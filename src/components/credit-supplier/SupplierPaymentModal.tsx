import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal, Form, Input, Switch, Table, Typography,
  message, Divider, Tag, Spin, Segmented,
} from 'antd';
import { useSupplierCreditStore } from '../../store/management/supplierCreditStore';
import { supplierCreditService } from '../../services/management/supplierCreditService';
import type { CreditSupplier, SupplierTransaction } from '../../types/entities/supplierCredit.types';
import { CommonButton } from '../common/Button';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

interface Props {
  visible: boolean;
  supplier: CreditSupplier | null;
  onClose: () => void;
  onSuccess: () => void;
}

const formatBalance = (balanceStr: string) => {
  const n = parseFloat(balanceStr || '0');
  if (n > 0) return { label: `Credit: ${n.toFixed(2)}`, color: '#cf1322' };
  if (n < 0) return { label: `Debit: ${Math.abs(n).toFixed(2)}`, color: '#389e0d' };
  return { label: '0.00', color: '#595959' };
};

const txnColumns = [
  {
    title: 'Date',
    dataIndex: 'transactionDate',
    key: 'date',
    width: 135,
    render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm'),
  },
  {
    title: 'Type',
    dataIndex: 'transactionType',
    key: 'type',
    width: 78,
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
    width: 95,
    render: (v: string) => parseFloat(v || '0').toFixed(2),
  },
  {
    title: 'Balance After',
    dataIndex: 'balanceAfter',
    key: 'balanceAfter',
    align: 'right' as const,
    width: 105,
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

const SupplierPaymentModal: React.FC<Props> = ({ visible, supplier, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [isCredit, setIsCredit] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const [transactions, setTransactions] = useState<SupplierTransaction[]>([]);
  const [txnLoading, setTxnLoading] = useState(false);
  const [txnFilter, setTxnFilter] = useState<'All' | 'Credit' | 'Debit'>('Credit');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const { submitting, createPayment } = useSupplierCreditStore();

  const loadTransactions = useCallback(async (supplierId: string) => {
    setTxnLoading(true);
    try {
      const data = await supplierCreditService.listTransactions(supplierId, 30);
      setTransactions(data);
    } catch {
      /* silently ignore */
    } finally {
      setTxnLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible && supplier) {
      form.resetFields();
      setIsCredit(false);
      setTxnFilter('Credit');
      setTransactions([]);
      setSelectedRowKeys([]);
      loadTransactions(supplier.id);
    }
  }, [visible, supplier?.id]);

  const balance = supplier ? formatBalance(supplier.outstandingBalance) : null;

  const filtered = transactions.filter((t) => {
    if (txnFilter === 'Credit') return t.transactionType === 'credit';
    if (txnFilter === 'Debit') return t.transactionType === 'debit';
    return true;
  });

  /* when checkbox selection changes, sum amounts and build auto-note */
  const handleSelectionChange = (keys: React.Key[], rows: SupplierTransaction[]) => {
    setSelectedRowKeys(keys);
    if (rows.length === 0) {
      form.setFieldsValue({ amount: undefined, description: undefined });
      return;
    }
    const total = rows.reduce((sum, r) => sum + parseFloat(r.amount || '0'), 0);
    const refs = rows
      .map((r) => r.grnId ? `GRN #${r.grnId.slice(-8)}` : r.description || '')
      .filter(Boolean)
      .join(', ');
    setIsCredit(false);
    form.setFieldsValue({
      amount: total.toFixed(2),
      description: refs || undefined,
    });
  };

  const rowSelection = {
    type: 'checkbox' as const,
    selectedRowKeys,
    onChange: handleSelectionChange,
    getCheckboxProps: (record: SupplierTransaction) => ({
      disabled: record.transactionType !== 'credit',
    }),
  };

  const selectedCount = selectedRowKeys.length;
  const selectedTotal = transactions
    .filter((t) => selectedRowKeys.includes(t.id))
    .reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      await createPayment(supplier!.id, {
        amount: values.amount,
        type: isCredit ? 'credit' : 'debit',
        description: values.description || undefined,
      });
      messageApi.success('Payment recorded successfully');
      onSuccess();
      onClose();
    } catch (err: any) {
      if (err?.errorFields) return;
      messageApi.error(err?.response?.data?.error?.message || 'Failed to record payment');
    }
  };

  return (
    <>
      {contextHolder}
      <Modal
        open={visible}
        onCancel={onClose}
        width={960}
        title={<Title level={5} style={{ margin: 0 }}>SUPPLIER PAYMENT</Title>}
        footer={null}
        destroyOnHidden
      >
        <div style={{ display: 'flex', gap: 24 }}>

          {/* ── Left: supplier info + form ── */}
          <div style={{ width: 290, flexShrink: 0 }}>

            {/* Disabled search bar — supplier pre-selected from table */}
            <div style={{ marginBottom: 14 }}>
              <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>
                Supplier
              </Text>
              <Input.Search
                value={supplier?.displayName ?? ''}
                disabled
                placeholder="Supplier name"
                style={{ width: '100%' }}
              />
            </div>

            {/* Supplier info card */}
            <div style={{
              background: '#f9f9f9', border: '1px solid #f0f0f0',
              borderRadius: 8, padding: 14, marginBottom: 14,
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 11 }}>Phone Number</Text>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{supplier?.phone || '—'}</div>
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: 11 }}>Current Balance</Text>
                  <div style={{ fontWeight: 700, fontSize: 16, color: balance?.color, marginTop: 2 }}>
                    {balance?.label ?? '—'}
                  </div>
                </div>
              </div>
            </div>

            {/* Selection summary */}
            {selectedCount > 0 && (
              <div style={{
                background: '#f6ffed', border: '1px solid #b7eb8f',
                borderRadius: 6, padding: '7px 10px', marginBottom: 10,
                fontSize: 12,
              }}>
                <div style={{ color: '#389e0d', fontWeight: 600 }}>
                  {selectedCount} credit{selectedCount > 1 ? 's' : ''} selected
                </div>
                <div style={{ color: '#595959', marginTop: 2 }}>
                  Total: <b>{selectedTotal.toFixed(2)}</b>
                </div>
              </div>
            )}

            {/* Payment form */}
            <Form form={form} layout="vertical" size="middle">
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
                <Form.Item
                  label="Pay Amount"
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
                style={{ flex: 1, background: '#389e0d', borderColor: '#389e0d' }}
                loading={submitting}
                onClick={handleSave}
              >
                Save
              </CommonButton>
              <CommonButton style={{ flex: 1 }} onClick={onClose} disabled={submitting}>
                Cancel
              </CommonButton>
            </div>

            <Divider style={{ margin: '14px 0 8px' }} />
            <Text type="secondary" style={{ fontSize: 11 }}>
              <b>Debit</b> = pay off balance &nbsp;·&nbsp; <b>Credit</b> = add credit note
            </Text>
          </div>

          {/* ── Right: recent transactions ── */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <Text strong style={{ fontSize: 13 }}>Recent Transactions</Text>
                <Text type="secondary" style={{ fontSize: 11, marginLeft: 8 }}>
                  Check credits to pay
                </Text>
              </div>
              <Segmented
                size="small"
                value={txnFilter}
                onChange={(v) => {
                  setTxnFilter(v as 'All' | 'Credit' | 'Debit');
                  setSelectedRowKeys([]);
                  form.setFieldsValue({ amount: undefined, description: undefined });
                }}
                options={[
                  { label: 'All', value: 'All' },
                  { label: 'Credit', value: 'Credit' },
                  { label: 'Debit', value: 'Debit' },
                ]}
              />
            </div>

            <Spin spinning={txnLoading} tip="Loading...">
              <Table
                size="small"
                columns={txnColumns}
                dataSource={filtered}
                rowKey="id"
                rowSelection={rowSelection}
                pagination={{ pageSize: 8, showSizeChanger: false }}
                scroll={{ x: 540 }}
                locale={{ emptyText: txnLoading ? ' ' : 'No transactions found' }}
                rowClassName={(record) =>
                  selectedRowKeys.includes(record.id) ? 'ant-table-row-selected' : ''
                }
              />
            </Spin>
          </div>

        </div>
      </Modal>
    </>
  );
};

export default SupplierPaymentModal;
