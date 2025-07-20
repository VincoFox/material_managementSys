'use client';
import { useTranslations } from 'next-intl';
import MetricsCard from './metrics-card';

const chartMetricsList = [
  { value: 'gmv' },
  { value: 'spend' },
  { value: 'roi' },
];

function AccountTotal({ data }: { data: any }) {
  const t = useTranslations('Report');

  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3'>
      {chartMetricsList?.map(({ value }) => (
        <MetricsCard key={value} field={value} value={data?.[value]} />
      ))}
    </div>
  );
}
export default AccountTotal;
