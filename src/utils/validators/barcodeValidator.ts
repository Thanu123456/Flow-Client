import type { Rule } from "antd/es/form";
import { isValidBarcode } from "../helpers/barcode";
import { productService } from "../../services/inventory/productService";

// Cache availability results briefly so the repeated whole-form validation sweeps
// used for live submit-button state don't spam the check-barcode endpoint.
const CACHE_TTL_MS = 15_000;
const cache = new Map<string, { available: boolean; ts: number }>();

const checkAvailability = async (code: string, excludeId?: string): Promise<boolean> => {
    const key = `${code}|${excludeId ?? ""}`;
    const hit = cache.get(key);
    if (hit && Date.now() - hit.ts < CACHE_TTL_MS) return hit.available;

    const { available } = await productService.checkBarcode(code, excludeId);
    cache.set(key, { available, ts: Date.now() });
    return available;
};

/**
 * Form.Item validator for a product / variation barcode field.
 * - empty is allowed (the server auto-generates a unique EAN-13 on save)
 * - a typed value must be a valid barcode format
 * - and must not already be used by another product/variation
 *
 * Pass `excludeId` (the product id) in edit mode so the product's own barcode
 * doesn't report as a conflict. Network/permission failures don't block submit.
 */
export const createBarcodeValidator = (excludeId?: string): Rule => ({
    validator: async (_rule, value) => {
        const code = (value ?? "").toString().trim();
        if (!code) return;

        if (!isValidBarcode(code)) {
            throw new Error("Enter a valid barcode (a 13-digit EAN needs a correct check digit)");
        }

        try {
            const available = await checkAvailability(code, excludeId);
            if (!available) throw new Error("This barcode is already used by another product");
        } catch (err) {
            if (err instanceof Error && err.message.includes("already used")) throw err;
            // Soft check — don't fail the form on a transient API/network error
        }
    },
});
