import type {
  InputProps as AntInputProps,
  InputNumberProps as AntInputNumberProps,
} from "antd";
import type { TextAreaProps as AntTextAreaProps } from "antd/es/input";
// import type { ReactNode } from "react";

export type InputSize = "small" | "middle" | "large";
export type InputStatus = "error" | "warning" | "";

// Base Input Props
export interface BaseInputProps extends Omit<AntInputProps, "size" | "status"> {
  label?: string;
  error?: string;
  required?: boolean;
  helperText?: string;
  size?: InputSize;
  fullWidth?: boolean;
}

// Text Input Props
export interface TextInputProps extends BaseInputProps {
  maxLength?: number;
  showCount?: boolean;
}

// Number Input Props
export interface NumberInputProps extends Omit<AntInputNumberProps, "size"> {
  label?: string;
  error?: string;
  required?: boolean;
  helperText?: string;
  size?: InputSize;
  fullWidth?: boolean;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
}

// Password Input Props
export interface PasswordInputProps extends BaseInputProps {
  showStrengthIndicator?: boolean;
  strengthLevel?: "weak" | "medium" | "strong";
}

// Search Input Props
export interface SearchInputProps extends BaseInputProps {
  onSearch?: (value: string) => void;
  debounceMs?: number;
  loading?: boolean;
}

// PIN Input Props
export interface PINInputProps {
  length?: 4 | 5 | 6;
  value?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
  masked?: boolean;
}

// Text Area Props
export interface TextAreaInputProps extends Omit<AntTextAreaProps, "size"> {
  label?: string;
  error?: string;
  required?: boolean;
  helperText?: string;
  size?: InputSize;
  fullWidth?: boolean;
  maxLength?: number;
  showCount?: boolean;
  autoSize?: boolean | { minRows?: number; maxRows?: number };
}

// Email Input Props
export interface EmailInputProps extends BaseInputProps {
  suggestions?: string[];
  validateOnBlur?: boolean;
}

// Phone Input Props
export interface PhoneInputProps extends BaseInputProps {
  countryCode?: string;
  format?: "local" | "international";
  defaultCountryCode?: string;
}

// Currency Input Props
export interface CurrencyInputProps extends Omit<NumberInputProps, "prefix"> {
  currency?: "LKR" | "USD" | "EUR" | "GBP";
  showSymbol?: boolean;
  locale?: string;
}

// Percentage Input Props
export interface PercentageInputProps extends NumberInputProps {
  showSymbol?: boolean;
}

// Barcode Input Props
export interface BarcodeInputProps extends BaseInputProps {
  onScan?: (barcode: string) => void;
  scannerEnabled?: boolean;
  validateFormat?: boolean;
  format?: "EAN13" | "CODE128" | "UPC" | "ANY";
}

// User ID Input Props
export interface UserIDInputProps extends BaseInputProps {
  prefix?: string;
  format?: "uppercase" | "lowercase" | "alphanumeric";
  minLength?: number;
  maxLength?: number;
}
