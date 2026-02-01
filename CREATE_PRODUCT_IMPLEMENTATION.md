# Create Product - Implementation Documentation

**Version:** 1.0
**Date:** January 2026
**Module:** Inventory Management
**URL:** `/api/v1/admin/products`

---

## Table of Contents

1. [Overview](#1-overview)
2. [Database Schema](#2-database-schema)
3. [API Endpoints](#3-api-endpoints)
4. [Request/Response DTOs](#4-requestresponse-dtos)
5. [Business Logic & Validation](#5-business-logic--validation)
6. [Implementation Layers](#6-implementation-layers)
7. [File Structure](#7-file-structure)
8. [Code Examples](#8-code-examples)
9. [Testing Checklist](#9-testing-checklist)
10. [Error Codes](#10-error-codes)

---

## 1. Overview

### 1.1 Feature Description

The Create Product feature allows users to add products to the POS system. Products can be of two types:

| Product Type | Description |
|--------------|-------------|
| **Single Item** | Standard product without variations (e.g., "Coca-Cola 500ml") |
| **Variable Item** | Product with variations like Size, Color, Material (e.g., "T-Shirt" with sizes S, M, L, XL) |

### 1.2 User Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CREATE PRODUCT FLOW                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1. User enters Basic Information                                       │
│     ├── Product Name (required)                                         │
│     ├── Category (required)                                             │
│     ├── Sub-Category (required)                                         │
│     ├── Brand (optional)                                                │
│     ├── Unit (required)                                                 │
│     ├── Warehouse (optional)                                            │
│     └── Warranty (optional)                                             │
│                                                                         │
│  2. User selects Product Type                                           │
│     ├── Single Item ──────────────► Enter Single Product Details        │
│     │                               ├── SKU, Barcode                    │
│     │                               ├── Cost Price, Selling Prices      │
│     │                               ├── Discount Settings               │
│     │                               └── Quantity Alert                  │
│     │                                                                   │
│     └── Variable Item ───────────► Select Variation Type                │
│                                    ├── Add Variation Values             │
│                                    └── For EACH value, enter:           │
│                                        ├── SKU, Barcode                 │
│                                        ├── Cost Price, Selling Prices   │
│                                        ├── Discount Settings            │
│                                        └── Item Image                   │
│                                                                         │
│  3. Submit → Validate → Save to Database                                │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.3 Key Features

- Support for both single and variable products
- Multiple pricing tiers (Cost, Wholesale, Retail, Our Price)
- Flexible discount system (Fixed/Percentage)
- SKU auto-generation if not provided
- Multiple image support (main product + per variation)
- Stock alert threshold configuration
- Warehouse assignment
- Barcode support

---

## 2. Database Schema

### 2.1 Existing Tables Used

```sql
-- Already exists in tenant schema
- categories
- subcategories
- brands
- units
- warehouses
- warranties
- variations
- variation_options
```

### 2.2 Products Table (Existing - Verify/Update)

```sql
-- Location: internal/database/migrations/tenant/

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Basic Information
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100) UNIQUE,
    barcode VARCHAR(100),

    -- Relationships
    category_id UUID NOT NULL REFERENCES categories(id),
    subcategory_id UUID NOT NULL REFERENCES subcategories(id),
    brand_id UUID REFERENCES brands(id),
    unit_id UUID NOT NULL REFERENCES units(id),
    warehouse_id UUID REFERENCES warehouses(id),
    warranty_id UUID REFERENCES warranties(id),

    -- Product Type
    product_type VARCHAR(20) NOT NULL DEFAULT 'single', -- 'single' or 'variable'

    -- Pricing (for single products)
    cost_price DECIMAL(15, 2) DEFAULT 0,
    wholesale_price DECIMAL(15, 2) DEFAULT 0,
    retail_price DECIMAL(15, 2) DEFAULT 0,
    our_price DECIMAL(15, 2) DEFAULT 0,

    -- Discount Settings
    discount_type VARCHAR(20), -- 'fixed' or 'percentage'
    discount_value DECIMAL(15, 2) DEFAULT 0,
    discount_applies_to VARCHAR(50)[], -- Array: ['wholesale', 'retail', 'our_price']

    -- Stock Settings
    quantity_alert INT DEFAULT 10,

    -- Tax Settings (if applicable)
    tax_type VARCHAR(20),
    tax_rate DECIMAL(5, 2) DEFAULT 0,

    -- Image
    image_url TEXT,

    -- Status & Audit
    is_active BOOLEAN DEFAULT true,
    created_by UUID NOT NULL,
    updated_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_products_sku ON products(sku) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_barcode ON products(barcode) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_category ON products(category_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_name ON products(name) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_active ON products(is_active) WHERE deleted_at IS NULL;
```

### 2.3 Product Variations Table (For Variable Products)

```sql
CREATE TABLE IF NOT EXISTS product_variations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variation_id UUID NOT NULL REFERENCES variations(id),

    -- Variation-specific details
    sku VARCHAR(100),
    barcode VARCHAR(100),

    -- Pricing
    cost_price DECIMAL(15, 2) NOT NULL DEFAULT 0,
    wholesale_price DECIMAL(15, 2) DEFAULT 0,
    retail_price DECIMAL(15, 2) DEFAULT 0,
    our_price DECIMAL(15, 2) DEFAULT 0,

    -- Discount Settings
    discount_type VARCHAR(20),
    discount_value DECIMAL(15, 2) DEFAULT 0,
    discount_applies_to VARCHAR(50)[],

    -- Stock Settings
    quantity_alert INT DEFAULT 10,

    -- Image
    image_url TEXT,

    -- Status
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,

    UNIQUE(product_id, variation_id)
);

-- Indexes
CREATE INDEX idx_product_variations_product ON product_variations(product_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_product_variations_sku ON product_variations(sku) WHERE deleted_at IS NULL;
```

### 2.4 Product Variation Options (Junction Table)

```sql
CREATE TABLE IF NOT EXISTS product_variation_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_variation_id UUID NOT NULL REFERENCES product_variations(id) ON DELETE CASCADE,
    variation_option_id UUID NOT NULL REFERENCES variation_options(id),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(product_variation_id, variation_option_id)
);

CREATE INDEX idx_pvo_variation ON product_variation_options(product_variation_id);
```

### 2.5 Stock Table (For Inventory Tracking)

```sql
CREATE TABLE IF NOT EXISTS stock (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id),

    quantity INT NOT NULL DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(product_id, warehouse_id)
);

-- For variable products
CREATE TABLE IF NOT EXISTS product_variation_stock (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_variation_id UUID NOT NULL REFERENCES product_variations(id) ON DELETE CASCADE,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id),

    quantity INT NOT NULL DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(product_variation_id, warehouse_id)
);
```

### 2.6 Entity Relationship Diagram

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│  categories │     │   brands    │     │    units     │
└──────┬──────┘     └──────┬──────┘     └──────┬───────┘
       │                   │                   │
       │    ┌──────────────┼───────────────────┤
       │    │              │                   │
       ▼    ▼              ▼                   ▼
┌──────────────────────────────────────────────────────┐
│                      products                         │
├──────────────────────────────────────────────────────┤
│ id, name, sku, barcode, product_type                 │
│ category_id, subcategory_id, brand_id, unit_id       │
│ warehouse_id, warranty_id                            │
│ cost_price, wholesale_price, retail_price, our_price │
│ discount_type, discount_value, discount_applies_to   │
│ quantity_alert, image_url, is_active                 │
└───────────────────────┬──────────────────────────────┘
                        │
          ┌─────────────┴─────────────┐
          │ (if product_type='variable')
          ▼
┌─────────────────────────────────────┐     ┌────────────────┐
│        product_variations           │────►│   variations   │
├─────────────────────────────────────┤     └────────┬───────┘
│ id, product_id, variation_id        │              │
│ sku, barcode, cost_price, etc.      │              ▼
└──────────────┬──────────────────────┘     ┌────────────────────┐
               │                            │  variation_options  │
               ▼                            └────────────────────┘
┌─────────────────────────────────────┐              ▲
│     product_variation_options       │──────────────┘
├─────────────────────────────────────┤
│ product_variation_id                │
│ variation_option_id                 │
└─────────────────────────────────────┘
```

---

## 3. API Endpoints

### 3.1 Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/admin/products` | Create new product |
| `GET` | `/api/v1/admin/products` | List products with pagination |
| `GET` | `/api/v1/admin/products/:id` | Get product details |
| `PUT` | `/api/v1/admin/products/:id` | Update product |
| `DELETE` | `/api/v1/admin/products/:id` | Soft delete product |
| `GET` | `/api/v1/admin/products/search` | Search products |
| `GET` | `/api/v1/admin/products/export/pdf` | Export to PDF |
| `GET` | `/api/v1/admin/products/export/excel` | Export to Excel |
| `POST` | `/api/v1/admin/products/import` | Import from CSV/Excel |
| `GET` | `/api/v1/admin/products/all` | List all (no pagination) |

### 3.2 Create Product Endpoint Details

```
POST /api/v1/admin/products
Authorization: Bearer <token>
Content-Type: application/json
```

#### Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | Bearer JWT token |
| `Content-Type` | Yes | `application/json` |

#### Authentication

- Requires valid JWT token
- User must have `add_products` permission
- Tenant schema automatically set via middleware

---

## 4. Request/Response DTOs

### 4.1 Create Product Request DTO

**File:** `internal/dto/request/inventory/product_request.go`

```go
package inventory

import (
    "github.com/google/uuid"
)

// CreateProductRequest - Main request for creating a product
type CreateProductRequest struct {
    // Basic Information
    Name          string     `json:"name" binding:"required,min=2,max=255"`
    Description   string     `json:"description" binding:"max=2000"`
    CategoryID    uuid.UUID  `json:"category_id" binding:"required"`
    SubcategoryID uuid.UUID  `json:"subcategory_id" binding:"required"`
    BrandID       *uuid.UUID `json:"brand_id"`
    UnitID        uuid.UUID  `json:"unit_id" binding:"required"`
    WarehouseID   *uuid.UUID `json:"warehouse_id"`
    WarrantyID    *uuid.UUID `json:"warranty_id"`

    // Product Type: "single" or "variable"
    ProductType string `json:"product_type" binding:"required,oneof=single variable"`

    // For Single Product
    SingleProduct *SingleProductRequest `json:"single_product"`

    // For Variable Product
    VariableProduct *VariableProductRequest `json:"variable_product"`
}

// SingleProductRequest - Details for single item product
type SingleProductRequest struct {
    SKU              string   `json:"sku" binding:"max=100"`
    Barcode          string   `json:"barcode" binding:"max=100"`
    CostPrice        float64  `json:"cost_price" binding:"required,gte=0"`
    WholesalePrice   float64  `json:"wholesale_price" binding:"gte=0"`
    RetailPrice      float64  `json:"retail_price" binding:"gte=0"`
    OurPrice         float64  `json:"our_price" binding:"gte=0"`
    DiscountType     string   `json:"discount_type" binding:"omitempty,oneof=fixed percentage"`
    DiscountValue    float64  `json:"discount_value" binding:"gte=0"`
    DiscountAppliesTo []string `json:"discount_applies_to"` // ["wholesale", "retail", "our_price"]
    QuantityAlert    int      `json:"quantity_alert" binding:"gte=0"`
    ImageURL         string   `json:"image_url"`
}

// VariableProductRequest - Details for variable item product
type VariableProductRequest struct {
    VariationID uuid.UUID                    `json:"variation_id" binding:"required"`
    Variations  []ProductVariationItemRequest `json:"variations" binding:"required,min=1,dive"`
}

// ProductVariationItemRequest - Each variation item details
type ProductVariationItemRequest struct {
    VariationOptionIDs []uuid.UUID `json:"variation_option_ids" binding:"required,min=1"`
    SKU                string      `json:"sku" binding:"max=100"`
    Barcode            string      `json:"barcode" binding:"max=100"`
    CostPrice          float64     `json:"cost_price" binding:"required,gte=0"`
    WholesalePrice     float64     `json:"wholesale_price" binding:"gte=0"`
    RetailPrice        float64     `json:"retail_price" binding:"gte=0"`
    OurPrice           float64     `json:"our_price" binding:"gte=0"`
    DiscountType       string      `json:"discount_type" binding:"omitempty,oneof=fixed percentage"`
    DiscountValue      float64     `json:"discount_value" binding:"gte=0"`
    DiscountAppliesTo  []string    `json:"discount_applies_to"`
    QuantityAlert      int         `json:"quantity_alert" binding:"gte=0"`
    ImageURL           string      `json:"image_url"`
}
```

### 4.2 Sample Request Body - Single Product

```json
{
    "name": "Coca-Cola 500ml",
    "description": "Refreshing carbonated soft drink",
    "category_id": "550e8400-e29b-41d4-a716-446655440001",
    "subcategory_id": "550e8400-e29b-41d4-a716-446655440002",
    "brand_id": "550e8400-e29b-41d4-a716-446655440003",
    "unit_id": "550e8400-e29b-41d4-a716-446655440004",
    "warehouse_id": "550e8400-e29b-41d4-a716-446655440005",
    "warranty_id": null,
    "product_type": "single",
    "single_product": {
        "sku": "COC-500-001",
        "barcode": "8901234567890",
        "cost_price": 120.00,
        "wholesale_price": 140.00,
        "retail_price": 160.00,
        "our_price": 150.00,
        "discount_type": "percentage",
        "discount_value": 5.00,
        "discount_applies_to": ["retail", "our_price"],
        "quantity_alert": 50,
        "image_url": "https://dropbox.com/images/coca-cola.jpg"
    },
    "variable_product": null
}
```

### 4.3 Sample Request Body - Variable Product

```json
{
    "name": "Cotton T-Shirt",
    "description": "Premium quality cotton t-shirt",
    "category_id": "550e8400-e29b-41d4-a716-446655440001",
    "subcategory_id": "550e8400-e29b-41d4-a716-446655440002",
    "brand_id": "550e8400-e29b-41d4-a716-446655440003",
    "unit_id": "550e8400-e29b-41d4-a716-446655440004",
    "warehouse_id": "550e8400-e29b-41d4-a716-446655440005",
    "warranty_id": null,
    "product_type": "variable",
    "single_product": null,
    "variable_product": {
        "variation_id": "550e8400-e29b-41d4-a716-446655440010",
        "variations": [
            {
                "variation_option_ids": ["550e8400-e29b-41d4-a716-446655440011"],
                "sku": "TSH-S-001",
                "barcode": "8901234567891",
                "cost_price": 500.00,
                "wholesale_price": 650.00,
                "retail_price": 800.00,
                "our_price": 750.00,
                "discount_type": "fixed",
                "discount_value": 50.00,
                "discount_applies_to": ["retail"],
                "quantity_alert": 20,
                "image_url": "https://dropbox.com/images/tshirt-small.jpg"
            },
            {
                "variation_option_ids": ["550e8400-e29b-41d4-a716-446655440012"],
                "sku": "TSH-M-001",
                "barcode": "8901234567892",
                "cost_price": 500.00,
                "wholesale_price": 650.00,
                "retail_price": 800.00,
                "our_price": 750.00,
                "discount_type": "fixed",
                "discount_value": 50.00,
                "discount_applies_to": ["retail"],
                "quantity_alert": 20,
                "image_url": "https://dropbox.com/images/tshirt-medium.jpg"
            },
            {
                "variation_option_ids": ["550e8400-e29b-41d4-a716-446655440013"],
                "sku": "TSH-L-001",
                "barcode": "8901234567893",
                "cost_price": 550.00,
                "wholesale_price": 700.00,
                "retail_price": 850.00,
                "our_price": 800.00,
                "discount_type": "fixed",
                "discount_value": 50.00,
                "discount_applies_to": ["retail"],
                "quantity_alert": 20,
                "image_url": "https://dropbox.com/images/tshirt-large.jpg"
            }
        ]
    }
}
```

### 4.4 Response DTOs

**File:** `internal/dto/response/inventory/product_response.go`

```go
package inventory

import (
    "time"
    "github.com/google/uuid"
)

// ProductResponse - Single product response
type ProductResponse struct {
    ID              uuid.UUID  `json:"id"`
    Name            string     `json:"name"`
    Description     string     `json:"description"`
    SKU             string     `json:"sku"`
    Barcode         string     `json:"barcode"`
    ProductType     string     `json:"product_type"`

    // Relationships
    CategoryID      uuid.UUID  `json:"category_id"`
    CategoryName    string     `json:"category_name"`
    SubcategoryID   uuid.UUID  `json:"subcategory_id"`
    SubcategoryName string     `json:"subcategory_name"`
    BrandID         *uuid.UUID `json:"brand_id"`
    BrandName       string     `json:"brand_name"`
    UnitID          uuid.UUID  `json:"unit_id"`
    UnitName        string     `json:"unit_name"`
    UnitShortName   string     `json:"unit_short_name"`
    WarehouseID     *uuid.UUID `json:"warehouse_id"`
    WarehouseName   string     `json:"warehouse_name"`
    WarrantyID      *uuid.UUID `json:"warranty_id"`
    WarrantyName    string     `json:"warranty_name"`

    // Pricing
    CostPrice       float64    `json:"cost_price"`
    WholesalePrice  float64    `json:"wholesale_price"`
    RetailPrice     float64    `json:"retail_price"`
    OurPrice        float64    `json:"our_price"`

    // Discount
    DiscountType      string   `json:"discount_type"`
    DiscountValue     float64  `json:"discount_value"`
    DiscountAppliesTo []string `json:"discount_applies_to"`

    // Stock
    QuantityAlert int `json:"quantity_alert"`
    CurrentStock  int `json:"current_stock"`

    // Image
    ImageURL string `json:"image_url"`

    // Status & Audit
    IsActive  bool      `json:"is_active"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`

    // Variations (only for variable products)
    Variations []ProductVariationResponse `json:"variations,omitempty"`
}

// ProductVariationResponse - Variation details in response
type ProductVariationResponse struct {
    ID                 uuid.UUID                       `json:"id"`
    VariationID        uuid.UUID                       `json:"variation_id"`
    VariationName      string                          `json:"variation_name"`
    Options            []VariationOptionResponse       `json:"options"`
    SKU                string                          `json:"sku"`
    Barcode            string                          `json:"barcode"`
    CostPrice          float64                         `json:"cost_price"`
    WholesalePrice     float64                         `json:"wholesale_price"`
    RetailPrice        float64                         `json:"retail_price"`
    OurPrice           float64                         `json:"our_price"`
    DiscountType       string                          `json:"discount_type"`
    DiscountValue      float64                         `json:"discount_value"`
    DiscountAppliesTo  []string                        `json:"discount_applies_to"`
    QuantityAlert      int                             `json:"quantity_alert"`
    CurrentStock       int                             `json:"current_stock"`
    ImageURL           string                          `json:"image_url"`
    IsActive           bool                            `json:"is_active"`
}

// VariationOptionResponse - Variation option in response
type VariationOptionResponse struct {
    ID    uuid.UUID `json:"id"`
    Value string    `json:"value"`
}

// ProductListResponse - Paginated list response
type ProductListResponse struct {
    Products []ProductListItem `json:"products"`
    Total    int64             `json:"total"`
}

// ProductListItem - Item in product list
type ProductListItem struct {
    ID              uuid.UUID  `json:"id"`
    Name            string     `json:"name"`
    SKU             string     `json:"sku"`
    ProductType     string     `json:"product_type"`
    CategoryName    string     `json:"category_name"`
    BrandName       string     `json:"brand_name"`
    UnitShortName   string     `json:"unit_short_name"`
    Price           float64    `json:"price"` // retail or our_price
    CurrentStock    int        `json:"current_stock"`
    QuantityAlert   int        `json:"quantity_alert"`
    ImageURL        string     `json:"image_url"`
    IsActive        bool       `json:"is_active"`
    VariationCount  int        `json:"variation_count"` // For variable products
}
```

### 4.5 Success Response Example

```json
{
    "success": true,
    "message": "Product created successfully",
    "data": {
        "id": "550e8400-e29b-41d4-a716-446655440100",
        "name": "Coca-Cola 500ml",
        "description": "Refreshing carbonated soft drink",
        "sku": "COC-500-001",
        "barcode": "8901234567890",
        "product_type": "single",
        "category_id": "550e8400-e29b-41d4-a716-446655440001",
        "category_name": "Beverages",
        "subcategory_id": "550e8400-e29b-41d4-a716-446655440002",
        "subcategory_name": "Soft Drinks",
        "brand_id": "550e8400-e29b-41d4-a716-446655440003",
        "brand_name": "Coca-Cola",
        "unit_id": "550e8400-e29b-41d4-a716-446655440004",
        "unit_name": "Piece",
        "unit_short_name": "Pcs",
        "warehouse_id": "550e8400-e29b-41d4-a716-446655440005",
        "warehouse_name": "Main Warehouse",
        "warranty_id": null,
        "warranty_name": "",
        "cost_price": 120.00,
        "wholesale_price": 140.00,
        "retail_price": 160.00,
        "our_price": 150.00,
        "discount_type": "percentage",
        "discount_value": 5.00,
        "discount_applies_to": ["retail", "our_price"],
        "quantity_alert": 50,
        "current_stock": 0,
        "image_url": "https://dropbox.com/images/coca-cola.jpg",
        "is_active": true,
        "created_at": "2026-01-21T10:30:00Z",
        "updated_at": "2026-01-21T10:30:00Z",
        "variations": null
    }
}
```

### 4.6 Error Response Example

```json
{
    "success": false,
    "error": {
        "code": "PRODUCT_SKU_EXISTS",
        "message": "A product with this SKU already exists",
        "details": "SKU 'COC-500-001' is already in use by another product"
    }
}
```

---

## 5. Business Logic & Validation

### 5.1 Validation Rules

#### Basic Information

| Field | Rule | Error Message |
|-------|------|---------------|
| `name` | Required, 2-255 chars | "Product name is required and must be 2-255 characters" |
| `category_id` | Required, must exist | "Category is required and must exist" |
| `subcategory_id` | Required, must exist, must belong to category | "Subcategory is required and must belong to selected category" |
| `brand_id` | Optional, if provided must exist | "Selected brand does not exist" |
| `unit_id` | Required, must exist | "Unit is required" |
| `warehouse_id` | Optional, if provided must exist | "Selected warehouse does not exist" |
| `warranty_id` | Optional, if provided must exist | "Selected warranty does not exist" |
| `product_type` | Required, must be 'single' or 'variable' | "Product type must be 'single' or 'variable'" |

#### Single Product

| Field | Rule | Error Message |
|-------|------|---------------|
| `sku` | Optional, max 100 chars, unique if provided | "SKU must be unique" |
| `barcode` | Optional, max 100 chars | "Barcode must be max 100 characters" |
| `cost_price` | Required, >= 0 | "Cost price is required and must be >= 0" |
| `wholesale_price` | Optional, >= 0 | "Wholesale price must be >= 0" |
| `retail_price` | Optional, >= 0 | "Retail price must be >= 0" |
| `our_price` | Optional, >= 0 | "Our price must be >= 0" |
| `discount_type` | Optional, must be 'fixed' or 'percentage' | "Discount type must be 'fixed' or 'percentage'" |
| `discount_value` | >= 0, if percentage max 100 | "Discount value must be valid" |
| `discount_applies_to` | Array of valid values | "Invalid discount application target" |
| `quantity_alert` | >= 0 | "Quantity alert must be >= 0" |

#### Variable Product

| Field | Rule | Error Message |
|-------|------|---------------|
| `variation_id` | Required, must exist | "Variation type is required" |
| `variations` | Required, min 1 item | "At least one variation is required" |
| Each variation | Same rules as single product | Same as single product |
| `variation_option_ids` | Required, min 1, must exist | "Variation options are required" |

### 5.2 Business Rules

```go
// Business Rules for Create Product
const (
    // SKU Rules
    SKUAutoGeneratePrefix = "PRD"
    SKUMaxLength         = 100

    // Discount Rules
    MaxPercentageDiscount = 100.0

    // Price Rules
    MinPrice = 0.0
)

// ValidateProductCreate - Business validation logic
func ValidateProductCreate(req *CreateProductRequest) []error {
    var errors []error

    // Rule 1: If product_type is "single", single_product must be provided
    if req.ProductType == "single" && req.SingleProduct == nil {
        errors = append(errors, fmt.Errorf("single product details required for single product type"))
    }

    // Rule 2: If product_type is "variable", variable_product must be provided
    if req.ProductType == "variable" && req.VariableProduct == nil {
        errors = append(errors, fmt.Errorf("variable product details required for variable product type"))
    }

    // Rule 3: Cost price should ideally be less than selling prices
    if req.SingleProduct != nil {
        if req.SingleProduct.CostPrice > req.SingleProduct.RetailPrice && req.SingleProduct.RetailPrice > 0 {
            // Warning: Not an error, but could log warning
        }
    }

    // Rule 4: Percentage discount cannot exceed 100%
    if req.SingleProduct != nil && req.SingleProduct.DiscountType == "percentage" {
        if req.SingleProduct.DiscountValue > 100 {
            errors = append(errors, fmt.Errorf("percentage discount cannot exceed 100%%"))
        }
    }

    // Rule 5: Subcategory must belong to the selected category
    // (Validated in service layer via DB query)

    // Rule 6: Variable product must have unique SKUs per variation
    if req.VariableProduct != nil {
        skus := make(map[string]bool)
        for _, v := range req.VariableProduct.Variations {
            if v.SKU != "" {
                if skus[v.SKU] {
                    errors = append(errors, fmt.Errorf("duplicate SKU in variations: %s", v.SKU))
                }
                skus[v.SKU] = true
            }
        }
    }

    return errors
}
```

### 5.3 SKU Auto-Generation

```go
// GenerateSKU - Auto-generate SKU if not provided
func GenerateSKU(productName string, categoryCode string) string {
    // Format: CAT-PRD-TIMESTAMP
    // Example: BEV-COCA-1705830600

    // Clean product name (first 4 chars, uppercase)
    cleanName := strings.ToUpper(regexp.MustCompile(`[^a-zA-Z0-9]`).ReplaceAllString(productName, ""))
    if len(cleanName) > 4 {
        cleanName = cleanName[:4]
    }

    timestamp := time.Now().Unix()

    return fmt.Sprintf("%s-%s-%d", categoryCode, cleanName, timestamp)
}

// GenerateVariationSKU - Auto-generate SKU for variation
func GenerateVariationSKU(baseSKU string, variationValue string) string {
    // Format: BASE-VAR
    // Example: TSH-001-SMALL

    cleanValue := strings.ToUpper(regexp.MustCompile(`[^a-zA-Z0-9]`).ReplaceAllString(variationValue, ""))
    if len(cleanValue) > 8 {
        cleanValue = cleanValue[:8]
    }

    return fmt.Sprintf("%s-%s", baseSKU, cleanValue)
}
```

---

## 6. Implementation Layers

### 6.1 Layer Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                         HTTP REQUEST                              │
│                    POST /api/v1/admin/products                    │
└───────────────────────────────┬──────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                      MIDDLEWARE CHAIN                             │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐  │
│  │    Auth    │→ │   Tenant   │→ │ Permission │→ │Rate Limit  │  │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘  │
└───────────────────────────────┬──────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                         HANDLER LAYER                             │
│  internal/handlers/inventory/product_handler.go                   │
│  • Extract context (tenant conn, user ID)                        │
│  • Bind & validate JSON request                                   │
│  • Call service layer                                            │
│  • Return standardized response                                   │
└───────────────────────────────┬──────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                         SERVICE LAYER                             │
│  internal/services/inventory/product_service.go                   │
│  • Business logic validation                                      │
│  • Orchestrate repository calls                                   │
│  • Handle transactions                                            │
│  • Audit logging                                                  │
│  • Transform models to DTOs                                       │
└───────────────────────────────┬──────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                       REPOSITORY LAYER                            │
│  internal/repositories/tenant/product_repository.go               │
│  • Execute SQLC queries                                          │
│  • Data access operations                                         │
│  • Validation queries (exists checks)                            │
└───────────────────────────────┬──────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                        DATABASE LAYER                             │
│  PostgreSQL (Tenant Schema)                                       │
│  internal/database/sqlc/tenant/                                   │
└──────────────────────────────────────────────────────────────────┘
```

### 6.2 Handler Implementation

**File:** `internal/handlers/inventory/product_handler.go`

```go
package inventory

import (
    "net/http"

    "github.com/gin-gonic/gin"
    "github.com/google/uuid"
    "github.com/jackc/pgx/v5/pgxpool"

    "flow-server/internal/config"
    reqDTO "flow-server/internal/dto/request/inventory"
    "flow-server/internal/middleware"
    inventoryService "flow-server/internal/services/inventory"
    "flow-server/internal/dto/response/common"
    "flow-server/pkg/errors"
)

type ProductHandler struct {
    productService *inventoryService.ProductService
    cfg            *config.Config
}

func NewProductHandler(productService *inventoryService.ProductService, cfg *config.Config) *ProductHandler {
    return &ProductHandler{
        productService: productService,
        cfg:            cfg,
    }
}

// CreateProduct handles POST /api/v1/admin/products
func (h *ProductHandler) CreateProduct(c *gin.Context) {
    // 1. Get tenant connection from context
    conn, err := h.getTenantConn(c)
    if err != nil {
        common.Error(c, errors.Unauthorized("TENANT_CONN_ERROR", "Failed to get tenant connection"))
        return
    }
    defer conn.Release()

    // 2. Get user ID and tenant ID from context
    userID, err := h.getUserID(c)
    if err != nil {
        common.Error(c, errors.Unauthorized("USER_ID_ERROR", "Failed to get user ID"))
        return
    }

    tenantID, err := h.getTenantID(c)
    if err != nil {
        common.Error(c, errors.Unauthorized("TENANT_ID_ERROR", "Failed to get tenant ID"))
        return
    }

    // 3. Bind and validate request
    var req reqDTO.CreateProductRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        common.ValidationError(c, err.Error())
        return
    }

    // 4. Get request metadata for audit
    ip := c.ClientIP()
    userAgent := c.GetHeader("User-Agent")

    // 5. Call service
    result, err := h.productService.CreateProduct(
        c.Request.Context(),
        conn,
        tenantID,
        &req,
        userID,
        ip,
        userAgent,
    )
    if err != nil {
        if appErr, ok := err.(*errors.AppError); ok {
            common.Error(c, appErr)
            return
        }
        common.Error(c, errors.Internal("CREATE_PRODUCT_ERROR", err.Error()))
        return
    }

    // 6. Return success response
    common.CreatedWithMessage(c, "Product created successfully", result)
}

// Helper methods
func (h *ProductHandler) getTenantConn(c *gin.Context) (*pgxpool.Conn, error) {
    return middleware.GetTenantConnFromContext(c)
}

func (h *ProductHandler) getUserID(c *gin.Context) (uuid.UUID, error) {
    userIDStr, exists := c.Get(middleware.ContextKeyUserID)
    if !exists {
        return uuid.Nil, fmt.Errorf("user ID not found")
    }
    return userIDStr.(uuid.UUID), nil
}

func (h *ProductHandler) getTenantID(c *gin.Context) (uuid.UUID, error) {
    tenantIDStr, exists := c.Get(middleware.ContextKeyTenantID)
    if !exists {
        return uuid.Nil, fmt.Errorf("tenant ID not found")
    }
    return tenantIDStr.(uuid.UUID), nil
}
```

### 6.3 Service Implementation

**File:** `internal/services/inventory/product_service.go`

```go
package inventory

import (
    "context"
    "fmt"
    "time"

    "github.com/google/uuid"
    "github.com/jackc/pgx/v5"
    "github.com/jackc/pgx/v5/pgxpool"

    "flow-server/internal/config"
    reqDTO "flow-server/internal/dto/request/inventory"
    respDTO "flow-server/internal/dto/response/inventory"
    masterRepo "flow-server/internal/repositories/master"
    tenantRepo "flow-server/internal/repositories/tenant"
    "flow-server/pkg/constants"
    "flow-server/pkg/errors"
)

type ProductService struct {
    cfg             *config.Config
    auditRepo       *masterRepo.AuditLogRepository
    productRepo     *tenantRepo.ProductRepository
    variationRepo   *tenantRepo.ProductVariationRepository
    categoryRepo    *tenantRepo.CategoryRepository
    subcategoryRepo *tenantRepo.SubcategoryRepository
    brandRepo       *tenantRepo.BrandRepository
    unitRepo        *tenantRepo.UnitRepository
    warehouseRepo   *tenantRepo.WarehouseRepository
    warrantyRepo    *tenantRepo.WarrantyRepository
    stockRepo       *tenantRepo.StockRepository
}

func NewProductService(
    cfg *config.Config,
    auditRepo *masterRepo.AuditLogRepository,
    productRepo *tenantRepo.ProductRepository,
    // ... other repos
) *ProductService {
    return &ProductService{
        cfg:             cfg,
        auditRepo:       auditRepo,
        productRepo:     productRepo,
        // ... initialize other repos
    }
}

// CreateProduct creates a new product (single or variable)
func (s *ProductService) CreateProduct(
    ctx context.Context,
    conn *pgxpool.Conn,
    tenantID uuid.UUID,
    req *reqDTO.CreateProductRequest,
    createdByID uuid.UUID,
    ip, userAgent string,
) (*respDTO.ProductResponse, error) {

    // 1. Validate relationships exist
    if err := s.validateRelationships(ctx, conn, req); err != nil {
        return nil, err
    }

    // 2. Validate product-type specific requirements
    if err := s.validateProductTypeRequirements(req); err != nil {
        return nil, err
    }

    // 3. Check for duplicate SKU
    if req.ProductType == "single" && req.SingleProduct.SKU != "" {
        exists, err := s.productRepo.SKUExists(ctx, conn, req.SingleProduct.SKU, nil)
        if err != nil {
            return nil, errors.Internal("SKU_CHECK_ERROR", err.Error())
        }
        if exists {
            return nil, errors.Conflict("PRODUCT_SKU_EXISTS", "A product with this SKU already exists")
        }
    }

    // 4. Generate SKU if not provided
    if req.ProductType == "single" && req.SingleProduct.SKU == "" {
        category, _ := s.categoryRepo.GetByID(ctx, conn, req.CategoryID)
        req.SingleProduct.SKU = s.generateSKU(req.Name, category.Code)
    }

    // 5. Start transaction
    tx, err := conn.Begin(ctx)
    if err != nil {
        return nil, errors.Internal("TX_BEGIN_ERROR", err.Error())
    }
    defer tx.Rollback(ctx)

    var product *respDTO.ProductResponse

    // 6. Create product based on type
    if req.ProductType == "single" {
        product, err = s.createSingleProduct(ctx, tx, req, createdByID)
    } else {
        product, err = s.createVariableProduct(ctx, tx, req, createdByID)
    }

    if err != nil {
        return nil, err
    }

    // 7. Commit transaction
    if err := tx.Commit(ctx); err != nil {
        return nil, errors.Internal("TX_COMMIT_ERROR", err.Error())
    }

    // 8. Log audit entry
    s.auditRepo.LogAction(ctx, conn, &masterRepo.AuditLogEntry{
        UserID:       createdByID,
        TenantID:     &tenantID,
        Action:       constants.AuditActionProductCreated,
        ResourceType: "product",
        ResourceID:   product.ID,
        Description:  fmt.Sprintf("Created product: %s", product.Name),
        IPAddress:    ip,
        UserAgent:    userAgent,
    })

    return product, nil
}

// createSingleProduct creates a single (non-variable) product
func (s *ProductService) createSingleProduct(
    ctx context.Context,
    tx pgx.Tx,
    req *reqDTO.CreateProductRequest,
    createdByID uuid.UUID,
) (*respDTO.ProductResponse, error) {

    product := &tenantRepo.Product{
        ID:                uuid.New(),
        Name:              req.Name,
        Description:       req.Description,
        SKU:               req.SingleProduct.SKU,
        Barcode:           req.SingleProduct.Barcode,
        CategoryID:        req.CategoryID,
        SubcategoryID:     req.SubcategoryID,
        BrandID:           req.BrandID,
        UnitID:            req.UnitID,
        WarehouseID:       req.WarehouseID,
        WarrantyID:        req.WarrantyID,
        ProductType:       "single",
        CostPrice:         req.SingleProduct.CostPrice,
        WholesalePrice:    req.SingleProduct.WholesalePrice,
        RetailPrice:       req.SingleProduct.RetailPrice,
        OurPrice:          req.SingleProduct.OurPrice,
        DiscountType:      req.SingleProduct.DiscountType,
        DiscountValue:     req.SingleProduct.DiscountValue,
        DiscountAppliesTo: req.SingleProduct.DiscountAppliesTo,
        QuantityAlert:     req.SingleProduct.QuantityAlert,
        ImageURL:          req.SingleProduct.ImageURL,
        IsActive:          true,
        CreatedBy:         createdByID,
        CreatedAt:         time.Now(),
        UpdatedAt:         time.Now(),
    }

    // Insert product
    if err := s.productRepo.CreateTx(ctx, tx, product); err != nil {
        return nil, errors.Internal("PRODUCT_CREATE_ERROR", err.Error())
    }

    // Initialize stock record (quantity 0)
    if req.WarehouseID != nil {
        if err := s.stockRepo.InitializeStockTx(ctx, tx, product.ID, *req.WarehouseID); err != nil {
            return nil, errors.Internal("STOCK_INIT_ERROR", err.Error())
        }
    }

    // Build response
    return s.buildProductResponse(ctx, tx, product)
}

// createVariableProduct creates a product with variations
func (s *ProductService) createVariableProduct(
    ctx context.Context,
    tx pgx.Tx,
    req *reqDTO.CreateProductRequest,
    createdByID uuid.UUID,
) (*respDTO.ProductResponse, error) {

    // Create base product (without pricing - pricing is per variation)
    product := &tenantRepo.Product{
        ID:            uuid.New(),
        Name:          req.Name,
        Description:   req.Description,
        CategoryID:    req.CategoryID,
        SubcategoryID: req.SubcategoryID,
        BrandID:       req.BrandID,
        UnitID:        req.UnitID,
        WarehouseID:   req.WarehouseID,
        WarrantyID:    req.WarrantyID,
        ProductType:   "variable",
        IsActive:      true,
        CreatedBy:     createdByID,
        CreatedAt:     time.Now(),
        UpdatedAt:     time.Now(),
    }

    // Insert base product
    if err := s.productRepo.CreateTx(ctx, tx, product); err != nil {
        return nil, errors.Internal("PRODUCT_CREATE_ERROR", err.Error())
    }

    // Create each variation
    var variations []respDTO.ProductVariationResponse
    for _, varReq := range req.VariableProduct.Variations {
        // Generate SKU if not provided
        sku := varReq.SKU
        if sku == "" {
            // Get first option value for SKU generation
            optionValue := s.getOptionValue(ctx, tx, varReq.VariationOptionIDs[0])
            sku = s.generateVariationSKU(product.Name, optionValue)
        }

        variation := &tenantRepo.ProductVariation{
            ID:                uuid.New(),
            ProductID:         product.ID,
            VariationID:       req.VariableProduct.VariationID,
            SKU:               sku,
            Barcode:           varReq.Barcode,
            CostPrice:         varReq.CostPrice,
            WholesalePrice:    varReq.WholesalePrice,
            RetailPrice:       varReq.RetailPrice,
            OurPrice:          varReq.OurPrice,
            DiscountType:      varReq.DiscountType,
            DiscountValue:     varReq.DiscountValue,
            DiscountAppliesTo: varReq.DiscountAppliesTo,
            QuantityAlert:     varReq.QuantityAlert,
            ImageURL:          varReq.ImageURL,
            IsActive:          true,
            CreatedAt:         time.Now(),
            UpdatedAt:         time.Now(),
        }

        // Insert variation
        if err := s.variationRepo.CreateTx(ctx, tx, variation); err != nil {
            return nil, errors.Internal("VARIATION_CREATE_ERROR", err.Error())
        }

        // Link variation options
        for _, optionID := range varReq.VariationOptionIDs {
            if err := s.variationRepo.LinkOptionTx(ctx, tx, variation.ID, optionID); err != nil {
                return nil, errors.Internal("VARIATION_OPTION_LINK_ERROR", err.Error())
            }
        }

        // Initialize stock for variation
        if req.WarehouseID != nil {
            if err := s.stockRepo.InitializeVariationStockTx(ctx, tx, variation.ID, *req.WarehouseID); err != nil {
                return nil, errors.Internal("VARIATION_STOCK_INIT_ERROR", err.Error())
            }
        }

        // Add to response
        variations = append(variations, s.buildVariationResponse(ctx, tx, variation))
    }

    // Build full response
    response, err := s.buildProductResponse(ctx, tx, product)
    if err != nil {
        return nil, err
    }
    response.Variations = variations

    return response, nil
}

// validateRelationships validates that all referenced entities exist
func (s *ProductService) validateRelationships(
    ctx context.Context,
    conn *pgxpool.Conn,
    req *reqDTO.CreateProductRequest,
) error {
    // Check category exists
    if _, err := s.categoryRepo.GetByID(ctx, conn, req.CategoryID); err != nil {
        return errors.NotFound("CATEGORY_NOT_FOUND", "Selected category does not exist")
    }

    // Check subcategory exists and belongs to category
    subcat, err := s.subcategoryRepo.GetByID(ctx, conn, req.SubcategoryID)
    if err != nil {
        return errors.NotFound("SUBCATEGORY_NOT_FOUND", "Selected subcategory does not exist")
    }
    if subcat.CategoryID != req.CategoryID {
        return errors.BadRequest("SUBCATEGORY_MISMATCH", "Subcategory does not belong to selected category")
    }

    // Check unit exists
    if _, err := s.unitRepo.GetByID(ctx, conn, req.UnitID); err != nil {
        return errors.NotFound("UNIT_NOT_FOUND", "Selected unit does not exist")
    }

    // Check brand if provided
    if req.BrandID != nil {
        if _, err := s.brandRepo.GetByID(ctx, conn, *req.BrandID); err != nil {
            return errors.NotFound("BRAND_NOT_FOUND", "Selected brand does not exist")
        }
    }

    // Check warehouse if provided
    if req.WarehouseID != nil {
        if _, err := s.warehouseRepo.GetByID(ctx, conn, *req.WarehouseID); err != nil {
            return errors.NotFound("WAREHOUSE_NOT_FOUND", "Selected warehouse does not exist")
        }
    }

    // Check warranty if provided
    if req.WarrantyID != nil {
        if _, err := s.warrantyRepo.GetByID(ctx, conn, *req.WarrantyID); err != nil {
            return errors.NotFound("WARRANTY_NOT_FOUND", "Selected warranty does not exist")
        }
    }

    // For variable products, check variation exists
    if req.ProductType == "variable" && req.VariableProduct != nil {
        if _, err := s.variationRepo.GetByID(ctx, conn, req.VariableProduct.VariationID); err != nil {
            return errors.NotFound("VARIATION_NOT_FOUND", "Selected variation type does not exist")
        }

        // Check all variation options exist
        for _, varItem := range req.VariableProduct.Variations {
            for _, optionID := range varItem.VariationOptionIDs {
                if _, err := s.variationRepo.GetOptionByID(ctx, conn, optionID); err != nil {
                    return errors.NotFound("VARIATION_OPTION_NOT_FOUND",
                        fmt.Sprintf("Variation option %s does not exist", optionID))
                }
            }
        }
    }

    return nil
}

// validateProductTypeRequirements validates product type specific fields
func (s *ProductService) validateProductTypeRequirements(req *reqDTO.CreateProductRequest) error {
    if req.ProductType == "single" {
        if req.SingleProduct == nil {
            return errors.BadRequest("SINGLE_PRODUCT_REQUIRED",
                "Single product details are required for single product type")
        }
    }

    if req.ProductType == "variable" {
        if req.VariableProduct == nil {
            return errors.BadRequest("VARIABLE_PRODUCT_REQUIRED",
                "Variable product details are required for variable product type")
        }
        if len(req.VariableProduct.Variations) == 0 {
            return errors.BadRequest("VARIATIONS_REQUIRED",
                "At least one variation is required for variable product")
        }

        // Check for duplicate SKUs within variations
        skuMap := make(map[string]bool)
        for _, v := range req.VariableProduct.Variations {
            if v.SKU != "" {
                if skuMap[v.SKU] {
                    return errors.BadRequest("DUPLICATE_VARIATION_SKU",
                        fmt.Sprintf("Duplicate SKU found in variations: %s", v.SKU))
                }
                skuMap[v.SKU] = true
            }
        }
    }

    return nil
}
```

### 6.4 Repository Implementation

**File:** `internal/repositories/tenant/product_repository.go`

```go
package tenant

import (
    "context"
    "time"

    "github.com/google/uuid"
    "github.com/jackc/pgx/v5"
    "github.com/jackc/pgx/v5/pgxpool"

    "flow-server/internal/database/sqlc/tenant"
)

type Product struct {
    ID                uuid.UUID
    Name              string
    Description       string
    SKU               string
    Barcode           string
    CategoryID        uuid.UUID
    SubcategoryID     uuid.UUID
    BrandID           *uuid.UUID
    UnitID            uuid.UUID
    WarehouseID       *uuid.UUID
    WarrantyID        *uuid.UUID
    ProductType       string
    CostPrice         float64
    WholesalePrice    float64
    RetailPrice       float64
    OurPrice          float64
    DiscountType      string
    DiscountValue     float64
    DiscountAppliesTo []string
    QuantityAlert     int
    ImageURL          string
    IsActive          bool
    CreatedBy         uuid.UUID
    UpdatedBy         *uuid.UUID
    CreatedAt         time.Time
    UpdatedAt         time.Time
    DeletedAt         *time.Time
}

type ProductRepository struct{}

func NewProductRepository() *ProductRepository {
    return &ProductRepository{}
}

// Create creates a new product
func (r *ProductRepository) Create(ctx context.Context, conn *pgxpool.Conn, p *Product) error {
    queries := tenant.New(conn)

    _, err := queries.CreateProduct(ctx, tenant.CreateProductParams{
        ID:                p.ID,
        Name:              p.Name,
        Description:       toNullString(p.Description),
        Sku:               toNullString(p.SKU),
        Barcode:           toNullString(p.Barcode),
        CategoryID:        p.CategoryID,
        SubcategoryID:     p.SubcategoryID,
        BrandID:           toNullUUID(p.BrandID),
        UnitID:            p.UnitID,
        WarehouseID:       toNullUUID(p.WarehouseID),
        WarrantyID:        toNullUUID(p.WarrantyID),
        ProductType:       p.ProductType,
        CostPrice:         toNumeric(p.CostPrice),
        WholesalePrice:    toNumeric(p.WholesalePrice),
        RetailPrice:       toNumeric(p.RetailPrice),
        OurPrice:          toNumeric(p.OurPrice),
        DiscountType:      toNullString(p.DiscountType),
        DiscountValue:     toNumeric(p.DiscountValue),
        DiscountAppliesTo: p.DiscountAppliesTo,
        QuantityAlert:     int32(p.QuantityAlert),
        ImageUrl:          toNullString(p.ImageURL),
        IsActive:          p.IsActive,
        CreatedBy:         p.CreatedBy,
    })

    return err
}

// CreateTx creates a product within a transaction
func (r *ProductRepository) CreateTx(ctx context.Context, tx pgx.Tx, p *Product) error {
    queries := tenant.New(tx)

    _, err := queries.CreateProduct(ctx, tenant.CreateProductParams{
        // ... same as above
    })

    return err
}

// SKUExists checks if a SKU already exists
func (r *ProductRepository) SKUExists(ctx context.Context, conn *pgxpool.Conn, sku string, excludeID *uuid.UUID) (bool, error) {
    queries := tenant.New(conn)

    if excludeID != nil {
        return queries.SKUExistsExcluding(ctx, tenant.SKUExistsExcludingParams{
            Sku: toNullString(sku),
            ID:  *excludeID,
        })
    }

    return queries.SKUExists(ctx, toNullString(sku))
}

// GetByID retrieves a product by ID
func (r *ProductRepository) GetByID(ctx context.Context, conn *pgxpool.Conn, id uuid.UUID) (*Product, error) {
    queries := tenant.New(conn)

    row, err := queries.GetProductByID(ctx, id)
    if err != nil {
        return nil, err
    }

    return r.rowToProduct(row), nil
}

// List retrieves products with pagination
func (r *ProductRepository) List(ctx context.Context, conn *pgxpool.Conn, page, perPage int, search string, filters ProductFilters) ([]Product, int64, error) {
    queries := tenant.New(conn)

    offset := (page - 1) * perPage

    rows, err := queries.ListProducts(ctx, tenant.ListProductsParams{
        Search:      "%" + search + "%",
        Limit:       int32(perPage),
        Offset:      int32(offset),
        CategoryID:  filters.CategoryID,
        BrandID:     filters.BrandID,
        IsActive:    filters.IsActive,
    })
    if err != nil {
        return nil, 0, err
    }

    count, err := queries.CountProducts(ctx, tenant.CountProductsParams{
        Search:     "%" + search + "%",
        CategoryID: filters.CategoryID,
        BrandID:    filters.BrandID,
        IsActive:   filters.IsActive,
    })
    if err != nil {
        return nil, 0, err
    }

    products := make([]Product, len(rows))
    for i, row := range rows {
        products[i] = *r.rowToProduct(row)
    }

    return products, count, nil
}
```

### 6.5 SQL Queries (SQLC)

**File:** `internal/database/queries/tenant/products.sql`

```sql
-- name: CreateProduct :one
INSERT INTO products (
    id, name, description, sku, barcode,
    category_id, subcategory_id, brand_id, unit_id,
    warehouse_id, warranty_id, product_type,
    cost_price, wholesale_price, retail_price, our_price,
    discount_type, discount_value, discount_applies_to,
    quantity_alert, image_url, is_active, created_by
) VALUES (
    $1, $2, $3, $4, $5,
    $6, $7, $8, $9,
    $10, $11, $12,
    $13, $14, $15, $16,
    $17, $18, $19,
    $20, $21, $22, $23
)
RETURNING *;

-- name: GetProductByID :one
SELECT
    p.*,
    c.name as category_name,
    sc.name as subcategory_name,
    b.name as brand_name,
    u.name as unit_name,
    u.short_name as unit_short_name,
    w.name as warehouse_name,
    wr.name as warranty_name,
    COALESCE(s.quantity, 0) as current_stock
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
LEFT JOIN brands b ON p.brand_id = b.id
LEFT JOIN units u ON p.unit_id = u.id
LEFT JOIN warehouses w ON p.warehouse_id = w.id
LEFT JOIN warranties wr ON p.warranty_id = wr.id
LEFT JOIN stock s ON p.id = s.product_id AND p.warehouse_id = s.warehouse_id
WHERE p.id = $1 AND p.deleted_at IS NULL;

-- name: ListProducts :many
SELECT
    p.id, p.name, p.sku, p.product_type,
    c.name as category_name,
    COALESCE(b.name, '') as brand_name,
    u.short_name as unit_short_name,
    COALESCE(p.retail_price, p.our_price, 0) as price,
    COALESCE(s.quantity, 0) as current_stock,
    p.quantity_alert,
    p.image_url,
    p.is_active,
    (SELECT COUNT(*) FROM product_variations pv WHERE pv.product_id = p.id AND pv.deleted_at IS NULL) as variation_count
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN brands b ON p.brand_id = b.id
LEFT JOIN units u ON p.unit_id = u.id
LEFT JOIN stock s ON p.id = s.product_id
WHERE p.deleted_at IS NULL
    AND (p.name ILIKE $1 OR p.sku ILIKE $1 OR p.barcode ILIKE $1)
    AND ($2::uuid IS NULL OR p.category_id = $2)
    AND ($3::uuid IS NULL OR p.brand_id = $3)
    AND ($4::boolean IS NULL OR p.is_active = $4)
ORDER BY p.created_at DESC
LIMIT $5 OFFSET $6;

-- name: CountProducts :one
SELECT COUNT(*)
FROM products p
WHERE p.deleted_at IS NULL
    AND (p.name ILIKE $1 OR p.sku ILIKE $1 OR p.barcode ILIKE $1)
    AND ($2::uuid IS NULL OR p.category_id = $2)
    AND ($3::uuid IS NULL OR p.brand_id = $3)
    AND ($4::boolean IS NULL OR p.is_active = $4);

-- name: SKUExists :one
SELECT EXISTS(
    SELECT 1 FROM products
    WHERE sku = $1 AND deleted_at IS NULL
);

-- name: SKUExistsExcluding :one
SELECT EXISTS(
    SELECT 1 FROM products
    WHERE sku = $1 AND id != $2 AND deleted_at IS NULL
);

-- name: UpdateProduct :one
UPDATE products SET
    name = COALESCE($2, name),
    description = COALESCE($3, description),
    sku = COALESCE($4, sku),
    barcode = COALESCE($5, barcode),
    category_id = COALESCE($6, category_id),
    subcategory_id = COALESCE($7, subcategory_id),
    brand_id = $8,
    unit_id = COALESCE($9, unit_id),
    warehouse_id = $10,
    warranty_id = $11,
    cost_price = COALESCE($12, cost_price),
    wholesale_price = COALESCE($13, wholesale_price),
    retail_price = COALESCE($14, retail_price),
    our_price = COALESCE($15, our_price),
    discount_type = $16,
    discount_value = COALESCE($17, discount_value),
    discount_applies_to = COALESCE($18, discount_applies_to),
    quantity_alert = COALESCE($19, quantity_alert),
    image_url = $20,
    is_active = COALESCE($21, is_active),
    updated_by = $22,
    updated_at = NOW()
WHERE id = $1 AND deleted_at IS NULL
RETURNING *;

-- name: SoftDeleteProduct :exec
UPDATE products SET
    deleted_at = NOW(),
    updated_by = $2,
    updated_at = NOW()
WHERE id = $1 AND deleted_at IS NULL;
```

**File:** `internal/database/queries/tenant/product_variations.sql`

```sql
-- name: CreateProductVariation :one
INSERT INTO product_variations (
    id, product_id, variation_id,
    sku, barcode,
    cost_price, wholesale_price, retail_price, our_price,
    discount_type, discount_value, discount_applies_to,
    quantity_alert, image_url, is_active
) VALUES (
    $1, $2, $3,
    $4, $5,
    $6, $7, $8, $9,
    $10, $11, $12,
    $13, $14, $15
)
RETURNING *;

-- name: GetProductVariationsByProductID :many
SELECT
    pv.*,
    v.name as variation_name,
    COALESCE(pvs.quantity, 0) as current_stock
FROM product_variations pv
LEFT JOIN variations v ON pv.variation_id = v.id
LEFT JOIN product_variation_stock pvs ON pv.id = pvs.product_variation_id
WHERE pv.product_id = $1 AND pv.deleted_at IS NULL
ORDER BY pv.created_at;

-- name: GetVariationOptions :many
SELECT
    vo.id, vo.value
FROM product_variation_options pvo
JOIN variation_options vo ON pvo.variation_option_id = vo.id
WHERE pvo.product_variation_id = $1;

-- name: LinkVariationOption :exec
INSERT INTO product_variation_options (
    id, product_variation_id, variation_option_id
) VALUES (gen_random_uuid(), $1, $2);

-- name: VariationSKUExists :one
SELECT EXISTS(
    SELECT 1 FROM product_variations
    WHERE sku = $1 AND deleted_at IS NULL
);
```

---

## 7. File Structure

### 7.1 New/Modified Files

```
internal/
├── dto/
│   ├── request/
│   │   └── inventory/
│   │       └── product_request.go          [NEW/UPDATE]
│   └── response/
│       └── inventory/
│           └── product_response.go         [NEW/UPDATE]
│
├── handlers/
│   └── inventory/
│       └── product_handler.go              [NEW/UPDATE]
│
├── services/
│   └── inventory/
│       └── product_service.go              [NEW/UPDATE]
│
├── repositories/
│   └── tenant/
│       ├── product_repository.go           [NEW/UPDATE]
│       └── product_variation_repository.go [NEW/UPDATE]
│
├── database/
│   ├── queries/
│   │   └── tenant/
│   │       ├── products.sql                [NEW/UPDATE]
│   │       └── product_variations.sql      [NEW/UPDATE]
│   ├── migrations/
│   │   └── tenant/
│   │       └── XXXXXX_add_product_tables.up.sql  [NEW if needed]
│   └── sqlc/
│       └── tenant/
│           └── (auto-generated)
│
├── router/
│   └── admin_routes.go                     [UPDATE - add routes]
│
└── models/
    └── tenant/
        └── product.go                      [VERIFY/UPDATE]
```

### 7.2 Route Registration

**File:** `internal/router/admin_routes.go`

```go
// Add to SetupAdminRoutes function

// Product routes
products := admin.Group("/products")
{
    products.POST("", productHandler.CreateProduct)
    products.GET("", productHandler.ListProducts)
    products.GET("/:id", productHandler.GetProduct)
    products.PUT("/:id", productHandler.UpdateProduct)
    products.DELETE("/:id", productHandler.DeleteProduct)
    products.GET("/search", productHandler.SearchProducts)
    products.GET("/all", productHandler.ListAllProducts)
    products.GET("/export/pdf", productHandler.ExportPDF)
    products.GET("/export/excel", productHandler.ExportExcel)
    products.POST("/import", productHandler.ImportProducts)
}
```

---

## 8. Code Examples

### 8.1 Complete Handler Example

```go
// CreateProduct - Full handler implementation
func (h *ProductHandler) CreateProduct(c *gin.Context) {
    ctx := c.Request.Context()

    // 1. Extract context values
    conn, err := middleware.GetTenantConnFromContext(c)
    if err != nil {
        common.Error(c, errors.Unauthorized("TENANT_CONN_ERROR", "Failed to get tenant connection"))
        return
    }
    defer conn.Release()

    userID, _ := c.Get(middleware.ContextKeyUserID)
    tenantID, _ := c.Get(middleware.ContextKeyTenantID)

    // 2. Bind request
    var req reqDTO.CreateProductRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        common.ValidationError(c, err.Error())
        return
    }

    // 3. Call service
    result, err := h.productService.CreateProduct(
        ctx,
        conn,
        tenantID.(uuid.UUID),
        &req,
        userID.(uuid.UUID),
        c.ClientIP(),
        c.GetHeader("User-Agent"),
    )

    // 4. Handle response
    if err != nil {
        if appErr, ok := err.(*errors.AppError); ok {
            common.Error(c, appErr)
            return
        }
        common.Error(c, errors.Internal("CREATE_PRODUCT_ERROR", err.Error()))
        return
    }

    common.CreatedWithMessage(c, "Product created successfully", result)
}
```

### 8.2 Service Layer Transaction Example

```go
// CreateProduct with transaction
func (s *ProductService) CreateProduct(ctx context.Context, conn *pgxpool.Conn, ...) (*respDTO.ProductResponse, error) {

    // Validation (before transaction)
    if err := s.validateRelationships(ctx, conn, req); err != nil {
        return nil, err
    }

    // Start transaction
    tx, err := conn.Begin(ctx)
    if err != nil {
        return nil, errors.Internal("TX_BEGIN_ERROR", err.Error())
    }

    // Ensure rollback on error
    defer func() {
        if tx != nil {
            tx.Rollback(ctx)
        }
    }()

    // Perform operations
    product, err := s.createSingleProduct(ctx, tx, req, createdByID)
    if err != nil {
        return nil, err
    }

    // Commit transaction
    if err := tx.Commit(ctx); err != nil {
        return nil, errors.Internal("TX_COMMIT_ERROR", err.Error())
    }
    tx = nil // Prevent rollback in defer

    // Post-transaction operations (audit logging)
    s.auditRepo.LogAction(ctx, conn, ...)

    return product, nil
}
```

---

## 9. Testing Checklist

### 9.1 Unit Tests

- [ ] **Request Validation**
  - [ ] Test required fields validation
  - [ ] Test field length validation
  - [ ] Test product type validation
  - [ ] Test pricing validation (>= 0)
  - [ ] Test discount percentage (max 100%)

- [ ] **Business Logic**
  - [ ] Test SKU auto-generation
  - [ ] Test SKU uniqueness check
  - [ ] Test subcategory belongs to category
  - [ ] Test variation option validation
  - [ ] Test duplicate variation SKU detection

### 9.2 Integration Tests

- [ ] **Create Single Product**
  - [ ] With all fields
  - [ ] With minimal fields
  - [ ] With auto-generated SKU
  - [ ] With discount settings

- [ ] **Create Variable Product**
  - [ ] With single variation
  - [ ] With multiple variations
  - [ ] With different pricing per variation
  - [ ] With images per variation

- [ ] **Error Cases**
  - [ ] Invalid category ID
  - [ ] Subcategory mismatch
  - [ ] Duplicate SKU
  - [ ] Missing required fields
  - [ ] Invalid variation options

### 9.3 API Tests (Postman/cURL)

```bash
# Test Create Single Product
curl -X POST http://localhost:8080/api/v1/admin/products \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "category_id": "uuid",
    "subcategory_id": "uuid",
    "unit_id": "uuid",
    "product_type": "single",
    "single_product": {
      "cost_price": 100,
      "retail_price": 150
    }
  }'

# Test Create Variable Product
curl -X POST http://localhost:8080/api/v1/admin/products \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test T-Shirt",
    "category_id": "uuid",
    "subcategory_id": "uuid",
    "unit_id": "uuid",
    "product_type": "variable",
    "variable_product": {
      "variation_id": "uuid",
      "variations": [
        {
          "variation_option_ids": ["uuid"],
          "cost_price": 500,
          "retail_price": 800
        }
      ]
    }
  }'
```

---

## 10. Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `PRODUCT_SKU_EXISTS` | 409 | SKU already exists |
| `CATEGORY_NOT_FOUND` | 404 | Category does not exist |
| `SUBCATEGORY_NOT_FOUND` | 404 | Subcategory does not exist |
| `SUBCATEGORY_MISMATCH` | 400 | Subcategory doesn't belong to category |
| `BRAND_NOT_FOUND` | 404 | Brand does not exist |
| `UNIT_NOT_FOUND` | 404 | Unit does not exist |
| `WAREHOUSE_NOT_FOUND` | 404 | Warehouse does not exist |
| `WARRANTY_NOT_FOUND` | 404 | Warranty does not exist |
| `VARIATION_NOT_FOUND` | 404 | Variation type does not exist |
| `VARIATION_OPTION_NOT_FOUND` | 404 | Variation option does not exist |
| `SINGLE_PRODUCT_REQUIRED` | 400 | Single product details missing |
| `VARIABLE_PRODUCT_REQUIRED` | 400 | Variable product details missing |
| `VARIATIONS_REQUIRED` | 400 | At least one variation required |
| `DUPLICATE_VARIATION_SKU` | 400 | Duplicate SKU in variations |
| `CREATE_PRODUCT_ERROR` | 500 | Internal error creating product |
| `TX_BEGIN_ERROR` | 500 | Transaction start failed |
| `TX_COMMIT_ERROR` | 500 | Transaction commit failed |

---

## Appendix A: Audit Log Actions

```go
// Add to pkg/constants/audit.go
const (
    AuditActionProductCreated       = "product.created"
    AuditActionProductUpdated       = "product.updated"
    AuditActionProductDeleted       = "product.deleted"
    AuditActionProductVariationAdded = "product.variation.added"
    AuditActionProductImported      = "product.imported"
)
```

---

## Appendix B: Permission Codes

```go
// Add to permissions table/constants
const (
    PermissionViewProducts   = "view_products"
    PermissionAddProducts    = "add_products"
    PermissionEditProducts   = "edit_products"
    PermissionDeleteProducts = "delete_products"
    PermissionImportProducts = "import_products"
    PermissionExportProducts = "export_products"
)
```

---

**Document End**

*For questions or clarifications, contact the development team lead.*


Documentation Summary
The documentation covers the following sections:

1. Overview
Feature description for Single and Variable products
Complete user flow diagram
Key features list
2. Database Schema
products table with all fields
product_variations table for variable products
product_variation_options junction table
stock tables for inventory tracking
Entity relationship diagram
3. API Endpoints
Method	Endpoint	Description
POST	/api/v1/admin/products	Create new product
GET	/api/v1/admin/products	List products
GET	/api/v1/admin/products/:id	Get product details
PUT	/api/v1/admin/products/:id	Update product
DELETE	/api/v1/admin/products/:id	Delete product
4. Request/Response DTOs
Complete DTO structures matching your existing patterns
Sample JSON requests for both Single and Variable products
Response format with all relationship data
5. Business Logic & Validation
All validation rules (required fields, formats, ranges)
SKU auto-generation logic
Relationship validation (category/subcategory matching)
6. Implementation Layers
Handler layer code with context extraction
Service layer with transaction handling
Repository layer with SQLC integration
SQL queries for SQLC generation
7. File Structure
All new/modified files listed
Route registration code
8. Testing Checklist
Unit test cases
Integration test scenarios
Sample cURL commands
9. Error Codes
Complete error code reference table
This documentation follows your existing codebase patterns (layered architecture, SQLC, multi-tenant schema, audit logging) and is ready to share with your development team.