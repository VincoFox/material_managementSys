'use client';
import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { ModuleLoading } from '@/components/module-loading';
import ChartCard from './chart-card';
import { queryHighlightFrame } from '@/lib/tt/report';
import { useToast } from '@/hooks/use-toast';

const chartMetrics = [
  { value: 'clicks', yAxisIndex: 0 },
  { value: 'retain', yAxisIndex: 0 },
  { value: 'drop_off', yAxisIndex: 0 },
  { value: 'ctr', yAxisIndex: 1, tooltipFormatter: (val: number) => `${val}%` },
  { value: 'conversions', yAxisIndex: 0 },
  { value: 'cvr', yAxisIndex: 1, tooltipFormatter: (val: number) => `${val}%` },
];

const options = {
  xAxis: {
    axisLabel: {
      formatter: (value: string, index: number) => `${index}s`, // 展示数组下标并添加单位"s"
    },
  },
};

function HighlightFrame({
  advertiserId,
  materialId,
}: {
  advertiserId: string;
  materialId: string;
}) {
  const { toast } = useToast();
  const t = useTranslations('Metrics');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>({});

  const getHighlightFrame = (material_id: string, advertiser_id: string) => {
    setLoading(true);
    queryHighlightFrame({
      advertiser_id,
      tt_material_id: material_id,
    })
      .then(({ data }) => {
        setData(data?.list?.[0]?.metrics || {});
      })
      .catch((e) => {
        console.error('queryHighlightFrame error', e);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const legend = useMemo(() => {
    console.log('legend', t('conversions'), t('cvr'));
    return {
      selected: {
        [t('clicks')]: false,
        [t('retain')]: false,
        [t('drop_off')]: false,
        [t('conversions')]: false,
      },
    };
  }, [t]);

  useEffect(() => {
    materialId && getHighlightFrame(materialId, advertiserId);
  }, [materialId, advertiserId]);

  return (
    <div className='relative'>
      <ModuleLoading loading={loading} className='absolute z-10' />
      <ChartCard
        data={data}
        target={chartMetrics}
        {...options}
        legend={legend}
      />
    </div>
  );
}

export default HighlightFrame;
