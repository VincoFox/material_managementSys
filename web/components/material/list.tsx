import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Material, VideoStoryboard } from '../types';
import Item from '@/components/material/material-card';
import { Checkbox } from '@/components/ui/checkbox';
import Pagination, { PaginationProps } from '@/components/ui-pro/pagination';

const defaultPageSize = 10;

export default function List({
  dataSource,
  isSelect,
  selected,
  pagination,
  adPerformance,
  onChangeSelect,
}: {
  dataSource?: (Material & { storyboard?: VideoStoryboard })[];
  isSelect?: boolean;
  selected?: number[];
  adPerformance?: string;
  pagination?: PaginationProps;
  onChangeSelect?: (id: number) => void;
}) {
  const t = useTranslations('List');
  const [localPagination, setLocalPagination] = useState<
    Omit<PaginationProps, 'onChange'>
  >({ pageIndex: 1, total: 1, pageSize: defaultPageSize });
  // 计算当前页的数据
  const getCurrentPageData = () => {
    if (!dataSource) return [];
    if (pagination) return dataSource;
    const { pageIndex, pageSize } = localPagination;
    const start = (pageIndex - 1) * pageSize!;
    const end = start + pageSize!;
    return dataSource.slice(start, end);
  };

  useEffect(() => {
    if (pagination) return;
    setLocalPagination({
      pageIndex: 1,
      total: dataSource?.length || 0,
      pageSize: defaultPageSize,
    });
  }, [dataSource, pagination]);

  const handleChangePagination = (pageIndex: number) => {
    setLocalPagination({
      ...localPagination,
      pageIndex,
    });
  };

  const localList = getCurrentPageData();

  return (
    <div>
      {localList.length ? (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
          {localList.map(({ storyboard, ...item }) => {
            const materialInfo = item as Material;
            return (
              <div
                className='relative'
                key={storyboard?.shot_id + 'm' + materialInfo.material_id}
              >
                {isSelect && (
                  <div className='absolute bottom-1 left-1 right-1 z-10 bg-white/80 p-1'>
                    <Checkbox
                      checked={selected?.includes(item.material_id)}
                      onClick={() => onChangeSelect?.(item.material_id)}
                      className='h-6 w-6 border-2'
                    />
                  </div>
                )}
                <Item
                  material={materialInfo}
                  storyBoard={storyboard}
                  adPerformance={adPerformance}
                  className='h-full'
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className='pt-10 text-center text-lg text-muted-foreground'>
          {t('noResult')}
        </div>
      )}
      {pagination ? (
        <Pagination {...pagination} />
      ) : (
        <Pagination {...localPagination} onChange={handleChangePagination} />
      )}
    </div>
  );
}
