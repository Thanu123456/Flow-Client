# GRN (Goods Receipt Note) - Functional Requirements

## Document Information
- **Version**: 1.0
- **Last Updated**: 2026-02-04
- **Module**: Purchases Management / GRN
- **URL**: `/purchases` (List), `/purchases/add` (Create)
- **Access**: Users with "Create Purchase Orders" or "View Purchases" permission

---

## 1. Overview

### 1.1 Purpose
The GRN (Goods Receipt Note) module handles the recording of goods received from suppliers. It manages:
- Product receipt tracking
- Stock level updates
- Supplier payment tracking (Cash, Cheque, Credit)
- Price management (Cost, Retail, Wholesale, Our Price)
- Serial number tracking for applicable products
- Expiry date management
- Supplier credit/debit balance tracking

### 1.2 Business Rules
1. Each GRN is associated with a single supplier OR can be supplier-less (walk-in purchase)
2. Once a supplier is selected for a GRN, all items must be from the same supplier
3. Stock quantities are updated upon GRN completion
4. Prices can be updated during GRN entry (new prices vs old prices tracking)
5. Serial numbers are required for products marked as serialized
6. Expiry dates are optional but tracked when provided
7. Payment can be partial (Credit) or full (Cash/Cheque)
8. Cheque numbers must be unique across all GRNs
9. Post-dated cheques are supported with pending amount tracking

---

## 2. Database Schema

### 2.1 GRN Table (grn)
```sql
CREATE TABLE IF NOT EXISTS grn (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grn_number VARCHAR(50) NOT NULL UNIQUE,

    -- Supplier (optional - can be null for walk-in purchases)
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,

    -- Warehouse
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,

    -- Payment Details
    payment_method VARCHAR(20) NOT NULL DEFAULT 'cash'
        CONSTRAINT chk_grn_payment_method CHECK (payment_method IN ('cash', 'cheque', 'credit')),

    -- Amounts
    total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    net_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    paid_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,

    -- Supplier Balance Tracking
    debit_balance_used DECIMAL(15, 2) NOT NULL DEFAULT 0,
    credit_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,

    -- Cheque Details (when payment_method = 'cheque')
    cheque_number VARCHAR(50),
    cheque_date DATE,
    cheque_note TEXT,
    pending_cheque_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    is_post_dated BOOLEAN NOT NULL DEFAULT FALSE,

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'draft'
        CONSTRAINT chk_grn_status CHECK (status IN ('draft', 'completed', 'cancelled')),

    -- Metadata
    notes TEXT,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    grn_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,

    -- Constraints
    CONSTRAINT chk_cheque_required CHECK (
        payment_method != 'cheque' OR cheque_number IS NOT NULL
    ),
    CONSTRAINT chk_amounts CHECK (
        net_amount = total_amount - discount_amount AND
        net_amount >= 0
    )
);

-- Indexes
CREATE INDEX idx_grn_supplier ON grn(supplier_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_grn_warehouse ON grn(warehouse_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_grn_date ON grn(grn_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_grn_status ON grn(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_grn_payment_method ON grn(payment_method) WHERE deleted_at IS NULL;
CREATE INDEX idx_grn_cheque_number ON grn(cheque_number) WHERE cheque_number IS NOT NULL;
CREATE INDEX idx_grn_deleted_at ON grn(deleted_at) WHERE deleted_at IS NULL;

-- Update trigger
CREATE TRIGGER update_grn_updated_at
    BEFORE UPDATE ON grn
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 2.2 GRN Items Table (grn_items)
```sql
CREATE TABLE IF NOT EXISTS grn_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grn_id UUID NOT NULL REFERENCES grn(id) ON DELETE CASCADE,

    -- Product Details
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    variation_id UUID REFERENCES product_variations(id) ON DELETE RESTRICT,
    variation_type VARCHAR(100),

    -- Quantity & Unit
    quantity DECIMAL(15, 4) NOT NULL,
    unit_id UUID REFERENCES units(id) ON DELETE SET NULL,

    -- Pricing (at time of purchase)
    cost_price DECIMAL(15, 2) NOT NULL,
    retail_price DECIMAL(15, 2) NOT NULL DEFAULT 0,
    wholesale_price DECIMAL(15, 2) NOT NULL DEFAULT 0,
    our_price DECIMAL(15, 2) NOT NULL DEFAULT 0,
    net_price DECIMAL(15, 2) NOT NULL,

    -- Price Change Tracking
    is_new_price BOOLEAN NOT NULL DEFAULT FALSE,
    old_cost_price DECIMAL(15, 2),
    old_retail_price DECIMAL(15, 2),
    old_wholesale_price DECIMAL(15, 2),
    old_our_price DECIMAL(15, 2),

    -- Dates
    manufacture_date DATE,
    expiry_date DATE,

    -- Serial Number Tracking
    has_serial_numbers BOOLEAN NOT NULL DEFAULT FALSE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT chk_grn_item_quantity CHECK (quantity > 0),
    CONSTRAINT chk_grn_item_net_price CHECK (net_price = quantity * cost_price)
);

-- Indexes
CREATE INDEX idx_grn_items_grn ON grn_items(grn_id);
CREATE INDEX idx_grn_items_product ON grn_items(product_id);
CREATE INDEX idx_grn_items_variation ON grn_items(variation_id) WHERE variation_id IS NOT NULL;
CREATE INDEX idx_grn_items_expiry ON grn_items(expiry_date) WHERE expiry_date IS NOT NULL;

-- Update trigger
CREATE TRIGGER update_grn_items_updated_at
    BEFORE UPDATE ON grn_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 2.3 GRN Serial Numbers Table (grn_serial_numbers)
```sql
CREATE TABLE IF NOT EXISTS grn_serial_numbers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grn_item_id UUID NOT NULL REFERENCES grn_items(id) ON DELETE CASCADE,

    serial_number VARCHAR(100) NOT NULL,

    -- Status tracking
    status VARCHAR(20) NOT NULL DEFAULT 'in_stock'
        CONSTRAINT chk_serial_status CHECK (status IN ('in_stock', 'sold', 'returned', 'damaged')),

    -- Sale reference (when sold)
    sale_item_id UUID REFERENCES sale_items(id) ON DELETE SET NULL,
    sold_at TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Unique constraint per tenant
    CONSTRAINT uk_grn_serial_number UNIQUE (serial_number)
);

-- Indexes
CREATE INDEX idx_grn_serial_numbers_grn_item ON grn_serial_numbers(grn_item_id);
CREATE INDEX idx_grn_serial_numbers_status ON grn_serial_numbers(status);
CREATE INDEX idx_grn_serial_numbers_serial ON grn_serial_numbers(serial_number);
```

### 2.4 Stock Details Table (stock_details)
```sql
CREATE TABLE IF NOT EXISTS stock_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grn_item_id UUID NOT NULL REFERENCES grn_items(id) ON DELETE CASCADE,

    -- Remaining quantity from this GRN batch
    remaining_qty DECIMAL(15, 4) NOT NULL,

    -- Price tracking for FIFO/LIFO
    is_new_stock BOOLEAN NOT NULL DEFAULT FALSE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_stock_remaining CHECK (remaining_qty >= 0)
);

-- Indexes
CREATE INDEX idx_stock_details_grn_item ON stock_details(grn_item_id);
CREATE INDEX idx_stock_details_is_new ON stock_details(is_new_stock);
```

### 2.5 Supplier Transactions Table (supplier_transactions)
```sql
CREATE TABLE IF NOT EXISTS supplier_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    grn_id UUID REFERENCES grn(id) ON DELETE SET NULL,

    -- Transaction Type
    transaction_type VARCHAR(20) NOT NULL
        CONSTRAINT chk_supplier_txn_type CHECK (transaction_type IN ('credit', 'debit')),

    -- Amount
    amount DECIMAL(15, 2) NOT NULL,

    -- Description
    description TEXT,

    -- Balance after transaction
    balance_after DECIMAL(15, 2) NOT NULL,

    -- Timestamps
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_supplier_transactions_supplier ON supplier_transactions(supplier_id);
CREATE INDEX idx_supplier_transactions_grn ON supplier_transactions(grn_id) WHERE grn_id IS NOT NULL;
CREATE INDEX idx_supplier_transactions_date ON supplier_transactions(transaction_date);
```

---

## 3. API Endpoints

### 3.1 GRN Endpoints

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/api/admin/purchases` | List all GRNs (paginated) | View Purchases |
| GET | `/api/admin/purchases/:id` | Get GRN details | View Purchases |
| POST | `/api/admin/purchases` | Create new GRN | Create Purchase Orders |
| PUT | `/api/admin/purchases/:id` | Update GRN (draft only) | Create Purchase Orders |
| DELETE | `/api/admin/purchases/:id` | Delete GRN (draft only) | Create Purchase Orders |
| POST | `/api/admin/purchases/:id/complete` | Complete GRN | Approve Purchase Orders |
| POST | `/api/admin/purchases/:id/cancel` | Cancel GRN | Approve Purchase Orders |

### 3.2 GRN Item Endpoints

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| POST | `/api/admin/purchases/:id/items` | Add item to GRN | Create Purchase Orders |
| PUT | `/api/admin/purchases/:id/items/:itemId` | Update GRN item | Create Purchase Orders |
| DELETE | `/api/admin/purchases/:id/items/:itemId` | Remove item from GRN | Create Purchase Orders |

### 3.3 Supporting Endpoints

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/api/admin/products/search` | Search products for GRN | Create Purchase Orders |
| GET | `/api/admin/products/:id/pricing` | Get product pricing details | Create Purchase Orders |
| GET | `/api/admin/suppliers/:id/balance` | Get supplier balance | View Suppliers |
| POST | `/api/admin/purchases/:id/serial-numbers` | Add serial numbers | Create Purchase Orders |

---

## 4. Request/Response DTOs

### 4.1 Create GRN Request
```go
type CreateGRNRequest struct {
    WarehouseID   uuid.UUID  `json:"warehouse_id" binding:"required"`
    SupplierID    *uuid.UUID `json:"supplier_id,omitempty"`
    PaymentMethod string     `json:"payment_method" binding:"required,oneof=cash cheque credit"`
    Notes         string     `json:"notes,omitempty"`
    GRNDate       *time.Time `json:"grn_date,omitempty"`
}
```

### 4.2 Add GRN Item Request
```go
type AddGRNItemRequest struct {
    ProductID       uuid.UUID  `json:"product_id" binding:"required"`
    VariationID     *uuid.UUID `json:"variation_id,omitempty"`
    VariationType   string     `json:"variation_type,omitempty"`
    Quantity        float64    `json:"quantity" binding:"required,gt=0"`
    UnitID          *uuid.UUID `json:"unit_id,omitempty"`
    CostPrice       float64    `json:"cost_price" binding:"required,gte=0"`
    RetailPrice     float64    `json:"retail_price,omitempty" binding:"gte=0"`
    WholesalePrice  float64    `json:"wholesale_price,omitempty" binding:"gte=0"`
    OurPrice        float64    `json:"our_price,omitempty" binding:"gte=0"`
    ManufactureDate *string    `json:"manufacture_date,omitempty"`
    ExpiryDate      *string    `json:"expiry_date,omitempty"`
    HasSerialNumbers bool      `json:"has_serial_numbers,omitempty"`
}
```

### 4.3 Complete GRN Request
```go
type CompleteGRNRequest struct {
    DiscountAmount     float64  `json:"discount_amount,omitempty" binding:"gte=0"`
    PaidAmount         float64  `json:"paid_amount" binding:"gte=0"`
    ChequeNumber       string   `json:"cheque_number,omitempty"`
    ChequeDate         *string  `json:"cheque_date,omitempty"`
    ChequeNote         string   `json:"cheque_note,omitempty"`
    DebitBalanceUsed   float64  `json:"debit_balance_used,omitempty" binding:"gte=0"`
}
```

### 4.4 Add Serial Numbers Request
```go
type AddSerialNumbersRequest struct {
    GRNItemID     uuid.UUID `json:"grn_item_id" binding:"required"`
    SerialNumbers []string  `json:"serial_numbers" binding:"required,min=1"`
}
```

### 4.5 GRN Response
```go
type GRNResponse struct {
    ID                 uuid.UUID         `json:"id"`
    GRNNumber          string            `json:"grn_number"`
    WarehouseID        uuid.UUID         `json:"warehouse_id"`
    WarehouseName      string            `json:"warehouse_name"`
    SupplierID         *uuid.UUID        `json:"supplier_id,omitempty"`
    SupplierName       string            `json:"supplier_name,omitempty"`
    PaymentMethod      string            `json:"payment_method"`
    TotalAmount        decimal.Decimal   `json:"total_amount"`
    DiscountAmount     decimal.Decimal   `json:"discount_amount"`
    NetAmount          decimal.Decimal   `json:"net_amount"`
    PaidAmount         decimal.Decimal   `json:"paid_amount"`
    DebitBalanceUsed   decimal.Decimal   `json:"debit_balance_used"`
    CreditAmount       decimal.Decimal   `json:"credit_amount"`
    ChequeNumber       string            `json:"cheque_number,omitempty"`
    ChequeDate         *time.Time        `json:"cheque_date,omitempty"`
    ChequeNote         string            `json:"cheque_note,omitempty"`
    PendingChequeAmount decimal.Decimal  `json:"pending_cheque_amount"`
    IsPostDated        bool              `json:"is_post_dated"`
    Status             string            `json:"status"`
    Notes              string            `json:"notes,omitempty"`
    GRNDate            time.Time         `json:"grn_date"`
    Items              []GRNItemResponse `json:"items"`
    ItemCount          int               `json:"item_count"`
    TotalQuantity      decimal.Decimal   `json:"total_quantity"`
    CreatedBy          uuid.UUID         `json:"created_by"`
    CreatedByName      string            `json:"created_by_name"`
    ApprovedBy         *uuid.UUID        `json:"approved_by,omitempty"`
    ApprovedByName     string            `json:"approved_by_name,omitempty"`
    ApprovedAt         *time.Time        `json:"approved_at,omitempty"`
    CreatedAt          time.Time         `json:"created_at"`
    UpdatedAt          time.Time         `json:"updated_at"`
}
```

### 4.6 GRN Item Response
```go
type GRNItemResponse struct {
    ID              uuid.UUID       `json:"id"`
    ProductID       uuid.UUID       `json:"product_id"`
    ProductName     string          `json:"product_name"`
    ProductSKU      string          `json:"product_sku,omitempty"`
    ProductBarcode  string          `json:"product_barcode,omitempty"`
    ProductImage    string          `json:"product_image,omitempty"`
    VariationID     *uuid.UUID      `json:"variation_id,omitempty"`
    VariationType   string          `json:"variation_type,omitempty"`
    CategoryName    string          `json:"category_name,omitempty"`
    BrandName       string          `json:"brand_name,omitempty"`
    Quantity        decimal.Decimal `json:"quantity"`
    UnitID          *uuid.UUID      `json:"unit_id,omitempty"`
    UnitName        string          `json:"unit_name,omitempty"`
    UnitShortName   string          `json:"unit_short_name,omitempty"`
    CostPrice       decimal.Decimal `json:"cost_price"`
    RetailPrice     decimal.Decimal `json:"retail_price"`
    WholesalePrice  decimal.Decimal `json:"wholesale_price"`
    OurPrice        decimal.Decimal `json:"our_price"`
    NetPrice        decimal.Decimal `json:"net_price"`
    IsNewPrice      bool            `json:"is_new_price"`
    OldCostPrice    *decimal.Decimal `json:"old_cost_price,omitempty"`
    OldRetailPrice  *decimal.Decimal `json:"old_retail_price,omitempty"`
    OldWholesalePrice *decimal.Decimal `json:"old_wholesale_price,omitempty"`
    OldOurPrice     *decimal.Decimal `json:"old_our_price,omitempty"`
    ManufactureDate *time.Time      `json:"manufacture_date,omitempty"`
    ExpiryDate      *time.Time      `json:"expiry_date,omitempty"`
    HasSerialNumbers bool           `json:"has_serial_numbers"`
    SerialNumbers   []string        `json:"serial_numbers,omitempty"`
    CurrentStock    decimal.Decimal `json:"current_stock"`
}
```

### 4.7 GRN List Response
```go
type GRNListResponse struct {
    GRNs       []GRNListItem `json:"grns"`
    Total      int64         `json:"total"`
    Page       int           `json:"page"`
    PerPage    int           `json:"per_page"`
    TotalPages int           `json:"total_pages"`
}

type GRNListItem struct {
    ID            uuid.UUID       `json:"id"`
    GRNNumber     string          `json:"grn_number"`
    SupplierName  string          `json:"supplier_name,omitempty"`
    WarehouseName string          `json:"warehouse_name"`
    PaymentMethod string          `json:"payment_method"`
    TotalAmount   decimal.Decimal `json:"total_amount"`
    NetAmount     decimal.Decimal `json:"net_amount"`
    Status        string          `json:"status"`
    ItemCount     int             `json:"item_count"`
    GRNDate       time.Time       `json:"grn_date"`
    CreatedAt     time.Time       `json:"created_at"`
}
```

### 4.8 List Request
```go
type GRNListRequest struct {
    Page          int    `form:"page,default=1"`
    PerPage       int    `form:"per_page,default=10"`
    Search        string `form:"search,omitempty"`
    SupplierID    string `form:"supplier_id,omitempty"`
    WarehouseID   string `form:"warehouse_id,omitempty"`
    PaymentMethod string `form:"payment_method,omitempty"`
    Status        string `form:"status,omitempty"`
    DateFrom      string `form:"date_from,omitempty"`
    DateTo        string `form:"date_to,omitempty"`
    SortBy        string `form:"sort_by,omitempty"`
}
```

---

## 5. Frontend UI Specifications

### 5.1 GRN List Page (`/purchases`)

#### 5.1.1 Toolbar Actions
- **Add Purchase Button**: Redirects to `/purchases/add`
- **PDF Download**: Export GRN list as PDF
- **Excel Download**: Export GRN list as Excel (.xlsx)
- **Refresh Button**: Reload data and reset filters
- **Collapse Button**: Toggle header section visibility

#### 5.1.2 Search & Filter Section
- **Search Bar**: Search by GRN number, supplier name (real-time with 300ms debounce)
- **Payment Method Filter**: Dropdown (All, Cash, Cheque, Credit)
- **Status Filter**: Dropdown (All, Draft, Completed, Cancelled)
- **Warehouse Filter**: Dropdown (All Warehouses, specific warehouses)
- **Date Range Filter**: From date to To date pickers

#### 5.1.3 GRN Table
| Column | Description |
|--------|-------------|
| GRN Number | Unique identifier (e.g., GRN-2024-0001) |
| Supplier | Supplier name or "Walk-in Purchase" |
| Warehouse | Destination warehouse name |
| Payment Method | Badge (Cash/Cheque/Credit) |
| Total Amount | Formatted currency (LKR XX,XXX.XX) |
| Status | Badge (Draft/Completed/Cancelled) |
| Date | Format: DD MMM YYYY |
| Actions | View, Edit (draft only), Delete (draft only) |

#### 5.1.4 Actions
- **View**: Opens modal with complete GRN details
  - GRN header information
  - All items with details
  - Payment information
  - Serial numbers (if applicable)
  - Print GRN button
  - Download PDF button
- **Edit**: Redirects to edit page (only for draft status)
- **Delete**: Confirmation modal with soft delete (only for draft status)

#### 5.1.5 Pagination
- Items per page: 10, 25, 50, 100
- Show total count
- Navigate through pages

---

### 5.2 Add/Edit GRN Page (`/purchases/add`, `/purchases/:id/edit`)

#### 5.2.1 Page Layout
```
+----------------------------------------------------------+
|  [Refresh]  [Collapse]                    Add Purchase    |
+----------------------------------------------------------+
| GRN Header Section                                        |
| +------------------------------------------------------+ |
| | Warehouse: [Dropdown] *   |  Supplier: [Autocomplete] | |
| | GRN Date: [Date Picker]   |  Notes: [Text Area]       | |
| +------------------------------------------------------+ |
+----------------------------------------------------------+
| Product Selection Section                                 |
| +------------------------------------------------------+ |
| | [Product Search Bar - Autocomplete with Scanner]      | |
| +------------------------------------------------------+ |
| | Product Details (Auto-filled on selection)            | |
| | +--------------------------------------------------+ | |
| | | Product ID | Product Name | Category | Variation | | |
| | | Unit       | Stock        | Cost     | Retail    | | |
| | | Wholesale  | Our Price    | Qty      | Net Price | | |
| | | Mfg Date   | Expiry Date  | Serial?  |           | | |
| | +--------------------------------------------------+ | |
| | [Add to List] [Reset]                                 | |
| +------------------------------------------------------+ |
+----------------------------------------------------------+
| GRN Items Table                                           |
| +------------------------------------------------------+ |
| | Product | Variation | Qty | Cost | Net | Expiry | X  | |
| +------------------------------------------------------+ |
+----------------------------------------------------------+
| Payment Section                                           |
| +------------------------------------------------------+ |
| | Total Amount: XXXXX  |  Discount: [Input]             | |
| | Supplier Balance: XX |  Net Amount: XXXXX             | |
| | Payment Method: (o)Cash (o)Cheque (o)Credit           | |
| | Paid Amount: [Input] |  Cheque No: [Input if cheque]  | |
| +------------------------------------------------------+ |
| [Save Draft] [Complete GRN] [Reset]                       |
+----------------------------------------------------------+
```

#### 5.2.2 GRN Header Section

**Warehouse Selection (Required)**
- Dropdown with all active warehouses
- Placeholder: "Select Warehouse"
- Required validation

**Supplier Selection (Optional)**
- Autocomplete search field
- Search by supplier name, company, phone
- Shows supplier balance on selection
- Can be left empty for walk-in purchases
- Once first item is added with/without supplier, cannot change

**GRN Date**
- Date picker, defaults to today
- Cannot be future date

**Notes**
- Optional text area for additional comments

#### 5.2.3 Product Selection Section

**Product Search Bar**
- Autocomplete with 300ms debounce
- Search by: Product name, SKU, Barcode, Product ID
- Supports barcode scanner input (USB/Bluetooth ready)
- Display format: `PRO001 - Product Name - Variation (if any)`
- On selection, auto-fill product details

**Auto-filled Fields (Read-only)**
- Product ID: Format `PROXXX`
- Product Name
- Category
- Variation Name (if variable product)
- Unit
- Current Stock

**Variation Type Selection**
- Dropdown (enabled only for variable products)
- Lists all variation types for selected product
- On change, updates pricing and stock

**Editable Pricing Fields**
- Cost Price (Required, decimal)
- Retail Price (Optional, decimal)
- Wholesale Price (Optional, decimal)
- Our Price (Optional, decimal)
- **Smart Loading**: Show new_price if > 0, otherwise old_price
- Changes are tracked as `is_new_price = true`

**Quantity & Net Price**
- Quantity (Required, > 0)
- Net Price (Auto-calculated: Quantity × Cost Price)

**Date Fields**
- Manufacture Date (Optional, date picker)
- Expiry Date (Optional, date picker with checkbox to enable)
  - Warning if expiry < 6 months from now

**Serial Number Checkbox**
- "Requires Serial Numbers" toggle
- If enabled, opens serial number entry modal on add

**Action Buttons**
- **Add to List**: Validates and adds to items table
  - If serial numbers required, opens serial entry modal first
  - If product already in list (same variation), increments quantity
- **Reset**: Clears product selection fields

#### 5.2.4 Serial Number Entry Modal
```
+--------------------------------------------+
|  Add Serial Numbers for [Product Name]     |
+--------------------------------------------+
| Quantity Required: 5                        |
|                                            |
| Serial Number 1: [______________]          |
| Serial Number 2: [______________]          |
| Serial Number 3: [______________]          |
| Serial Number 4: [______________]          |
| Serial Number 5: [______________]          |
|                                            |
| [Scan Mode: ON/OFF]                        |
|                                            |
| [Cancel]                      [Save]       |
+--------------------------------------------+
```
- Number of fields matches quantity
- Validates uniqueness across entire system
- Scan mode: Auto-focus to next field after entry
- Cannot save without all serial numbers

#### 5.2.5 GRN Items Table

| Column | Description |
|--------|-------------|
| Product Image | Thumbnail |
| Product Name | With variation type if applicable |
| Unit | Unit name/short name |
| Quantity | Editable number |
| Serial Number | "Yes"/"No" indicator |
| Expiry Date | Date or "N/A" |
| Cost Price | Per unit |
| Net Price | Quantity × Cost |
| Delete | Remove from list (X icon) |

**Features**
- Inline editing of quantity (recalculates net price)
- Delete confirmation for items with serial numbers
- Running totals displayed

#### 5.2.6 Payment Section

**Summary Display**
- Total Cost Value: Sum of all net prices (auto-updates)
- Supplier Discount: Editable input (fixed amount)
- Supplier Balance:
  - Positive = We owe supplier (Credit)
  - Negative = Supplier owes us (Debit, can be used)
- Net Amount: Total - Discount

**Payment Method Selection (Radio Buttons)**

**Cash Payment**
- Paid Amount field (editable)
- Without supplier: Must equal net amount
- With supplier:
  - Can use debit balance if available
  - Can be partial (remaining goes to credit)
  - Can exceed (creates new debit balance)

**Cheque Payment**
- Paid Amount field
- Cheque Number (Required, validated for uniqueness)
- Cheque Date (Optional, enables post-dated tracking)
- Cheque Note (Optional)
- Post-dated: If cheque date > today, sets `pending_cheque_amount`

**Credit Payment**
- Requires supplier selection
- Paid Amount (Optional, can be 0 or partial)
- Remaining amount added to supplier credit balance

#### 5.2.7 Action Buttons

**Save Draft**
- Saves GRN with status = 'draft'
- Does NOT update stock
- Does NOT update supplier balance
- Can be edited later

**Complete GRN**
- Validates all required fields
- Validates payment amounts based on method
- Creates supplier transactions (credit/debit)
- Updates product stock in warehouse
- Updates product pricing if changed
- Creates stock_details records
- Sets status = 'completed'
- Shows success with GRN number
- Option to print GRN receipt

**Reset**
- Clears all fields
- Requires confirmation if items exist

---

### 5.3 View GRN Modal

```
+----------------------------------------------------------+
|  GRN Details - GRN-2024-0001                    [X Close] |
+----------------------------------------------------------+
| Header Information                                        |
| +--------------------------+---------------------------+ |
| | GRN Number: GRN-2024-0001| Date: 15 Jan 2024         | |
| | Warehouse: Main Store    | Status: Completed         | |
| | Supplier: ABC Traders    | Payment: Cash             | |
| | Created By: John Doe     | Created: 15 Jan 2024 10:30| |
| +--------------------------+---------------------------+ |
+----------------------------------------------------------+
| Items                                                     |
| +------------------------------------------------------+ |
| | # | Product      | Var  | Qty | Cost | Net    | Exp  | |
| | 1 | iPhone 15    | 128GB| 5   | 1000 | 5000   | N/A  | |
| | 2 | Samsung S24  | 256GB| 3   | 800  | 2400   | N/A  | |
| +------------------------------------------------------+ |
| | Serial Numbers for iPhone 15:                         | |
| | SN001, SN002, SN003, SN004, SN005                     | |
| +------------------------------------------------------+ |
+----------------------------------------------------------+
| Payment Summary                                           |
| +------------------------------------------------------+ |
| | Total Amount:         LKR 7,400.00                    | |
| | Discount:             LKR   100.00                    | |
| | Net Amount:           LKR 7,300.00                    | |
| | Debit Balance Used:   LKR   300.00                    | |
| | Paid Amount:          LKR 7,000.00                    | |
| | Credit Balance:       LKR     0.00                    | |
| +------------------------------------------------------+ |
+----------------------------------------------------------+
| [Print GRN]  [Download PDF]                    [Close]    |
+----------------------------------------------------------+
```

---

## 6. Business Logic & Validations

### 6.1 GRN Creation Validations
1. Warehouse must be selected
2. At least one item required to complete
3. Quantity must be > 0 for all items
4. Cost price must be >= 0
5. Net price must be positive
6. Expiry date must be in future if provided

### 6.2 Supplier Lock Logic
```
IF items exist in GRN:
    IF first item has supplier:
        Lock supplier - all items must have same supplier
    ELSE:
        Lock as "no supplier" - no items can have supplier
```

### 6.3 Payment Validation Rules

**Cash Payment**
```
IF no supplier:
    paid_amount MUST EQUAL net_amount
ELSE:
    remaining = net_amount
    IF supplier has debit balance:
        debit_used = MIN(supplier_debit, remaining)
        remaining = remaining - debit_used
    IF paid_amount < remaining:
        credit_amount = remaining - paid_amount
    ELSE IF paid_amount > remaining:
        excess_payment = paid_amount - remaining
        # Creates new debit balance for supplier
```

**Cheque Payment**
```
cheque_number IS REQUIRED AND UNIQUE
IF no supplier:
    paid_amount MUST EQUAL net_amount
ELSE:
    # Same logic as cash
IF cheque_date > today:
    is_post_dated = true
    pending_cheque_amount = paid_amount
    actual_paid_amount = 0
```

**Credit Payment**
```
REQUIRES supplier
IF paid_amount == 0:
    credit_amount = net_amount
ELSE IF paid_amount < net_amount:
    credit_amount = net_amount - paid_amount
ELSE:
    REJECT - paid_amount cannot exceed net_amount for credit
```

### 6.4 Stock Update Logic
On GRN completion:
```sql
-- Update main stock table
UPDATE stock
SET quantity = quantity + grn_item.quantity,
    updated_at = NOW()
WHERE product_id = grn_item.product_id
  AND warehouse_id = grn.warehouse_id
  AND (variation_id = grn_item.variation_id OR both are NULL);

-- Insert if not exists
INSERT INTO stock (product_id, warehouse_id, variation_id, quantity)
SELECT grn_item.product_id, grn.warehouse_id, grn_item.variation_id, grn_item.quantity
WHERE NOT EXISTS (SELECT 1 FROM stock WHERE ...);
```

### 6.5 Price Update Logic
```
When adding GRN item:
1. Fetch current prices from pricing table
2. Compare with entered prices
3. If any price differs and entered_price > 0:
   - Set is_new_price = true
   - Store old prices in old_* fields
   - On GRN completion, update pricing table's new_* fields
```

### 6.6 Supplier Transaction Recording
On GRN completion:
```sql
-- 1. Record purchase as credit (we owe supplier)
INSERT INTO supplier_transactions
(supplier_id, grn_id, transaction_type, amount, description, balance_after)
VALUES (supplier_id, grn_id, 'credit', net_amount, 'GRN Purchase',
        current_balance + net_amount);

-- 2. Record payment as debit (we paid supplier)
IF paid_amount > 0:
    INSERT INTO supplier_transactions
    (supplier_id, grn_id, transaction_type, amount, description, balance_after)
    VALUES (supplier_id, grn_id, 'debit', paid_amount, 'Payment',
            balance_after - paid_amount);

-- 3. Update supplier's outstanding_balance
UPDATE suppliers
SET outstanding_balance = (
    SELECT SUM(CASE WHEN transaction_type = 'credit' THEN amount ELSE -amount END)
    FROM supplier_transactions
    WHERE supplier_id = suppliers.id
)
WHERE id = supplier_id;
```

---

## 7. Error Codes

| Code | Message | HTTP Status |
|------|---------|-------------|
| GRN_001 | GRN not found | 404 |
| GRN_002 | Warehouse is required | 400 |
| GRN_003 | GRN must have at least one item | 400 |
| GRN_004 | Supplier mismatch - all items must have same supplier | 400 |
| GRN_005 | Invalid quantity - must be greater than 0 | 400 |
| GRN_006 | Cheque number is required for cheque payment | 400 |
| GRN_007 | Cheque number already exists | 400 |
| GRN_008 | Credit payment requires supplier | 400 |
| GRN_009 | Paid amount cannot exceed net amount for credit payment | 400 |
| GRN_010 | Paid amount must equal net amount for cash without supplier | 400 |
| GRN_011 | Cannot edit completed GRN | 400 |
| GRN_012 | Cannot delete completed GRN | 400 |
| GRN_013 | Serial number already exists | 400 |
| GRN_014 | Serial numbers count must match quantity | 400 |
| GRN_015 | Post-dated cheques require supplier | 400 |
| GRN_016 | Product not found | 404 |
| GRN_017 | Variation not found | 404 |
| GRN_018 | Insufficient data to complete GRN | 400 |
| GRN_019 | Failed to update stock | 500 |
| GRN_020 | Failed to record supplier transaction | 500 |

---

## 8. Audit Logging

### 8.1 Audit Actions
```go
const (
    AuditActionGRNCreated     = "grn_created"
    AuditActionGRNUpdated     = "grn_updated"
    AuditActionGRNCompleted   = "grn_completed"
    AuditActionGRNCancelled   = "grn_cancelled"
    AuditActionGRNDeleted     = "grn_deleted"
    AuditActionGRNItemAdded   = "grn_item_added"
    AuditActionGRNItemUpdated = "grn_item_updated"
    AuditActionGRNItemRemoved = "grn_item_removed"
)
```

### 8.2 Audit Log Format
```go
s.auditRepo.Log(ctx, &masterRepo.AuditLogEntry{
    UserID:       userID,
    TenantID:     &tenantID,
    Action:       constants.AuditActionGRNCreated,
    ResourceType: "grn",
    ResourceID:   grn.ID,
    Description:  fmt.Sprintf("Created GRN: %s for supplier: %s", grn.GRNNumber, supplierName),
    IPAddress:    ip,
    UserAgent:    userAgent,
    OldValue:     nil, // JSON of previous state for updates
    NewValue:     grnJSON, // JSON of new state
})
```

---

## 9. Performance Considerations

### 9.1 Database Indexes
- Composite index on `(product_id, warehouse_id, variation_id)` for stock lookups
- Index on `grn_number` for search
- Index on `supplier_id` for supplier filtering
- Index on `grn_date` for date range queries
- Index on `status` for status filtering

### 9.2 Query Optimization
- Use pagination for all list queries (max 100 per page)
- Eager load related data (supplier, warehouse, items) in single query
- Cache frequently accessed data (warehouses, units)
- Use database views for complex GRN list queries

### 9.3 Batch Operations
- Batch insert for GRN items
- Batch insert for serial numbers
- Single transaction for GRN completion (atomic operation)

---

## 10. File Structure

```
internal/
├── database/
│   └── migrations/
│       └── tenant/
│           └── 000005_create_grn_tables.up.sql
│           └── 000005_create_grn_tables.down.sql
├── models/
│   └── tenant/
│       ├── grn.go
│       ├── grn_item.go
│       ├── grn_serial_number.go
│       ├── stock_detail.go
│       └── supplier_transaction.go
├── dto/
│   ├── request/
│   │   └── transactions/
│   │       └── grn_request.go
│   └── response/
│       └── transactions/
│           └── grn_response.go
├── repositories/
│   └── tenant/
│       ├── grn_repository.go
│       ├── grn_item_repository.go
│       └── supplier_transaction_repository.go
├── services/
│   └── transactions/
│       └── grn_service.go
├── handlers/
│   └── transactions/
│       └── grn_handler.go
└── router/
    └── admin_routes.go (add GRN routes)
```

---

## 11. Integration Points

### 11.1 Stock Service
- `UpdateStock(productID, warehouseID, variationID, quantity, isAddition)`
- `GetStock(productID, warehouseID, variationID)`

### 11.2 Product Service
- `GetProductPricing(productID, variationID)`
- `UpdateProductPricing(productID, variationID, prices)`
- `SearchProducts(query, includeVariations)`

### 11.3 Supplier Service
- `GetSupplierBalance(supplierID)`
- `UpdateSupplierBalance(supplierID, amount, isCredit)`

### 11.4 Payment Service (Future)
- `RecordPayment(entityType, entityID, amount, method)`
- `ProcessCheque(chequeNumber, amount, date)`

---

## 12. Future Enhancements (Phase 2)

1. **GRN Approval Workflow**: Draft → Pending Approval → Approved → Received
2. **Purchase Orders**: Link GRN to purchase orders
3. **Partial Receipts**: Receive partial quantities from PO
4. **Quality Check**: QC status and rejection tracking
5. **GRN Templates**: Save common supplier orders as templates
6. **Batch/Lot Tracking**: Track batches for traceability
7. **Auto-Reorder**: Trigger GRN suggestions based on low stock
8. **Mobile GRN Entry**: Mobile app for warehouse receiving
9. **Supplier Portal**: Suppliers can view their GRNs
10. **EDI Integration**: Electronic data interchange with suppliers

---

## 13. Testing Scenarios

### 13.1 Unit Tests
- GRN creation with valid data
- GRN creation without warehouse (should fail)
- Add item to GRN
- Supplier lock validation
- Payment calculation for each method
- Serial number uniqueness validation
- Stock update on completion

### 13.2 Integration Tests
- Complete GRN workflow (create → add items → complete)
- Supplier balance updates after GRN
- Stock level updates after GRN
- Price change tracking
- Cheque uniqueness across GRNs

### 13.3 E2E Tests
- Create GRN via UI
- Search and select product
- Add serial numbers
- Complete payment
- View GRN details
- Print/Export GRN

---

## Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-04 | System | Initial document created |

---

**End of Document**
