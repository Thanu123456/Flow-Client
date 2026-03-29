import { useEffect, useState, useRef } from 'react';

interface UseBarcodeProps {
    onScan: (barcode: string) => void;
    debounceMs?: number;
    enabled?: boolean;
}

/**
 * Hook for barcode scanner support
 * Listens for keyboard input and buffers characters
 * Triggers onScan callback when buffer is complete
 *
 * @param onScan - Callback when barcode is scanned
 * @param debounceMs - Debounce timeout in milliseconds (default: 100ms)
 * @param enabled - Enable/disable the scanner (default: true)
 * @returns Object containing current buffer
 */
export const useBarcodeScanner = ({
    onScan,
    debounceMs = 100,
    enabled = true,
}: UseBarcodeProps) => {
    const [buffer, setBuffer] = useState<string>("");
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't listen if user is typing in a form input
            const activeElement = document.activeElement;
            if (
                activeElement instanceof HTMLInputElement ||
                activeElement instanceof HTMLTextAreaElement ||
                activeElement instanceof HTMLSelectElement
            ) {
                return;
            }

            // Add printable ASCII character to buffer
            // Skip: Ctrl, Alt, Meta keys, Space, and special keys
            if (
                e.key.length === 1 &&
                !e.ctrlKey &&
                !e.altKey &&
                !e.metaKey &&
                e.key !== " " // Ignore space
            ) {
                e.preventDefault();

                const newBuffer = buffer + e.key;
                setBuffer(newBuffer);

                // Debug logging (remove in production)
                if (process.env.NODE_ENV === 'development') {
                    console.log(`[Barcode] Buffer: "${newBuffer}"`);
                }

                // Clear existing debounce timer
                if (debounceTimerRef.current) {
                    clearTimeout(debounceTimerRef.current);
                }

                // Set new debounce timer
                const timer = setTimeout(() => {
                    if (newBuffer.length > 0) {
                        console.log(`[Barcode] Scan complete: "${newBuffer}"`);
                        onScan(newBuffer);
                    }
                    setBuffer("");
                }, debounceMs);

                debounceTimerRef.current = timer;
            }

            // Enter key also flushes the buffer immediately
            if (e.key === "Enter") {
                if (buffer.length > 0) {
                    e.preventDefault();
                    if (debounceTimerRef.current) {
                        clearTimeout(debounceTimerRef.current);
                    }
                    console.log(`[Barcode] Enter pressed: "${buffer}"`);
                    onScan(buffer);
                    setBuffer("");
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [buffer, debounceMs, enabled, onScan]);

    return { buffer };
};

export default useBarcodeScanner;
