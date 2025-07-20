'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { subDays } from 'date-fns';
import { getFormattedDate } from '@/lib/datetime';
import { queryMaterial, queryMaterialByMetrics } from '@/lib/api/material';
import { useToast } from '@/hooks/use-toast';
import type { Material } from '@/components/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pushto } from '@/components/pushto';
import { Download } from '@/components/download';
import { PaginationProps } from '@/components/ui-pro/pagination';
import { isMetricsSort } from '@/components/metrics/sort-by';
import { isMetricsFilter } from '@/components/metrics/filter';
import useMergeMetrics from '@/components/material/use-merge-metrics';
import List from '@/components/material/list';
import SearchFilter from '@/components/material/search-filter';
import { create } from 'domain';

const defaultPageSize = 10;
/**
 * 搜索页面组件
 * 用于展示和搜索素材数据，支持筛选、排序、分页等功能
 * @returns {JSX.Element} 返回搜索页面的React组件
 */
function Search() {
  const t = useTranslations('search');
  const { toast } = useToast();
  const { getMaterialMetricsList, getMaterialList } = useMergeMetrics();
  // 筛选条件数据
  const [filterParams, setFilterParams] = useState<any>();
  const [listData, setListData] = useState<Material[]>([]);
  const [isSelect, setIsSelect] = useState(false);
  const [isAll, setIsAll] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [pagination, setPagination] = useState<
    Omit<PaginationProps, 'onChange'>
  >({ pageIndex: 1, total: 1, pageSize: defaultPageSize });
  /**
   * 获取数据
   * 根据当前筛选条件和分页信息查询素材数据
   * @async
   * @returns {Promise<void>}
   */
  const fetchData = async (values = filterParams, pageParams = pagination) => {
    let isMetricsQuery = false;
    const { filterData, metricsFilterData, dateRange, sortBy } = values || {};
    if (
      // !filterData.external_id &&
      isMetricsFilter(metricsFilterData) ||
      isMetricsSort(sortBy)
    ) {
      isMetricsQuery = true;
    }

    let queryLabels = { ...filterData };
    const { material_id } = queryLabels;
    if (material_id) {
      const materialIds = Array.isArray(material_id)
        ? material_id
        : material_id.split(',').map((id: string) => id.trim());

      queryLabels.material_id = materialIds;
    }

    const created_at = {
      from: dateRange?.from ? getFormattedDate(dateRange?.from) : undefined,
      to: dateRange?.to ? getFormattedDate(dateRange?.to) : undefined,
    };

    if (isMetricsQuery) {
      const { data_time, ...otherFilter } = metricsFilterData;
      if (!(data_time?.from && data_time?.to)) {
        toast({
          title: 'Error',
          variant: 'destructive',
          description: '请选择数据日期',
        });
        return;
      }

      return queryMaterialByMetrics(
        {
          ...otherFilter,
          data_time: {
            from: getFormattedDate(data_time.from),
            to: getFormattedDate(data_time.to),
          },
        },
        queryLabels,
        {
          material_created_at: {
            min: created_at.from,
            max: created_at.to,
          },
        },
        sortBy,
        pagination
      ).then(({ data, count, error, message }) => {
        if (error) {
          toast({
            title: 'Error',
            description: message || error.message,
            variant: 'destructive',
          });
        } else {
          setListData(data || []);
          setPagination((prev) => ({
            ...prev,
            total: count || defaultPageSize,
          }));
          data?.length &&
            getMaterialList(data)
              .then((mergedData) => {
                setListData(mergedData || []);
              })
              .catch((e) => {
                toast({
                  title: 'Error',
                  variant: 'destructive',
                  description: e.message,
                });
              });
        }
      });
    }

    const { copyright_platform, ...otherFilterData } = queryLabels;
    return queryMaterial(
      {
        ...otherFilterData,
        created_at,
        metadata: { copyright_platform },
      },
      pageParams
    ).then(({ data, count, error }) => {
      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        setListData(data || []);

        setPagination((prev) => ({
          ...prev,
          total: count || 0,
        }));

        data?.length &&
          getMaterialMetricsList(metricsFilterData, data)
            .then((mergedData) => {
              setListData(mergedData || []);
            })
            .catch((e) => {
              toast({
                title: 'Error',
                variant: 'destructive',
                description: e.message,
              });
            });
      }
    });
  };
  /**
   * 处理选择状态
   * @param {boolean} isSelect 是否进入选择模式
   * @param {boolean} [isAll=false] 是否全选
   */
  const handleIsSelect = (isSelect: boolean, isAll = false) => {
    setIsSelect(isSelect);
    if (!isSelect) {
      setIsAll(false);
      setSelected([]);
    } else if (isAll) {
      setSelected(listData?.map((item) => item.material_id) || []);
      setIsAll(true);
    }
  };
  /**
   * 处理单个素材的选择状态
   * @param {number} id 素材ID
   */
  const handleChangeSelect = (id: number) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((val) => val !== id));
    } else {
      setSelected([...selected, id]);
    }
  };
  /**
   * 提交搜索请求
   */
  const handleSubmit = (values: any) => {
    console.log('handleSubmit', values);
    const newPagination = {
      ...pagination,
      pageIndex: 1,
    };
    setPagination(newPagination);
    setFilterParams(values);
    return fetchData(values, newPagination);
  };
  /**
   * 处理分页变化
   * @param {number} current 当前页码
   */
  const handleChangePagination = (current: number) => {
    const newPagination = {
      ...pagination,
      pageIndex: current,
    };
    setPagination(newPagination);
    fetchData(filterParams, newPagination);
  };

  const selectedFilePaths: any[] = selected?.length
    ? listData
        .filter((item) => selected.includes(item.material_id))
        .map((item) => item.file_path)
        .filter((i) => i)
    : [];

  const adPerformance = [
    getFormattedDate(filterParams?.metricsFilterData?.data_time?.from),
    getFormattedDate(filterParams?.metricsFilterData?.data_time?.to),
  ].join(',');

  return (
    <div className='space-y-4'>
      <SearchFilter onSubmit={handleSubmit} />
      <Card className='flex-1'>
        <CardContent className='p-4'>
          <div className='mb-4 flex justify-between'>
            <div className='space-x-3'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => handleIsSelect(!isSelect)}
              >
                {t(isSelect ? 'unselect' : 'select')}
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => handleIsSelect(!isAll, !isAll)}
              >
                {t(isAll ? 'notIsAll' : 'isAll')}
              </Button>
            </div>
            <div className='space-x-3'>
              {!!selectedFilePaths?.length && (
                <Download
                  variant='outline'
                  size='sm'
                  file_path={selectedFilePaths}
                />
              )}

              <Pushto variant='outline' size='sm' ids={selected} />
            </div>
          </div>
          <List
            dataSource={listData}
            isSelect={isSelect}
            selected={selected}
            adPerformance={adPerformance}
            pagination={{ ...pagination, onChange: handleChangePagination }}
            onChangeSelect={handleChangeSelect}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default Search;
