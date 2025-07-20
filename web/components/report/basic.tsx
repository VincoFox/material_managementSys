'use client';
import { useTranslations } from 'next-intl';
import Total from './total';
import ChartCard from './chart-card';
import { useEffect, useState } from 'react';
import { DatePickerWithRange, DateRange } from '../ui-pro/date-picker';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { subDays } from 'date-fns';
import { queryMetricsByPostId } from '@/lib/api/material';
import { getFormattedDate } from '@/lib/datetime';
import { LoaderIcon } from '@/components/icons';

const chartMetricsList = [
  [
    { value: 'gmv', yAxisIndex: 0 },
    { value: 'spend', yAxisIndex: 0 },
    { value: 'roi', yAxisIndex: 1 },
  ],
  [
    { value: 'impressions', yAxisIndex: 0 },
    { value: 'video_views', yAxisIndex: 0 },
  ],
];
/**
 * 基础报表组件
 * @param {Object} props - 组件属性
 * @param {string} props.postId - 帖子ID，用于查询相关指标数据
 * @returns {JSX.Element} 返回包含日期选择器、汇总数据和图表的报表组件
 */
function Basic({
  postId,
  adPerformance,
}: {
  postId: string;
  adPerformance?: string;
}) {
  const { toast } = useToast();
  const t = useTranslations('Report');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const dateTime = adPerformance?.split(',');
    if (dateTime?.[0] && dateTime?.[1]) {
      const fromDate = new Date(dateTime[0]);
      const toDate = new Date(dateTime[1]);

      // 判断是否是合法日期
      if (!isNaN(fromDate.getTime()) && !isNaN(toDate.getTime())) {
        return {
          from: fromDate,
          to: toDate,
        };
      }
    }
    return {
      from: subDays(new Date(), 7),
      to: subDays(new Date(), 1),
    };
  });
  const [data, setData] = useState<any>({ summary: {}, trends: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    postId && handleSubmit();
  }, [postId]);
  /**
   * 处理日期范围变化
   * @param {DateRange | undefined} newDateRange - 新的日期范围
   */
  const handleDateRangeChange = (newDateRange?: DateRange) => {
    setDateRange(newDateRange);
  };
  /**
   * 提交查询请求
   * 根据当前选择的日期范围和帖子ID查询指标数据
   */
  const handleSubmit = () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast({
        title: 'Error',
        variant: 'destructive',
        description: t('message.data_time_empty'),
      });
      return;
    } else {
      setLoading(true);
      queryMetricsByPostId({
        start_date: getFormattedDate(dateRange.from),
        end_date: getFormattedDate(dateRange.to),
        post_id: postId + '',
      })
        .then(({ data, status }) => {
          if (status === 'success') {
            setData(data);
            console.log('queryMetricsByPostId', data);
          }
        })
        .catch((e) => {
          console.log('queryMetricsByPostId error', e);
        })
        .finally(() => setLoading(false));
    }
    console.log('handleSubmit', dateRange);
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-4'>
        {t('data_time')}
        <DatePickerWithRange
          className='flex-1'
          value={dateRange}
          onChange={handleDateRangeChange}
        />
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? <LoaderIcon size={16} /> : null}
          {t('search')}
        </Button>
      </div>
      <Total data={data} />
      {chartMetricsList?.map((item, index) => (
        <ChartCard key={index} target={item} source={data?.trends} />
      ))}
    </div>
  );
}

export default Basic;
