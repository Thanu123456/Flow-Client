// EAN-13 helpers. In-house barcodes use the "999" prefix and always carry a valid
// mod-10 check digit so they scan and validate on real hardware.

/** Compute the trailing mod-10 check digit for a 12-digit GTIN base. */
export const ean13CheckDigit = (base12: string): number => {
    let sum = 0;
    for (let i = 0; i < 12; i++) {
        const d = base12.charCodeAt(i) - 48; // '0' => 0
        sum += i % 2 === 0 ? d : d * 3;
    }
    return (10 - (sum % 10)) % 10;
};

/**
 * Generate an in-house EAN-13: "999" + 6 timestamp digits + 3 random digits + check digit.
 * The server regenerates/validates on save, so a rare local collision is corrected there.
 */
export const generateBarcode = (): string => {
    const prefix = "999";
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    const base = `${prefix}${timestamp}${random}`; // 12 digits
    return `${base}${ean13CheckDigit(base)}`;
};

/**
 * Accept a barcode typed by the user. A 13-digit code must be a valid EAN-13
 * (correct check digit); other lengths (UPC-A, EAN-8, supplier codes) pass as
 * any 6-14 digit numeric string.
 */
export const isValidBarcode = (code: string): boolean => {
    if (!/^[0-9]{6,14}$/.test(code)) return false;
    if (code.length === 13) return ean13CheckDigit(code.slice(0, 12)) === Number(code[12]);
    return true;
};
