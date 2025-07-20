'use client';
import MetricsCard from './metrics-card';

const chartMetricsList = [
  { value: 'cpc' },
  { value: 'cpm' },
  { value: 'ctr', suffix: '%' },
  { value: 'average_video_play' },
];

function Basictt({ data }: { data: any }) {
  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
      {chartMetricsList?.map(({ value, suffix }) => (
        <MetricsCard
          key={value}
          field={value}
          value={data?.[value]}
          suffix={suffix}
        />
      ))}
    </div>
  );
}

export default Basictt;
