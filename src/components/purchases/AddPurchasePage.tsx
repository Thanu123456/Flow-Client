import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  App, Card, Row, Col, Select, AutoComplete, DatePicker, Input, Button, Space,
  InputNumber, Checkbox, Modal, Form, message, Typography, Divider, Tag, Alert,
  Spin, Tooltip, Table,
} from 'antd';
import {
  SaveOutlined, CheckCircleOutlined, ReloadOutlined,
  PlusOutlined, SearchOutlined, ExclamationCircleOutlined, DeleteOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';

import { usePurchaseStore } from '../../store/transactions/purchaseStore';
import { useAllWarehouses } from '../../hooks/data/useAllWarehouses';
import { useSupplierStore } from '../../store/management/supplierStore';
import { purchaseService } from '../../services/transactions/purchaseService';
import { purchaseOrderService } from '../../services/transactions/purchaseOrderService';
import type {
  PaymentMethod,
  GRNItemLocal,
  GRNCharge,
  ChargeType,
  ProductSearchResult,
  ProductVariationOption,
} from '../../types/entities/purchase.types';
import type { PurchaseOrder, POItem } from '../../types/entities/purchaseOrder.types';
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
  const [messageApi, contextHolder] = message.useMessage();

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
      messageApi.warning(`Please enter all ${quantity} serial numbers`);
      return;
    }
    const unique = new Set(serials.map((s) => s.trim()));
    if (unique.size < quantity) {
      messageApi.error('Duplicate serial numbers detected');
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
      {contextHolder}
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

// ─── QC Inspection Modal ────────────────────────────────────────────────────
interface QCInspectModalProps {
  open: boolean;
  item: GRNItemLocal | null;
  submitting: boolean;
  onSave: (status: 'accepted' | 'rejected' | 'pending', rejectedQty: number, note: string) => void;
  onCancel: () => void;
}
const QCInspectModal: React.FC<QCInspectModalProps> = ({
  open, item, submitting, onSave, onCancel,
}) => {
  const [status, setStatus] = useState<'accepted' | 'rejected' | 'pending'>('accepted');
  const [qty, setQty] = useState<number>(0);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (open && item) {
      setStatus((item.inspectionStatus as any) || (item.rejectedQty ? 'rejected' : 'accepted'));
      setQty(item.rejectedQty || 0);
      setNote(item.inspectionNote || '');
    }
  }, [open, item]);

  if (!item) return null;

  const handleOk = () => onSave(status, status === 'rejected' ? qty : 0, note);

  return (
    <Modal
      open={open}
      title={`Receiving Inspection — ${item.productName}`}
      onCancel={onCancel}
      onOk={handleOk}
      okText="Save Inspection"
      confirmLoading={submitting}
      width={440}
    >
      <Space direction="vertical" style={{ width: '100%' }} size={12}>
        <Text type="secondary">Received quantity: {item.quantity}</Text>
        <div>
          <Text strong>Outcome</Text>
          <div style={{ marginTop: 6 }}>
            <Space>
              <Button type={status === 'accepted' ? 'primary' : 'default'} onClick={() => setStatus('accepted')}>
                Accept
              </Button>
              <Button danger={status === 'rejected'} type={status === 'rejected' ? 'primary' : 'default'} onClick={() => setStatus('rejected')}>
                Reject
              </Button>
              <Button type={status === 'pending' ? 'primary' : 'default'} onClick={() => setStatus('pending')}>
                Hold (pending)
              </Button>
            </Space>
          </div>
        </div>
        {status === 'rejected' && (
          <div>
            <Text strong>Rejected quantity</Text>
            <InputNumber
              min={0.0001}
              max={item.quantity}
              value={qty || item.quantity}
              style={{ width: '100%', marginTop: 6 }}
              onChange={(v) => setQty(v || 0)}
            />
          </div>
        )}
        <div>
          <Text strong>Note</Text>
          <TextArea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Reason / inspection remarks (optional)"
            style={{ marginTop: 6 }}
          />
        </div>
      </Space>
    </Modal>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────
const AddPurchasePage: React.FC = () => {
  const navigate = useNavigate();
  const { id: editId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(editId);
  const [messageApi, contextHolder] = message.useMessage();
  const { modal } = App.useApp();

  const { createGRN, updateGRN, removeItem, completeGRN, getGRN } =
    usePurchaseStore();
  const [saving, setSaving] = useState(false);
  const { warehouses } = useAllWarehouses();
  const { searchSuppliers } = useSupplierStore();

  // ── Header state ────────────────────────────────────────
  const [warehouseId, setWarehouseId] = useState('');
  const [supplierId, setSupplierId] = useState<string | undefined>();
  const [_supplierName, setSupplierName] = useState('');
  const [supplierBalance, setSupplierBalance] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [grnDate, setGrnDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [notes, setNotes] = useState('');
  const [supplierLocked, setSupplierLocked] = useState(false);

  // ── Purchase order receiving ──────────────────────────────
  const [linkedPO, setLinkedPO] = useState<PurchaseOrder | null>(null);
  const poId = searchParams.get('poId') || undefined;

  // ── Data lists ───────────────────────────────────────────
  const [supplierOptions, setSupplierOptions] = useState<{ value: string; label: string }[]>([]);
  const [_searchingSuppliers, setSearchingSuppliers] = useState(false);

  // ── Product selection state ──────────────────────────────
  const [productSearch, setProductSearch] = useState('');
  const [productOptions, setProductOptions] = useState<ProductSearchResult[]>([]);
  const [searchingProducts, setSearchingProducts] = useState(false);
  const searchRequestRef = useRef(0);
  const [selectedProduct, setSelectedProduct] = useState<ProductSearchResult | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<ProductVariationOption | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [costPrice, setCostPrice] = useState<number>(0);
  const [retailPrice, setRetailPrice] = useState<number>(0);
  const [wholesalePrice, setWholesalePrice] = useState<number>(0);
  const [ourPrice, setOurPrice] = useState<number>(0);
  const [manufactureDate, setManufactureDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [lotNumber, setLotNumber] = useState('');
  const [rejectedQty, setRejectedQty] = useState<number>(0);
  const [hasSerialNumbers, setHasSerialNumbers] = useState(false);
  const [pendingSerials, setPendingSerials] = useState<string[]>([]);
  const [serialModalOpen, setSerialModalOpen] = useState(false);
  // Ref to the product search box (barcode-scanner throughput: keep it focused).
  const productSearchRef = useRef<React.ComponentRef<typeof AutoComplete>>(null);
  // Set right before a programmatic productSearch change so the debounced effect
  // doesn't fire a redundant search for the name we just filled in.
  const skipNextSearchRef = useRef(false);
  // PO line currently loaded into the product form (via "Load" on the PO panel).
  // Cleared by resetProductForm; consumed by doAddItem so the added GRN line
  // stays linked to its PO line.
  const pendingPOItemIdRef = useRef<string | null>(null);
  const [loadingPOLine, setLoadingPOLine] = useState<string | null>(null);
  // Item whose quantity is being changed via the items table; re-opens the
  // serial modal so its serial count stays in sync with the new quantity.
  const [editingSerialItem, setEditingSerialItem] = useState<GRNItemLocal | null>(null);
  // Item whose receiving inspection (QC) is being recorded via the dedicated
  // /inspect endpoint. Only items already saved to the backend (backendId set)
  // can be inspected — see PurchaseItemsTable's Inspect action.
  const [inspectingItem, setInspectingItem] = useState<GRNItemLocal | null>(null);
  const [inspectingSubmitting, setInspectingSubmitting] = useState(false);

  // ── Items list ───────────────────────────────────────────
  const [items, setItems] = useState<GRNItemLocal[]>([]);

  // ── Landed-cost charges (freight / duty / insurance) ─────
  const [charges, setCharges] = useState<GRNCharge[]>([]);
  const chargesTotal = charges.reduce((s, c) => s + (c.amount || 0), 0);

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

  // Warehouses load via useAllWarehouses() (React Query-cached).

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
        // Do NOT lock supplier in edit mode — user should be able to change it

        // Pre-populate supplier options so the Select shows the supplier name
        if (grn.supplierId && grn.supplierName) {
          setSupplierOptions([{ value: grn.supplierId, label: grn.supplierName }]);
        }

        // Load supplier balance if supplier set
        if (grn.supplierId) {
          purchaseService.getSupplierBalance(grn.supplierId).then((b) => setSupplierBalance(b.outstandingBalance));
        }

        // Show the linked PO's outstanding lines (if any) so more can be received
        if (grn.purchaseOrderId) {
          purchaseOrderService.get(grn.purchaseOrderId).then(setLinkedPO).catch(() => {});
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
            purchaseOrderItemId: item.purchaseOrderItemId,
            lotNumber: item.lotNumber,
            inspectionStatus: item.inspectionStatus,
            rejectedQty: item.rejectedQty > 0 ? item.rejectedQty : undefined,
            inspectionNote: item.inspectionNote,
          }))
        );
        purchaseService.getCharges(editId).then(setCharges).catch(() => {});
      }).catch(() => {
        messageApi.error('Failed to load GRN for editing');
        navigate('/purchases');
      });
    }
  }, [editId]);

  // ── Load the purchase order being received against (?poId=...) ──────────
  useEffect(() => {
    if (isEdit || !poId) return;
    purchaseOrderService.get(poId).then((po) => {
      setLinkedPO(po);
      setWarehouseId(po.warehouseId);
      setSupplierId(po.supplierId);
      setSupplierName(po.supplierName || '');
      if (po.supplierName) {
        setSupplierOptions([{ value: po.supplierId, label: po.supplierName }]);
      }
      purchaseService.getSupplierBalance(po.supplierId).then((b) => setSupplierBalance(b.outstandingBalance));
    }).catch(() => {
      messageApi.error('Failed to load the purchase order');
    });
  }, [isEdit, poId]);

  // ── Product form helpers ─────────────────────────────────
  const resetProductForm = useCallback(() => {
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
    setLotNumber('');
    setRejectedQty(0);
    setHasSerialNumbers(false);
    setPendingSerials([]);
    pendingPOItemIdRef.current = null;
  }, []);

  const focusProductSearch = useCallback(() => {
    setTimeout(() => productSearchRef.current?.focus(), 50);
  }, []);

  const handleSelectProduct = useCallback((product: ProductSearchResult) => {
    skipNextSearchRef.current = true; // don't re-search the name we just filled in
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
  }, []);

  // Add a plain (non-variable, non-serial) product straight to the list at its
  // default prices — the barcode-scanner fast path.
  const quickAddProduct = useCallback((product: ProductSearchResult) => {
    setItems((prev) => {
      const idx = prev.findIndex(
        (i) => !i.isDeleted && i.productId === product.id && !i.variationId
      );
      if (idx >= 0) {
        return prev.map((it, i) =>
          i === idx
            ? { ...it, quantity: it.quantity + 1, netPrice: (it.quantity + 1) * it.costPrice, isModified: !it.isNew }
            : it
        );
      }
      const newItem: GRNItemLocal = {
        localId: newLocalId(), isNew: true, isModified: false, isDeleted: false,
        productId: product.id, productName: product.name, productSKU: product.sku,
        productImage: product.imageUrl, quantity: 1,
        unitId: product.unitId, unitName: product.unitName, unitShortName: product.unitShortName,
        costPrice: product.costPrice, retailPrice: product.retailPrice,
        wholesalePrice: product.wholesalePrice, ourPrice: product.ourPrice,
        netPrice: product.costPrice, hasSerialNumbers: false, serialNumbers: [],
        currentStock: product.currentStock,
      };
      return [...prev, newItem];
    });
    setSupplierLocked(true);
    resetProductForm();
    messageApi.success({ content: `Added ${product.name}`, duration: 1.2 });
    focusProductSearch();
  }, [messageApi, resetProductForm, focusProductSearch]);

  // ── Product search ───────────────────────────────────────
  const handleProductSearch = useCallback(
    async (query: string) => {
      if (!query || query.length < 1) {
        setProductOptions([]);
        return;
      }
      // Increment request counter so stale in-flight responses are ignored
      const requestId = ++searchRequestRef.current;
      setSearchingProducts(true);
      try {
        const results = await purchaseService.searchProducts(query, warehouseId || undefined);
        if (requestId !== searchRequestRef.current) return; // stale response

        // Barcode-scanner fast path: a single exact barcode/SKU hit is added
        // (or just selected, if it needs a variation or serial numbers) hands-free.
        const q = query.trim().toLowerCase();
        const exact =
          q.length >= 4 &&
          results.length === 1 &&
          ((results[0].barcode ?? '').toLowerCase() === q ||
            (results[0].sku ?? '').toLowerCase() === q);
        if (exact) {
          const p = results[0];
          if (p.productType !== 'variable' && !p.hasSerialNumbers && p.costPrice > 0) {
            quickAddProduct(p);
          } else {
            handleSelectProduct(p);
          }
          return;
        }
        setProductOptions(results);
      } catch {
        if (requestId !== searchRequestRef.current) return;
        setProductOptions([]);
      } finally {
        if (requestId === searchRequestRef.current) setSearchingProducts(false);
      }
    },
    [warehouseId, quickAddProduct, handleSelectProduct]
  );

  // Debounced product search — depends on handleProductSearch so it re-fires
  // automatically when the warehouse changes (which recreates handleProductSearch)
  useEffect(() => {
    if (skipNextSearchRef.current) {
      skipNextSearchRef.current = false;
      return;
    }
    const timer = setTimeout(() => {
      if (productSearch) handleProductSearch(productSearch);
    }, 200);
    return () => clearTimeout(timer);
  }, [productSearch, handleProductSearch]);

  // Focus the search box on load so a scan works immediately (new GRN only).
  useEffect(() => {
    if (!isEdit) focusProductSearch();
  }, [isEdit, focusProductSearch]);

  // Enter / Escape handling for the product search box.
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (productOptions.length === 0 && selectedProduct) {
        e.preventDefault();
        handleAddItem();
      } else if (productOptions.length === 0 && !selectedProduct && productSearch.trim()) {
        // Scanner sent Enter before the debounce fired — resolve now.
        e.preventDefault();
        handleProductSearch(productSearch);
      }
    } else if (e.key === 'Escape' && (selectedProduct || productSearch)) {
      e.preventDefault();
      resetProductForm();
      focusProductSearch();
    }
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

  // Load a PO line into the Product Details form: its current selling prices are
  // pre-filled and editable, cost + quantity come from the PO, and the line
  // stays linked to the PO (purchaseOrderItemId) once "Add to List" is pressed.
  const handleLoadFromPO = async (poItem: POItem) => {
    if (poItem.outstandingQty <= 0) return;
    if (items.some((i) => !i.isDeleted && i.purchaseOrderItemId === poItem.id)) {
      messageApi.info('This line has already been added to the GRN');
      return;
    }

    setLoadingPOLine(poItem.id);
    try {
      const results = await purchaseService.searchProducts(
        poItem.productSKU || poItem.productName,
        warehouseId || undefined,
      );
      const product = results.find((p) => p.id === poItem.productId);

      if (product) {
        handleSelectProduct(product);
        if (poItem.variationId && product.variations?.some((v) => v.id === poItem.variationId)) {
          handleSelectVariation(poItem.variationId);
        }
        // PO wins on cost + quantity; selling prices keep the product defaults
        // (now editable in the form).
        setCostPrice(poItem.unitCost || product.costPrice);
        setQuantity(poItem.outstandingQty);
      } else {
        // Product not returned by search (inactive / renamed) — fall back to a
        // minimal selection; selling prices default to the product's current
        // ones on the backend.
        setSelectedProduct({
          id: poItem.productId,
          name: poItem.productName,
          sku: poItem.productSKU,
          productType: 'single',
          costPrice: poItem.unitCost,
          retailPrice: 0,
          wholesalePrice: 0,
          ourPrice: 0,
          currentStock: 0,
          unitId: poItem.unitId,
          unitName: poItem.unitName,
          unitShortName: poItem.unitShortName,
          hasSerialNumbers: false,
        } as ProductSearchResult);
        setSelectedVariation(null);
        setCostPrice(poItem.unitCost);
        setRetailPrice(0);
        setWholesalePrice(0);
        setOurPrice(0);
        setQuantity(poItem.outstandingQty);
        setProductSearch(`${poItem.productSKU ? poItem.productSKU + ' - ' : ''}${poItem.productName}`);
      }

      pendingPOItemIdRef.current = poItem.id;
      messageApi.info('Adjust the prices below, then press "Add to List"');
    } catch {
      messageApi.error('Failed to load the product');
    } finally {
      setLoadingPOLine(null);
    }
  };

  // ── Supplier search ──────────────────────────────────────
  const handleSupplierSearch = async (query: string) => {
    if (!query || query.length < 1) {
      setSupplierOptions([]);
      return;
    }
    setSearchingSuppliers(true);
    try {
      const results = await searchSuppliers(query);
      setSupplierOptions(
        results.map((s) => ({ value: s.id, label: `${s.displayName} (${s.phone})` }))
      );
    } catch {
      setSupplierOptions([]);
    } finally {
      setSearchingSuppliers(false);
    }
  };

  const handleSelectSupplier = (id: string, option: any) => {
    setSupplierId(id);
    setSupplierName(option.label);
    // Fetch supplier balance
    purchaseService.getSupplierBalance(id)
      .then((b) => setSupplierBalance(b.outstandingBalance))
      .catch(() => setSupplierBalance(0));
  };

  const handleClearSupplier = () => {
    if (supplierLocked) {
      messageApi.warning('Cannot change supplier after items have been added');
      return;
    }
    setSupplierId(undefined);
    setSupplierName('');
    setSupplierBalance(0);
  };

  // ── Add item to list ─────────────────────────────────────
  const handleAddItem = () => {
    if (!selectedProduct) {
      messageApi.warning('Please select a product first');
      return;
    }
    if (selectedProduct.productType === 'variable' && !selectedVariation) {
      messageApi.warning('Please select a variation');
      return;
    }
    if (!quantity || quantity <= 0) {
      messageApi.warning('Quantity must be greater than 0');
      return;
    }
    if (!costPrice || costPrice <= 0) {
      messageApi.warning('Cost price must be greater than 0');
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
    const poItemId = pendingPOItemIdRef.current;

    // Check if same product+variation already in list → increment qty. A line
    // being received against a PO stays its own row so its received quantity is
    // tracked separately.
    const existingIdx = poItemId
      ? -1
      : items.findIndex(
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
        purchaseOrderItemId: poItemId ?? undefined,
        lotNumber: lotNumber || undefined,
        rejectedQty: rejectedQty > 0 ? rejectedQty : undefined,
      };
      setItems((prev) => [...prev, newItem]);
    }

    // Lock supplier after first item
    if (!supplierLocked) setSupplierLocked(true);

    resetProductForm();
    setSerialModalOpen(false);
    focusProductSearch();
  };

  const handleQuantityChange = (localId: string, qty: number) => {
    const target = items.find((i) => i.localId === localId);
    if (target?.hasSerialNumbers) {
      // Changing quantity changes how many serials are required — reopen the
      // serial modal so the user reconciles the serial list before it commits.
      setEditingSerialItem({ ...target, quantity: qty });
      return;
    }
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
    // Releasing the last item unlocks the supplier again.
    const remaining = items.filter((i) => !i.isDeleted && i.localId !== localId);
    if (remaining.length === 0) setSupplierLocked(false);
  };

  // ── Receiving inspection (QC) ─────────────────────────────
  const handleSaveInspection = async (
    status: 'accepted' | 'rejected' | 'pending',
    rejectedQty: number,
    note: string,
  ) => {
    if (!inspectingItem?.backendId || !editId) return;
    setInspectingSubmitting(true);
    try {
      const updated = await purchaseService.inspectItem(editId, inspectingItem.backendId, {
        status,
        rejectedQty: status === 'rejected' ? rejectedQty : undefined,
        note: note || undefined,
      });
      setItems((prev) =>
        prev.map((item) =>
          item.localId === inspectingItem.localId
            ? {
                ...item,
                inspectionStatus: updated.inspectionStatus,
                rejectedQty: updated.rejectedQty > 0 ? updated.rejectedQty : undefined,
                inspectionNote: updated.inspectionNote,
              }
            : item
        )
      );
      messageApi.success('Inspection recorded');
      setInspectingItem(null);
    } catch (e: any) {
      const errData = e?.response?.data;
      messageApi.error(errData?.error?.message || errData?.error?.details || 'Failed to record inspection');
    } finally {
      setInspectingSubmitting(false);
    }
  };

  // ── Validate before submit ────────────────────────────────
  const validate = (doComplete: boolean): string | null => {
    if (!warehouseId) return 'Please select a warehouse';
    if (activeItems.length === 0) return 'Please add at least one item';
    const zeroPrice = activeItems.find((i) => i.costPrice <= 0);
    if (zeroPrice) return `"${zeroPrice.productName}" has an invalid cost price. All items must have a cost price greater than 0`;
    const badSerial = activeItems.find(
      (i) => i.hasSerialNumbers && i.serialNumbers.length !== Math.round(i.quantity)
    );
    if (badSerial) {
      return `"${badSerial.productName}" requires ${Math.round(badSerial.quantity)} serial number(s), but ${badSerial.serialNumbers.length} ${badSerial.serialNumbers.length === 1 ? 'is' : 'are'} entered`;
    }
    if (doComplete) {
      if (paymentMethod === 'cheque' && !supplierId) return 'Cheque payment requires a supplier';
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
    if (err) { messageApi.error(err); return; }

    setSaving(true);
    // Track a newly created draft so we can delete it if completion fails,
    // preventing orphaned draft GRNs from appearing in the list.
    let newlyCreatedGrnId: string | null = null;
    // Non-blocking supplier price-list deviation notes surfaced by the server.
    const priceWarnings: string[] = [];

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
        const toModify = items.filter((i) => i.isModified && !i.isNew && !i.isDeleted && i.backendId);

        for (const item of toRemove) {
          await removeItem(grnId, item.backendId!);
        }
        for (const item of toModify) {
          await purchaseService.updateItem(grnId, item.backendId!, {
            quantity: item.quantity,
            costPrice: item.costPrice,
            retailPrice: item.retailPrice,
            wholesalePrice: item.wholesalePrice,
            ourPrice: item.ourPrice,
            manufactureDate: item.manufactureDate,
            expiryDate: item.expiryDate,
          });
          // Quantity edits can change the serial list (see handleQuantityChange) —
          // resync it with the backend, which was previously left stale.
          if (item.hasSerialNumbers) {
            await purchaseService.addSerialNumbers(grnId, {
              grnItemId: item.backendId!,
              serialNumbers: item.serialNumbers,
            });
          }
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
            purchaseOrderItemId: item.purchaseOrderItemId,
            lotNumber: item.lotNumber,
            inspectionStatus: item.rejectedQty && item.rejectedQty > 0 ? 'rejected' : undefined,
            rejectedQty: item.rejectedQty,
            inspectionNote: item.inspectionNote,
          });
          if (backendItem.priceWarning) {
            priceWarnings.push(`${item.productName}: ${backendItem.priceWarning}`);
          }
          if (item.hasSerialNumbers && item.serialNumbers.length > 0) {
            await purchaseService.addSerialNumbers(grnId, {
              grnItemId: backendItem.id,
              serialNumbers: item.serialNumbers,
            });
          }
        }
      } else {
        // Create new GRN draft
        const grn = await createGRN({
          warehouseId,
          supplierId,
          paymentMethod,
          notes: notes || undefined,
          grnDate,
          purchaseOrderId: linkedPO?.id,
        });
        grnId = grn.id;
        if (doComplete) newlyCreatedGrnId = grnId; // remember for rollback

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
            purchaseOrderItemId: item.purchaseOrderItemId,
            lotNumber: item.lotNumber,
            inspectionStatus: item.rejectedQty && item.rejectedQty > 0 ? 'rejected' : undefined,
            rejectedQty: item.rejectedQty,
            inspectionNote: item.inspectionNote,
          });
          if (backendItem.priceWarning) {
            priceWarnings.push(`${item.productName}: ${backendItem.priceWarning}`);
          }
          if (item.hasSerialNumbers && item.serialNumbers.length > 0) {
            await purchaseService.addSerialNumbers(grnId, {
              grnItemId: backendItem.id,
              serialNumbers: item.serialNumbers,
            });
          }
        }
      }

      if (priceWarnings.length > 0) {
        Modal.warning({
          title: 'Cost price deviates from the usual price',
          content: (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {priceWarnings.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
          ),
        });
      }

      // Landed-cost charge lines (freight / duty / insurance).
      await purchaseService.setCharges(grnId, charges.filter((c) => c.amount > 0));

      if (doComplete) {
        try {
          const completed = await completeGRN(grnId, {
            discountAmount: discountAmount || 0,
            paidAmount,
            chequeNumber: chequeNumber || undefined,
            chequeDate: chequeDate || undefined,
            chequeNote: chequeNote || undefined,
            debitBalanceUsed: debitBalanceUsed || 0,
          });
          // Completion succeeded — no need to rollback
          newlyCreatedGrnId = null;
          messageApi.success(`GRN ${completed.grnNumber} completed successfully!`);
        } catch (completeError: any) {
          // If the server returned 400 it means the GRN was already completed
          // (a previous attempt succeeded but the response was lost).  Navigate
          // to the list; do NOT delete the (already-completed) GRN.
          const status = (completeError as any).response?.status;
          if (status === 400) {
            newlyCreatedGrnId = null;
            messageApi.success('GRN completed successfully!');
            navigate('/purchases');
            return;
          }
          // Any other error: delete the orphaned draft so the user can retry
          // from a clean state.
          if (newlyCreatedGrnId) {
            await purchaseService.deleteGRN(newlyCreatedGrnId).catch(() => {});
            newlyCreatedGrnId = null;
          }
          throw completeError;
        }
      } else {
        messageApi.success('Draft saved successfully');
      }

      navigate('/purchases');
    } catch (error: any) {
      // Clean up orphaned draft if item-addition failed mid-way
      if (newlyCreatedGrnId) {
        await purchaseService.deleteGRN(newlyCreatedGrnId).catch(() => {});
        newlyCreatedGrnId = null;
      }
      const errData = error.response?.data;
      const errMsg = errData?.error?.details || errData?.error?.message || errData?.message || 'An error occurred. Please try again.';
      messageApi.error(errMsg);
    } finally {
      setSaving(false);
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
      setCharges([]);
    };

    if (activeItems.length > 0) {
      modal.confirm({
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
      {contextHolder}
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          {isEdit ? 'Edit Purchase (GRN)' : 'Add Purchase (GRN)'}
        </Title>
        <Space>
          <Button icon={<ReloadOutlined style={{ color: "blue" }} />} onClick={handleReset}>Reset</Button>
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
              <Select
                showSearch
                value={supplierId}
                options={supplierOptions}
                onSearch={handleSupplierSearch}
                onSelect={handleSelectSupplier}
                onChange={(val) => setSupplierName(val ?? '')}
                onClear={handleClearSupplier}
                placeholder="Search supplier..."
                allowClear
                disabled={supplierLocked && Boolean(supplierId)}
                style={{ width: '100%' }}
                filterOption={false}
                defaultActiveFirstOption={false}
                suffixIcon={<SearchOutlined />}
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

      {/* ── Receiving Against Purchase Order ───────────────── */}
      {linkedPO && (
        <Card
          title={`Receiving Against ${linkedPO.poNumber}`}
          style={{ marginBottom: 16 }}
          extra={<Tag color="geekblue">{linkedPO.status.replace('_', ' ').toUpperCase()}</Tag>}
        >
          <Table<POItem>
            size="small"
            pagination={false}
            rowKey="id"
            dataSource={linkedPO.items}
            columns={[
              { title: 'Product', dataIndex: 'productName', key: 'productName' },
              { title: 'Ordered', dataIndex: 'orderedQty', key: 'orderedQty', align: 'right' as const },
              { title: 'Received', dataIndex: 'receivedQty', key: 'receivedQty', align: 'right' as const },
              { title: 'Outstanding', dataIndex: 'outstandingQty', key: 'outstandingQty', align: 'right' as const },
              { title: 'Unit Cost', dataIndex: 'unitCost', key: 'unitCost', align: 'right' as const, render: (v: number) => v.toFixed(2) },
              {
                title: '', key: 'action', width: 96,
                render: (_: any, record: POItem) => {
                  const added = items.some((i) => !i.isDeleted && i.purchaseOrderItemId === record.id);
                  const loaded = pendingPOItemIdRef.current === record.id;
                  return (
                    <Tooltip title={added ? 'Already added to the GRN' : 'Load into the form below to set prices'}>
                      <Button
                        size="small" type={added ? 'default' : 'primary'}
                        loading={loadingPOLine === record.id}
                        disabled={added || record.outstandingQty <= 0}
                        onClick={() => handleLoadFromPO(record)}
                      >
                        {added ? 'Added' : loaded ? 'Loaded' : 'Load'}
                      </Button>
                    </Tooltip>
                  );
                },
              },
            ]}
          />
        </Card>
      )}

      {/* ── Product Selection Section ──────────────────────── */}
      <Card title="Add Product" style={{ marginBottom: 16 }}>
        {/* Product Search */}
        <Row gutter={[16, 12]}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Search Product"
              style={{ marginBottom: 0 }}
              extra={<Text type="secondary" style={{ fontSize: 11 }}>Scan or type · Enter to add · Esc to clear</Text>}
            >
              <div onKeyDown={handleSearchKeyDown}>
              <AutoComplete
                ref={productSearchRef}
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
              </div>
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
            <Col xs={24}>
              <Divider style={{ margin: '8px 0' }}>Product Details</Divider>

              <Form layout="vertical">
              <Row gutter={[16, 20]}>

                {/* ── Row 1: Category | Current Stock (2 wide columns) ── */}
                <Col xs={24} sm={12}>
                  <Form.Item label="Category" style={{ marginBottom: 0 }}>
                    <Input
                      readOnly
                      value={selectedProduct.categoryName || '—'}
                      style={{ backgroundColor: '#fafafa', cursor: 'default', fontWeight: 600 }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Current Stock" style={{ marginBottom: 0 }}>
                    <Input
                      readOnly
                      value={`${selectedVariation ? selectedVariation.currentStock : selectedProduct.currentStock}${selectedProduct.unitShortName ? ' ' + selectedProduct.unitShortName : ''}`}
                      style={{
                        backgroundColor: '#fafafa', cursor: 'default', fontWeight: 700,
                        color: (selectedVariation?.currentStock ?? selectedProduct.currentStock) <= 0 ? '#ff4d4f' : '#52c41a',
                      }}
                    />
                  </Form.Item>
                </Col>

                {/* ── Row 2: Quantity | Cost Price | Net Price (3 columns) ── */}
                <Col xs={12} sm={8}>
                  <Form.Item label="Quantity *" style={{ marginBottom: 0 }}>
                    <InputNumber
                      min={hasSerialNumbers ? 1 : 0.0001} value={quantity}
                      onChange={(v) => setQuantity(v ?? 1)}
                      onPressEnter={handleAddItem}
                      precision={hasSerialNumbers ? 0 : 4} style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={12} sm={8}>
                  <Form.Item label="Cost Price *" style={{ marginBottom: 0 }}>
                    <InputNumber
                      min={0} value={costPrice}
                      onChange={(v) => setCostPrice(v ?? 0)}
                      onPressEnter={handleAddItem}
                      precision={2} prefix="Rs." style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={12} sm={8}>
                  <Form.Item label="Net Price (auto)" style={{ marginBottom: 0 }}>
                    <Input
                      readOnly prefix="Rs."
                      value={netPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      style={{ backgroundColor: '#fafafa', fontWeight: 700, cursor: 'default', color: '#222' }}
                    />
                  </Form.Item>
                </Col>

                {/* ── Row 3: Retail Price | Wholesale Price | Our Price (3 columns) ── */}
                <Col xs={12} sm={8}>
                  <Form.Item label="Retail Price" style={{ marginBottom: 0 }}>
                    <InputNumber
                      min={0} value={retailPrice}
                      onChange={(v) => setRetailPrice(v ?? 0)}
                      precision={2} prefix="Rs." style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={12} sm={8}>
                  <Form.Item label="Wholesale Price" style={{ marginBottom: 0 }}>
                    <InputNumber
                      min={0} value={wholesalePrice}
                      onChange={(v) => setWholesalePrice(v ?? 0)}
                      precision={2} prefix="Rs." style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={12} sm={8}>
                  <Form.Item label="Our Price" style={{ marginBottom: 0 }}>
                    <InputNumber
                      min={0} value={ourPrice}
                      onChange={(v) => setOurPrice(v ?? 0)}
                      precision={2} prefix="Rs." style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>

                {/* ── Row 4: Manufacture Date | Expiry Date | Serial Numbers (3 columns) ── */}
                <Col xs={12} sm={8}>
                  <Form.Item label="Manufacture Date" style={{ marginBottom: 0 }}>
                    <DatePicker
                      style={{ width: '100%' }}
                      value={manufactureDate ? dayjs(manufactureDate) : null}
                      onChange={(_, str) => setManufactureDate(str as string)}
                      format="YYYY-MM-DD"
                    />
                  </Form.Item>
                </Col>
                <Col xs={12} sm={8}>
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
                <Col xs={12} sm={8}>
                  <Form.Item label="Serial Numbers" style={{ marginBottom: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 32 }}>
                      <Checkbox
                        checked={hasSerialNumbers}
                        onChange={(e) => setHasSerialNumbers(e.target.checked)}
                      >
                        Requires S/N
                      </Checkbox>
                      {hasSerialNumbers && pendingSerials.length > 0 && (
                        <Tag color="green">{pendingSerials.length} entered</Tag>
                      )}
                    </div>
                  </Form.Item>
                </Col>

                {/* ── Row 5: Lot / Batch No. | Rejected Qty (QC) ── */}
                <Col xs={12} sm={8}>
                  <Form.Item label="Lot / Batch No." style={{ marginBottom: 0 }}>
                    <Input
                      value={lotNumber}
                      onChange={(e) => setLotNumber(e.target.value)}
                      placeholder="Supplier's lot code (optional)"
                    />
                  </Form.Item>
                </Col>
                <Col xs={12} sm={8}>
                  <Form.Item
                    label={<span>Rejected Qty <Text type="secondary" style={{ fontSize: 12 }}>(QC)</Text></span>}
                    style={{ marginBottom: 0 }}
                  >
                    <InputNumber
                      min={0} max={quantity} value={rejectedQty}
                      onChange={(v) => setRejectedQty(v ?? 0)}
                      precision={hasSerialNumbers ? 0 : 4} style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>

                {/* ── Actions ── */}
                <Col xs={24} style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <Button onClick={resetProductForm}>Reset</Button>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleAddItem}>
                    Add to List
                  </Button>
                </Col>

              </Row>
              </Form>
            </Col>
          )}
        </Row>
      </Card>

      {/* ── Items Table ────────────────────────────────────── */}
      <Card title={`GRN Items (${activeItems.length})`} style={{ marginBottom: 16 }}>
        <PurchaseItemsTable
          items={items}
          onQuantityChange={handleQuantityChange}
          onRemove={handleRemoveItem}
          onInspect={setInspectingItem}
        />
      </Card>

      {/* ── Landed Costs (freight / duty / insurance) ──────── */}
      <Card
        title="Additional Costs (Freight / Duty / Insurance)"
        style={{ marginBottom: 16 }}
        extra={
          <Button
            size="small" icon={<PlusOutlined />}
            onClick={() => setCharges((prev) => [...prev, { chargeType: 'freight', amount: 0, allocationMethod: 'value' }])}
          >
            Add Charge
          </Button>
        }
      >
        {charges.length === 0 ? (
          <Text type="secondary">
            No additional costs. Freight, duty and insurance added here are allocated across the
            items into their unit cost when the GRN is completed.
          </Text>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {charges.map((c, idx) => (
              <Row gutter={8} key={idx} align="middle">
                <Col xs={12} sm={6}>
                  <Select
                    style={{ width: '100%' }}
                    value={c.chargeType}
                    onChange={(v) => setCharges((prev) => prev.map((x, i) => i === idx ? { ...x, chargeType: v as ChargeType } : x))}
                    options={[
                      { value: 'freight', label: 'Freight' },
                      { value: 'duty', label: 'Duty' },
                      { value: 'insurance', label: 'Insurance' },
                      { value: 'handling', label: 'Handling' },
                      { value: 'other', label: 'Other' },
                    ]}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <InputNumber
                    style={{ width: '100%' }} min={0} prefix="Rs." precision={2}
                    value={c.amount}
                    onChange={(v) => setCharges((prev) => prev.map((x, i) => i === idx ? { ...x, amount: v ?? 0 } : x))}
                  />
                </Col>
                <Col xs={12} sm={5}>
                  <Select
                    style={{ width: '100%' }}
                    value={c.allocationMethod}
                    onChange={(v) => setCharges((prev) => prev.map((x, i) => i === idx ? { ...x, allocationMethod: v as 'value' | 'quantity' } : x))}
                    options={[
                      { value: 'value', label: 'By value' },
                      { value: 'quantity', label: 'By quantity' },
                    ]}
                  />
                </Col>
                <Col xs={10} sm={5}>
                  <Input
                    placeholder="Note" value={c.note ?? ''}
                    onChange={(e) => setCharges((prev) => prev.map((x, i) => i === idx ? { ...x, note: e.target.value } : x))}
                  />
                </Col>
                <Col xs={2} sm={2}>
                  <Button type="text" icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />}
                    onClick={() => setCharges((prev) => prev.filter((_, i) => i !== idx))} />
                </Col>
              </Row>
            ))}
            <div style={{ textAlign: 'right', fontWeight: 600 }}>
              Total additional cost: Rs. {chargesTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
        )}
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
          loading={saving}
          onClick={() => handleSubmit(false)}
          disabled={activeItems.length === 0}
        >
          Save Draft
        </Button>
        <Button
          type="primary"
          icon={<CheckCircleOutlined />}
          loading={saving}
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

      {editingSerialItem && (
        <SerialNumberModal
          open={Boolean(editingSerialItem)}
          productName={editingSerialItem.productName}
          quantity={Math.round(editingSerialItem.quantity)}
          existing={editingSerialItem.serialNumbers}
          onSave={(serials) => {
            setItems((prev) =>
              prev.map((item) =>
                item.localId === editingSerialItem.localId
                  ? {
                      ...item,
                      quantity: editingSerialItem.quantity,
                      netPrice: editingSerialItem.quantity * item.costPrice,
                      serialNumbers: serials,
                      isModified: !item.isNew,
                    }
                  : item
              )
            );
            setEditingSerialItem(null);
          }}
          onCancel={() => setEditingSerialItem(null)}
        />
      )}

      <QCInspectModal
        open={Boolean(inspectingItem)}
        item={inspectingItem}
        submitting={inspectingSubmitting}
        onSave={handleSaveInspection}
        onCancel={() => setInspectingItem(null)}
      />
    </div>
  );
};

export default AddPurchasePage;
