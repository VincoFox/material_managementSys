'use client';
import React from 'react';
import { SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

interface InputSearchProps {
  value?: string;
  onChange?: (value: string) => void;
}

const InputSearch = ({ value, onChange }: InputSearchProps) => {
  const t = useTranslations('inputSearch');
  const [localValue, setLocalValue] = React.useState(value || '');
  const handleSearch = () => {
    onChange?.(localValue);
  };

  return (
    <div className='relative rounded-md shadow-sm'>
      <Input
        type='text'
        placeholder={t('placeholder')}
        className='pr-[100px]'
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
      />
      <Button onClick={handleSearch} className='absolute right-0 top-0'>
        <SearchIcon size={16} className='mr-2' />
        {t('search')}
      </Button>
    </div>
  );
};

export default InputSearch;
