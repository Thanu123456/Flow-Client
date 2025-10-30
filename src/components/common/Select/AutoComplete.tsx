import React, { useState, useEffect } from 'react';
import { AutoComplete as AntAutoComplete, Input, Spin } from 'antd';
import type { AutoCompleteProps } from './Select.types';

const AutoComplete: React.FC<AutoCompleteProps> = ({
  options = [],
  loading = false,
  placeholder = 'Search...',
  allowCreate = false,
  onSearch,
  onSelect,
  value,
  onChange,
  ...restProps
}) => {
  const [searchValue, setSearchValue] = useState(value || '');
  const [filteredOptions, setFilteredOptions] = useState(options);

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
        ...options
      ]);
    } else {
      setFilteredOptions(options);
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

  return (
    <AntAutoComplete
      className="w-full"
      value={searchValue}
      options={filteredOptions}
      onSelect={handleSelect}
      onChange={handleChange}
      notFoundContent={loading ? <Spin size="small" /> : null}
      {...restProps}
    >
      <Input.Search
        placeholder={placeholder}
        enterButton={false}
        onSearch={handleSelect}
      />
    </AntAutoComplete>
  );
};

export default AutoComplete;