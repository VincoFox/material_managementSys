'use server';
import { TT_API, TT_API_TOKEN } from '@/config';

/**
 * 根据post_id查询视频素材信息  https://business-api.tiktok.com/portal/docs?id=1789700050715650
 * @param params
 * @returns
 */
export const queryTTMaterialInfo = async (params: {
  advertiser_id: string;
  post_id: string;
  start_date: string;
  end_date: string;
}) => {
  try {
    const body: string[] = [];
    const obj = {
      advertiser_id: params.advertiser_id,
      start_date: params.start_date,
      end_date: params.end_date,
      report_type: 'VIDEO_INSIGHT',
      filtering: JSON.stringify({ tiktok_item_ids: [params.post_id] }),
    };
    Object.entries(obj).forEach(([key, value]) => {
      body.push(`${key}=${value}`);
    });

    console.log('queryTTMaterialInfo=====body===', body); // 打印请求的ur

    return fetch(`${TT_API}/creative/report/get/?${body.join('&')}`, {
      method: 'GET',
      headers: {
        'Access-Token': TT_API_TOKEN!,
        'Content-Type': 'application/json',
      },
    })
      .then(async (res) => {
        try {
          const resp = await res.json();
          console.log('queryTTMaterialInfo=====resp===', resp);
          return resp;
        } catch (e) {
          console.log('queryTTMaterialInfo=====error===', res.statusText);
          return {
            code: 500,
            message: (e as Error).message || '查询失败',
          };
        }
      })
      .catch((e) => {
        console.error('queryTTMaterialInfo===catch===error', e);
        return {
          code: 500,
          message: (e as Error).message || '查询失败',
        };
      });
  } catch (e: unknown) {
    console.error('queryTTMaterialInfo===catch===error', e);
    return {
      code: 500,
      message: (e as Error).message || '查询失败',
    };
  }
};

/**
 * 查询素材高光帧 https://business-api.tiktok.com/portal/docs?id=1738825259075586
 * @param params
 * @returns
 */
export const queryHighlightFrame = async (params: {
  advertiser_id: string;
  tt_material_id: string;
}) => {
  try {
    const body: string[] = [];
    const obj = {
      advertiser_id: params.advertiser_id,
      report_type: 'VIDEO',
      filtering: JSON.stringify({ material_ids: [params.tt_material_id] }),
    };
    Object.entries(obj).forEach(([key, value]) => {
      body.push(`${key}=${value}`);
    });

    return fetch(`${TT_API}/report/video_performance/get/?${body.join('&')}`, {
      method: 'GET',
      headers: {
        'Access-Token': TT_API_TOKEN!,
        'Content-Type': 'application/json',
      },
    }).then(async (res) => {
      try {
        const resp = await res.json();
        console.log('queryHighlightFrame=====result===', resp);
        return resp;
      } catch (e) {
        console.log('queryHighlightFrame=====error===', res.statusText);
        return {
          code: 500,
          message: (e as Error).message || '查询失败',
        };
      }
    });
  } catch (e: unknown) {
    console.error('queryHighlightFrame===catch===error', e);
    return {
      code: 500,
      message: (e as Error).message || '查询失败',
    };
  }
};
