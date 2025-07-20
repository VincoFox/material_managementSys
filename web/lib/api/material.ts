'use server';
import { DateRange } from 'react-day-picker';
import supabase from '@/lib/supabase/client';
import { getServerClient } from '@/lib/supabase/server';
import { countryList } from '@/lib/country';
import { SortDirection } from '@/components/metrics/sort-by';
import { getUser } from '@/lib/api/user';
import { getFormattedDate } from '@/lib/datetime';
import {
  QUERY_MATERIAL_URL,
  QUERY_MATERIALS_URL,
  QUERY_MATERIALS_BY_METRICS_URL,
  QUERY_ADVERTISERS_BY_POST,
} from '@/config';

const field2column: any = {
  target_platform: 'ad_platform',
  external_id: 'post_id',
};

export interface FilterData {
  data_time?: DateRange;
  target_country?: string;
  [key: string]: any;
}

interface LabelData {
  [key: string]: string | string[] | number | number[] | undefined;
}

interface Pagination {
  pageIndex: number;
  pageSize?: number;
}

export interface OrderBy {
  [key: string]: SortDirection | undefined;
}

const defaultPageSize = 20;

const queryParams = (
  query: any,
  filterData: LabelData,
  filters: Record<string, any>
) => {
  Object.entries(filterData).forEach(([key, value]) => {
    if (value) {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          query = query.in(key, value);
        }
      } else {
        filters[key] = value;
      }
    }
  });
};

export const queryMaterial = async (
  filterData: { [key: string]: any },
  pagination: any
) => {
  try {
    let query = supabase.from('material').select('*', { count: 'exact' });
    const filters: any = {};
    const { material_name, created_at, metadata, ...otherFileterData } =
      filterData || {};

    otherFileterData && queryParams(query, otherFileterData, filters);

    console.log(
      '[queryMaterial]==filterData==',
      filterData,
      filters,
      created_at
    );
    query.match(filters);

    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        if (Array.isArray(value) && value.length > 0) {
          value.forEach((v) => {
            query = query.contains(`metadata`, { [key]: [v] });
          });
        } else if (value) {
          query = query.contains(`metadata`, { [key]: value });
        }
      });
    }

    if (created_at?.from) {
      query = query.gte('created_at', created_at.from);
    }
    if (created_at?.to) {
      const endDate = new Date(created_at.to);
      endDate.setDate(endDate.getDate() + 1); // 增加一天
      query = query.lte('created_at', getFormattedDate(endDate));
    }

    if (material_name) {
      query = query.ilike('material_name', `%${material_name}%`);
    }
    query.order('created_at', { ascending: false });

    const { pageIndex, pageSize = defaultPageSize } = pagination;
    const offset = (pageIndex - 1) * pageSize;
    return query.limit(pageSize).range(offset, offset + pageSize - 1);
  } catch (error) {
    console.error('[queryMaterial]===Error:', error);
    throw error;
  }
};

export const updateMaterial = async (id: number, data: any) => {
  const supabase = await getServerClient();
  const {
    data: { user },
    error,
  } = await getUser();
  if (!user) return Promise.reject(error);
  console.log('[updateMaterial]==============', id, data, error, user.id);
  return supabase
    .from('material')
    .update({ ...data, user_id: user.id })
    .eq('material_id', id)
    .select();
};

export const queryMaterialById = async (id: number) => {
  return supabase.from('material').select('*').eq('material_id', id).single();
};

export const queryMaterialByIds = async (ids: number[]) => {
  return supabase.from('material').select('*').in('material_id', ids);
};

export const queryMaterialByMetrics = async (
  filterData?: FilterData,
  labelData?: LabelData,
  range_filters?: Record<
    string,
    { min?: string | number; max?: string | number }
  >,
  orderBy?: OrderBy,
  pagination?: Pagination
): Promise<{
  data: any[] | null;
  count: number | null;
  error: any;
  message?: string;
}> => {
  try {
    const { data_time, ...otherFilterData } = filterData || {};

    console.log(
      '[queryMaterialByMetrics]=========filterData, labelData, orderBy, pagination=========',
      filterData,
      labelData,
      range_filters,
      orderBy,
      pagination
    );

    const params = {
      start_date: '',
      end_date: '',
      attribute_filters: {},
      metric_filters: {},
      range_filters,
      order_by: orderBy,
      // TODO: 暂时不做分页
      limit: 20,
    };

    if (!(data_time?.from && data_time?.to)) {
      throw new Error('data_time is required');
    }

    Object.assign(params, {
      start_date: data_time.from,
      end_date: data_time.to,
    });

    // Apply label filters
    if (labelData) {
      const p_filters: any = {};
      Object.entries(labelData).forEach(([key, value]) => {
        if (value) {
          if (key === 'target_country') {
            const countryCode = countryList.find(
              (item) => item.name === value || item.zhName === value
            )?.code;
            if (countryCode) {
              p_filters['country_code'] = [countryCode];
            }
          } else if (key === 'material_id') {
            if (Array.isArray(value) && value.length > 0) {
              p_filters[key] = value.map((item) => item + '');
            }
          } else {
            let localKey = key;
            if (field2column[key]) {
              localKey = field2column[key];
            }
            if (!Array.isArray(value)) {
              p_filters[localKey] = [value];
            } else if (value.length > 0) {
              p_filters[localKey] = value;
            }
          }
        }
      });
      Object.assign(params, { attribute_filters: p_filters });
    }

    // Apply metrics filters
    if (otherFilterData) {
      const metric_filters: any = {};
      Object.entries(otherFilterData).forEach(([key, value]) => {
        const { max, min } = value || {};
        // if (max && min) {
        metric_filters[key] = { min, max };
        // } else if (min) {
        //   p_metric_filters[key] = { op: '>=', value: min };
        // } else if (max) {
        //   p_metric_filters[key] = { op: '<=', value: max };
        // }
      });
      Object.assign(params, { metric_filters });
    }

    console.log('[queryMaterialByMetrics] params==========', params);

    return fetch(QUERY_MATERIALS_BY_METRICS_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    }).then(async (res) => {
      const resp = await res.json();
      return resp;
    });
  } catch (error) {
    console.error('Error in queryMaterialByMetrics:', error);
    return { data: [], count: 0, error };
  }
};

export const queryMaterialMetricsByIds = async (params: {
  post_ids: string[];
  start_date: string;
  end_date: string;
}) => {
  console.log('[queryMaterialMetricsByIds] params==========', params);
  return fetch(QUERY_MATERIALS_URL!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  }).then((res) => res.json());
};

export const queryMetricsByPostId = async (params: {
  post_id: string;
  start_date: string;
  end_date: string;
}) => {
  return fetch(QUERY_MATERIAL_URL!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  }).then((res) => res.json());
};

export const queryAdvertisersByPost = async (post_id: string) => {
  console.log('[queryAdvertisersByPost] post_id====', post_id);
  return fetch(QUERY_ADVERTISERS_BY_POST! + '?post_id=' + post_id, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((res) => res.json());
};
