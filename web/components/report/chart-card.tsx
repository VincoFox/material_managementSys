'use client';
import Chart from '@/components/chart';
import { Title } from './title';
import useChartOptions from './use-chart-options';
import type { ChartOptions } from './use-chart-options';

function ChartCard(props: ChartOptions) {
  const { title, ...chartOptions } = useChartOptions(props);
  return (
    <div>
      <Title>{title}</Title>
      <div className='h-[350px] w-full'>
        <Chart {...chartOptions} />
      </div>
    </div>
  );
}

export default ChartCard;
