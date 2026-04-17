# Sale Returns / Refund Feature — Implementation Plan

## Overview

Add a Sale Returns (Refund) module to the web admin. This mirrors the Windows POS "Refund Mode" — the cashier finds an original sale, selects items to return (full or partial), and processes a refund.

**What already exists in the backend:**
- `POST /admin/pos/return` is **fully implemented** in `pos_service.go` (`CreateReturn`)
  - Creates a negative-amount sale record (status = `"refunded"`)
  - Restores stock via `stockRepo.UpsertStock()`
  - Deducts from customer's `outstanding_balance` for Credit method
- `GET /admin/sales` and `GET /admin/sales/:id` return sale detail including items

**What is empty/placeholder:**
- `internal/handlers/transactions/sale_return_handler.go` — empty
- `internal/services/transactions/sale_return_service.go` — empty
- `GET /admin/sale-returns` — placeholder (returns hardcoded message)
- Frontend: `saleReturnService.ts`, `saleReturnStore.ts`, `SalesReturns` page — all empty

**Strategy**: The `POST /admin/pos/return` route handles the actual return creation and is working. The main work is the frontend refund flow + wiring the `GET /admin/sale-returns` list endpoint.

---

## Backend Changes Required (Flow_Server-go)

### 1. Implement GET /admin/sale-returns

The returns are stored in the `sales` table with `status = 'refunded'`. Just filter existing data.

**File:** `internal/handlers/transactions/sale_handler.go`

Add `ListSaleReturns` method:

```go
func (h *SaleHandler) ListSaleReturns(c *gin.Context) {
    // Same as ListSales but filters status = 'refunded'
    // Supports query params: search, date_from, date_to, customer_id, page, per_page
}
```

**File:** `internal/services/transactions/sale_service.go`

Add `ListSaleReturns` method (reuse existing list logic, add `WHERE status = 'refunded'`).

**File:** `internal/router/admin_routes.go`

Wire up the real handler:
```go
saleReturns := admin.Group("/sale-returns")
{
    saleReturns.GET("", saleHandler.ListSaleReturns)  // replace placeholder
    saleReturns.GET("/:id", saleHandler.GetSaleDetail) // reuse existing (works for returns too)
}
```

### 2. GET /admin/sales/:id already returns items

`GetSaleDetail` in `sale_handler.go` returns the full sale with `items[]`. This is used to populate the return form — no changes needed.

### 3. POST /admin/pos/return — no changes needed

Already fully implemented. Accepts the same `POSSaleRequest` struct. The frontend just needs to call it correctly.

### 4. Optional: Link return to original sale

The current `sales` table has no `original_sale_id` column. For a full audit trail, consider a migration:

```sql
ALTER TABLE sales ADD COLUMN original_sale_id UUID REFERENCES sales(id);
```

Add `OriginalSaleID *uuid.UUID` to the `Sale` model and `original_sale_id` to `POSSaleRequest`.
This lets you show "Refund of INV-001" in the sale returns list and prevents double-refunding.

> This is optional for the first version but recommended.

---

## Frontend Changes Required (Flow-Client)

### File Structure

```
src/
├── types/entities/
│   └── saleReturn.types.ts              FILL — currently empty
├── services/transactions/
│   └── saleReturnService.ts             FILL — currently empty
├── store/transactions/
│   └── saleReturnStore.ts               FILL — currently empty
├── components/sales-returns/
│   ├── SaleReturnsPage.tsx              FILL — list of all refunds
│   ├── SaleReturnsTable.tsx             NEW  — table component
│   ├── SaleReturnDetailsModal.tsx       NEW  — view a refund record
│   └── ProcessRefundPage.tsx            NEW  — the refund creation flow
└── pages/transactions/
    ├── SalesReturns.tsx                 FILL — page wrapper for list
    └── ProcessRefund.tsx                NEW  — page wrapper for refund form
```

---

### 1. Types — `src/types/entities/saleReturn.types.ts`

```typescript
// A refund record from GET /admin/sale-returns
export interface SaleReturn {
  id: string;
  invoiceNumber: string;          // starts with "REF-" (auto-generated)
  originalSaleId?: string;        // links to original sale (optional v1)
  customerId?: string;
  customerName?: string;
  paymentMethod: string;
  totalAmount: number;            // negative value stored, display absolute
  paidAmount: number;             // negative value stored, display absolute
  discountAmount: number;
  deliveryCharge: number;
  status: 'refunded';
  items: SaleReturnItem[];
  saleDate: string;
  createdAt: string;
}

export interface SaleReturnItem {
  id: string;
  productId: string;
  productName: string;
  variationId?: string;
  quantity: number;               // negative in DB, display absolute
  price: number;                  // negative in DB, display absolute
}

// Used when loading the original sale to initiate a return
export interface OriginalSaleDetail {
  id: string;
  invoiceNumber: string;
  customerName?: string;
  customerId?: string;
  paymentMethod: string;
  totalAmount: number;
  paidAmount: number;
  status: string;
  saleDate: string;
  items: OriginalSaleItem[];
}

export interface OriginalSaleItem {
  id: string;
  productId: string;
  productName: string;
  variationId?: string;
  quantity: number;
  price: number;
}

// Sent to POST /admin/pos/return
export interface ProcessRefundRequest {
  invoice_number?: string;        // optional custom ref number
  original_sale_id?: string;      // optional link
  customer_id?: string;
  payment_method: string;         // how refund is given back
  total_amount: number;
  paid_amount: number;
  products: {
    product_id: string;
    variation_id?: string;
    quantity: number;
    price: number;
  }[];
}

export interface SaleReturnsFilter {
  search?: string;
  date_from?: string;
  date_to?: string;
  payment_method?: string;
}
```

---

### 2. Service — `src/services/transactions/saleReturnService.ts`

```typescript
import api from '@/utils/api';
import type {
  SaleReturn, SaleReturnsFilter, OriginalSaleDetail, ProcessRefundRequest
} from '@/types/entities/saleReturn.types';

const transformReturn = (raw: any): SaleReturn => ({
  id: raw.id,
  invoiceNumber: raw.invoice_number,
  originalSaleId: raw.original_sale_id,
  customerId: raw.customer_id,
  customerName: raw.customer_name,
  paymentMethod: raw.payment_method,
  totalAmount: Math.abs(parseFloat(raw.total_amount || '0')),
  paidAmount: Math.abs(parseFloat(raw.paid_amount || '0')),
  discountAmount: Math.abs(parseFloat(raw.discount_amount || '0')),
  deliveryCharge: Math.abs(parseFloat(raw.delivery_charge || '0')),
  status: 'refunded',
  items: (raw.items || []).map((item: any) => ({
    id: item.id,
    productId: item.product_id,
    productName: item.product_name,
    variationId: item.variation_id,
    quantity: Math.abs(parseFloat(item.quantity || '0')),
    price: Math.abs(parseFloat(item.price || '0')),
  })),
  saleDate: raw.sale_date,
  createdAt: raw.created_at,
});

const transformOriginalSale = (raw: any): OriginalSaleDetail => ({
  id: raw.id,
  invoiceNumber: raw.invoice_number,
  customerName: raw.customer_name,
  customerId: raw.customer_id,
  paymentMethod: raw.payment_method,
  totalAmount: parseFloat(raw.total_amount || '0'),
  paidAmount: parseFloat(raw.paid_amount || '0'),
  status: raw.status,
  saleDate: raw.sale_date,
  items: (raw.items || []).map((item: any) => ({
    id: item.id,
    productId: item.product_id,
    productName: item.product_name,
    variationId: item.variation_id,
    quantity: parseFloat(item.quantity || '0'),
    price: parseFloat(item.price || '0'),
  })),
});

export const saleReturnService = {
  async listReturns(filter: SaleReturnsFilter = {}): Promise<SaleReturn[]> {
    const res = await api.get('/admin/sale-returns', { params: filter });
    return (res.data.data || []).map(transformReturn);
  },

  async getReturnDetail(id: string): Promise<SaleReturn> {
    const res = await api.get(`/admin/sale-returns/${id}`);
    return transformReturn(res.data.data || res.data);
  },

  // Load original sale to populate the return form
  async getOriginalSale(saleId: string): Promise<OriginalSaleDetail> {
    const res = await api.get(`/admin/sales/${saleId}`);
    return transformOriginalSale(res.data.data || res.data);
  },

  // Search original sale by invoice number
  async findSaleByInvoice(invoiceNumber: string): Promise<OriginalSaleDetail | null> {
    const res = await api.get('/admin/sales', { params: { search: invoiceNumber } });
    const items = res.data.data || [];
    if (!items.length) return null;
    // Get full detail of first match
    return saleReturnService.getOriginalSale(items[0].id);
  },

  async processRefund(data: ProcessRefundRequest): Promise<{ id: string; invoiceNumber: string }> {
    const res = await api.post('/admin/pos/return', {
      ...data,
      total_amount: data.total_amount,
      paid_amount: data.paid_amount,
    });
    const sale = res.data.sale;
    return { id: sale.id, invoiceNumber: sale.invoice_number };
  },
};
```

---

### 3. Store — `src/store/transactions/saleReturnStore.ts`

```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { saleReturnService } from '@/services/transactions/saleReturnService';
import type {
  SaleReturn, SaleReturnsFilter, OriginalSaleDetail, ProcessRefundRequest
} from '@/types/entities/saleReturn.types';
import { message } from 'antd';

interface SaleReturnState {
  returns: SaleReturn[];
  selectedReturn: SaleReturn | null;
  originalSale: OriginalSaleDetail | null;
  loading: boolean;
  submitting: boolean;
  searching: boolean;

  fetchReturns: (filter?: SaleReturnsFilter) => Promise<void>;
  fetchReturnDetail: (id: string) => Promise<void>;
  findOriginalSale: (invoiceNumber: string) => Promise<boolean>;
  loadOriginalSale: (saleId: string) => Promise<void>;
  processRefund: (data: ProcessRefundRequest) => Promise<string | null>;
  clearOriginalSale: () => void;
}

export const useSaleReturnStore = create<SaleReturnState>()(
  devtools((set) => ({
    returns: [],
    selectedReturn: null,
    originalSale: null,
    loading: false,
    submitting: false,
    searching: false,

    fetchReturns: async (filter = {}) => {
      set({ loading: true });
      try {
        const returns = await saleReturnService.listReturns(filter);
        set({ returns });
      } catch {
        message.error('Failed to load sale returns');
      } finally {
        set({ loading: false });
      }
    },

    fetchReturnDetail: async (id) => {
      set({ loading: true });
      try {
        const ret = await saleReturnService.getReturnDetail(id);
        set({ selectedReturn: ret });
      } catch {
        message.error('Failed to load return details');
      } finally {
        set({ loading: false });
      }
    },

    findOriginalSale: async (invoiceNumber) => {
      set({ searching: true, originalSale: null });
      try {
        const sale = await saleReturnService.findSaleByInvoice(invoiceNumber);
        if (!sale) {
          message.warning('No sale found with that invoice number');
          return false;
        }
        if (sale.status === 'refunded') {
          message.warning('This sale has already been refunded');
          return false;
        }
        set({ originalSale: sale });
        return true;
      } catch {
        message.error('Failed to search for sale');
        return false;
      } finally {
        set({ searching: false });
      }
    },

    loadOriginalSale: async (saleId) => {
      set({ searching: true });
      try {
        const sale = await saleReturnService.getOriginalSale(saleId);
        set({ originalSale: sale });
      } catch {
        message.error('Failed to load sale details');
      } finally {
        set({ searching: false });
      }
    },

    processRefund: async (data) => {
      set({ submitting: true });
      try {
        const result = await saleReturnService.processRefund(data);
        message.success(`Refund processed: ${result.invoiceNumber}`);
        return result.id;
      } catch {
        message.error('Failed to process refund');
        return null;
      } finally {
        set({ submitting: false });
      }
    },

    clearOriginalSale: () => set({ originalSale: null }),
  }), { name: 'sale-return-store' })
);
```

---

### 4. ProcessRefundPage — `src/components/sales-returns/ProcessRefundPage.tsx`

The main refund creation flow. Three-step process:

#### Step 1 — Find Original Sale

- Search `Input` for invoice number (e.g., `INV-1714xxxxxx`)
- "Search" button → `findOriginalSale(invoiceNumber)`
- OR navigate directly from Sales History (pass `saleId` as route param → `loadOriginalSale(saleId)`)
- Shows original sale info card: Invoice #, Customer, Date, Total, Payment Method

#### Step 2 — Select Items to Return

Table of original sale items with checkboxes and editable return quantity:

| Column | Notes |
|--------|-------|
| Checkbox | Select items to return |
| Product Name | read-only |
| Original Qty | read-only |
| Return Qty | `InputNumber`, max = original qty, min = 0.01 |
| Unit Price | read-only |
| Return Amount | computed: returnQty × price |

- "Select All" toggle
- Running total of selected return amount at bottom

#### Step 3 — Refund Details & Confirm

- **Return Method** (`Select`): Cash, Credit (to customer account), Card
  - Cash: full `paidAmount` must equal return total (no partial cash refund)
  - Credit: requires a customer on the original sale; reduces `outstanding_balance`
  - Card: show card details (bank, last 4)
- **Return Reason** (`TextArea`, optional): for records
- **Refund Amount** (`InputNumber`): pre-filled with total, editable for partial cash
- **Confirm Refund** button → `processRefund(data)` → redirect to `/sales-returns`

#### Key Validation Rules

- Cannot refund more than originally purchased (per item)
- Cash refund: `paidAmount` must equal return `totalAmount`
- Credit refund: `customerId` is required
- At least 1 item must be selected with qty > 0
- Cannot refund a sale with status `"refunded"` already

---

### 5. SaleReturnsPage — `src/components/sales-returns/SaleReturnsPage.tsx`

List all refund transactions. Pattern matches `SalesPage` / `PurchasesPage`.

**Features:**
- Table with columns: Ref #, Original Invoice, Customer, Items, Total Refunded, Payment Method, Date, Actions
- Filter bar: date range picker, payment method select, search input
- Row click → open `SaleReturnDetailsModal`
- "Process New Refund" button → navigate to `/sales-returns/new`

---

### 6. SaleReturnDetailsModal — `src/components/sales-returns/SaleReturnDetailsModal.tsx`

Shows the full refund record details (read-only):

- Header: Ref # (REF-xxx), Date, Status badge ("Refunded")
- Original Invoice link (clickable, opens sale detail)
- Customer info (if any)
- Items table: Product, Qty Returned, Unit Price, Total
- Summary: Total Refunded, Payment Method, Refund Reference
- Print button (for receipt)

---

### 7. Routes — `src/routes/AppRoutes.tsx`

```tsx
// Inside admin protected routes
<Route path="/sales-returns" element={
  <PermissionRoute requiredPermission={PERMISSIONS.SALES_REFUNDS}>
    <SalesReturns />
  </PermissionRoute>
} />
<Route path="/sales-returns/new" element={
  <PermissionRoute requiredPermission={PERMISSIONS.SALES_REFUNDS}>
    <ProcessRefund />
  </PermissionRoute>
} />
<Route path="/sales-returns/new/:saleId" element={
  <PermissionRoute requiredPermission={PERMISSIONS.SALES_REFUNDS}>
    <ProcessRefund />
  </PermissionRoute>
} />
```

The `:saleId` param allows navigating directly from Sales History → "Process Return" action.

---

### 8. Sales History Integration

In `src/components/sales/SalesHistoryTable.tsx`, add a "Return" action button per row:

```tsx
<Button
  size="small"
  danger
  icon={<RollbackOutlined />}
  onClick={() => navigate(`/sales-returns/new/${record.id}`)}
  disabled={record.status === 'refunded'}
>
  Return
</Button>
```

---

### 9. Permissions

`PERMISSIONS.SALES_REFUNDS` already exists in `src/types/auth/permissions.ts` as `'sales.refunds'`.
No new permissions needed.

---

## Implementation Order

1. **Backend**: Implement `ListSaleReturns` in sale_service + sale_handler, wire route (replace placeholder)
2. **Types**: Fill `saleReturn.types.ts`
3. **Service**: Fill `saleReturnService.ts`
4. **Store**: Fill `saleReturnStore.ts`
5. **ProcessRefundPage**: Build Step 1 (search) → Step 2 (item selection) → Step 3 (confirm)
6. **SaleReturnsPage + Table + DetailsModal**: Build the list view
7. **Page wrappers**: Fill `SalesReturns.tsx`, create `ProcessRefund.tsx`
8. **Routes**: Add to `AppRoutes.tsx`
9. **Sales History integration**: Add "Return" action button to `SalesHistoryTable.tsx`

---

## API Endpoints Summary

| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| GET | `/admin/sale-returns` | List all refund records | Needs implementation |
| GET | `/admin/sale-returns/:id` | Get refund detail | Reuse `/admin/sales/:id` |
| GET | `/admin/sales/:id` | Get original sale detail for return form | Working |
| GET | `/admin/sales` | Search sales by invoice number | Working |
| POST | `/admin/pos/return` | Process refund (create negative sale) | **Already working** |

---

## Data Flow: Process a Refund

```
Admin navigates to /sales-returns/new
  OR clicks "Return" on a row in Sales History → /sales-returns/new/:saleId

Step 1 — Find Sale
  → Enter invoice number → findOriginalSale('INV-xxx')
  → GET /admin/sales?search=INV-xxx → GET /admin/sales/:id
  → Sale detail loaded: customer, items, total, status

Step 2 — Select Items
  → Check items to return
  → Adjust return quantities (partial return supported)
  → Return total computed

Step 3 — Confirm
  → Choose return method (Cash/Credit/Card)
  → Validate (cash = full amount, credit = needs customer)
  → processRefund({ customer_id, payment_method, total_amount, paid_amount, products[] })
  → POST /admin/pos/return
    → Backend: creates sale record with status='refunded', negative amounts
    → Backend: UpsertStock() restores stock per item
    → Backend: if Credit, reduces customer outstanding_balance
  → Redirect to /sales-returns
  → Show success with REF- number
```

## Data Flow: View Refund History

```
Admin navigates to /sales-returns
  → fetchReturns({ date_from, date_to, search })
  → GET /admin/sale-returns
  → Table shows all returns: REF#, original INV#, customer, total, method, date
  → Click row → SaleReturnDetailsModal
  → Shows items returned, amounts, print option
```

---

## Windows vs Web Differences

| Windows App | Web App |
|-------------|---------|
| Refund mode toggle in POS | Dedicated `/sales-returns/new` page + POS refund button |
| Manual item entry for return | Load original sale items, select/adjust quantities |
| No link to original sale | Optional `original_sale_id` links return to original sale |
| Reference number = REF-{timestamp} (auto) | Same auto-generation in backend (`REF-{unix}`) |
| Single refund payment method | Same: Cash / Credit / Card |
| No return history page | Dedicated `/sales-returns` list page |
