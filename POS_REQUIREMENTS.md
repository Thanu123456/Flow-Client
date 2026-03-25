# POS Web Application – Enhancement Requirements

**Based on:** Windows desktop app (EscopeWindowsApp) POS.cs + POSPaymentForm.cs
**Target:** Flow-Client (React 19 + TypeScript) + Flow_Server-go (Go + PostgreSQL multi-tenant)
**Date:** 2026-03-25

---

## 1. Current State Summary

### Already Implemented (Web)

| Feature | Status | Location |
|---------|--------|----------|
| Product grid with images + stock badge | ✅ Done | `POS.tsx` |
| Category filter dropdown | ✅ Done | `POS.tsx` + `categoryStore` |
| Search by name / SKU / barcode | ✅ Done | `POS.tsx` (client-side filter) |
| Variable product variations (one card per variation) | ✅ Done | `POS.tsx` |
| Cart: add, +/- qty, remove, clear | ✅ Done | `posStore.ts` |
| Customer search + autocomplete | ✅ Done | `POS.tsx` + `customerStore` |
| Create new customer (F1) | ✅ Done | `POS.tsx` |
| Payment methods: Cash / Card / Credit / COD | ✅ Done | `POS.tsx` |
| Paid amount + change calculation | ✅ Done | `POS.tsx` |
| Refund mode | ✅ Done | `posStore.ts` |
| Hold mode (sets payment method to HOLD) | ✅ Partial | `POS.tsx` (no resume) |
| Tracking number field (UI only) | ✅ UI only | `POS.tsx` |
| Checkout → `POST /admin/pos/sale` | ✅ Done | `posService.ts` |
| Return → `POST /admin/pos/return` | ✅ Done | `posService.ts` |
| Print Bill checkbox (UI only) | ✅ UI only | `POS.tsx` |
| Keyboard shortcuts: Esc, Del, Enter, F1–F4, F12 | ✅ Partial | `POS.tsx` |
| Clock + date display | ✅ Done | `POS.tsx` |

---

## 2. Features to Add (from Windows App, adapted for Web)

---

### 2.1 Price Mode (F3)

**What Windows does:** A persistent setting `priceMode` (Our / Retail / Wholesale) loaded from app settings. Controls which price column is displayed on product cards and used in the cart. Products have `our_price`, `retail_price`, and `wholesale_price` columns (and `new_*` variants for repriced stock).

**What the web currently does:** F3 button shows a "coming soon" toast. POS always uses `retailPrice` (or `costPrice` as fallback).

**Requirements:**

- Add `priceMode` state to `posStore` (values: `"our"` | `"retail"` | `"wholesale"`, default `"retail"`)
- Persist `priceMode` in `localStorage` (survives page reload)
- F3 key and the "PRICE MODE" button open a small dropdown/modal to select the mode
- Product cards display price according to selected mode:
  - `"retail"` → `retailPrice`
  - `"wholesale"` → `wholesalePrice`
  - `"our"` → `ourPrice`
- `addToCart` records the price at the time of adding (snapshot — not reactive to mode changes after add)
- **Backend:** Products API must return `ourPrice` and `wholesalePrice` fields. Update `productService.ts` transform function to map `our_price` / `wholesale_price` from backend.
- **Backend:** Product type in `product.types.ts` needs `ourPrice?: number` and `wholesalePrice?: number` fields.

---

### 2.2 Discount (F6 = Fixed, F7 = Percentage)

**What Windows does:** Payment form has two radio buttons (Fixed amount / Percentage) + a value input. Discount is applied before delivery charge: `total = max(0, subtotal − discount) + delivery`.

**Requirements:**

**Frontend – Payment Modal:**
- Add "DISCOUNT" section above delivery charge:
  - Radio: Fixed Amount (F6) | Percentage (F7)
  - Number input for discount value
  - Display calculated discount amount (e.g. `−150.00`)
- Recalculate `totalPayable` on every change: `total = max(0, subtotal − discountAmount) + deliveryCharge`
- Validation: Fixed discount cannot exceed subtotal; Percentage must be 0–100
- Show discount line in payment summary

**Frontend – POS Store (`posStore.ts`):**
- Add `discountType: "fixed" | "percent"` and `discountValue: number` state
- Expose `setDiscount(type, value)` action
- Checkout payload must include discount fields

**Backend – Sale API:**
- `POST /admin/pos/sale` request body: add `discount_type` (`"fixed"` | `"percent"`), `discount_value` (number), `discount_amount` (calculated, for record-keeping)
- `sales` table: add `discount_type`, `discount_value`, `discount_amount` columns
- Backend recalculates and validates `net_amount = max(0, total_amount − discount_amount) + delivery_charge`

---

### 2.3 Delivery Charge (F8)

**What Windows does:** Optional numeric field in payment form. Added to total after discount.

**Requirements:**

**Frontend – Payment Modal:**
- Add "DELIVERY CHARGE" input (F8 focuses it)
- Display `+{deliveryCharge}` line in total breakdown
- Default 0; only shown in total if > 0

**Frontend – POS Store:**
- Add `deliveryCharge: number` state and `setDeliveryCharge(amount)` action
- Include in checkout payload

**Backend – Sale API:**
- `POST /admin/pos/sale` request body: add `delivery_charge` (number, default 0)
- `sales` table: add `delivery_charge` column

---

### 2.4 Card Payment Details (Bank + Card Number + Card Type)

**What Windows does:** When "Card" is selected, additional fields appear: bank dropdown (Sri Lankan banks list) + card first digit + card last 4 digits. Card type (Visa / Mastercard / Amex) is auto-detected from first digit (4 = Visa, 5 = Mastercard, 3 = Amex).

**Requirements:**

**Frontend – Payment Modal:**
- When `paymentMethod === "Card"` is selected:
  - Show "Bank" dropdown (Sri Lankan banks: Commercial Bank, Sampath Bank, HNB, BOC, People's Bank, Nations Trust Bank, Seylan Bank, NDB, DFCC, Pan Asia Bank, Amana Bank, Cargills Bank, HSBC/Standard Chartered)
  - Show "Card First Digit" input (1 character, numeric only)
  - Show "Card Last 4 Digits" input (4 characters, numeric only)
  - Auto-detect and display card type badge: `4` = VISA, `5` = MASTERCARD, `3` = AMEX
  - F11 focuses bank dropdown; F12 focuses first digit field (when card is selected)
  - Paid amount input should be auto-filled and disabled (card pays exact amount)
- Validation: Bank, first digit, and last 4 digits are required for card payment

**Frontend – POS Store:**
- Add `cardBank: string`, `cardFirstDigit: string`, `cardLastFour: string`, `cardType: string` state
- Include in checkout payload

**Backend – Sale API:**
- `POST /admin/pos/sale` request body: add `card_bank`, `card_number` (formatted: `first_digit***last_4`), `card_type`
- `sales` table: add `card_bank`, `card_number`, `card_type` columns

---

### 2.5 Cart Weight Calculation

**What Windows does:** Each product row has `weight_grams` column. Cart weight = sum of `(quantity × weight_grams)` for all cart items, displayed as `X.XXX Kg` in payment form header.

**Requirements:**

**Frontend:**
- Product type: add `weightGrams?: number` field
- `posStore` CartItem: add `weightGrams?: number` field
- `addToCart` passes `weightGrams` from product
- Add computed getter `cartWeight` in `posStore`: `sum(item.quantity × item.weightGrams) / 1000` formatted as `X.XXX Kg`
- Payment modal header: replace hardcoded `"0.000 Kg"` with live `cartWeight` value

**Backend – Product API:**
- Products response: ensure `weight_grams` is returned and mapped in `productService.ts`

---

### 2.6 Weight-Based Quantity Entry Modal

**What Windows does:** For products with unit = Kilogram, Liter, or Meter, clicking the product card opens a `POSWeightForm` modal that prompts for a decimal quantity (e.g. `2.500 Kg`) before adding to cart. This also applies when editing quantity in cart via Ctrl+Shift.

**Requirements:**

**Frontend:**
- Identify weight-based products: `unit.toLowerCase()` in `["kilogram", "kg", "liter", "litre", "l", "meter", "metre", "m"]`
- When a weight-based product card is clicked: open a `WeightEntryModal` instead of immediately adding to cart
  - Modal title: product name
  - Shows available stock and unit
  - Numeric input for quantity (decimal, step 0.001)
  - Confirm / Cancel buttons
  - Validate: if `allowNoStockBills` is false, quantity cannot exceed available stock
- In cart: weight-based items show quantity with 3 decimal places (e.g. `2.500`); piece items show integer
- Ctrl+Shift on a cart row opens the same `WeightEntryModal` for updating quantity

---

### 2.7 Allow No-Stock Bills Setting

**What Windows does:** A per-company setting `allow_no_stock_bills` (boolean). When enabled, out-of-stock products can still be added to cart and sold (stock goes negative). When disabled, clicking an out-of-stock product shows an error.

**Requirements:**

**Frontend:**
- Load `allowNoStockBills` from company/tenant settings on POS mount
- If `allowNoStockBills === false`: clicking an out-of-stock product shows an Ant Design warning notification and does NOT add to cart
- If `allowNoStockBills === true`: out-of-stock products can be added; display a visual warning badge (amber instead of red)

**Backend:**
- `GET /admin/pos/settings` endpoint (or include in `/admin/tenant/settings`): return `allow_no_stock_bills: boolean`
- Tenant `settings` table (or equivalent): store `allow_no_stock_bills` column
- `POST /admin/pos/sale`: backend also enforces this — reject sale if stock < 0 and setting is false

---

### 2.8 Barcode Scanner Support

**What Windows does:** An invisible `TextBox` (off-screen position) permanently holds keyboard focus and collects characters into `barcodeBuffer`. A 100ms debounce timer fires after the last keystroke — if buffer is ≥ 1 char, treats it as a complete barcode scan and calls `ProcessScannedBarcode(barcode)`, which looks up the product by barcode and adds it to cart. A 500ms timer refocuses the hidden input whenever POS is the active window and no other input is focused.

**Requirements:**

**Frontend:**
- Use a `useEffect` that listens for `keydown` events globally; build a barcode buffer with a 100ms debounce timeout
- When buffer flushes (Enter key or timeout), search `posItems` by `barcode` field
- If a single match is found: add it to cart (respecting weight-modal flow for Kg/L/m units and `allowNoStockBills`)
- If no match found: show a brief notification "Barcode not found: {barcode}"
- Do NOT intercept characters when any standard `<input>` / `<textarea>` is focused (check `document.activeElement`)
- Support repeating scan (scanning same barcode again increments quantity)

---

### 2.9 Hold Bills (Resume/Save Later)

**What Windows does:** Clicking HOLD saves the current cart as a "pending" bill in the database. The cart is then cleared for the next customer. A separate CODOrders-style form can be opened to view and resume held bills.

**What the web currently does:** "HOLD" sets `paymentMethod = "HOLD"` and calls the sale API — this is incorrect (it should NOT create a completed sale).

**Requirements:**

**Frontend:**
- Separate "HOLD" from payment methods — it is a cart action, not a payment method
- HOLD button: saves current cart as a held bill (call `POST /admin/pos/hold`) and clears the cart
- Add a "Held Bills" icon/button in the POS header that opens a `HeldBillsModal`
  - Lists all active held bills for current session/cashier: bill number, customer name, total, items count, time held
  - "Resume" button on each row: loads the held bill back into the cart
  - "Delete" button: removes the held bill without processing
- Remove "HOLD" from the payment method Radio.Group in the payment modal

**Backend:**
- `POST /admin/pos/hold` – saves cart as a held (draft) sale, returns `hold_id`
- `GET /admin/pos/holds` – lists all active held bills for this tenant
- `DELETE /admin/pos/holds/:id` – removes a held bill
- `POST /admin/pos/holds/:id/resume` – marks held bill as resumed (returns cart items)
- OR alternatively: Use `sales` table with `status = "hold"` and filter accordingly

---

### 2.10 Sales History

**What the web currently lacks:** No way to view past transactions from the POS or admin panel.

**Requirements:**

**Frontend – Admin Panel (new page):**
- Route: `/sales` under transactions section
- `SalesPage` component with a table:
  - Columns: Bill No, Date/Time, Customer, Payment Method, Items, Subtotal, Discount, Delivery, Total, Cashier, Actions
  - Filters: date range, payment method, cashier/user, search by bill no / customer
  - Pagination
  - "View" action: opens `SaleDetailsModal` showing full item breakdown, payment info, card details if applicable
  - "Print" action: re-prints the bill (thermal or PDF)
  - "Return/Refund" action: pre-fills refund modal with sale items

**Frontend – POS header:**
- Optional "Sales History" button linking to `/sales`

**Backend:**
- `GET /admin/sales` – paginated list with filters (date_from, date_to, payment_method, cashier_id, search)
- `GET /admin/sales/:id` – sale detail with all items
- These may already exist; verify and expose if not

---

### 2.11 Receipt / Bill Printing

**What Windows does:** After successful payment, calls `ThermalBillPrinter.PrintBill(...)` which sends ESC/POS commands to a thermal printer. If "Print Retail Bill Also" checkbox is checked AND price mode is "Our" or "Wholesale", prints a second bill with retail prices (with optional retail price adjustment: fixed or percent markup).

**Requirements:**

**Frontend:**
- "Print Bill" checkbox in payment modal must be functional (not just UI)
- Implement browser-based thermal bill printing via `window.print()` with a dedicated print CSS or via a receipt-formatted HTML template
- Print format (matching Windows app):
  - Company name + address header
  - Bill No, Date, Cashier, Customer
  - Item table: No. | Product | Unit | Qty | Price | Total
  - Subtotal, Discount (if any), Delivery Charge (if any), Total
  - Payment Method, Paid Amount, Change/Balance
  - Card details (Bank, Card type, masked number) if card payment
  - Credit balance change summary if credit payment
  - Footer: thank you message
- "Print Retail Bill Also" checkbox: only visible when price mode is `"our"` or `"wholesale"`. When checked, prints an additional retail-price copy after the main bill.
- **Retail price adjustment**: When printing retail bill, allow optional fixed (+X) or percentage (+X%) markup to the retail price (UI: two radio buttons + number input, visible only when "Print Retail Bill Also" is checked).

**Backend:**
- `GET /admin/sales/:id/receipt` — returns receipt data (company info + sale details) formatted for printing (JSON). Frontend renders it.

---

### 2.12 Cash Drawer Integration

**What Windows does:** After successful payment, sends ESC/p bytes (`27 112 0 25 250`) to the default thermal printer via Win32 `OpenPrinter` + `WritePrinter`. Tries multiple command variants if first fails.

**Web adaptation:**
- Web browsers cannot directly send raw bytes to a USB printer
- **Option A (Recommended):** Use [Web Serial API](https://developer.mozilla.org/en-US/docs/Web/API/Serial) when available (Chrome/Edge only). Provide "Connect Cash Drawer" button in POS settings; after connecting, send ESC/p bytes on successful checkout.
- **Option B:** Provide a companion local print agent (small Node.js or Electron app running locally) that the web app calls via `localhost` HTTP to trigger the cash drawer.
- **Option C (Fallback):** Hide cash drawer feature if not supported; document the requirement for future native app integration.
- Implement as a configurable setting: `cashDrawerEnabled: boolean` in POS settings. If disabled, skip the drawer step silently.

---

### 2.13 Bill Number Generation

**What Windows does:** Bill number format = `{pricePrefix}{paymentCode}{yyMMddHHmm}{2 random digits}`. Price prefix: O (Our), R (Retail), W (Wholesale). Payment code: C (Cash), D (Card), R (Credit), O (COD). Checks for uniqueness in `sales` table.

**Requirements:**

**Backend:**
- Generate bill number server-side (never trust client-generated IDs for uniqueness)
- Format: `{MODE_PREFIX}{PAY_CODE}{YYMMDDHHMMSS}{3 random chars}` where MODE_PREFIX is O/R/W, PAY_CODE is C/D/R/O
- Uniqueness check with retry loop (up to 100 attempts)
- Backend returns bill number in sale response; frontend displays it in the success notification

**Frontend:**
- After successful checkout, show success modal with: Bill No, Total, Payment Method, Change (if Cash)
- Bill No displayed prominently for reference

---

### 2.14 Keyboard Shortcuts — Full Set

Extend current shortcuts to match the Windows app's full keyboard scheme:

| Key | Action |
|-----|--------|
| F1 (in payment modal) | Select Cash payment |
| F2 (in payment modal) | Select Card payment |
| F3 (in payment modal) | Select Credit payment |
| F4 (in payment modal) | Select COD payment |
| F5 | Focus customer search |
| F6 | Select Fixed discount + focus discount input |
| F7 | Select Percentage discount + focus discount input |
| F8 | Focus delivery charge input |
| F9 | Focus paid amount input |
| F10 | Focus tracking number input |
| F11 | Focus bank dropdown (when Card selected) |
| F12 | Toggle print bill checkbox (or focus card first digit if Card selected) |
| Tab / Shift+Tab | Cycle through payment form fields in order |
| Ctrl+↑/↓ | Navigate cart rows |
| Ctrl+Shift | Open weight entry for selected cart row (if weight-based) |
| Alt (single) | Focus product search bar |
| Esc | Close payment modal / close suggestion panel |
| Delete | Clear cart (when modal is closed) |
| Enter | Complete payment (when modal is open) |

---

### 2.15 COD Orders Management

**What Windows does:** A separate `CODOrders` form shows all sales with `payment_method = 'COD'` and `status = 'pending_delivery'`. Staff can mark them as delivered or cancelled.

**Requirements:**

**Frontend – Admin Panel (new page):**
- Route: `/cod-orders` under transactions section
- Table: Order No, Customer, Phone, Address, Items, Total, Date, Status, Actions
- "Mark Delivered" action: updates status to `delivered`, records delivery date
- "Cancel" action: cancels the order and restores stock

**Backend:**
- `GET /admin/pos/cod-orders` — list COD orders with filters (status, date range)
- `PATCH /admin/pos/cod-orders/:id/deliver` — mark as delivered
- `PATCH /admin/pos/cod-orders/:id/cancel` — cancel and restore stock

---

### 2.16 Product Auto-Refresh

**What Windows does:** A 30-second `refreshTimer` periodically reloads the products list while preserving the current search/category filter.

**Requirements:**

**Frontend (`POS.tsx`):**
- Add `useInterval` (or `setInterval` inside `useEffect`) to call `getProducts(...)` every 30 seconds
- Preserve current `selectedCategory` and `searchTerm` state when refreshing
- The refresh must NOT trigger the full-page loading spinner (use the "hasExisting" pattern already in `productStore.ts`)

---

## 3. Backend API Changes Summary

| Endpoint | Change |
|----------|--------|
| `POST /admin/pos/sale` | Add: `discount_type`, `discount_value`, `discount_amount`, `delivery_charge`, `card_bank`, `card_number`, `card_type`, `price_mode`, `tracking_number` |
| `POST /admin/pos/return` | Same additional fields as sale |
| `POST /admin/pos/hold` | **New:** Save cart as held bill |
| `GET /admin/pos/holds` | **New:** List held bills |
| `DELETE /admin/pos/holds/:id` | **New:** Delete held bill |
| `GET /admin/pos/settings` | **New:** Return `allow_no_stock_bills`, `price_mode_default`, `cash_drawer_enabled` |
| `GET /admin/sales` | **New:** Paginated sales history |
| `GET /admin/sales/:id` | **New:** Sale detail |
| `GET /admin/sales/:id/receipt` | **New:** Receipt data for printing |
| `GET /admin/products` | Ensure `our_price`, `wholesale_price`, `weight_grams` are returned |
| `GET /admin/pos/cod-orders` | **New:** COD orders list |
| `PATCH /admin/pos/cod-orders/:id/deliver` | **New:** Mark COD delivered |
| `PATCH /admin/pos/cod-orders/:id/cancel` | **New:** Cancel COD and restore stock |

---

## 4. Database Schema Changes

> All changes are on tenant schemas (per-tenant PostgreSQL schema).

### 4.1 `sales` table — add columns
```sql
ALTER TABLE sales ADD COLUMN IF NOT EXISTS discount_type    VARCHAR(10) DEFAULT 'fixed';
ALTER TABLE sales ADD COLUMN IF NOT EXISTS discount_value   DECIMAL(15,2) DEFAULT 0;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS discount_amount  DECIMAL(15,2) DEFAULT 0;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS delivery_charge  DECIMAL(15,2) DEFAULT 0;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS price_mode       VARCHAR(20) DEFAULT 'retail';
ALTER TABLE sales ADD COLUMN IF NOT EXISTS card_bank        VARCHAR(100);
ALTER TABLE sales ADD COLUMN IF NOT EXISTS card_number      VARCHAR(20);
ALTER TABLE sales ADD COLUMN IF NOT EXISTS card_type        VARCHAR(20);
ALTER TABLE sales ADD COLUMN IF NOT EXISTS tracking_number  VARCHAR(100);
ALTER TABLE sales ADD COLUMN IF NOT EXISTS bill_no          VARCHAR(50);
ALTER TABLE sales ADD COLUMN IF NOT EXISTS status          VARCHAR(30) DEFAULT 'completed';
```

### 4.2 `held_sales` table — new
```sql
CREATE TABLE IF NOT EXISTS held_sales (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id),
    cashier_id  UUID NOT NULL,
    items       JSONB NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    held_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    note        TEXT
);
```

### 4.3 `settings` table — add columns
```sql
ALTER TABLE settings ADD COLUMN IF NOT EXISTS allow_no_stock_bills BOOLEAN DEFAULT false;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS default_price_mode   VARCHAR(20) DEFAULT 'retail';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS cash_drawer_enabled  BOOLEAN DEFAULT false;
```

---

## 5. Frontend Component Structure (Proposed)

```
src/
├── pages/pos/
│   └── POS.tsx                         # (exists — enhance)
├── components/pos/
│   ├── PaymentModal.tsx                 # Extract from POS.tsx (exists inline)
│   ├── WeightEntryModal.tsx             # NEW: weight/decimal qty entry
│   ├── HeldBillsModal.tsx              # NEW: view/resume/delete held bills
│   ├── PriceModeSwitcher.tsx           # NEW: Our/Retail/Wholesale selector
│   ├── CardPaymentDetails.tsx          # NEW: bank + card digit inputs
│   ├── DiscountDeliverySection.tsx     # NEW: discount type/value + delivery
│   ├── POSReceipt.tsx                  # NEW: print-ready receipt component
│   └── CheckoutSuccessModal.tsx        # NEW: post-payment bill no + summary
├── pages/transactions/
│   ├── Sales.tsx                        # NEW: sales history page wrapper
│   ├── CODOrders.tsx                   # NEW: COD orders page wrapper
├── components/sales/
│   ├── SalesTable.tsx                  # NEW
│   ├── SaleDetailsModal.tsx            # NEW
│   └── SalesFilters.tsx               # NEW
├── components/cod/
│   ├── CODOrdersTable.tsx             # NEW
│   └── CODOrderDetailsModal.tsx       # NEW
├── store/transactions/
│   └── posStore.ts                     # Enhance (discount, delivery, card, weight, hold, priceMode)
├── services/transactions/
│   ├── posService.ts                   # Enhance (updated payload + new endpoints)
│   └── salesService.ts               # NEW: sales history + receipt
└── types/entities/
    ├── pos.types.ts                    # NEW: POS-specific type definitions
    └── sale.types.ts                  # NEW: Sale / SaleItem types
```

---

## 6. Implementation Priority

### Phase 1 – Core Payment Enhancements (High Impact, Low Risk)
1. Discount (fixed + percentage) — 2.2
2. Delivery Charge — 2.3
3. Card payment details (bank + card number + type detection) — 2.4
4. Bill number generation (backend) — 2.13
5. Cart weight calculation — 2.5

### Phase 2 – POS UX Features
6. Price Mode switching (Our/Retail/Wholesale) — 2.1
7. Barcode scanner support — 2.8
8. Weight-based quantity entry modal — 2.6
9. Full keyboard shortcut set — 2.14
10. Auto-refresh products every 30 seconds — 2.16

### Phase 3 – Hold / History / COD
11. Hold Bills (save, resume, delete) — 2.9
12. Sales History page — 2.10
13. COD Orders management — 2.15

### Phase 4 – Printing & Hardware
14. Receipt / bill printing (browser print) — 2.11
15. Allow No-Stock Bills setting — 2.7
16. Cash drawer integration (optional, Web Serial API) — 2.12

---

## 7. Notes and Constraints

- **Multi-tenant:** All new endpoints must use the tenant's schema via `search_path`. Held bills, sales, settings all live in tenant schema.
- **No-stock bills setting** should be configurable in the Admin > Settings page, not hardcoded.
- **Price mode** is per-user/session in Windows app. For web: per-session (Zustand + localStorage). It is NOT a system-wide setting.
- **COD orders** are existing sales records with `payment_method = 'COD'` and `status = 'pending_delivery'`. The COD orders page is a filtered view of the `sales` table.
- **Hold bills** are NOT completed sales — they should NOT deduct stock. They are temporary drafts.
- **Thermal printing** via the browser is limited to `window.print()`. Design the receipt as a hidden `@media print` div. Cash drawer hardware integration requires Web Serial API or a local agent.
- **Card type detection:** First digit `4` = VISA, `5` = Mastercard, `3` = Amex, `6` = Discover. This is client-side only (no real card processing).
- **Retail price adjustment** (Section 2.11): Only relevant for the secondary retail bill print. Store `retailPriceAdjustmentType` and `retailPriceAdjustmentValue` in component state (not store) — it's a print-time setting, not saved to DB.


16 Features to Add — each with what the Windows app does, what the web currently does, and specific frontend + backend requirements:

---- Price Mode (Our/Retail/Wholesale) — F3 currently does nothing
---- Discount (fixed/percent, F6/F7)
---- Delivery Charge (F8)
---- Card payment details (bank dropdown + card digits + type auto-detect)
---- Cart weight calculation (weight_grams per product)
---- Weight-based quantity modal (for Kg/L/m unit products)
---- Allow No-Stock Bills setting
---- Barcode scanner (HID input buffer pattern)
---- Hold Bills (save/resume/delete — currently broken, sends as a completed sale)
---- Sales History page
---- Receipt/bill printing + dual-bill (retail copy)
---- Cash drawer integration (Web Serial API approach)
---- Bill number generation (server-side, formatted)
---- Full keyboard shortcut table
---- COD Orders management page
---- Auto-refresh products every 30s