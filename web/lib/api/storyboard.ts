'use server';
import { getServerClient } from '@/lib/supabase/server';
import { startAI } from '@/lib/api/start-process';
import { SEARCH_STORYBOARD_URL } from '@/config';

export const querylStoryboardByMateriaId = async (id: number) => {
  try {
    const supabase = await getServerClient();
    return supabase
      .from('video_storyboard')
      .select('*')
      .eq('material_id', id)
      .order('end_time');
  } catch (e: unknown) {
    console.error('[querylStoryboardByMateriaId]====error:', e);
    return {
      error: (e as Error).message || 'Failed to get storyboard',
      data: [],
    };
  }
};

export const getStoryboard = async (keyword: string) => {
  try {
    console.log('[GET storyboard]===keyword:', keyword);
    // 检查关键词是否存在
    if (!keyword) {
      return { error: 'keyword are required', status: 400 };
    }
    // 调用getStoryboard函数获取ai解读数据
    const response = await fetch(
      `${SEARCH_STORYBOARD_URL}&query_str=${keyword}`,
      {
        method: 'GET',
      }
    );
    const storyboardData = await response.json();
    if (response.ok) {
      const { count, results } = storyboardData;
      if (count > 0) {
        // 提取所有material_id
        const material_ids = results.map((item: any) => item.material_id);
        // 连接Supabase数据库
        const supabase = await getServerClient();
        // 查询material表中对应的数据
        const { data, error } = await supabase
          .from('material')
          .select('*')
          .in('material_id', material_ids);
        // 如果查询失败，返回错误信息
        if (error) {
          return { error: 'Failed to get material', status: 500, ...error };
        } else {
          console.log('material_ids_data============', data);
          // 将material数据与storyboard数据合并
          const material_ids_data_map = results.map((item: any) => ({
            ...data.find(
              (material: any) => material.material_id === item.material_id
            ),
            storyboard: item,
          }));
          // 返回合并后的数据
          return { data: material_ids_data_map };
        }
      } else {
        return storyboardData;
      }
    } else {
      return { error: 'Failed to get storyboard', ...response };
    }
  } catch (e: any) {
    return { error: e.message || 'Failed to get storyboard', status: 500 };
  }
};

export const startStoryboard = async (params: {
  material_id: number;
  file_path: string;
}) => {
  try {
    const { material_id, file_path } = params;
    if (!material_id || !file_path) {
      return { error: 'material_id and file_path are required' };
    }

    const response = await startAI(material_id, file_path);
    return response;
  } catch (e: unknown) {
    console.error('[startStoryboard]====error:', e);
    return { error: (e as Error).message || 'Internal Server Error' };
  }
};
