import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Modal, Input, Button, Table, InputNumber, Select, Switch, Checkbox,
  Typography, message, Spin,
} from 'antd';
import { SearchOutlined, DeleteOutlined, CameraOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useSaleReturnStore } from '../../store/transactions/saleReturnStore';
import type { OriginalSaleItem } from '../../types/entities/saleReturn.types';
import { useBarcodeScanner } from '../../hooks/useBarcodeScanner';

const { Text } = Typography;

const RETURN_REASONS = [
  { value: 'damaged_product',        label: 'Damaged Product' },
  { value: 'wrong_item',             label: 'Wrong Item' },
  { value: 'customer_changed_mind',  label: 'Customer Changed Mind' },
  { value: 'defective',              label: 'Defective Product' },
  { value: 'other',                  label: 'Other' },
];

interface ReturnItem {
  key: string;
  productId: string;
  variationId?: string;
  productName: string;
  variationType: string;
  unit: string;
  quantity: number;
  price: number;
}

interface POSRefundModalProps {
  visible: boolean;
  onClose: () => void;
}

const POSRefundModal: React.FC<POSRefundModalProps> = ({ visible, onClose }) => {
  const {
    originalSale, searching, submitting,
    findOriginalSale, clearOriginalSale, processRefund,
  } = useSaleReturnStore();

  const [invoiceSearch, setInvoiceSearch]     = useState('');
  const [selectedItem, setSelectedItem]       = useState<OriginalSaleItem | null>(null);
  const [returnQty, setReturnQty]             = useState<number>(1);
  const [returnItems, setReturnItems]         = useState<ReturnItem[]>([]);
  const [reason, setReason]                   = useState('damaged_product');
  const [note, setNote]                       = useState('');
  const [usbScanner, setUsbScanner]           = useState(true);
  const [bluetooth, setBluetooth]             = useState(true);
  const [refundDelivery, setRefundDelivery]   = useState(false);

  // Reset everything when modal closes
  useEffect(() => {
    if (!visible) {
      setInvoiceSearch('');
      setSelectedItem(null);
      setReturnQty(1);
      setReturnItems([]);
      setReason('damaged_product');
      setNote('');
      setRefundDelivery(false);
      clearOriginalSale();
    }
  }, [visible, clearOriginalSale]);

  // Pre-fill with the AVAILABLE (not original) qty when an item is selected
  useEffect(() => {
    if (selectedItem) setReturnQty(selectedItem.availableQty ?? selectedItem.quantity);
  }, [selectedItem]);

  const handleSearch = async () => {
    if (!invoiceSearch.trim()) { message.warning('Enter an invoice number'); return; }
    setSelectedItem(null);
    setReturnItems([]);
    await findOriginalSale(invoiceSearch.trim());
  };

  // Barcode scanner fills the invoice search field
  const handleBarcode = useCallback((code: string) => {
    setInvoiceSearch(code);
  }, []);

  useBarcodeScanner({
    onScan: handleBarcode,
    debounceMs: 100,
    enabled: usbScanner && visible,
  });

  const handleAddToList = () => {
    if (!selectedItem) { message.warning('Select an item from the original sale'); return; }
    const availQty = selectedItem.availableQty ?? selectedItem.quantity;
    if (availQty <= 0) {
      message.error('This item has already been fully returned');
      return;
    }
    if (returnQty <= 0) { message.warning('Quantity must be greater than 0'); return; }
    if (returnQty > availQty) {
      message.warning(`Cannot return more than available quantity (${availQty})`);
      return;
    }
    const key = `${selectedItem.productId}-${selectedItem.variationId ?? 'none'}`;
    setReturnItems(prev => {
      const existing = prev.find(i => i.key === key);
      if (existing) return prev.map(i => i.key === key ? { ...i, quantity: returnQty } : i);
      return [...prev, {
        key,
        productId:     selectedItem.productId,
        variationId:   selectedItem.variationId,
        productName:   selectedItem.productName,
        variationType: selectedItem.variationType || 'N/A',
        unit:          selectedItem.unit || 'Pieces',
        quantity:      returnQty,
        price:         selectedItem.price,
      }];
    });
  };

  const handleDeleteItem = (key: string) =>
    setReturnItems(prev => prev.filter(i => i.key !== key));

  const totalRefund = useMemo(() => {
    const itemsTotal = returnItems.reduce((s, i) => s + i.quantity * i.price, 0);
    return refundDelivery && (originalSale?.deliveryCharge ?? 0) > 0
      ? itemsTotal + originalSale!.deliveryCharge
      : itemsTotal;
  }, [returnItems, refundDelivery, originalSale]);

  const handleRefund = async () => {
    if (returnItems.length === 0) { message.warning('Add at least one item to return'); return; }
    if (!originalSale) return;

    const refundId = await processRefund({
      original_sale_id:     originalSale.id,
      customer_id:          originalSale.customerId,
      payment_method:       originalSale.paymentMethod,
      total_amount:         totalRefund,
      paid_amount:          totalRefund,
      reason,
      note:                 note || undefined,
      refund_delivery_charge: refundDelivery,
      products: returnItems.map(i => ({
        product_id:   i.productId,
        variation_id: i.variationId,
        quantity:     i.quantity,
        price:        i.price,
      })),
    });

    if (refundId) onClose();
  };

  // ── Table: original sale items (left) ──────────────────────────────────────
  const leftColumns: ColumnsType<OriginalSaleItem> = [
    { title: 'Product Name', dataIndex: 'productName', key: 'name', width: 140, ellipsis: true },
    { title: 'Variation',    key: 'vt',   width: 85, render: (_, r) => r.variationType || 'N/A' },
    { title: 'Unit',         key: 'unit', width: 60, render: (_, r) => r.unit || 'Pcs' },
    {
      title: 'Avail / Sold', key: 'qty', width: 90, align: 'right',
      render: (_, r) => {
        const avail = r.availableQty ?? r.quantity;
        const sold  = r.quantity % 1 === 0 ? r.quantity : r.quantity.toFixed(3);
        const availStr = avail % 1 === 0 ? avail : avail.toFixed(3);
        return (
          <span style={{ color: avail === 0 ? '#ff4d4f' : avail < r.quantity ? '#fa8c16' : '#52c41a', fontWeight: 600 }}>
            {availStr}<span style={{ color: '#aaa', fontWeight: 400 }}>/{sold}</span>
          </span>
        );
      },
    },
    { title: 'Price', dataIndex: 'price', key: 'price', width: 70, align: 'right', render: (v: number) => v.toFixed(2) },
    { title: 'Total', key: 'total',       width: 78, align: 'right', render: (_, r) => (r.quantity * r.price).toFixed(2) },
    {
      title: 'Date', key: 'date', width: 75,
      render: () => originalSale ? dayjs(originalSale.createdAt).format('M/D/YYYY') : '',
    },
  ];

  // ── Table: return items list (right bottom) ─────────────────────────────────
  const rightColumns: ColumnsType<ReturnItem> = [
    { title: 'Product Name',   dataIndex: 'productName',   key: 'name',  ellipsis: true },
    { title: 'Variation Type', dataIndex: 'variationType', key: 'vt',   width: 100 },
    { title: 'Unit',           dataIndex: 'unit',          key: 'unit', width: 75 },
    {
      title: 'Quantity', dataIndex: 'quantity', key: 'qty', width: 75, align: 'right',
      render: (v: number) => v % 1 === 0 ? v : v.toFixed(3),
    },
    { title: 'Price',       dataIndex: 'price', key: 'price', width: 80, align: 'right', render: (v: number) => v.toFixed(2) },
    { title: 'Total Price', key: 'total', width: 90, align: 'right', render: (_, r) => (r.quantity * r.price).toFixed(2) },
    {
      title: 'Delete', key: 'del', width: 56, align: 'center',
      render: (_, r) => (
        <Button
          type="text" danger size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteItem(r.key)}
        />
      ),
    },
  ];

  const tableHeaderStyle: React.CSSProperties = {
    backgroundColor: '#2ea2f8',
  };

  const hasDelivery = (originalSale?.deliveryCharge ?? 0) > 0;

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={1220}
      closable
      centered
      destroyOnClose
      title={null}
      styles={{ body: { padding: 16, overflowX: 'hidden' }, wrapper: { overflowX: 'hidden' } }}
    >
      {/* ── TOP: 2-column main area ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 14, height: 420 }}>

        {/* LEFT – invoice search + original sale items */}
        <div style={{ flex: '0 0 490px', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Search bar */}
          <Input.Search
            placeholder="Search invoice number..."
            value={invoiceSearch}
            onChange={e => setInvoiceSearch(e.target.value)}
            onSearch={handleSearch}
            onPressEnter={handleSearch}
            loading={searching}
            enterButton={<SearchOutlined />}
            style={{ height: 36 }}
          />

          {/* Customer name & invoice display */}
          {originalSale && (
            <div style={{ fontSize: 13, display: 'flex', gap: 24 }}>
              <span>Name: <strong>{originalSale.customerName || 'N/A'}</strong></span>
              <span>Number: <strong>{originalSale.invoiceNumber || 'N/A'}</strong></span>
            </div>
          )}

          {/* Original sale items table */}
          <div style={{ flex: 1, overflow: 'hidden', border: '1px solid #e8e8e8', borderRadius: 6 }}>
            <Spin spinning={searching}>
              <Table
                columns={leftColumns}
                dataSource={originalSale?.items ?? []}
                rowKey="id"
                pagination={false}
                size="small"
                scroll={{ y: 300, x: 600 }}
                onRow={record => {
                  const avail = record.availableQty ?? record.quantity;
                  const fullyReturned = avail <= 0;
                  return {
                    onClick: () => { if (!fullyReturned) setSelectedItem(record); },
                    style: {
                      cursor:          fullyReturned ? 'not-allowed' : 'pointer',
                      opacity:         fullyReturned ? 0.45 : 1,
                      backgroundColor: selectedItem?.id === record.id
                        ? '#e6f4ff'
                        : fullyReturned ? '#fff1f0' : undefined,
                    },
                  };
                }}
                locale={{ emptyText: 'Search an invoice to load items' }}
                components={{
                  header: {
                    cell: (props: any) => (
                      <th {...props} style={{ ...props.style, ...tableHeaderStyle, color: '#fff' }} />
                    ),
                  },
                }}
              />
            </Spin>
          </div>
        </div>

        {/* RIGHT – item detail form + return items list */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>

          {/* Product detail inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 8 }}>
            <div>
              <div style={{ fontSize: 11, color: '#888', marginBottom: 3 }}>Product ID:</div>
              <Input value={selectedItem?.productId ?? ''} readOnly placeholder="pro1514" style={{ height: 32 }} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#888', marginBottom: 3 }}>Product Name:</div>
              <Input value={selectedItem?.productName ?? ''} readOnly placeholder="Product Name" style={{ height: 32 }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <div>
              <div style={{ fontSize: 11, color: '#888', marginBottom: 3 }}>Variation:</div>
              <Input value={selectedItem?.variationType || (selectedItem ? 'N/A' : '')} readOnly placeholder="N/A" style={{ height: 32 }} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#888', marginBottom: 3 }}>Unit:</div>
              <Input value={selectedItem?.unit || ''} readOnly placeholder="Pieces" style={{ height: 32 }} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#888', marginBottom: 3 }}>Quantity:</div>
              <InputNumber
                value={returnQty}
                onChange={v => setReturnQty(Number(v) || 0)}
                min={0.001}
                max={(selectedItem?.availableQty ?? selectedItem?.quantity) ?? 9999}
                step={1}
                placeholder="Quantity"
                style={{ width: '100%', height: 32 }}
                controls={false}
              />
            </div>
          </div>

          {/* Add To List button */}
          <Button
            block
            disabled={!selectedItem}
            onClick={handleAddToList}
            style={{
              backgroundColor: '#7c6ef7',
              borderColor: '#7c6ef7',
              color: '#fff',
              height: 36,
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Add To List
          </Button>

          {/* Return items table */}
          <div style={{ flex: 1, overflow: 'hidden', border: '1px solid #e8e8e8', borderRadius: 6 }}>
            <Table
              columns={rightColumns}
              dataSource={returnItems}
              rowKey="key"
              pagination={false}
              size="small"
              scroll={{ y: 200, x: 'max-content' }}
              locale={{ emptyText: 'No items added' }}
              components={{
                header: {
                  cell: (props: any) => (
                    <th {...props} style={{ ...props.style, ...tableHeaderStyle, color: '#fff' }} />
                  ),
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* ── BOTTOM ROW ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 14, marginTop: 14, alignItems: 'flex-end' }}>

        {/* Bottom-left: reason, note, scanners */}
        <div style={{ flex: 1, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ minWidth: 190 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#444', marginBottom: 4 }}>Reason</div>
            <Select
              value={reason}
              onChange={setReason}
              options={RETURN_REASONS}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ flex: 1, minWidth: 150 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#444', marginBottom: 4 }}>Note</div>
            <Input
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Enter Note"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, paddingBottom: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <Switch
                checked={usbScanner}
                onChange={setUsbScanner}
                style={usbScanner ? { backgroundColor: '#52c41a' } : {}}
              />
              USB Scanner
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <Switch
                checked={bluetooth}
                onChange={setBluetooth}
                style={bluetooth ? { backgroundColor: '#7c6ef7' } : {}}
              />
              Bluetooth
            </div>
          </div>

          <Button
            icon={<CameraOutlined />}
            style={{
              height: 58,
              minWidth: 90,
              whiteSpace: 'normal',
              lineHeight: '1.3',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            Web Cam{'\n'}Scanner
          </Button>
        </div>

        {/* Bottom-right: payment info + refund button */}
        <div style={{
          minWidth: 290,
          border: '1px solid #e8e8e8',
          borderRadius: 8,
          padding: '12px 16px',
          backgroundColor: '#fafafa',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}>
          <Text style={{ fontSize: 14, fontWeight: 700, color: '#52c41a' }}>
            Payment Method:{' '}
            {originalSale?.paymentMethod
              ? originalSale.paymentMethod.charAt(0).toUpperCase() + originalSale.paymentMethod.slice(1)
              : '—'}
          </Text>

          <Checkbox
            checked={refundDelivery}
            onChange={e => setRefundDelivery(e.target.checked)}
            disabled={!hasDelivery}
            style={{ fontSize: 12, color: '#666' }}
          >
            Refund Delivery Charge{' '}
            {hasDelivery
              ? `(+${originalSale!.deliveryCharge.toFixed(2)})`
              : '(No delivery charge)'}
          </Checkbox>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 14, fontWeight: 700 }}>Total Refund:</Text>
            <Text style={{ fontSize: 20, fontWeight: 900, color: '#f5222d' }}>
              {totalRefund.toFixed(2)}
            </Text>
          </div>

          <Button
            block
            size="large"
            loading={submitting}
            onClick={handleRefund}
            style={{
              height: 46,
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: '0.05em',
              backgroundColor: '#7b0000',
              borderColor: '#7b0000',
              color: '#fff',
            }}
          >
            Refund
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default POSRefundModal;
