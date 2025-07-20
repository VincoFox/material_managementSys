import { type NextRequest, NextResponse } from 'next/server';
import {
  getSparkAd,
  createCampaign,
  createAdGroup,
  uploadAdVideo,
  getVideoImage,
  createSparkAd,
} from '@/lib/tt';
import { getFormattedDateTime, getYYYYMMDDFormat } from '@/lib/datetime';
import stores from '../store.json';
import { getServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const adId = request.nextUrl.searchParams.get('adId'); // 从查询参数获取文件名
    if (!adId) {
      return NextResponse.json({ error: 'adId is required' }, { status: 400 });
    }
    const res: any = await getSparkAd([adId]);
    const supabase = await getServerClient();
    const { data, error } = await supabase
      .from('material_ad_info')
      .update({ status: res.data?.list?.[0]?.secondary_status })
      .eq('ad_id', adId);
    return NextResponse.json({ data: res.data?.list });
  } catch (error: any) {
    console.error('[tt] getBusinessCenterAccounts error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    let {
      task_id,
      material_id,
      video_id = 'v10033g50000cvb7qffog65p78o3do1g',
      adgroup_id = '1826754777451570',
      image_id,
      identity_id,
      ad_text,
    } = body;
    console.log('[tt upload]===================', body);
    if (!material_id || !identity_id || !task_id) {
      return NextResponse.json(
        { error: 'material_id, identity_id, task_id is required' },
        { status: 400 }
      );
    }

    // TODO: 根据 identity_id 从配置里获取 location_id 和 store_id
    const storeInfo = stores.find((store) => store.identity_id === identity_id);
    if (!storeInfo) {
      return NextResponse.json(
        { error: 'tt get video id error', data: { video_id, material_id } },
        { status: 400 }
      );
    }
    const { product_id } = storeInfo;

    const adParams = { identity_id, ad_text };
    const response = await createSparkAd(
      video_id,
      image_id,
      adgroup_id,
      product_id,
      adParams
    );
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('[tt] getBusinessCenterAccounts error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// 异步需要等待50s-5min
async function waitVideoImage(video_id: string) {
  await new Promise((resolve) => setTimeout(resolve, 5000));
  const imageRes = await getVideoImage(video_id);
  console.log('[tt upload video]:imageRes', imageRes?.data);
  return imageRes?.data?.list?.[0]?.id;
}
// 步骤1：创建campaign
async function getCampaignId(store_name: string, material_name: string) {
  const campaignRes: any = await createCampaign(
    getYYYYMMDDFormat() + store_name + material_name
  );
  return campaignRes.campaign_id;
}
// 步骤2：创建adgroup
async function getAdGroupId(
  location_id: string,
  store_id: string,
  store_name: string
) {
  const adgroupRes: any = await createAdGroup({
    adgroup_name: getYYYYMMDDFormat() + store_name,
    location_ids: [location_id.toString()],
    store_id,
    schedule_start_time: getFormattedDateTime(),
  });
  return adgroupRes?.data.adgroup_id;
}
// 步骤3：上传视频
async function getAdVideoId(video_url: string, material_name: string) {
  const videoRes: any = await uploadAdVideo(
    getYYYYMMDDFormat() +
      (material_name || '') +
      Date.now().toString() +
      '.mp4',
    video_url
  );
  console.log('[tt upload video]:', videoRes);
  const { video_id } = videoRes?.data?.[0] || {};
  return video_id;
}
