/**
 * POS Helper Functions
 * Utilities for product unit detection and quantity formatting
 */

// Weight-based units that trigger the quantity modal
export const WEIGHT_BASED_UNITS = [
    "kilogram",
    "kilograms",
    "kg",
    "kgs",
    "kilo",
    "liter",
    "liters",
    "litre",
    "litres",
    "l",
    "ltr",
    "meter",
    "meters",
    "metre",
    "metres",
    "m"
];

/**
 * Check if a product's unit is weight-based
 * Weight-based products open quantity modal instead of adding directly
 * @param unit - Product unit from database
 * @returns true if product uses weight-based unit
 */
export const isWeightBasedProduct = (unit: string | undefined): boolean => {
    if (!unit) return false;

    const normalized = unit.toLowerCase().trim();

    // Debug logging (remove in production)
    // if (process.env.NODE_ENV === 'development') {
    //     //console.log(`[POS] Unit check: "${unit}" → "${normalized}" → ${WEIGHT_BASED_UNITS.includes(normalized)}`);
    // }

    return WEIGHT_BASED_UNITS.includes(normalized);
};

/**
 * Format quantity for display based on unit type
 * Weight-based: 3 decimals (2.500 Kg)
 * Regular: integer (5 Pcs)
 * @param quantity - Numeric quantity
 * @param unit - Product unit
 * @returns Formatted quantity string
 */
export const formatQuantity = (quantity: number, unit: string | undefined): string => {
    if (isWeightBasedProduct(unit)) {
        return quantity.toFixed(3); // 3 decimals for weight: 2.500
    }
    return Math.floor(quantity).toString(); // Integer for pieces: 5
};

/**
 * Get display format for weight in kg
 * @param grams - Weight in grams
 * @returns Formatted weight string with 3 decimals
 */
export const formatWeightInKg = (grams: number): string => {
    const kg = grams / 1000;
    return kg.toFixed(3);
};

/**
 * Check if quantity is valid for product
 * @param quantity - Quantity to validate
 * @param stock - Available stock
 * @param allowNegative - Allow negative inventory
 * @returns true if quantity is valid
 */
export const isValidQuantity = (
    quantity: number,
    stock: number,
    allowNegative: boolean = false
): boolean => {
    if (quantity <= 0) return false;
    if (!allowNegative && quantity > stock) return false;
    return true;
};

/**
 * Get stock status badge color
 * @param stock - Current stock
 * @param allowNoStock - Allow out of stock
 * @returns Badge status: 'success' | 'warning' | 'error'
 */
export const getStockStatus = (stock: number, allowNoStock: boolean): 'success' | 'warning' | 'error' => {
    if (stock > 0) return 'success'; // In stock
    if (allowNoStock) return 'warning'; // Out of stock but allowed
    return 'error'; // Out of stock, not allowed
};

/**
 * Get stock display text
 * @param stock - Current stock
 * @param unit - Product unit
 * @param allowNoStock - Allow out of stock
 * @returns Display text
 */
export const getStockDisplayText = (stock: number, unit: string | undefined, allowNoStock: boolean): string => {
    if (stock > 0) {
        return `${formatQuantity(stock, unit)} ${unit || 'pcs'}`;
    }
    if (allowNoStock) {
        return 'Low Stock';
    }
    return 'Out of Stock';
};
