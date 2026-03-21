import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Card, Row, Col, Select, AutoComplete, DatePicker, Input, Button, Space,
  InputNumber, Checkbox, Modal, Form, message, Typography, Divider, Tag, Alert,
  Spin, Tooltip,
} from 'antd';
import {
  SaveOutlined, CheckCircleOutlined, ReloadOutlined,
  PlusOutlined, SearchOutlined, ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';

import { usePurchaseStore } from '../../store/transactions/purchaseStore';
import { useWarehouseStore } from '../../store/management/warehouseStore';
import { useSupplierStore } from '../../store/management/supplierStore';
import { purchaseService } from '../../services/transactions/purchaseService';
import type {
  PaymentMethod,
  GRNItemLocal,
  ProductSearchResult,
  ProductVariationOption,
} from '../../types/entities/purchase.types';
import PurchaseItemsTable from './PurchaseItemsTable';
import PurchaseSummary from './PurchaseSummary';

const { Title, Text } = Typography;
const { TextArea } = Input;

let localIdCounter = 0;
const newLocalId = () => `local-${++localIdCounter}`;

// ─── Serial Number Modal ────────────────────────────────────────────────────
interface SerialModalProps {
  open: boolean;
  productName: string;
  quantity: number;
  existing: string[];
  onSave: (serials: string[]) => void;
  onCancel: () => void;
}
const SerialNumberModal: React.FC<SerialModalProps> = ({
  open, productName, quantity, existing, onSave, onCancel,
}) => {
  const [serials, setSerials] = useState<string[]>(existing);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (open) {
      const filled = [...existing];
      while (filled.length < quantity) filled.push('');
      setSerials(filled);
    }
  }, [open, quantity, existing]);

  const handleChange = (idx: number, val: string) => {
    const next = [...serials];
    next[idx] = val;
    setSerials(next);
    if (val && idx < quantity - 1) {
      setTimeout(() => inputRefs.current[idx + 1]?.focus(), 50);
    }
  };

  const handleSave = () => {
    const filled = serials.filter((s) => s.trim());
    if (filled.length < quantity) {
      message.warning(`Please enter all ${quantity} serial numbers`);
      return;
    }
    const unique = new Set(serials.map((s) => s.trim()));
    if (unique.size < quantity) {
      message.error('Duplicate serial numbers detected');
      return;
    }
    onSave(serials.map((s) => s.trim()));
  };

  return (
    <Modal
      open={open}
      title={`Serial Numbers — ${productName}`}
      onCancel={onCancel}
      onOk={handleSave}
      okText="Save Serial Numbers"
      width={480}
    >
      <Text type="secondary">Required: {quantity} serial number(s)</Text>
      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {Array.from({ length: quantity }).map((_, idx) => (
          <Input
            key={idx}
            ref={(el) => { inputRefs.current[idx] = el?.input ?? null; }}
            placeholder={`Serial Number ${idx + 1}`}
            value={serials[idx] ?? ''}
            onChange={(e) => handleChange(idx, e.target.value)}
            prefix={<Tag>{idx + 1}</Tag>}
          />
        ))}
      </div>
    </Modal>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────
const AddPurchasePage: React.FC = () => {
  const navigate = useNavigate();
  const { id: editId } = useParams<{ id: string }>();
  const isEdit = Boolean(editId);

  const { createGRN, updateGRN, removeItem, completeGRN, getGRN, submitting } =
    usePurchaseStore();
  const { getAllWarehouses } = useWarehouseStore();
  const { searchSuppliers } = useSupplierStore();

  // ── Header state ────────────────────────────────────────
  const [warehouseId, setWarehouseId] = useState('');
  const [supplierId, setSupplierId] = useState<string | undefined>();
  const [supplierName, setSupplierName] = useState('');
  const [supplierBalance, setSupplierBalance] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [grnDate, setGrnDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [notes, setNotes] = useState('');
  const [supplierLocked, setSupplierLocked] = useState(false);

  // ── Data lists ───────────────────────────────────────────
  const [warehouses, setWarehouses] = useState<{ id: string; name: string }[]>([]);
  const [supplierOptions, setSupplierOptions] = useState<{ value: string; label: string; id: string }[]>([]);

  // ── Product selection state ──────────────────────────────
  const [productSearch, setProductSearch] = useState('');
  const [productOptions, setProductOptions] = useState<ProductSearchResult[]>([]);
  const [searchingProducts, setSearchingProducts] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductSearchResult | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<ProductVariationOption | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [costPrice, setCostPrice] = useState<number>(0);
  const [retailPrice, setRetailPrice] = useState<number>(0);
  const [wholesalePrice, setWholesalePrice] = useState<number>(0);
  const [ourPrice, setOurPrice] = useState<number>(0);
  const [manufactureDate, setManufactureDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [hasSerialNumbers, setHasSerialNumbers] = useState(false);
  const [pendingSerials, setPendingSerials] = useState<string[]>([]);
  const [serialModalOpen, setSerialModalOpen] = useState(false);

  // ── Items list ───────────────────────────────────────────
  const [items, setItems] = useState<GRNItemLocal[]>([]);

  // ── Payment state ────────────────────────────────────────
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [debitBalanceUsed, setDebitBalanceUsed] = useState(0);
  const [chequeNumber, setChequeNumber] = useState('');
  const [chequeDate, setChequeDate] = useState('');
  const [chequeNote, setChequeNote] = useState('');

  // ── Computed ─────────────────────────────────────────────
  const activeItems = items.filter((i) => !i.isDeleted);
  const totalAmount = activeItems.reduce((s, i) => s + i.netPrice, 0);
  const netAmount = Math.max(0, totalAmount - discountAmount);

  // ── Load warehouses ──────────────────────────────────────
  useEffect(() => {
    getAllWarehouses().then((whs) => setWarehouses(whs));
  }, []);

  // ── Load existing GRN if editing ─────────────────────────
  useEffect(() => {
    if (isEdit && editId) {
      getGRN(editId).then((grn) => {
        setWarehouseId(grn.warehouseId);
        setSupplierId(grn.supplierId);
        setSupplierName(grn.supplierName || '');
        setPaymentMethod(grn.paymentMethod);
        setGrnDate(dayjs(grn.grnDate).format('YYYY-MM-DD'));
        setNotes(grn.notes || '');
        if (grn.items.length > 0) setSupplierLocked(true);

        // Load supplier balance if supplier set
        if (grn.supplierId) {
          purchaseService.getSupplierBalance(grn.supplierId).then((b) => setSupplierBalance(b.outstandingBalance));
        }

        // Map existing items to local state
        setItems(
          grn.items.map((item) => ({
            localId: newLocalId(),
            backendId: item.id,
            isNew: false,
            isModified: false,
            isDeleted: false,
            productId: item.productId,
            productName: item.productName,
            productSKU: item.productSKU,
            productImage: item.productImage,
            variationId: item.variationId,
            variationType: item.variationType,
            quantity: item.quantity,
            unitId: item.unitId,
            unitName: item.unitName,
            unitShortName: item.unitShortName,
            costPrice: item.costPrice,
            retailPrice: item.retailPrice,
            wholesalePrice: item.wholesalePrice,
            ourPrice: item.ourPrice,
            netPrice: item.netPrice,
            manufactureDate: item.manufactureDate,
            expiryDate: item.expiryDate,
            hasSerialNumbers: item.hasSerialNumbers,
            serialNumbers: item.serialNumbers || [],
            currentStock: item.currentStock,
          }))
        );
      }).catch(() => {
        message.error('Failed to load GRN for editing');
        navigate('/purchases');
      });
    }
  }, [editId]);

  // ── Product search ───────────────────────────────────────
  const handleProductSearch = useCallback(
    async (query: string) => {
      if (!query || query.length < 2) {
        setProductOptions([]);
        return;
      }
      setSearchingProducts(true);
      try {
        const results = await purchaseService.searchProducts(query, warehouseId || undefined);
        setProductOptions(results);
      } catch {
        setProductOptions([]);
      } finally {
        setSearchingProducts(false);
      }
    },
    [warehouseId]
  );

  // Debounced product search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (productSearch) handleProductSearch(productSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [productSearch]);

  const handleSelectProduct = (product: ProductSearchResult) => {
    setSelectedProduct(product);
    setSelectedVariation(null);
    setCostPrice(product.costPrice);
    setRetailPrice(product.retailPrice);
    setWholesalePrice(product.wholesalePrice);
    setOurPrice(product.ourPrice);
    setHasSerialNumbers(product.hasSerialNumbers);
    setPendingSerials([]);
    setProductSearch(`${product.sku ? product.sku + ' - ' : ''}${product.name}`);
    setProductOptions([]);
  };

  const handleSelectVariation = (variationId: string) => {
    const variation = selectedProduct?.variations?.find((v) => v.id === variationId);
    if (variation) {
      setSelectedVariation(variation);
      setCostPrice(variation.costPrice);
      setRetailPrice(variation.retailPrice);
      setWholesalePrice(variation.wholesalePrice);
      setOurPrice(variation.ourPrice);
    }
  };

  // ── Supplier search ──────────────────────────────────────
  const handleSupplierSearch = async (query: string) => {
    if (!query || query.length < 2) {
      setSupplierOptions([]);
      return;
    }
    try {
      const results = await searchSuppliers(query);
      setSupplierOptions(
        results.map((s) => ({ value: s.displayName, label: s.displayName, id: s.id }))
      );
    } catch {
      setSupplierOptions([]);
    }
  };

  const handleSelectSupplier = (value: string, option: any) => {
    setSupplierId(option.id);
    setSupplierName(value);
    // Fetch supplier balance
    purchaseService.getSupplierBalance(option.id)
      .then((b) => setSupplierBalance(b.outstandingBalance))
      .catch(() => setSupplierBalance(0));
  };

  const handleClearSupplier = () => {
    if (supplierLocked) {
      message.warning('Cannot change supplier after items have been added');
      return;
    }
    setSupplierId(undefined);
    setSupplierName('');
    setSupplierBalance(0);
  };

  // ── Add item to list ─────────────────────────────────────
  const handleAddItem = () => {
    if (!selectedProduct) {
      message.warning('Please select a product first');
      return;
    }
    if (selectedProduct.productType === 'variable' && !selectedVariation) {
      message.warning('Please select a variation');
      return;
    }
    if (!quantity || quantity <= 0) {
      message.warning('Quantity must be greater than 0');
      return;
    }

    if (hasSerialNumbers) {
      setSerialModalOpen(true);
      return;
    }

    doAddItem([]);
  };

  const doAddItem = (serials: string[]) => {
    if (!selectedProduct) return;

    const variation = selectedVariation;
    const netPrice = quantity * costPrice;

    // Check if same product+variation already in list → increment qty
    const existingIdx = items.findIndex(
      (i) =>
        !i.isDeleted &&
        i.productId === selectedProduct.id &&
        (i.variationId ?? '') === (variation?.id ?? '')
    );

    if (existingIdx >= 0) {
      setItems((prev) =>
        prev.map((item, idx) => {
          if (idx !== existingIdx) return item;
          const newQty = item.quantity + quantity;
          return {
            ...item,
            quantity: newQty,
            netPrice: newQty * item.costPrice,
            isModified: !item.isNew,
            serialNumbers: [...item.serialNumbers, ...serials],
          };
        })
      );
    } else {
      const newItem: GRNItemLocal = {
        localId: newLocalId(),
        isNew: true,
        isModified: false,
        isDeleted: false,
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        productSKU: selectedProduct.sku,
        productImage: selectedProduct.imageUrl,
        variationId: variation?.id,
        variationType: variation?.type,
        quantity,
        unitId: selectedProduct.unitId,
        unitName: selectedProduct.unitName,
        unitShortName: selectedProduct.unitShortName,
        costPrice,
        retailPrice,
        wholesalePrice,
        ourPrice,
        netPrice,
        manufactureDate: manufactureDate || undefined,
        expiryDate: expiryDate || undefined,
        hasSerialNumbers,
        serialNumbers: serials,
        currentStock: variation ? variation.currentStock : selectedProduct.currentStock,
      };
      setItems((prev) => [...prev, newItem]);
    }

    // Lock supplier after first item
    if (!supplierLocked) setSupplierLocked(true);

    resetProductForm();
    setSerialModalOpen(false);
  };

  const resetProductForm = () => {
    setSelectedProduct(null);
    setSelectedVariation(null);
    setProductSearch('');
    setQuantity(1);
    setCostPrice(0);
    setRetailPrice(0);
    setWholesalePrice(0);
    setOurPrice(0);
    setManufactureDate('');
    setExpiryDate('');
    setHasSerialNumbers(false);
    setPendingSerials([]);
  };

  const handleQuantityChange = (localId: string, qty: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.localId === localId
          ? { ...item, quantity: qty, netPrice: qty * item.costPrice, isModified: !item.isNew }
          : item
      )
    );
  };

  const handleRemoveItem = (localId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.localId === localId ? { ...item, isDeleted: true } : item
      )
    );
  };

  // ── Validate before submit ────────────────────────────────
  const validate = (doComplete: boolean): string | null => {
    if (!warehouseId) return 'Please select a warehouse';
    if (activeItems.length === 0) return 'Please add at least one item';
    if (doComplete) {
      if (paymentMethod === 'cheque' && !chequeNumber) return 'Cheque number is required';
      if (paymentMethod === 'credit' && !supplierId) return 'Credit payment requires a supplier';
      if (!supplierId && paymentMethod !== 'credit' && paidAmount !== netAmount && Math.abs(paidAmount - netAmount) > 0.01) {
        return `Paid amount must equal net amount (${netAmount.toFixed(2)}) for purchases without a supplier`;
      }
    }
    return null;
  };

  // ── Submit ─────────────────────────────────────────────────
  const handleSubmit = async (doComplete: boolean) => {
    const err = validate(doComplete);
    if (err) { message.error(err); return; }

    try {
      let grnId: string;

      if (isEdit && editId) {
        // Update existing draft header
        await updateGRN(editId, {
          warehouseId,
          supplierId,
          paymentMethod,
          notes: notes || undefined,
          grnDate,
        });
        grnId = editId;

        // Handle item changes
        const toRemove = items.filter((i) => i.isDeleted && i.backendId);
        const toAdd = items.filter((i) => i.isNew && !i.isDeleted);

        for (const item of toRemove) {
          await removeItem(grnId, item.backendId!);
        }
        for (const item of toAdd) {
          const backendItem = await purchaseService.addItem(grnId, {
            productId: item.productId,
            variationId: item.variationId,
            variationType: item.variationType,
            quantity: item.quantity,
            unitId: item.unitId,
            costPrice: item.costPrice,
            retailPrice: item.retailPrice,
            wholesalePrice: item.wholesalePrice,
            ourPrice: item.ourPrice,
            manufactureDate: item.manufactureDate,
            expiryDate: item.expiryDate,
            hasSerialNumbers: item.hasSerialNumbers,
          });
          if (item.hasSerialNumbers && item.serialNumbers.length > 0) {
            await purchaseService.addSerialNumbers(grnId, {
              grnItemId: backendItem.id,
              serialNumbers: item.serialNumbers,
            });
          }
        }
      } else {
        // Create new GRN
        const grn = await createGRN({
          warehouseId,
          supplierId,
          paymentMethod,
          notes: notes || undefined,
          grnDate,
        });
        grnId = grn.id;

        // Add all items
        for (const item of activeItems) {
          const backendItem = await purchaseService.addItem(grnId, {
            productId: item.productId,
            variationId: item.variationId,
            variationType: item.variationType,
            quantity: item.quantity,
            unitId: item.unitId,
            costPrice: item.costPrice,
            retailPrice: item.retailPrice,
            wholesalePrice: item.wholesalePrice,
            ourPrice: item.ourPrice,
            manufactureDate: item.manufactureDate,
            expiryDate: item.expiryDate,
            hasSerialNumbers: item.hasSerialNumbers,
          });
          if (item.hasSerialNumbers && item.serialNumbers.length > 0) {
            await purchaseService.addSerialNumbers(grnId, {
              grnItemId: backendItem.id,
              serialNumbers: item.serialNumbers,
            });
          }
        }
      }

      if (doComplete) {
        const completed = await completeGRN(grnId, {
          discountAmount: discountAmount || 0,
          paidAmount,
          chequeNumber: chequeNumber || undefined,
          chequeDate: chequeDate || undefined,
          chequeNote: chequeNote || undefined,
          debitBalanceUsed: debitBalanceUsed || 0,
        });
        message.success(`GRN ${completed.grnNumber} completed successfully!`);
      } else {
        message.success('Draft saved successfully');
      }

      navigate('/purchases');
    } catch (error: any) {
      const errData = error.response?.data;
      const errMsg = errData?.error?.details || errData?.error?.message || errData?.message || 'An error occurred. Please try again.';
      message.error(errMsg);
    }
  };

  const handleReset = () => {
    const doReset = () => {
      setItems([]);
      resetProductForm();
      // Reset header / purchase information fields
      setWarehouseId('');
      setSupplierId(undefined);
      setSupplierName('');
      setSupplierBalance(0);
      setPaymentMethod('cash');
      setGrnDate(dayjs().format('YYYY-MM-DD'));
      setNotes('');
      setSupplierLocked(false);
      // Reset payment fields
      setDiscountAmount(0);
      setPaidAmount(0);
      setDebitBalanceUsed(0);
      setChequeNumber('');
      setChequeDate('');
      setChequeNote('');
    };

    if (activeItems.length > 0) {
      Modal.confirm({
        title: 'Reset Form',
        icon: <ExclamationCircleOutlined />,
        content: 'This will clear all items and purchase information. Are you sure?',
        onOk: doReset,
      });
    } else {
      doReset();
    }
  };

  const netPrice = quantity * costPrice;

  // ────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '24px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          {isEdit ? 'Edit Purchase (GRN)' : 'Add Purchase (GRN)'}
        </Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={handleReset}>Reset</Button>
        </Space>
      </div>

      {/* ── GRN Header Section ─────────────────────────────── */}
      <Card title="Purchase Information" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="Warehouse *" style={{ marginBottom: 0 }}>
              <Select
                placeholder="Select Warehouse"
                value={warehouseId || undefined}
                onChange={setWarehouseId}
                options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
                style={{ width: '100%' }}
                showSearch
                filterOption={(input, option) =>
                  (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item
              label={
                <span>
                  Supplier{' '}
                  <Text type="secondary" style={{ fontSize: 12 }}>(optional)</Text>
                  {supplierLocked && (
                    <Tooltip title="Supplier is locked after first item is added">
                      <Tag color="orange" style={{ marginLeft: 4 }}>Locked</Tag>
                    </Tooltip>
                  )}
                </span>
              }
              style={{ marginBottom: 0 }}
            >
              <AutoComplete
                value={supplierName}
                options={supplierOptions}
                onSearch={handleSupplierSearch}
                onSelect={handleSelectSupplier}
                onChange={(val) => setSupplierName(val ?? '')}
                onClear={handleClearSupplier}
                placeholder="Search supplier..."
                allowClear
                disabled={supplierLocked && Boolean(supplierId)}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="GRN Date" style={{ marginBottom: 0 }}>
              <DatePicker
                style={{ width: '100%' }}
                value={dayjs(grnDate)}
                onChange={(_, str) => setGrnDate(str as string)}
                format="YYYY-MM-DD"
                disabledDate={(d) => d.isAfter(dayjs())}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="Notes" style={{ marginBottom: 0 }}>
              <TextArea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={1}
                placeholder="Optional notes"
              />
            </Form.Item>
          </Col>
        </Row>
        {supplierId && supplierBalance !== 0 && (
          <Alert
            style={{ marginTop: 12 }}
            type={supplierBalance > 0 ? 'warning' : 'success'}
            message={
              supplierBalance > 0
                ? `Supplier Credit Balance: Rs. ${supplierBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} (We owe supplier)`
                : `Supplier Debit Balance: Rs. ${Math.abs(supplierBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })} (Supplier owes us)`
            }
            showIcon
          />
        )}
      </Card>

      {/* ── Product Selection Section ──────────────────────── */}
      <Card title="Add Product" style={{ marginBottom: 16 }}>
        {/* Product Search */}
        <Row gutter={[16, 12]}>
          <Col xs={24} md={12}>
            <Form.Item label="Search Product" style={{ marginBottom: 0 }}>
              <AutoComplete
                value={productSearch}
                options={productOptions.map((p) => ({
                  value: p.id,
                  label: (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>
                        {p.sku && <Tag style={{ marginRight: 4 }}>{p.sku}</Tag>}
                        {p.name}
                        {p.variations && p.variations.length > 0 && (
                          <Tag color="blue" style={{ marginLeft: 4 }}>Variable</Tag>
                        )}
                      </span>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Stock: {p.currentStock}
                      </Text>
                    </div>
                  ),
                }))}
                filterOption={false}
                onSearch={setProductSearch}
                onSelect={(value) => {
                  const product = productOptions.find((p) => p.id === value);
                  if (product) handleSelectProduct(product);
                }}
                placeholder="Search by name, SKU, or barcode..."
                suffixIcon={searchingProducts ? <Spin size="small" /> : <SearchOutlined />}
                notFoundContent={searchingProducts ? <Spin /> : 'No products found'}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>

          {/* Variation select (variable products) */}
          {selectedProduct?.productType === 'variable' && selectedProduct.variations && (
            <Col xs={24} md={6}>
              <Form.Item label="Variation *" style={{ marginBottom: 0 }}>
                <Select
                  placeholder="Select variation"
                  value={selectedVariation?.id}
                  onChange={handleSelectVariation}
                  options={selectedProduct.variations.map((v) => ({
                    value: v.id,
                    label: v.type,
                  }))}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          )}

          {/* Product details display */}
          {selectedProduct && (
            <>
              <Col xs={24}>
                <Divider style={{ margin: '8px 0' }}>Product Details</Divider>
              </Col>
              <Col xs={12} md={4}>
                <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#fafafa', borderRadius: 4 }}>
                  <div style={{ fontSize: 12, color: '#666' }}>Category</div>
                  <div style={{ fontWeight: 600 }}>{selectedProduct.categoryName || '-'}</div>
                </div>
              </Col>
              <Col xs={12} md={4}>
                <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#fafafa', borderRadius: 4 }}>
                  <div style={{ fontSize: 12, color: '#666' }}>Current Stock</div>
                  <div style={{ fontWeight: 600, color: (selectedVariation?.currentStock ?? selectedProduct.currentStock) <= 0 ? '#ff4d4f' : '#52c41a' }}>
                    {selectedVariation ? selectedVariation.currentStock : selectedProduct.currentStock}
                    {selectedProduct.unitShortName && ` ${selectedProduct.unitShortName}`}
                  </div>
                </div>
              </Col>
              <Col xs={24} md={4}>
                <Form.Item label="Quantity *" style={{ marginBottom: 0 }}>
                  <InputNumber
                    min={0.0001}
                    value={quantity}
                    onChange={(v) => setQuantity(v ?? 1)}
                    precision={4}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={4}>
                <Form.Item label="Cost Price *" style={{ marginBottom: 0 }}>
                  <InputNumber
                    min={0}
                    value={costPrice}
                    onChange={(v) => setCostPrice(v ?? 0)}
                    precision={2}
                    prefix="Rs."
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={4}>
                <Form.Item label="Retail Price" style={{ marginBottom: 0 }}>
                  <InputNumber
                    min={0}
                    value={retailPrice}
                    onChange={(v) => setRetailPrice(v ?? 0)}
                    precision={2}
                    prefix="Rs."
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={4}>
                <Form.Item label="Wholesale Price" style={{ marginBottom: 0 }}>
                  <InputNumber
                    min={0}
                    value={wholesalePrice}
                    onChange={(v) => setWholesalePrice(v ?? 0)}
                    precision={2}
                    prefix="Rs."
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={4}>
                <Form.Item label="Our Price" style={{ marginBottom: 0 }}>
                  <InputNumber
                    min={0}
                    value={ourPrice}
                    onChange={(v) => setOurPrice(v ?? 0)}
                    precision={2}
                    prefix="Rs."
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={4}>
                <Form.Item label="Net Price (auto)" style={{ marginBottom: 0 }}>
                  <div
                    style={{
                      padding: '4px 11px',
                      border: '1px solid #d9d9d9',
                      borderRadius: 6,
                      backgroundColor: '#fafafa',
                      fontFamily: 'monospace',
                      fontWeight: 600,
                    }}
                  >
                    Rs. {netPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </Form.Item>
              </Col>
              <Col xs={24} md={4}>
                <Form.Item label="Manufacture Date" style={{ marginBottom: 0 }}>
                  <DatePicker
                    style={{ width: '100%' }}
                    value={manufactureDate ? dayjs(manufactureDate) : null}
                    onChange={(_, str) => setManufactureDate(str as string)}
                    format="YYYY-MM-DD"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={4}>
                <Form.Item label="Expiry Date" style={{ marginBottom: 0 }}>
                  <DatePicker
                    style={{ width: '100%' }}
                    value={expiryDate ? dayjs(expiryDate) : null}
                    onChange={(_, str) => setExpiryDate(str as string)}
                    format="YYYY-MM-DD"
                    disabledDate={(d) => d.isBefore(dayjs())}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={4}>
                <Form.Item label="Serial Numbers" style={{ marginBottom: 0 }}>
                  <Checkbox
                    checked={hasSerialNumbers}
                    onChange={(e) => setHasSerialNumbers(e.target.checked)}
                  >
                    Requires S/N
                  </Checkbox>
                  {hasSerialNumbers && pendingSerials.length > 0 && (
                    <Tag color="green">{pendingSerials.length} entered</Tag>
                  )}
                </Form.Item>
              </Col>
              <Col xs={24} style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <Button onClick={resetProductForm}>Reset</Button>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddItem}>
                  Add to List
                </Button>
              </Col>
            </>
          )}
        </Row>
      </Card>

      {/* ── Items Table ────────────────────────────────────── */}
      <Card title={`GRN Items (${activeItems.length})`} style={{ marginBottom: 16 }}>
        <PurchaseItemsTable
          items={items}
          onQuantityChange={handleQuantityChange}
          onRemove={handleRemoveItem}
        />
      </Card>

      {/* ── Payment Section ────────────────────────────────── */}
      <PurchaseSummary
        totalAmount={totalAmount}
        supplierBalance={supplierBalance}
        paymentMethod={paymentMethod}
        discountAmount={discountAmount}
        paidAmount={paidAmount}
        debitBalanceUsed={debitBalanceUsed}
        chequeNumber={chequeNumber}
        chequeDate={chequeDate}
        chequeNote={chequeNote}
        hasSupplier={Boolean(supplierId)}
        onPaymentMethodChange={setPaymentMethod}
        onDiscountChange={setDiscountAmount}
        onPaidAmountChange={setPaidAmount}
        onDebitBalanceUsedChange={setDebitBalanceUsed}
        onChequeNumberChange={setChequeNumber}
        onChequeDateChange={setChequeDate}
        onChequeNoteChange={setChequeNote}
      />

      {/* ── Action Buttons ─────────────────────────────────── */}
      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <Button onClick={() => navigate('/purchases')}>Cancel</Button>
        <Button
          icon={<SaveOutlined />}
          loading={submitting}
          onClick={() => handleSubmit(false)}
          disabled={activeItems.length === 0}
        >
          Save Draft
        </Button>
        <Button
          type="primary"
          icon={<CheckCircleOutlined />}
          loading={submitting}
          onClick={() => handleSubmit(true)}
          disabled={activeItems.length === 0}
        >
          Complete GRN
        </Button>
      </div>

      {/* ── Serial Number Modal ────────────────────────────── */}
      {selectedProduct && (
        <SerialNumberModal
          open={serialModalOpen}
          productName={selectedProduct.name}
          quantity={Math.ceil(quantity)}
          existing={pendingSerials}
          onSave={(serials) => {
            setPendingSerials(serials);
            doAddItem(serials);
          }}
          onCancel={() => setSerialModalOpen(false)}
        />
      )}
    </div>
  );
};

export default AddPurchasePage;
