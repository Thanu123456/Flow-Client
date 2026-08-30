import { useCallback, useEffect, useRef, useState } from "react";
import type { FormInstance } from "antd";

/**
 * Wires an AntD form to a "baseline" object and tracks whether the user has made
 * edits. Baseline resets whenever `data` changes (initial load, successful save).
 */
export function useDirtyForm<T extends Record<string, any>>(
  form: FormInstance,
  data: T | null | undefined,
  onDirtyChange?: (dirty: boolean) => void
) {
  const baseline = useRef<string>("");
  const [dirty, setDirty] = useState(false);

  const setDirtyFlag = useCallback(
    (value: boolean) => {
      setDirty(value);
      onDirtyChange?.(value);
    },
    [onDirtyChange]
  );

  useEffect(() => {
    if (!data) return;
    form.setFieldsValue(data);
    baseline.current = JSON.stringify(form.getFieldsValue(true));
    setDirtyFlag(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const handleValuesChange = useCallback(() => {
    const current = JSON.stringify(form.getFieldsValue(true));
    setDirtyFlag(current !== baseline.current);
  }, [form, setDirtyFlag]);

  const reset = useCallback(() => {
    if (!data) return;
    form.setFieldsValue(data);
    setDirtyFlag(false);
  }, [data, form, setDirtyFlag]);

  const markSaved = useCallback(() => {
    baseline.current = JSON.stringify(form.getFieldsValue(true));
    setDirtyFlag(false);
  }, [form, setDirtyFlag]);

  return { dirty, handleValuesChange, reset, markSaved };
}

/** Warns before a full page unload while any section has unsaved edits. */
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
