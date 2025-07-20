import { type NextRequest, NextResponse } from 'next/server';
import { createAdGroup, createSparkAd } from '@/lib/tt';
import { getFormattedDateTime, getYYYYMMDDFormat } from '@/lib/datetime';
import stores from '../store.json';
import { getServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    let { task_id, ad_info_id, material_id, video_id, image_id, identity_id } =
      body;
    if (
      !task_id ||
      !material_id ||
      !video_id ||
      !image_id ||
      !identity_id ||
      !ad_info_id
    ) {
      return NextResponse.json(
        {
          error:
            'task_id, material_id, video_url, image_id, identity_id, ad_info_id is required',
        },
        { status: 400 }
      );
    }

    // TODO: 根据 identity_id 从配置里获取 location_id 和 store_id
    const storeInfo = stores.find((store) => store.identity_id === identity_id);
    if (!storeInfo) {
      return NextResponse.json(
        {
          error: 'tt get store id error',
          data: { task_id, material_id, video_id },
        },
        { status: 400 }
      );
    }

    const supabase = await getServerClient();
    const { data: adgroupData } = await supabase
      .from('material_ad_info')
      .select('ad_text, adgroup_id')
      .eq('id', ad_info_id);
    const { ad_text, adgroup_id } = adgroupData?.[0] || {};
    const { store_name, location_id, store_id, product_id } = storeInfo;
    let local_adgroup_id = adgroup_id;

    // if (!local_adgroup_id) {
    const adgroupRes: any = await createAdGroup({
      adgroup_name: getYYYYMMDDFormat() + store_name,
      location_ids: [location_id],
      store_id,
      schedule_start_time: getFormattedDateTime(),
    });
    local_adgroup_id = adgroupRes.data.adgroup_id;
    const { error } = await supabase
      .from('material_ad_info')
      .update({ adgroup_id: local_adgroup_id })
      .eq('id', ad_info_id);
    if (error) {
      console.log('[tt] adgroup save supabase error:', error);
    }
    // }
    const adParams = { identity_id, ad_text };
    // const response: any = await createSparkAd(
    //   video_id,
    //   image_id,
    //   local_adgroup_id,
    //   product_id,
    //   adParams
    // );

    return NextResponse.json({
      ad_info_id,
      material_id,
      identity_id,
      adgroup_id: local_adgroup_id,
      // ad_id: response.data.ad_id,
    });
  } catch (error: any) {
    console.error('[tt] adgroup error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    let { task_id, ad_info_id, material_id, video_id, image_id, identity_id } =
      body;
  } catch (error: any) {
    console.error('[tt] adgroup error:', error);
  }
}
