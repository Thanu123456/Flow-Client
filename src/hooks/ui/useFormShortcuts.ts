import { useEffect } from "react";
import type { FormInstance } from "antd";

/**
 * Keyboard shortcuts for full-page forms:
 *  - Ctrl/Cmd + S  → submit the form
 *  - Escape        → cancel (ignored while a Select/Picker/Modal is open)
 */
export const useFormShortcuts = (form: FormInstance, onCancel: () => void) => {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
                e.preventDefault();
                form.submit();
                return;
            }
            if (e.key === "Escape") {
                const overlayOpen = document.querySelector(
                    ".ant-select-dropdown:not(.ant-select-dropdown-hidden), " +
                    ".ant-picker-dropdown:not(.ant-picker-dropdown-hidden), " +
                    ".ant-modal-root, .ant-image-preview-root"
                );
                if (overlayOpen) return;
                onCancel();
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [form, onCancel]);
};
