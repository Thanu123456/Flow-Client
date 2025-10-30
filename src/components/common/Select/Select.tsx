import React from 'react';
import { Select as AntSelect, Spin } from 'antd';
import type { SelectProps } from './Select.types';

const { Option } = AntSelect;

const Select: React.FC<SelectProps> = ({
  options = [],
  loading = false,
  allowClear = true,
  showSearch = true,
  placeholder = 'Please select',
  onSearch,
  ...restProps
}) => {
  const handleSearch = (value: string) => {
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <AntSelect
      className="w-full"
      placeholder={placeholder}
      allowClear={allowClear}
      showSearch={showSearch}
      loading={loading}
      filterOption={(input, option) => {
        const text = option && option.children ? String(option.children).toLowerCase() : '';
        return text.indexOf(String(input).toLowerCase()) >= 0;
      }}
      onSearch={handleSearch}
      notFoundContent={loading ? <Spin size="small" /> : null}
      {...restProps}
    >
      {options.map((option) => (
        <Option key={option.value} value={option.value} disabled={option.disabled}>
          {option.label}
        </Option>
      ))}
    </AntSelect>
  );
};

export default Select;