import { useCallback, useEffect, useRef, useState } from "react";
import type { FormInstance } from "antd";

interface DirtyForm {
  /** true when any tracked field differs from the last-saved baseline */
  dirty: boolean;
  /** top-level field names that currently differ from the baseline */
  dirtyFields: Set<string>;
  dirtyCount: number;
  /** wire to <Form onValuesChange> */
  handleValuesChange: () => void;
  /** revert the form to the baseline */
  reset: () => void;
  /** call after a successful save so the current values become the new baseline */
  markSaved: () => void;
}

const stable = (v: unknown) => JSON.stringify(v ?? null);

/**
 * Wires an AntD form to a "baseline" object and tracks which fields the user has
 * edited. Baseline resets whenever `data` changes (initial load, successful save).
 */
export function useDirtyForm<T extends Record<string, any>>(
  form: FormInstance,
  data: T | null | undefined,
  onDirtyChange?: (dirty: boolean) => void
): DirtyForm {
  const baseline = useRef<Record<string, any>>({});
  const [dirtyFields, setDirtyFields] = useState<Set<string>>(new Set());

  const apply = useCallback(
    (fields: Set<string>) => {
      setDirtyFields(fields);
      onDirtyChange?.(fields.size > 0);
    },
    [onDirtyChange]
  );

  const recompute = useCallback(() => {
    const current = form.getFieldsValue(true);
    const base = baseline.current;
    const changed = new Set<string>();
    const keys = new Set([...Object.keys(current), ...Object.keys(base)]);
    keys.forEach((k) => {
      if (stable(current[k]) !== stable(base[k])) changed.add(k);
    });
    apply(changed);
  }, [form, apply]);

  useEffect(() => {
    if (!data) return;
    form.setFieldsValue(data);
    baseline.current = form.getFieldsValue(true);
    apply(new Set());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const reset = useCallback(() => {
    if (!data) return;
    form.setFieldsValue(data);
    baseline.current = form.getFieldsValue(true);
    apply(new Set());
  }, [data, form, apply]);

  const markSaved = useCallback(() => {
    baseline.current = form.getFieldsValue(true);
    apply(new Set());
  }, [form, apply]);

  return {
    dirty: dirtyFields.size > 0,
    dirtyFields,
    dirtyCount: dirtyFields.size,
    handleValuesChange: recompute,
    reset,
    markSaved,
  };
}

/** Warns before a full page unload while a section has unsaved edits. */
export function useUnloadGuard(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [active]);
}
