'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { subDays } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { MaterialFields } from '@/components/material/material-field';
import type { FieldConfig } from '@/components/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoaderIcon } from '@/components/icons';
import {
  DatePickerWithRange,
  type DateRange,
} from '@/components/ui-pro/date-picker';
import SortBy, { SortDirection } from '@/components/metrics/sort-by';
import MetricsFilter from '@/components/metrics/filter';

const defaultSortBy = {
  '': SortDirection.DESC,
};

const defaultFilterData = {
  material_id: '',
  material_name: '',
  external_id: '',
};
/**
 * 搜索页面组件
 * 用于展示和搜索素材数据，支持筛选、排序、分页等功能
 * @returns {JSX.Element} 返回搜索页面的React组件
 */
function SearchFilter({
  onSubmit,
}: {
  onSubmit: (values: any) => Promise<any>;
}) {
  const t = useTranslations('search');
  const { toast } = useToast();
  // 筛选条件数据
  const [filterData, setFilterData] = useState<any>(() => ({
    ...defaultFilterData,
  }));
  // 指标筛选条件数据
  const [metricsFilterData, setMetricsFilterData] = useState<any>({
    data_time: {
      from: subDays(new Date(), 7),
      to: subDays(new Date(), 1),
    },
  });
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    {} as DateRange
  );
  const [sortBy, setSortBy] = useState<
    Record<string, SortDirection | undefined>
  >({ gmv: SortDirection.DESC });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    handleSubmit();
  }, []);
  /**
   * 处理排序条件变化
   * @param {string} field 排序字段
   * @param {SortDirection} sort 排序方向
   */
  const handleChangeSortBy = (field: string, sort: SortDirection) => {
    setSortBy(field ? { [field]: sort } : defaultSortBy);
  };
  /**
   * 提交搜索请求
   */
  const handleSubmit = () => {
    const { data_time } = metricsFilterData;
    if (!(data_time?.from && data_time?.to)) {
      toast({
        title: 'Error',
        variant: 'destructive',
        description: 'please select Ad Performance',
      });
      return;
    }

    setIsLoading(true);
    onSubmit({ dateRange, filterData, metricsFilterData, sortBy }).finally(() =>
      setIsLoading(false)
    );
  };
  /**
   * 重置筛选条件
   */
  const handlReset = () => {
    setFilterData({ ...defaultFilterData });
    setDateRange(undefined);
  };

  const filterFields = [
    {
      field: 'created_at',
      node: (
        <DatePickerWithRange
          className='w-full flex-1'
          value={dateRange}
          onChange={setDateRange}
        />
      ),
    },
    {
      field: 'target_country',
      displayType: 'Select',
    },
    {
      field: 'target_platform',
      displayType: 'Select',
    },
    {
      field: 'first_level_category',
      displayType: 'MultiSelect',
    },
    {
      field: 'product_name',
      displayType: 'MultiSelect',
    },
    {
      field: 'material_category',
      displayType: 'Select',
    },
    {
      field: 'video_type',
      displayType: 'MultiSelect',
    },
    {
      field: 'topic',
      displayType: 'MultiSelect',
    },
    {
      field: 'owner_team',
      displayType: 'Select',
    },
    {
      field: 'editor_name',
      displayType: 'Select',
    },
    {
      field: 'director_name',
      displayType: 'Select',
    },
    {
      field: 'external_id',
      displayType: 'Input',
    },
    // {
    //   field: 'status',
    //   displayType: 'Select',
    //   options: Object.values(statusInfo).map((item) => ({
    //     value: item.value,
    //     label: item.value,
    //   })),
    // },
  ] as Array<FieldConfig>;

  const filterFields1 = [
    {
      field: 'material_id',
      displayType: 'Input',
    },
    {
      field: 'material_name',
      displayType: 'Input',
    },
  ] as Array<FieldConfig>;

  return (
    <div className='space-y-4'>
      <Card>
        <CardContent className='grid grid-cols-3 gap-x-3 gap-y-4 p-3 pt-5'>
          <MaterialFields
            data={filterData}
            fields={filterFields}
            hasMetadata={false}
            className='inline-flex'
            labelClassName='text-right'
            valueClassName='w-[230px]'
            onChange={setFilterData}
          />
          <div className='col-span-3 my-2 border-b'></div>
          <MaterialFields
            hasMetadata={false}
            data={filterData}
            fields={filterFields1}
            className='inline-flex'
            labelClassName=' text-right'
            valueClassName='w-[230px]'
            onChange={setFilterData}
          />

          <div className='text-right'>
            <Button variant='outline' size='sm' onClick={handlReset}>
              {t('reset')}
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card className='flex-1'>
        <CardHeader className='space-y-2 border-b px-4 py-3'>
          <div className='flex items-center'>
            {t('field.data_time')}：
            <DatePickerWithRange
              className='max-w-[280px] flex-1'
              value={metricsFilterData.data_time}
              onChange={(val) =>
                setMetricsFilterData((prev: any) => ({
                  ...prev,
                  data_time: val,
                }))
              }
            />
          </div>
          <div className='flex flex-row items-center justify-between gap-4'>
            <div className='flex items-center gap-2'>
              <MetricsFilter
                value={metricsFilterData}
                onChange={setMetricsFilterData}
              />

              <div className='mx-2 h-6 border-l'></div>
              <SortBy
                defaultLabel={t('field.created_at')}
                value={sortBy}
                onChange={handleChangeSortBy}
              />
            </div>
            <div className='flex items-center gap-4'>
              <Button
                onClick={handleSubmit}
                className='disabled:cursor-not-allowed disabled:opacity-50'
                disabled={isLoading}
                size='sm'
              >
                {isLoading ? (
                  <>
                    <LoaderIcon size={16} />
                    {t('searching')}
                  </>
                ) : (
                  t('search')
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}

export default SearchFilter;
