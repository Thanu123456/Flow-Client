import React, { useState, useEffect } from 'react';
import { Select as AntSelect, Spin } from 'antd';
import type { ComboBoxProps } from './Select.types';

const { Option } = AntSelect;

const ComboBox: React.FC<ComboBoxProps> = ({
  options = [],
  loading = false,
  placeholder = 'Select or type...',
  allowCreate = true,
  onSearch,
  onSelect,
  value,
  onChange,
  ...restProps
}) => {
  const [searchValue, setSearchValue] = useState(value || '');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  useEffect(() => {
    setSearchValue(value || '');
  }, [value]);

  useEffect(() => {
    if (onSearch) {
      onSearch(searchValue);
    }
  }, [searchValue]);

  useEffect(() => {
    if (allowCreate && searchValue && !options.some(option => option.value === searchValue)) {
      setFilteredOptions([
        { value: searchValue, label: `Create "${searchValue}"` },
        ...options.filter(option => 
          option.label?.toString().toLowerCase().includes(searchValue.toLowerCase())
        )
      ]);
      setIsCreatingNew(true);
    } else {
      setFilteredOptions(options.filter(option => 
        option.label?.toString().toLowerCase().includes(searchValue.toLowerCase())
      ));
      setIsCreatingNew(false);
    }
  }, [options, searchValue, allowCreate]);

  const handleSelect = (value: string, option: any) => {
    setSearchValue(value);
    if (onChange) {
      onChange(value);
    }
    if (onSelect) {
      onSelect(value, option);
    }
  };

  const handleChange = (value: string) => {
    setSearchValue(value);
    if (onChange) {
      onChange(value);
    }
  };

  const handleBlur = () => {
    if (isCreatingNew && searchValue) {
      handleSelect(searchValue, { value: searchValue, label: searchValue });
    }
  };

  return (
    <AntSelect
      className="w-full"
      value={searchValue}
      showSearch
      placeholder={placeholder}
      defaultActiveFirstOption={false}
      showArrow={false}
      filterOption={false}
      onSearch={handleChange}
      onSelect={handleSelect}
      onBlur={handleBlur}
      notFoundContent={loading ? <Spin size="small" /> : null}
      {...restProps}
    >
      {filteredOptions.map((option) => (
        <Option key={option.value} value={option.value}>
          {option.label}
        </Option>
      ))}
    </AntSelect>
  );
};

export default ComboBox;