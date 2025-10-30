import type { ReactNode } from 'react';
import type { SelectProps as AntSelectProps } from 'antd';

// Base option type
export interface OptionType {
  label: ReactNode;
  value: string | number;
  disabled?: boolean;
  children?: OptionType[];
}

// Select component props
export interface SelectProps extends Omit<AntSelectProps, 'options'> {
  options?: OptionType[];
  onSearch?: (value: string) => void;
  loading?: boolean;
  allowClear?: boolean;
  showSearch?: boolean;
  placeholder?: string;
}

// AutoComplete component props
export interface AutoCompleteProps {
  options?: OptionType[];
  onSearch?: (value: string) => void;
  onSelect?: (value: string, option: OptionType) => void;
  placeholder?: string;
  allowCreate?: boolean;
  loading?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}

// ComboBox component props
export interface ComboBoxProps {
  options?: OptionType[];
  onSearch?: (value: string) => void;
  onSelect?: (value: string, option: OptionType) => void;
  placeholder?: string;
  allowCreate?: boolean;
  loading?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}