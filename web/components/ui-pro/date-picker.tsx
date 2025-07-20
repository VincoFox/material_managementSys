'use client';

import * as React from 'react';
import { getFormattedDate } from '@/lib/datetime';
import { CalendarIcon } from 'lucide-react';
import { DateRange as DateRangeProps } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useTranslations } from 'next-intl';

export interface DateRange extends Partial<DateRangeProps> {}

function DatePicker({
  value,
  className,
  placeholder,
  onChange,
}: {
  className?: string;
  value?: Date;
  placeholder?: string;
  onChange?: (date: Date | undefined) => void;
}) {
  return (
    <div className={cn('w-full', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id='date'
            variant={'outline'}
            className={cn(
              'w-full justify-start border-0 px-2 text-left font-normal',
              !value && 'text-muted-foreground'
            )}
          >
            <CalendarIcon size={18} className='mr-2 text-muted-foreground' />
            {value ? getFormattedDate(value) : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' align='start'>
          <Calendar
            mode='single'
            defaultMonth={value}
            selected={value}
            onSelect={onChange}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function DatePickerWithRange({
  value,
  className,
  onChange,
}: {
  className?: string;
  value?: DateRange;
  onChange?: (date: DateRange | undefined) => void;
}) {
  const t = useTranslations('DatePicker');
  const handleChange = (date: DateRange) => {
    if (date?.from && date?.to && date?.from > date?.to) {
      onChange?.({
        from: date?.to,
        to: date?.from,
      });
    } else {
      onChange?.(date);
    }
  };

  return (
    <div
      className={cn(
        'flex w-full grid-cols-2 items-center rounded-sm border',
        className
      )}
    >
      <DatePicker
        value={value?.from}
        onChange={(from) => handleChange?.({ ...value, from })}
        className='flex-1'
        placeholder={t('start')}
      />
      <span className='px-1 text-muted-foreground'>-</span>
      <DatePicker
        value={value?.to}
        onChange={(to) => handleChange?.({ ...value, to })}
        className='flex-1'
        placeholder={t('end')}
      />
    </div>
  );
}
