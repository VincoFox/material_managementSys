'use client';
import { useAllMetricsOptions } from '../metrics/metrics';
import { useMemo } from 'react';
import { ChartProps } from '../chart';

interface ChartOptions {
  target: any[];
  data?: any;
  source?: any[];
  xAxis?: any;
  legend?: any;
}

const useChartOptions = ({
  data,
  source,
  target,
  xAxis,
  legend,
}: ChartOptions): ChartProps & { title: string } => {
  const metrics = useAllMetricsOptions();

  return useMemo(() => {
    const metricsLabes = {} as Record<string, string>;
    target.forEach(({ value }) => {
      metricsLabes[value] =
        metrics.find((item) => item.value === value)?.label || value;
    });

    let dimensions;

    if (source) {
      dimensions = ['stat_date', ...target.map(({ value }) => value)];
    }

    const yAxis = [
      {
        name: '',
        type: 'value',
        alignTicks: true,
        nameTextStyle: {
          align: 'left',
        },
      },
    ];

    target.forEach(({ value, yAxisIndex, tooltipFormatter }) => {
      const axis = yAxis[yAxisIndex];
      if (axis) {
        yAxis[yAxisIndex].name += yAxis[yAxisIndex].name
          ? `/${metricsLabes[value]}`
          : metricsLabes[value];
      } else {
        yAxis.push({
          name: metricsLabes[value],
          type: 'value',
          axisLabel: {
            formatter: tooltipFormatter || ((value: number) => value), // 为ctr和cvr添加单位
          },
        } as any);
      }
    });

    return {
      title: target.map(({ value }) => metricsLabes[value]).join('/'),
      dimensions,
      source,
      xAxis: {
        type: 'category',
        ...xAxis,
      },
      yAxis,
      legend: legend,
      series: target.map(({ value, yAxisIndex, tooltipFormatter }) => ({
        name: metricsLabes[value],
        type: 'line',
        yAxisIndex,
        data: data?.[value],
        tooltip: {
          valueFormatter: tooltipFormatter || ((val: number) => val + ''),
        },
      })),
    };
  }, [target, data, source, xAxis, legend]);
};

export type { ChartOptions };

export default useChartOptions;
