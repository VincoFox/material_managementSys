'use client';
import * as echarts from 'echarts';
import { useEffect, useRef } from 'react';

interface ChartProps extends Omit<echarts.EChartsOption, 'title'> {
  dimensions?: string[];
  type?: 'line' | 'bar';
  source?: any[];
}

function Chart({
  dimensions,
  source,
  xAxis,
  yAxis,
  series,
  type = 'line',
  legend,
}: ChartProps) {
  const chartDom = useRef(null);
  const chart = useRef<any>(null);
  const resizeObserverRef = useRef<any>(null);
  useEffect(() => {
    if (chartDom.current && !chart.current) {
      const chartInstance = echarts.init(chartDom.current);
      chartInstance.setOption({
        tooltip: {
          trigger: 'axis',
        },
        xAxis: { type: 'category' },
        yAxis: {
          type: 'value',
        },
        grid: {
          containLabel: true,
          top: 30,
          bottom: 30,
          left: 20,
          right: 30,
        },
        legend: {
          show: true, // 显示图例
        },
      });
      chart.current = chartInstance;

      if (window.ResizeObserver) {
        // 使用 ResizeObserver 监听容器大小变化
        const resizeObserver = new ResizeObserver(() => {
          chart.current?.resize();
        });

        // 开始观察图表容器
        resizeObserver.observe(chartDom.current);
        resizeObserverRef.current = resizeObserver;
      }
    }
    return () => {
      if (process.env.NODE_ENV !== 'development') {
        chartDom.current &&
          resizeObserverRef.current?.unobserve(chartDom.current);
        chart.current?.dispose();
      }
    };
  }, []);

  useEffect(() => {
    const option = {
      ...(dimensions || source ? { dataset: { dimensions, source } } : {}),
      ...(xAxis ? { xAxis } : null),
      yAxis: yAxis || {},
      series: series || [{ type }],
      legend,
    };
    chart.current?.setOption(option);
  }, [dimensions, source, legend, xAxis, yAxis, series]);
  return <div ref={chartDom} className='h-full w-full'></div>;
}

export type { ChartProps };
export default Chart;
