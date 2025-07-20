'use client';

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { useTranslations } from 'next-intl';
import { useFilterOptions, metricsList } from './metrics';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';

interface FilterProps {
  value?: { [key: string]: any };
  onChange: (value: any, field?: string) => void;
  showMetrics?: boolean;
}

function isMetricsFilter(value: FilterProps['value']) {
  const options = value && Object.entries(value);
  if (!options) return false;
  return options.some(([key, value]) => {
    const { min, max } = value || ({} as any);
    return metricsList.includes(key) && (max || min);
  });
}

function metricsFilterCount(value: FilterProps['value']) {
  const options = value && Object.entries(value);
  if (!options) return 0;
  return options.filter(([key, value]) => {
    const { min, max } = value || ({} as any);
    return metricsList.includes(key) && (max || min);
  }).length;
}

const MetricsItem = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: { max?: string; min?: string };
  onChange: (value: { [key: string]: any }) => void;
}) => {
  const isSelected = value?.min || value?.max;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Badge
          variant='outline'
          className={cn(
            'cursor-pointer text-sm hover:bg-accent',
            isSelected ? 'text-primary' : ''
          )}
          onMouseEnter={(e) => {
            const target = e.currentTarget;
            target.click(); // 触发 Popover 打开
          }}
        >
          {label}
        </Badge>
      </PopoverTrigger>
      <PopoverContent className='flex flex-wrap gap-3'>
        <div className='flex items-center gap-2'>
          <div className='w-12'>min:</div>
          <Input
            type='number'
            className='h-6 flex-1'
            value={value?.min || ''}
            onChange={(e) => onChange({ ...value, min: e.target.value })}
          />
        </div>
        <div className='flex items-center gap-2'>
          <div className='w-12'>max:</div>
          <Input
            type='number'
            className='h-6 flex-1'
            value={value?.max || ''}
            onChange={(e) => onChange({ ...value, max: e.target.value })}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};

const Filter = ({ value, showMetrics = true, onChange }: FilterProps) => {
  const t = useTranslations('Metrics');
  const filterOptions = useFilterOptions();
  const handleChange = (field: string, val: { [key: string]: any }) => {
    onChange({ ...value, [field]: val }, field);
  };
  return (
    <div className='space-y-6'>
      {showMetrics && (
        <div className='flex flex-wrap gap-2'>
          {filterOptions.map((item) => (
            <MetricsItem
              key={item.value}
              label={item.label}
              value={value?.[item.value]}
              onChange={(value) => handleChange(item.value, value)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FilterPopover = (props: FilterProps) => {
  const t = useTranslations('MetricsFilter');
  const count = useMemo(() => {
    return metricsFilterCount(props.value) || 0;
  }, [props.value]);

  return (
    <Popover>
      <PopoverTrigger className='relative text-primary'>
        {t('button')}
        {count > 0 && (
          <Badge className='absolute -right-6 -top-4 min-w-5 -translate-x-1/2 px-1'>
            {count}
          </Badge>
        )}
      </PopoverTrigger>
      <PopoverContent className='w-[550px]'>
        <Filter {...props} />
        <div className='flex justify-end'>
          <Button
            variant='outline'
            onClick={() =>
              props.onChange({ data_time: props.value?.data_time })
            }
          >
            {t('reset')}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export { Filter, isMetricsFilter };
export default FilterPopover;
