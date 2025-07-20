'use client';

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { metricsList, useSortOptions, OptionProps } from './metrics';

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export interface OrderBy {
  [key: string]: SortDirection | undefined;
}

function isMetricsSort(value: OrderBy) {
  const key = value && Object.keys(value)?.[0];
  return key ? metricsList.includes(key) : false;
}

function SortItem({
  selected,
  item,
  onChange,
}: {
  item: OptionProps;
  onChange: (field: string, value: SortDirection) => void;
  selected?: OrderBy;
}) {
  return (
    <div className='flex items-center gap-4'>
      <div className='w-24'>{item.label}</div>
      <Button
        size='sm'
        variant={
          selected?.[item.value] === SortDirection.DESC
            ? 'default'
            : 'secondary'
        }
        onClick={() => onChange(item.value, SortDirection.DESC)}
      >
        <ArrowDown size={18} />
      </Button>
      <Button
        size='sm'
        variant={
          selected?.[item.value] === SortDirection.ASC ? 'default' : 'secondary'
        }
        onClick={() => onChange(item.value, SortDirection.ASC)}
      >
        <ArrowUp size={18} />
      </Button>
    </div>
  );
}

const SortBy = ({
  value,
  options,
  onChange,
  defaultLabel,
}: {
  onChange: (field: string, value: SortDirection) => void;
  value?: OrderBy;
  options?: OptionProps[];
  defaultLabel?: string;
}) => {
  const t = useTranslations('Sort');
  const sortOptions = useSortOptions();

  const getSelectedOption = (key: string) => {
    const sortOption = sortOptions.find((item) => item.value === key);
    if (!sortOption) {
      return options?.find((item) => item.value === key);
    } else {
      return sortOption;
    }
  };

  return (
    <div className='inlin-flex items-center'>
      {t('sortBy')}
      <Popover>
        <PopoverTrigger className='text-primary'>
          <div className='flex items-center gap-1'>
            {value
              ? Object.entries(value).map(([key, value]) => (
                  <div key={key} className='ml-1 flex items-center gap-1'>
                    {key ? getSelectedOption(key)?.label || key : defaultLabel}
                    {value === SortDirection.DESC ? (
                      <ArrowDown size={14} />
                    ) : (
                      <ArrowUp size={14} />
                    )}
                  </div>
                ))
              : defaultLabel}
          </div>
        </PopoverTrigger>
        <PopoverContent className='space-y-4'>
          {options?.map((item) => (
            <SortItem
              key={item.value}
              selected={value}
              item={item}
              onChange={onChange}
            />
          ))}
          {sortOptions.map((item) => (
            <SortItem
              key={item.value}
              selected={value}
              item={item}
              onChange={onChange}
            />
          ))}
          <div className='flex justify-end'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => onChange('', SortDirection.DESC)}
            >
              {t('reset')}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
export { isMetricsSort };
export default SortBy;
