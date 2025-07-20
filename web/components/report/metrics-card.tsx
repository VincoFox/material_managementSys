'use client';
import { useTranslations } from 'next-intl';
import { Card } from '../ui/card';
import { formatValue } from '@/lib/value-format';

const MetricsCard = ({
  field,
  value,
  suffix,
}: {
  field: string;
  value: string;
  suffix?: string;
}) => {
  const t = useTranslations('Metrics');
  return (
    <Card className='w-full p-4'>
      <div className='flex justify-between'>
        <div className='text-sm text-gray-600'>
          {t.has(field) ? t(field) : field}
        </div>
      </div>
      <div className='mt-2 text-2xl font-bold'>
        {formatValue(value)}
        {suffix}
      </div>
    </Card>
  );
};

export default MetricsCard;
