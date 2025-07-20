'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function Password({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const t = useTranslations('Password');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (value: string) => {
    onChange(value);
  };

  return (
    <div className='relative'>
      <Input
        id='password'
        placeholder={t('placeholder')}
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
      />
      <button
        type='button'
        onClick={() => setShowPassword(!showPassword)}
        className='absolute inset-y-0 right-0 mt-0 flex items-center px-3 text-gray-500 hover:text-gray-700'
      >
        {showPassword ? (
          <Eye className='h-5 w-5' />
        ) : (
          <EyeOff className='h-5 w-5' />
        )}
      </button>
    </div>
  );
}
