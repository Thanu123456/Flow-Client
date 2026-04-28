# Hold Bills Feature — Implementation Plan

## Overview

Adapt the Windows POS "Hold" functionality (HoldForm + HoldReference) to the web POS.
The Windows app let a cashier pause a transaction, give it a reference number and optional name, then resume or delete it later from a list.

The web app already has:
- `src/components/pos/HeldBillsModal.tsx` — lists active held bills (resume/delete), uses raw `fetch()`
- `src/store/transactions/posStore.ts` — `holdBill()` and `resumeHoldBill()` actions
- Backend: `hold_handler.go` + `hold_service.go` + `held_sales` table (fully implemented)

**Critical backend gap**: Hold routes are **not registered** in `admin_routes.go`. The `HoldService` uses `pgx.Conn` (direct connection) instead of the multi-tenant `pgxpool.Conn` pattern the middleware provides — this must be fixed before routes can be wired.

---

## Backend Changes Required (Flow_Server-go)

### 1. Fix HoldService to use pgxpool (Multi-tenant Pattern)

**File:** `internal/services/transactions/hold_service.go`

Current problem: `HoldService` stores a `*pgx.Conn` set at startup — it cannot switch tenant schemas per-request.

Fix: Change to accept `*pgxpool.Conn` per-call (same pattern as `POSService`).

```go
// BEFORE
type HoldService struct { db *pgx.Conn }
func NewHoldService(db *pgx.Conn) *HoldService { ... }
func (s *HoldService) SaveHoldBill(ctx, req) ...

// AFTER
type HoldService struct{} // stateless
func NewHoldService() *HoldService { return &HoldService{} }
func (s *HoldService) SaveHoldBill(ctx, conn *pgxpool.Conn, req) ...
func (s *HoldService) GetHeldBills(ctx, conn *pgxpool.Conn, tenantID string) ...
func (s *HoldService) ResumeHoldBill(ctx, conn *pgxpool.Conn, holdID string) ...
func (s *HoldService) DeleteHoldBill(ctx, conn *pgxpool.Conn, holdID string) ...
```

### 2. Update HoldHandler to pass conn from middleware

**File:** `internal/handlers/transactions/hold_handler.go`

Each handler method should extract `conn` and `tenantID` from context (same as `pos_handler.go`):

```go
func (h *HoldHandler) SaveHoldBill(c *gin.Context) {
    conn, ok := middleware.GetTenantConn(c)
    // ...
    tenantID, _ := middleware.GetTenantID(c)
    req.TenantID = tenantID
    heldSale, err := h.holdService.SaveHoldBill(c.Request.Context(), conn, &req)
    // ...
}
```

### 3. Add `notes` field to HoldBillRequest DTO

**File:** `internal/dto/request/transactions/hold_bill_request.go`

The `HeldSale` model already has a `Notes` field. Expose it in the request DTO so the frontend can pass an optional hold name/reference (equivalent to `hold_name` + `reference_number` in the Windows form).

```go
type HoldBillRequest struct {
    TenantID       uuid.UUID        `json:"tenant_id"`
    CustomerID     *uuid.UUID       `json:"customer_id"`
    Notes          string           `json:"notes"`          // optional hold label
    Items          []CartItemRequest `json:"items"`
    Subtotal       float64          `json:"subtotal"`
    DiscountType   string           `json:"discount_type"`
    DiscountValue  float64          `json:"discount_value"`
    DiscountAmount float64          `json:"discount_amount"`
    DeliveryCharge float64          `json:"delivery_charge"`
    TotalAmount    float64          `json:"total_amount"`
}
```

### 4. Register hold routes in admin_routes.go

**File:** `internal/router/admin_routes.go`

Add inside the existing `pos` group (around line 299):

```go
pos := admin.Group("/pos")
{
    pos.POST("/sale",          posHandler.CreatePOSSale)
    pos.POST("/return",        posHandler.CreatePOSReturn)
    pos.POST("/hold",          holdHandler.SaveHoldBill)      // NEW
    pos.GET("/holds",          holdHandler.GetHeldBills)      // NEW
    pos.POST("/holds/:id/resume", holdHandler.ResumeHoldBill) // NEW
    pos.DELETE("/holds/:id",   holdHandler.DeleteHoldBill)    // NEW
    pos.GET("/next-bill-number", posHandler.GetNextBillNumber)
    pos.GET("/settings",       posHandler.GetSettings)
    pos.PATCH("/settings",     posHandler.UpdateSettings)
}
```

Also wire up `NewHoldHandler` and `NewHoldService` in the dependency injection chain.

---

## Frontend Changes Required (Flow-Client)

### File Structure

```
src/
├── types/entities/
│   └── holdBill.types.ts           NEW — TypeScript types
├── services/transactions/
│   └── holdService.ts              NEW — API calls (replaces raw fetch)
├── store/transactions/
│   └── holdStore.ts                NEW — Zustand store
├── components/pos/
│   ├── HeldBillsModal.tsx          MODIFY — use holdStore instead of raw fetch
│   └── HoldNoteModal.tsx           NEW — dialog to enter hold note before saving
└── pages/transactions/
    └── HoldBills.tsx               NEW — standalone admin hold management page
```

---

### 1. Types — `src/types/entities/holdBill.types.ts`

```typescript
export interface CartItemHeld {
  id: string;
  productId: string;
  variationId?: string;
  name: string;
  unit: string;
  quantity: number;
  price: number;
  maxStock: number;
  weightGrams?: number;
}

export interface HeldBill {
  id: string;
  billNumber: string;
  customerId?: string;
  customerName?: string;
  notes: string;           // the optional hold label (Windows: hold_name + reference_number)
  items: CartItemHeld[];
  subtotal: number;
  discountType: string;
  discountValue: number;
  discountAmount: number;
  deliveryCharge: number;
  totalAmount: number;
  heldAt: string;
  resumedAt?: string;
  status: 'active' | 'resumed' | 'cancelled';
}

export interface SaveHoldRequest {
  notes?: string;
  customer_id?: string;
  items: CartItemHeld[];
  subtotal: number;
  discount_type: string;
  discount_value: number;
  discount_amount: number;
  delivery_charge: number;
  total_amount: number;
}

export interface HeldBillsFilter {
  status?: 'active' | 'resumed' | 'cancelled';
  date_from?: string;
  date_to?: string;
}
```

---

### 2. Service — `src/services/transactions/holdService.ts`

Replace all raw `fetch()` calls with the `api` axios instance from `src/utils/api.ts`.

```typescript
import api from '@/utils/api';
import type { HeldBill, SaveHoldRequest } from '@/types/entities/holdBill.types';

const transform = (raw: any): HeldBill => ({
  id: raw.id,
  billNumber: raw.bill_number,
  customerId: raw.customer_id,
  customerName: raw.customer_name,
  notes: raw.notes || '',
  items: raw.items || [],
  subtotal: parseFloat(raw.subtotal || '0'),
  discountType: raw.discount_type || 'fixed',
  discountValue: parseFloat(raw.discount_value || '0'),
  discountAmount: parseFloat(raw.discount_amount || '0'),
  deliveryCharge: parseFloat(raw.delivery_charge || '0'),
  totalAmount: parseFloat(raw.total_amount || '0'),
  heldAt: raw.held_at,
  resumedAt: raw.resumed_at,
  status: raw.status,
});

export const holdService = {
  async getHeldBills(status = 'active'): Promise<HeldBill[]> {
    const res = await api.get('/admin/pos/holds', { params: { status } });
    return (res.data.data || []).map(transform);
  },

  async saveHold(data: SaveHoldRequest): Promise<{ holdId: string }> {
    const res = await api.post('/admin/pos/hold', data);
    return { holdId: res.data.hold_id };
  },

  async resumeHold(holdId: string): Promise<HeldBill> {
    const res = await api.post(`/admin/pos/holds/${holdId}/resume`);
    return transform(res.data.data);
  },

  async deleteHold(holdId: string): Promise<void> {
    await api.delete(`/admin/pos/holds/${holdId}`);
  },
};
```

---

### 3. Store — `src/store/transactions/holdStore.ts`

```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { holdService } from '@/services/transactions/holdService';
import type { HeldBill, SaveHoldRequest } from '@/types/entities/holdBill.types';
import { message } from 'antd';

interface HoldState {
  heldBills: HeldBill[];
  loading: boolean;
  submitting: boolean;

  fetchHeldBills: (status?: string) => Promise<void>;
  saveHold: (data: SaveHoldRequest) => Promise<boolean>;
  resumeHold: (holdId: string) => Promise<HeldBill | null>;
  deleteHold: (holdId: string) => Promise<boolean>;
}

export const useHoldStore = create<HoldState>()(
  devtools((set, get) => ({
    heldBills: [],
    loading: false,
    submitting: false,

    fetchHeldBills: async (status = 'active') => {
      set({ loading: true });
      try {
        const bills = await holdService.getHeldBills(status);
        set({ heldBills: bills });
      } catch {
        message.error('Failed to load held bills');
      } finally {
        set({ loading: false });
      }
    },

    saveHold: async (data) => {
      set({ submitting: true });
      try {
        await holdService.saveHold(data);
        message.success('Bill held successfully');
        return true;
      } catch {
        message.error('Failed to hold bill');
        return false;
      } finally {
        set({ submitting: false });
      }
    },

    resumeHold: async (holdId) => {
      set({ submitting: true });
      try {
        const bill = await holdService.resumeHold(holdId);
        set((s) => ({
          heldBills: s.heldBills.filter((b) => b.id !== holdId),
        }));
        return bill;
      } catch {
        message.error('Failed to resume bill');
        return null;
      } finally {
        set({ submitting: false });
      }
    },

    deleteHold: async (holdId) => {
      set({ submitting: true });
      try {
        await holdService.deleteHold(holdId);
        set((s) => ({
          heldBills: s.heldBills.filter((b) => b.id !== holdId),
        }));
        message.success('Held bill deleted');
        return true;
      } catch {
        message.error('Failed to delete held bill');
        return false;
      } finally {
        set({ submitting: false });
      }
    },
  }), { name: 'hold-store' })
);
```

---

### 4. HoldNoteModal — `src/components/pos/HoldNoteModal.tsx`

Equivalent to the Windows `HoldReference` form. Opens when the cashier clicks "Hold Bill" in POS.
Lets them enter an optional label for the bill before it's saved.

**Props:**
```typescript
interface HoldNoteModalProps {
  open: boolean;
  submitting: boolean;
  onConfirm: (notes: string) => void;
  onCancel: () => void;
}
```

**UI Elements:**
- Single `Input` field: "Hold Note / Label" (optional, max 100 chars) — combines the Windows `reference_number` + `hold_name` into one text field (the backend `notes` column)
- "Hold Bill" confirm button (primary)
- "Cancel" button

> **Windows vs Web difference**: The Windows app required a numeric reference number. For the web, we use a free-text notes field since the backend `BillNumber` is auto-generated (e.g., `HOLD-abc12345-1714000000`). The `notes` field acts as the optional human-readable label.

---

### 5. Update HeldBillsModal — `src/components/pos/HeldBillsModal.tsx`

Replace raw `fetch()` with `useHoldStore`:

```typescript
const { heldBills, loading, fetchHeldBills, resumeHold, deleteHold, submitting } = useHoldStore();

useEffect(() => {
  if (open) fetchHeldBills('active');
}, [open]);

const handleResume = async (bill: HeldBill) => {
  const resumed = await resumeHold(bill.id);
  if (resumed) {
    onResume(resumed);   // passes full bill data back to POS
    onClose();
  }
};
```

Add `notes` column to the table (shows the hold label the cashier entered):

```typescript
{ title: 'Label', dataIndex: 'notes', render: (n) => n || '—' }
```

---

### 6. Update POS Store — `src/store/transactions/posStore.ts`

Replace the inline `holdBill()` implementation with `useHoldStore.saveHold()`:

```typescript
// Remove raw fetch from holdBill()
// Instead call holdStore.saveHold({ notes, items, subtotal, ... })
// Open HoldNoteModal first → get notes → then call saveHold
```

---

### 7. Hold Management Page — `src/pages/transactions/HoldBills.tsx`

A standalone admin page at `/holds`. Equivalent to the Windows HoldForm but with richer filtering.

**Features:**
- Table showing **all** held bills (active + resumed + cancelled) — filter tabs at top
- Columns: Bill #, Label (notes), Customer, Items count, Total Amount, Held At, Status, Cashier
- Actions: Resume (active only), Delete/Cancel (active only)
- Date range filter
- Search by bill number or label
- "Open in POS" action for active bills (navigates to `/pos` and loads the bill)

**Route:** Add to `AppRoutes.tsx`:
```tsx
<Route path="/holds" element={
  <PermissionRoute requiredPermission={PERMISSIONS.POS_SALES}>
    <HoldBills />
  </PermissionRoute>
} />
```

---

## Permissions

No new permissions needed. Use existing `PERMISSIONS.POS_SALES` for the hold management page.
Hold/resume actions in POS are already covered by cashier access.

---

## Implementation Order

1. **Backend first**: Fix `HoldService` to use `pgxpool`, update handler, register routes, redeploy
2. **Types + Service**: `holdBill.types.ts`, `holdService.ts`
3. **Store**: `holdStore.ts`
4. **HoldNoteModal**: New component for POS hold label dialog
5. **Update HeldBillsModal**: Swap raw fetch → holdStore
6. **Update posStore**: Wire HoldNoteModal + holdStore.saveHold()
7. **Hold Management Page**: `/holds` route and page component

---

## API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/admin/pos/hold` | Save current cart as held bill |
| GET | `/admin/pos/holds` | List held bills (filter by status) |
| POST | `/admin/pos/holds/:id/resume` | Resume a held bill (returns full data) |
| DELETE | `/admin/pos/holds/:id` | Cancel/delete a held bill |

---

## Data Flow: Hold Bill in POS

```
Cashier clicks "Hold Bill"
  → HoldNoteModal opens
  → Cashier enters optional label (e.g. "Table 5 - Ruchira")
  → Clicks "Hold Bill"
  → posStore.holdBill(notes) called
  → holdStore.saveHold({ notes, items, subtotal, discountType, ... })
  → POST /admin/pos/hold
  → Cart cleared in POS
  → Success message
```

## Data Flow: Resume Held Bill

```
Cashier clicks "Held Bills"
  → HeldBillsModal opens (useHoldStore.fetchHeldBills('active'))
  → Table shows: Bill #, Label, Customer, Items, Total, Time
  → Cashier clicks "Resume"
  → holdStore.resumeHold(id)
  → POST /admin/pos/holds/:id/resume
  → Returns full HeldSale with items JSONB
  → posStore.resumeHoldBill(bill) restores cart (items, customer, discounts, delivery)
  → HeldBillsModal closes
  → POS shows restored cart
```
