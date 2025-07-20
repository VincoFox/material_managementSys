'use client';
import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { subDays } from 'date-fns';
import { getFormattedDate } from '@/lib/datetime';
import { OrderBy, FilterData } from '@/lib/api/material';
import { getStoryboard } from '@/lib/api/storyboard';
import SearchInput from '@/components/ui-pro/search-input';
import { useAppLayout } from '@/components/app-layout';
import type { Material, VideoStoryboard } from '@/components/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { SortDirection } from '@/components/metrics/sort-by';
import { useToast } from '@/hooks/use-toast';
import MetricsSort from '@/components/metrics/sort-by';
import { Filter } from '@/components/metrics/filter';
import { MaterialFields } from '@/components/material/material-field';
import { fieldsMap } from '@/components/material/use-form-field';
import { ModuleLoading } from '@/components/module-loading';
import { DatePickerWithRange } from '@/components/ui-pro/date-picker';
import useMergeMetrics from '@/components/material/use-merge-metrics';
import List from '@/components/material/list';

type ListItemType = Material & { storyboard: VideoStoryboard };

const defaultSortBy = {
  '': SortDirection.DESC,
};

const useDefaultSortLabel = () => {
  const t = useTranslations('Storyboard');
  return t('similarity');
};
/**
 * AI搜索页面组件，用于展示和管理素材搜索结果
 */
const AiSearch = () => {
  const t = useTranslations('search');
  const { toast } = useToast();
  const { getMaterialMetricsList } = useMergeMetrics();
  const { metadata } = useAppLayout();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterData, setFilterData] = useState({});
  const [metricsFilterData, setMetricsFilterData] = useState<FilterData>({
    data_time: {
      from: subDays(new Date(), 7),
      to: subDays(new Date(), 1),
    },
  });
  const [sortBy, setSortBy] = useState<OrderBy>(defaultSortBy);
  const [listData, setListData] = useState<ListItemType[]>();
  const [loading, setLoading] = useState(false);
  const defaultSortLabel = useDefaultSortLabel();

  const localFields = useMemo(() => {
    const copyright_platform = metadata?.find(
      (item: any) => item.field === 'copyright_platform'
    );

    const filterFields = [
      fieldsMap.target_country,
      fieldsMap.target_platform,
      fieldsMap.source_type,
      { ...fieldsMap.product_name, displayType: 'MultiSelect' },
    ];
    return copyright_platform
      ? [...filterFields, copyright_platform]
      : filterFields;
  }, [metadata]);

  const filterList = useMemo(() => {
    const filterArray = Object.entries(filterData);

    let result: ListItemType[] | undefined = [];
    if (
      filterArray.length === 0 ||
      filterArray.every(([key, value]) =>
        Array.isArray(value) ? value.length === 0 : !value
      )
    ) {
      result = listData;
    } else {
      result = listData?.filter((item: any) => {
        return filterArray.every(([key, value]) => {
          const itemValue = item[key] || item.metadata?.[key];
          if (!value) {
            return true;
          }
          if (Array.isArray(value)) {
            if (value.length < 1) return true;
            return Array.isArray(itemValue)
              ? value.some((valueItem) => itemValue.includes(valueItem))
              : value.includes(itemValue);
          }
          return itemValue === value;
        });
      });
    }

    // 添加排序逻辑
    if (result && sortBy) {
      const [sortField, sortDirection] = Object.entries(sortBy)[0] || [];
      if (sortField && sortDirection) {
        result = [...result].sort((a: any, b: any) => {
          const aValue = a[sortField] ?? 0;
          const bValue = b[sortField] ?? 0;
          if (sortDirection === SortDirection.DESC) {
            return bValue - aValue;
          }
          return aValue - bValue;
        });
      }
    }

    return result;
  }, [listData, filterData, sortBy]);
  /**
   * 获取素材列表数据
   * @param metricsFilterData - 指标过滤条件
   * @param materialList - 可选，初始素材列表
   */
  const getMaterialList = async (
    metricsFilterData: FilterData,
    materialList?: ListItemType[]
  ) => {
    console.log('getMaterialList=======', metricsFilterData, materialList);
    getMaterialMetricsList(metricsFilterData, materialList)
      .then((data) => {
        setListData(data || []);
      })
      .catch((e) => {
        toast({
          title: 'Error',
          variant: 'destructive',
          description: e.message,
        });
      });
  };
  /**
   * 处理搜索操作
   * @param query - 搜索关键词
   * @param queryType - 搜索类型
   */
  const handleSearch = (query: string, queryType: string) => {
    setSearchKeyword(query);
    setFilterData({});
    setListData([] as any);

    setLoading(true);
    console.log('handleSubmit=======', query, queryType);
    if (!query) {
      toast({
        title: '请输入搜索内容',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }
    getStoryboard(query)
      .then(({ data, error }) => {
        if (error) {
          return Promise.reject(error);
        }
        setListData(data);
        if (data?.length) {
          getMaterialList(metricsFilterData, data);
        }
      })
      .catch((e) => {
        toast({
          title: 'Error',
          variant: 'destructive',
          description: e.message,
        });
        console.error('res=======error=====', e);
      })
      .finally(() => setLoading(false));
  };
  /**
   * 处理排序操作
   * @param field - 排序字段
   * @param sort - 排序方向
   */
  const handleSort = async (field: string, sort: SortDirection | undefined) => {
    setSortBy(field ? { [field]: sort } : defaultSortBy);
  };
  /**
   * 处理日期范围变化
   * @param value - 新的日期范围
   */
  const handleDataTimeChange = (value: any) => {
    const newMetricsFilterData = {
      ...metricsFilterData,
      data_time: value,
    };
    setMetricsFilterData(newMetricsFilterData);
    getMaterialList(newMetricsFilterData, listData);
  };
  /**
   * 处理指标过滤条件变化
   * @param data - 新的过滤条件
   */
  const handleMetricsFilterDataChange = (data: FilterData) => {
    setMetricsFilterData(data);
  };

  let statusComp = null;
  if (loading) {
    statusComp = (
      <div>
        <ModuleLoading loading />
      </div>
    );
  } else if (!listData?.length) {
    statusComp = (
      <div className='py-20 text-center text-lg text-muted-foreground'>
        {searchKeyword ? (
          t('noResult')
        ) : (
          <>
            {t('noSearch')} <div>{t('noSearchTips')}</div>
          </>
        )}
      </div>
    );
  }

  const adPerformance = [
    metricsFilterData?.data_time?.from
      ? getFormattedDate(metricsFilterData?.data_time?.from)
      : '',
    metricsFilterData?.data_time?.to
      ? getFormattedDate(metricsFilterData?.data_time?.to)
      : '',
  ].join(',');

  return (
    <div className='min-h-full space-y-4'>
      <div className='bg-background p-3'>
        <SearchInput loading={loading} onSearch={handleSearch} />
      </div>
      <div className='space-y-4 bg-background p-3'>
        {statusComp}

        {!!listData?.length && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>{t('filterTitle')}</CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='grid grid-cols-1 gap-4'>
                  <MaterialFields
                    fields={localFields}
                    data={filterData}
                    hasMetadata={false}
                    onChange={setFilterData}
                  />
                </div>
                <div className='space-y-4'>
                  <Filter
                    showMetrics={false}
                    value={metricsFilterData}
                    onChange={handleMetricsFilterDataChange}
                  />

                  <div className='flex items-center gap-2'>
                    <div className='w-32'>{t('field.data_time')}</div>
                    <DatePickerWithRange
                      className='max-w-[280px] flex-1'
                      value={metricsFilterData.data_time}
                      onChange={handleDataTimeChange}
                    />
                  </div>
                  <div className='flex gap-4'>
                    <MetricsSort
                      defaultLabel={defaultSortLabel}
                      value={sortBy}
                      onChange={handleSort}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            <List dataSource={filterList} adPerformance={adPerformance} />
          </>
        )}
      </div>
    </div>
  );
};

export default AiSearch;
