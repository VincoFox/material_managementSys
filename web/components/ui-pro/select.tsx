'use client';
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import makeAnimated from 'react-select/animated';
import { cn } from '@/lib/utils';

// 异步加载 react-select 组件，设置 ssr 为 false 以确保只在客户端渲染
const AsyncSelect = dynamic(() => import('react-select'), {
  ssr: false,
});

const animatedComponents = makeAnimated();

interface Option {
  value: string | number;
  label: string;
}

interface SearchableSelectProps {
  isMulti?: boolean;
  isClearable?: boolean;
  placeholder?: string;
  className?: string;
  value?: string | number | string[] | number[];
  options?: Option[];
  // options item 里的所有值都包含在value里
  onChange?: (
    selected: string | number | string[] | number[],
    selectedOption: Option | Option[]
  ) => void;
  onSearch?: (query: string) => void;
  onClear?: () => void; // 清空时的回调
}

const customStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    borderColor: state.isFocused ? 'border' : 'border', // 设置边框颜色
    '&:hover': {
      borderColor: state.isFocused ? 'border' : 'border', // 设置鼠标悬停时的边框颜色
    },
  }),
  multiValue: (styles: any) => {
    return {
      ...styles,
      backgroundColor: '#f4f4f4',
    };
  },
};

function SearchableSelect({
  isMulti,
  isClearable,
  placeholder,
  className,
  value,
  options = [],
  onChange,
}: SearchableSelectProps) {
  const [localValue, setLocalValue] = useState<unknown>(null);
  // 根据 value 找到对应的完整选项对象

  // 初始化回填
  React.useEffect(() => {
    const findOptionByValue = (value: string | number) => {
      return options.find((option) => option.value === value);
    };
    if (value && Array.isArray(value)) {
      const selected = value
        ?.map((value) => findOptionByValue(value))
        .filter(Boolean);
      setLocalValue(selected || []);
    } else {
      setLocalValue(value ? findOptionByValue(value) : null);
    }
  }, [value, options]);

  const handleChange = (selected: any) => {
    setLocalValue(selected);
    onChange?.(
      Array.isArray(selected)
        ? selected?.map((item) => item.value)
        : selected?.value,
      selected
    );
  };

  return (
    <AsyncSelect
      isMulti={isMulti}
      isClearable={isClearable}
      options={options}
      onChange={handleChange}
      value={localValue}
      placeholder={placeholder}
      closeMenuOnSelect={!isMulti}
      className={cn('w-full text-sm', className)}
      components={animatedComponents}
      noOptionsMessage={() => 'No matching options'}
      styles={customStyles}
    />
  );
}

export default SearchableSelect;
