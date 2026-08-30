import { useEffect, useState } from "react";
import { Form } from "antd";
import type { FormInstance } from "antd";

interface ValidateErrorEntry {
    name: (string | number)[];
    errors: string[];
}
interface ValidateErrorLike {
    errorFields?: ValidateErrorEntry[];
}

interface FormSubmittable {
    /** true when every rule currently passes */
    submittable: boolean;
    /** first error message per still-invalid field */
    issues: string[];
    /** compact one-line summary for a tooltip / helper text */
    summary: string;
}

/**
 * Tracks live form validity so a submit button can disable itself and explain
 * what's outstanding — mirrors the desktop client's UpdateSaveButtonState.
 * Uses validateOnly so it never shows red errors just from watching.
 */
export const useFormSubmittable = (form: FormInstance): FormSubmittable => {
    const values = Form.useWatch([], form);
    const [submittable, setSubmittable] = useState(false);
    const [issues, setIssues] = useState<string[]>([]);

    useEffect(() => {
        let cancelled = false;
        form.validateFields({ validateOnly: true })
            .then(() => {
                if (cancelled) return;
                setSubmittable(true);
                setIssues([]);
            })
            .catch((err: ValidateErrorLike) => {
                if (cancelled) return;
                const fields = err?.errorFields ?? [];
                setSubmittable(fields.length === 0);
                setIssues(
                    fields
                        .map((f) => f.errors?.[0] || (Array.isArray(f.name) ? f.name.join(".") : String(f.name)))
                        .filter(Boolean)
                );
            });
        return () => { cancelled = true; };
    }, [form, values]);

    const summary =
        !submittable && issues.length
            ? issues.slice(0, 6).join(" · ") + (issues.length > 6 ? ` · +${issues.length - 6} more` : "")
            : "";

    return { submittable, issues, summary };
};
