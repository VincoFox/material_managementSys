import React, { useState } from 'react';
import { format, subDays } from 'date-fns';
import { cn } from '@/lib/utils';

interface TimeRangeProps {
  start?: Date;
  end?: Date;
  value?: number;
  className?: string;
  onChange?: (days: number) => void;
  onTimeRangeChange?: (from: Date, to: Date) => void;
}

const QUICK_RANGES = [
  { label: '近 7 days', days: 7 },
  { label: '近 14 days', days: 14 },
  { label: '近 30 days', days: 30 },
  { label: '近 60 days', days: 60 },
];

const TimeRange: React.FC<TimeRangeProps> = ({
  start,
  end,
  value,
  onChange,
  onTimeRangeChange,
  className,
}) => {
  const [activeRange, setActiveRange] = useState<number>(value || 7);

  const handleQuickRangeClick = (days: number) => {
    const end = new Date();
    const start = subDays(end, days);

    setActiveRange(days);
    onChange?.(days);
    onTimeRangeChange?.(start, end);
  };

  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div className='flex flex-wrap gap-2'>
        {QUICK_RANGES.map((range) => (
          <button
            key={range.days}
            onClick={() => handleQuickRangeClick(range.days)}
            className={cn(
              'time-chip rounded-full px-3 py-1.5 text-sm transition-all',
              'border border-border',
              activeRange === range.days
                ? 'active'
                : 'bg-background hover:border-primary/40 hover:text-primary'
            )}
          >
            {range.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimeRange;
