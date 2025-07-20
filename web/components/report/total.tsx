'use client';
import { useTranslations } from 'next-intl';
import { Title } from './title';
import MetricsCard from './metrics-card';

const chartMetricsList = [
  { value: 'gmv' },
  { value: 'spend' },
  { value: 'impressions' },
  { value: 'roi' },
  { value: 'video_views' },
];

function Total({ data }: { data: any }) {
  const { summary } = data || {};
  const t = useTranslations('Report');

  return (
    <div>
      <Title>{t('total')}</Title>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5'>
        {chartMetricsList?.map(({ value }) => (
          <MetricsCard key={value} field={value} value={summary?.[value]} />
        ))}
      </div>
    </div>
  );
}
export default Total;
