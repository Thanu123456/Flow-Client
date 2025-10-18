import React, { useState, useEffect } from "react";
import { Input, InputNumber, Typography } from "antd";
import type {
  TextInputProps,
  NumberInputProps,
  PasswordInputProps,
  SearchInputProps,
  PINInputProps,
  TextAreaInputProps,
  EmailInputProps,
  PhoneInputProps,
  CurrencyInputProps,
  PercentageInputProps,
  BarcodeInputProps,
  UserIDInputProps,
} from "./Input.types";

const { TextArea, Search, Password } = Input;
const { Text } = Typography;

const fieldContainer = (label?: string, required?: boolean) =>
  label ? (
    <label className="block mb-1 font-medium text-gray-800">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
  ) : null;

const helperTextEl = (text?: string, error?: string) =>
  text || error ? (
    <Text
      type={error ? "danger" : "secondary"}
      className={`text-sm ${error ? "text-red-500" : "text-gray-500"}`}
    >
      {error || text}
    </Text>
  ) : null;

/* ------------------------ TEXT INPUT ------------------------ */
export const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  helperText,
  required,
  fullWidth,
  size = "middle",
  ...props
}) => (
  <div className={`${fullWidth ? "w-full" : "w-auto"} space-y-1`}>
    {fieldContainer(label, required)}
    <Input {...props} size={size} status={error ? "error" : ""} />
    {helperTextEl(helperText, error)}
  </div>
);

/* ------------------------ NUMBER INPUT ------------------------ */
export const NumberInput: React.FC<NumberInputProps> = ({
  label,
  error,
  helperText,
  required,
  fullWidth,
  size = "middle",
  ...props
}) => (
  <div className={`${fullWidth ? "w-full" : "w-auto"} space-y-1`}>
    {fieldContainer(label, required)}
    <InputNumber
      {...props}
      className="w-full"
      size={size}
      status={error ? "error" : ""}
    />
    {helperTextEl(helperText, error)}
  </div>
);

/* ------------------------ PASSWORD INPUT ------------------------ */
export const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  error,
  helperText,
  required,
  fullWidth,
  showStrengthIndicator,
  strengthLevel,
  size = "middle",
  ...props
}) => {
  const strengthColors: Record<string, string> = {
    weak: "bg-red-400",
    medium: "bg-yellow-400",
    strong: "bg-green-500",
  };

  return (
    <div className={`${fullWidth ? "w-full" : "w-auto"} space-y-1`}>
      {fieldContainer(label, required)}
      <Password {...props} size={size} status={error ? "error" : ""} />
      {showStrengthIndicator && strengthLevel && (
        <div className="h-1 mt-1 rounded w-full bg-gray-200">
          <div
            className={`h-1 rounded ${strengthColors[strengthLevel]}`}
            style={{
              width:
                strengthLevel === "weak"
                  ? "33%"
                  : strengthLevel === "medium"
                  ? "66%"
                  : "100%",
            }}
          />
        </div>
      )}
      {helperTextEl(helperText, error)}
    </div>
  );
};

/* ------------------------ SEARCH INPUT ------------------------ */
export const SearchInput: React.FC<SearchInputProps> = ({
  label,
  error,
  helperText,
  required,
  onSearch,
  debounceMs = 0,
  fullWidth,
  size = "middle",
  ...props
}) => {
  const [value, setValue] = useState("");
  useEffect(() => {
    if (debounceMs > 0 && onSearch) {
      const handler = setTimeout(() => onSearch(value), debounceMs);
      return () => clearTimeout(handler);
    }
  }, [value]);

  return (
    <div className={`${fullWidth ? "w-full" : "w-auto"} space-y-1`}>
      {fieldContainer(label, required)}
      <Search
        {...props}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onSearch={onSearch}
        size={size}
        status={error ? "error" : ""}
      />
      {helperTextEl(helperText, error)}
    </div>
  );
};

/* ------------------------ PIN INPUT ------------------------ */
export const PINInput: React.FC<PINInputProps> = ({
  length = 4,
  value = "",
  onChange,
  onComplete,
  masked,
  label,
  error,
  disabled,
}) => {
  const handleChange = (val: string) => {
    if (val.length <= length) {
      onChange?.(val);
      if (val.length === length) onComplete?.(val);
    }
  };
  return (
    <div className="space-y-1">
      {fieldContainer(label)}
      <Input
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        maxLength={length}
        disabled={disabled}
        type={masked ? "password" : "text"}
        status={error ? "error" : ""}
      />
      {helperTextEl(undefined, error)}
    </div>
  );
};

/* ------------------------ TEXT AREA INPUT ------------------------ */
export const TextAreaInput: React.FC<TextAreaInputProps> = ({
  label,
  error,
  helperText,
  required,
  fullWidth,
  size = "middle",
  ...props
}) => (
  <div className={`${fullWidth ? "w-full" : "w-auto"} space-y-1`}>
    {fieldContainer(label, required)}
    <TextArea {...props} status={error ? "error" : ""} />
    {helperTextEl(helperText, error)}
  </div>
);

/* ------------------------ EMAIL INPUT ------------------------ */
export const EmailInput: React.FC<EmailInputProps> = ({
  label,
  error,
  helperText,
  required,
  validateOnBlur,
  fullWidth,
  ...props
}) => {
  const [value, setValue] = useState(props.value || "");
  const [internalError, setInternalError] = useState<string | undefined>(error);

  const validate = (val: string) => {
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    setInternalError(valid ? undefined : "Invalid email address");
  };

  return (
    <div className={`${fullWidth ? "w-full" : "w-auto"} space-y-1`}>
      {fieldContainer(label, required)}
      <Input
        {...props}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          props.onChange?.(e);
        }}
        onBlur={() => validateOnBlur && validate(String(value ?? ""))}
        status={internalError ? "error" : ""}
      />
      {helperTextEl(helperText, internalError)}
    </div>
  );
};

/* ------------------------ PHONE INPUT ------------------------ */
export const PhoneInput: React.FC<PhoneInputProps> = ({
  label,
  error,
  helperText,
  required,
  countryCode,
  format = "local",
  fullWidth,
  ...props
}) => (
  <div className={`${fullWidth ? "w-full" : "w-auto"} space-y-1`}>
    {fieldContainer(label, required)}
    <Input
      {...props}
      addonBefore={countryCode}
      status={error ? "error" : ""}
      placeholder={format === "local" ? "77 123 4567" : "+94 77 123 4567"}
    />
    {helperTextEl(helperText, error)}
  </div>
);

/* ------------------------ CURRENCY INPUT ------------------------ */
export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  label,
  error,
  helperText,
  required,
  fullWidth,
  currency = "LKR",
  showSymbol = true,
  ...props
}) => (
  <div className={`${fullWidth ? "w-full" : "w-auto"} space-y-1`}>
    {fieldContainer(label, required)}
    <InputNumber
      {...props}
      addonBefore={showSymbol ? currency : undefined}
      className="w-full"
      status={error ? "error" : ""}
    />
    {helperTextEl(helperText, error)}
  </div>
);

/* ------------------------ PERCENTAGE INPUT ------------------------ */
export const PercentageInput: React.FC<PercentageInputProps> = ({
  label,
  error,
  helperText,
  required,
  fullWidth,
  showSymbol = true,
  ...props
}) => (
  <div className={`${fullWidth ? "w-full" : "w-auto"} space-y-1`}>
    {fieldContainer(label, required)}
    <InputNumber
      {...props}
      addonAfter={showSymbol ? "%" : undefined}
      className="w-full"
      status={error ? "error" : ""}
    />
    {helperTextEl(helperText, error)}
  </div>
);

/* ------------------------ BARCODE INPUT ------------------------ */
export const BarcodeInput: React.FC<BarcodeInputProps> = ({
  label,
  error,
  helperText,
  required,
  onScan,
  scannerEnabled,
  fullWidth,
  ...props
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (scannerEnabled && e.key === "Enter") {
      onScan?.((e.target as HTMLInputElement).value);
    }
  };

  return (
    <div className={`${fullWidth ? "w-full" : "w-auto"} space-y-1`}>
      {fieldContainer(label, required)}
      <Input
        {...props}
        onKeyDown={handleKeyDown}
        status={error ? "error" : ""}
      />
      {helperTextEl(helperText, error)}
    </div>
  );
};

/* ------------------------ USER ID INPUT ------------------------ */
export const UserIDInput: React.FC<UserIDInputProps> = ({
  label,
  error,
  helperText,
  required,
  prefix,
  format = "uppercase",
  minLength,
  maxLength,
  fullWidth,
  ...props
}) => {
  const [value, setValue] = useState(props.value || "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (format === "uppercase") val = val.toUpperCase();
    if (format === "lowercase") val = val.toLowerCase();
    setValue(val);
    props.onChange?.(e);
  };

  return (
    <div className={`${fullWidth ? "w-full" : "w-auto"} space-y-1`}>
      {fieldContainer(label, required)}
      <Input
        {...props}
        addonBefore={prefix}
        value={value}
        onChange={handleChange}
        minLength={minLength}
        maxLength={maxLength}
        status={error ? "error" : ""}
      />
      {helperTextEl(helperText, error)}
    </div>
  );
};
