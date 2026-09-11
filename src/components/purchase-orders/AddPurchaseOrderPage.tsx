import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Card, Row, Col, Select, AutoComplete, DatePicker, Input, Button,
  InputNumber, Table, Form, message, Typography, Spin,
} from 'antd';
import { SaveOutlined, PlusOutlined, SearchOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';

import { usePurchaseOrderStore } from '../../store/transactions/purchaseOrderStore';
import { useWarehouseStore } from '../../store/management/warehouseStore';
import { useSupplierStore } from '../../store/management/supplierStore';
import { purchaseService } from '../../services/transactions/purchaseService';
import type { POItemLocal } from '../../types/entities/purchaseOrder.types';
import type { ProductSearchResult } from '../../types/entities/purchase.types';

const { Title } = Typography;
const { TextArea } = Input;

let localIdCounter = 0;
const newLocalId = () => `po-local-${++localIdCounter}`;

const AddPurchaseOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const { id: editId } = useParams<{ id: string }>();
  const isEdit = Boolean(editId);
  const [messageApi, contextHolder] = message.useMessage();

  const { createPO, updatePO, getPO, addItem, updateItem, removeItem } = usePurchaseOrderStore();
  const { getAllWarehouses } = useWarehouseStore();
  const { searchSuppliers } = useSupplierStore();
  const [saving, setSaving] = useState(false);

  const [warehouseId, setWarehouseId] = useState('');
  const [supplierId, setSupplierId] = useState<string | undefined>();
  const [orderDate, setOrderDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [expectedDate, setExpectedDate] = useState('');
  const [notes, setNotes] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [tolerancePct, setTolerancePct] = useState(0);

  const [warehouses, setWarehouses] = useState<{ id: string; name: string }[]>([]);
  const [supplierOptions, setSupplierOptions] = useState<{ value: string; label: string }[]>([]);

  const [productSearch, setProductSearch] = useState('');
  const [productOptions, setProductOptions] = useState<ProductSearchResult[]>([]);
  const [searchingProducts, setSearchingProducts] = useState(false);
  const searchRequestRef = useRef(0);
  const [selectedProduct, setSelectedProduct] = useState<ProductSearchResult | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [unitCost, setUnitCost] = useState<number>(0);

  const [items, setItems] = useState<POItemLocal[]>([]);
  const [existingItemIds, setExistingItemIds] = useState<Record<string, string>>({}); // localId -> backendId
  const [removedItemIds, setRemovedItemIds] = useState<string[]>([]);

  const totalAmount = items.reduce((s, i) => s + i.lineTotal, 0);
  const netAmount = Math.max(0, totalAmount - discountAmount);

  useEffect(() => {
    getAllWarehouses().then((whs) => setWarehouses(whs));
  }, []);

  useEffect(() => {
    if (isEdit && editId) {
      getPO(editId).then((po) => {
        setWarehouseId(po.warehouseId);
        setSupplierId(po.supplierId);
        if (po.supplierId && po.supplierName) {
          setSupplierOptions([{ value: po.supplierId, label: po.supplierName }]);
        }
        setOrderDate(dayjs(po.orderDate).format('YYYY-MM-DD'));
        setExpectedDate(po.expectedDate ? dayjs(po.expectedDate).format('YYYY-MM-DD') : '');
        setNotes(po.notes || '');
        setDiscountAmount(po.discountAmount);
        setTolerancePct(po.overReceiptTolerancePct);
        const idMap: Record<string, string> = {};
        setItems(po.items.map((it) => {
          const localId = newLocalId();
          idMap[localId] = it.id;
          return {
            localId,
            productId: it.productId,
            productName: it.productName,
            productSKU: it.productSKU,
            variationId: it.variationId,
            variationType: it.variationType,
            unitId: it.unitId,
            unitName: it.unitName,
            unitShortName: it.unitShortName,
            orderedQty: it.orderedQty,
            unitCost: it.unitCost,
            lineTotal: it.lineTotal,
            notes: it.notes,
          };
        }));
        setExistingItemIds(idMap);
      }).catch(() => {
        messageApi.error('Failed to load purchase order for editing');
        navigate('/purchase-orders');
      });
    }
  }, [editId]);

  const handleProductSearch = useCallback(async (query: string) => {
    if (!query) { setProductOptions([]); return; }
    const requestId = ++searchRequestRef.current;
    setSearchingProducts(true);
    try {
      const results = await purchaseService.searchProducts(query, warehouseId || undefined);
      if (requestId !== searchRequestRef.current) return;
      setProductOptions(results);
    } catch {
      if (requestId === searchRequestRef.current) setProductOptions([]);
    } finally {
      if (requestId === searchRequestRef.current) setSearchingProducts(false);
    }
  }, [warehouseId]);

  useEffect(() => {
    const timer = setTimeout(() => { if (productSearch) handleProductSearch(productSearch); }, 300);
    return () => clearTimeout(timer);
  }, [productSearch, handleProductSearch]);

  const handleSelectProduct = (product: ProductSearchResult) => {
    setSelectedProduct(product);
    setUnitCost(product.costPrice);
    setProductSearch(`${product.sku ? product.sku + ' - ' : ''}${product.name}`);
    setProductOptions([]);
  };

  const handleSupplierSearch = async (query: string) => {
    if (!query) { setSupplierOptions([]); return; }
    try {
      const results = await searchSuppliers(query);
      setSupplierOptions(results.map((s) => ({ value: s.id, label: `${s.displayName} (${s.phone})` })));
    } catch {
      setSupplierOptions([]);
    }
  };

  const resetProductForm = () => {
    setSelectedProduct(null);
    setProductSearch('');
    setQuantity(1);
    setUnitCost(0);
  };

  const handleAddLine = () => {
    if (!selectedProduct) { messageApi.warning('Select a product first'); return; }
    if (!quantity || quantity <= 0) { messageApi.warning('Quantity must be greater than 0'); return; }

    const existingIdx = items.findIndex((i) => i.productId === selectedProduct.id);
    if (existingIdx >= 0) {
      setItems((prev) => prev.map((it, idx) => idx === existingIdx
        ? { ...it, orderedQty: it.orderedQty + quantity, lineTotal: (it.orderedQty + quantity) * it.unitCost }
        : it));
    } else {
      setItems((prev) => [...prev, {
        localId: newLocalId(),
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        productSKU: selectedProduct.sku,
        unitId: selectedProduct.unitId,
        unitName: selectedProduct.unitName,
        unitShortName: selectedProduct.unitShortName,
        orderedQty: quantity,
        unitCost,
        lineTotal: quantity * unitCost,
      }]);
    }
    resetProductForm();
  };

  const handleRemoveLine = (localId: string) => {
    if (existingItemIds[localId]) setRemovedItemIds((prev) => [...prev, existingItemIds[localId]]);
    setItems((prev) => prev.filter((i) => i.localId !== localId));
  };

  const handleQtyChange = (localId: string, qty: number) => {
    setItems((prev) => prev.map((i) => i.localId === localId ? { ...i, orderedQty: qty, lineTotal: qty * i.unitCost } : i));
  };

  const handleCostChange = (localId: string, cost: number) => {
    setItems((prev) => prev.map((i) => i.localId === localId ? { ...i, unitCost: cost, lineTotal: i.orderedQty * cost } : i));
  };

  const handleSubmit = async () => {
    if (!warehouseId) { messageApi.error('Please select a warehouse'); return; }
    if (!supplierId) { messageApi.error('Please select a supplier'); return; }
    if (items.length === 0) { messageApi.error('Please add at least one line'); return; }

    setSaving(true);
    try {
      if (isEdit && editId) {
        await updatePO(editId, {
          supplierId, warehouseId, orderDate, expectedDate: expectedDate || undefined,
          notes: notes || undefined, discountAmount, overReceiptTolerancePct: tolerancePct,
        });
        for (const id of removedItemIds) {
          await removeItem(editId, id);
        }
        for (const item of items) {
          const backendId = existingItemIds[item.localId];
          if (backendId) {
            await updateItem(editId, backendId, { orderedQty: item.orderedQty, unitCost: item.unitCost });
          } else {
            await addItem(editId, {
              productId: item.productId, variationId: item.variationId, variationType: item.variationType,
              unitId: item.unitId, orderedQty: item.orderedQty, unitCost: item.unitCost,
            });
          }
        }
        messageApi.success('Purchase order updated');
      } else {
        await createPO({
          supplierId, warehouseId, orderDate, expectedDate: expectedDate || undefined,
          notes: notes || undefined, discountAmount, overReceiptTolerancePct: tolerancePct,
          items: items.map((i) => ({
            productId: i.productId, variationId: i.variationId, variationType: i.variationType,
            unitId: i.unitId, orderedQty: i.orderedQty, unitCost: i.unitCost,
          })),
        });
        messageApi.success('Purchase order created');
      }
      navigate('/purchase-orders');
    } catch (error: any) {
      const errData = error.response?.data;
      messageApi.error(errData?.error?.details || errData?.error?.message || 'Failed to save purchase order');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { title: 'Product', dataIndex: 'productName', key: 'productName' },
    { title: 'Unit', dataIndex: 'unitShortName', key: 'unitShortName', render: (v?: string) => v || '-' },
    {
      title: 'Qty', key: 'qty', width: 110,
      render: (_: any, r: POItemLocal) => (
        <InputNumber min={0.0001} value={r.orderedQty} onChange={(v) => v && handleQtyChange(r.localId, v)} style={{ width: '100%' }} />
      ),
    },
    {
      title: 'Unit Cost', key: 'cost', width: 130,
      render: (_: any, r: POItemLocal) => (
        <InputNumber min={0} prefix="Rs." value={r.unitCost} onChange={(v) => v !== null && handleCostChange(r.localId, v)} style={{ width: '100%' }} />
      ),
    },
    {
      title: 'Line Total', key: 'total', align: 'right' as const,
      render: (_: any, r: POItemLocal) => `Rs. ${r.lineTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    },
    {
      title: '', key: 'action', width: 48,
      render: (_: any, r: POItemLocal) => (
        <Button type="text" icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />} onClick={() => handleRemoveLine(r.localId)} />
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {contextHolder}
      <Title level={4} style={{ marginBottom: 16 }}>{isEdit ? 'Edit Purchase Order' : 'Add Purchase Order'}</Title>

      <Card title="Order Information" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="Supplier *" style={{ marginBottom: 0 }}>
              <Select
                showSearch value={supplierId} options={supplierOptions}
                onSearch={handleSupplierSearch}
                onSelect={(val) => setSupplierId(val)}
                placeholder="Search supplier..." allowClear style={{ width: '100%' }}
                filterOption={false} suffixIcon={<SearchOutlined />}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="Warehouse *" style={{ marginBottom: 0 }}>
              <Select
                placeholder="Select Warehouse" value={warehouseId || undefined} onChange={setWarehouseId}
                options={warehouses.map((w) => ({ value: w.id, label: w.name }))} style={{ width: '100%' }} showSearch
                filterOption={(input, option) => (option?.label as string)?.toLowerCase().includes(input.toLowerCase())}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="Order Date" style={{ marginBottom: 0 }}>
              <DatePicker style={{ width: '100%' }} value={dayjs(orderDate)} onChange={(_, s) => setOrderDate(s as string)} format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="Expected Date" style={{ marginBottom: 0 }}>
              <DatePicker style={{ width: '100%' }} value={expectedDate ? dayjs(expectedDate) : null} onChange={(_, s) => setExpectedDate((s as string) || '')} format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="Discount Amount" style={{ marginBottom: 0 }}>
              <InputNumber min={0} prefix="Rs." value={discountAmount} onChange={(v) => setDiscountAmount(v ?? 0)} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="Over-receipt Tolerance %" style={{ marginBottom: 0 }}>
              <InputNumber min={0} max={100} suffix="%" value={tolerancePct} onChange={(v) => setTolerancePct(v ?? 0)} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item label="Notes" style={{ marginBottom: 0 }}>
              <TextArea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Optional notes" />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Card title="Add Product" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 12]} align="bottom">
          <Col xs={24} md={10}>
            <Form.Item label="Search Product" style={{ marginBottom: 0 }}>
              <AutoComplete
                value={productSearch}
                options={productOptions.map((p) => ({ value: p.id, label: `${p.sku ? p.sku + ' - ' : ''}${p.name} (stock: ${p.currentStock})` }))}
                filterOption={false}
                onSearch={setProductSearch}
                onSelect={(value) => { const p = productOptions.find((x) => x.id === value); if (p) handleSelectProduct(p); }}
                placeholder="Search by name, SKU, or barcode..."
                suffixIcon={searchingProducts ? <Spin size="small" /> : <SearchOutlined />}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col xs={12} md={4}>
            <Form.Item label="Quantity" style={{ marginBottom: 0 }}>
              <InputNumber min={0.0001} value={quantity} onChange={(v) => setQuantity(v ?? 1)} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={12} md={5}>
            <Form.Item label="Unit Cost" style={{ marginBottom: 0 }}>
              <InputNumber min={0} prefix="Rs." value={unitCost} onChange={(v) => setUnitCost(v ?? 0)} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={5}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddLine} block>Add Line</Button>
          </Col>
        </Row>
      </Card>

      <Card title={`Order Lines (${items.length})`} style={{ marginBottom: 16 }}>
        <Table columns={columns} dataSource={items} rowKey="localId" pagination={false} size="small"
          locale={{ emptyText: 'No lines added yet.' }}
          footer={() => (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 24 }}>
              <span>Total: <strong>Rs. {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></span>
              <span>Net: <strong>Rs. {netAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></span>
            </div>
          )}
        />
      </Card>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <Button onClick={() => navigate('/purchase-orders')}>Cancel</Button>
        <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSubmit} disabled={items.length === 0}>
          {isEdit ? 'Save Changes' : 'Create Purchase Order'}
        </Button>
      </div>
    </div>
  );
};

export default AddPurchaseOrderPage;
