import React, { useState } from 'react';
import { SearchIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SearchInputProps {
  onSearch: (query: string, type: string) => void;
  loading?: boolean;
  placeholder?: string;
  className?: string;
}

const SearchInput = ({ loading, onSearch, className }: SearchInputProps) => {
  const t = useTranslations('SearchInput');
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [queryType, setQueryType] = useState('ai');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, queryType);
  };

  return (
    <div
      className={cn(
        'relative w-full transition-all duration-300',
        isFocused ? 'scale-[1.01]' : 'scale-100',
        className
      )}
    >
      <form onSubmit={handleSearch}>
        <div
          className={cn(
            'relative flex items-center overflow-hidden rounded-xl',
            'border border-border bg-background',
            'transition-all duration-300 ease-in-out',
            isFocused ? 'border-primary/40 shadow-md' : 'shadow-sm'
          )}
        >
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={t('placeholder')}
            className={cn(
              'w-full pr-36',
              'border-none text-foreground placeholder:text-muted-foreground',
              'transition-all duration-300'
            )}
          />
          {query && (
            <button
              type='button'
              onClick={() => setQuery('')}
              className='absolute right-28 text-muted-foreground transition-colors duration-200 hover:text-foreground'
            >
              <span className='sr-only'>Clear search</span>
              <svg
                width='15'
                height='15'
                viewBox='0 0 15 15'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
                className='h-4 w-4'
              >
                <path
                  d='M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z'
                  fill='currentColor'
                ></path>
              </svg>
            </button>
          )}

          {/* 使用 Shadcn 的 Select 组件 */}
          {/* <Select value={queryType} onValueChange={handleOptionChange}>
            <SelectTrigger className='absolute left-0 top-0 w-20 rounded-r-none border-b-0 border-l-0 border-t-0 outline-none'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className='mt-1 rounded-md bg-white shadow-lg'>
              <SelectItem value='ai'>分镜</SelectItem>
              <SelectItem value='id'>id</SelectItem>
              <SelectItem value='name'>name</SelectItem>
            </SelectContent>
          </Select> */}
          <Button
            type='submit'
            className='absolute right-0 top-0 rounded-l-none text-white'
            disabled={loading}
          >
            <SearchIcon size={16} className='mr-2' />
            {t('search')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SearchInput;
