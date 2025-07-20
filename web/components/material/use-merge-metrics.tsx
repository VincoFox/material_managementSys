import {
  queryMaterialMetricsByIds,
  queryMaterialByIds,
  FilterData,
} from '@/lib/api/material';
import type { Material, VideoStoryboard } from '@/components/types';
import { useTranslations } from 'next-intl';
import { getFormattedDate } from '@/lib/datetime';
type ListItemType = Material & { storyboard?: VideoStoryboard };

/**
 * 自定义Hook，用于合并物料指标数据
 * @returns {Object} 包含两个方法的对象：getMaterialList和getMaterialMetricsList
 */
const useMergeMetrics = () => {
  const t = useTranslations('search');

  const getMaterialMetricsList = async (
    metricsFilterData: FilterData,
    materialList?: ListItemType[]
  ) => {
    const { data_time } = metricsFilterData;
    if (!(data_time?.from && data_time?.to)) {
      throw new Error('please select ' + t('field.data_time'));
    } else {
      const postIds = materialList
        ?.map((item) => item.external_id)
        ?.filter(Boolean);
      return queryMaterialMetricsByIds({
        post_ids: postIds as any[],
        start_date: getFormattedDate(data_time.from),
        end_date: getFormattedDate(data_time.to),
      }).then(({ data, status, error, message }) => {
        if (error) {
          throw new Error(message || error.message);
        }
        if (status === 'success') {
          // 创建external_id到metrics的映射
          const metricsMap = new Map(
            data.map((item: any) => [item.post_id, item])
          );

          // 合并数据到materialList
          const mergedList = materialList?.map((item) => {
            const { material_id, ...metrics } =
              metricsMap.get(item.external_id + '') || ({} as any);
            return { ...item, ...metrics };
          });

          console.log('mergedList=======', mergedList, metricsMap, data);
          return mergedList;
        }
        console.log('mergedList===status====', status, data);
        return materialList;
      });
    }
  };

  const getMaterialList = async (materialList: any[]) => {
    const matetialIds = materialList?.map((item) => item.material_id);
    return queryMaterialByIds(matetialIds).then(({ data, error }) => {
      if (error) {
        throw new Error(error.message);
      } else if (!error) {
        // 创建material_id到metrics的映射
        const metricsMap = new Map(
          data.map((item: any) => [item.material_id + '', item])
        );

        // 合并数据到materialList
        const mergedList = materialList?.map((item) => {
          const { material_id, ...metrics } =
            metricsMap.get(item.material_id + '') || ({} as any);
          return { ...item, ...metrics };
        });

        console.log('getMaterialList=======', mergedList, metricsMap, data);
        return mergedList;
      }
    });
  };

  return {
    getMaterialList,
    getMaterialMetricsList,
  };
};

export default useMergeMetrics;
