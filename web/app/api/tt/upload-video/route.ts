import { type NextRequest, NextResponse } from 'next/server';
import { uploadAdVideo } from '@/lib/tt';
import { getYYYYMMDDFormat } from '@/lib/datetime';
import { getServerClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';
type MaterialAdInfo =
  Database['public']['Tables']['material_ad_info']['Insert'];

// {
//   bit_rate: 2784304,
//   preview_url: 'https://v16m-default.akamaized.net/76e26f4663ddf3127352e32f53807c4b/67d6d1b7/video/tos/alisg/tos-alisg-v-0051c001-sg/ocDdsTf0ABwnnFADCLyBA9QGE1IBfIGgNtGA1t/?a=0&bti=Nzg3NWYzLTQ6&ch=0&cr=0&dr=0&cd=0%7C0%7C0%7C0&br=5438&bt=2719&cs=0&ds=4&ft=.cwOVInz7ThuLCeOXq8Zmo&mime_type=video_mp4&qs=13&rc=anI2O3M5cmk6eTMzODYzNEBpanI2O3M5cmk6eTMzODYzNEAuYWw0MmRjbl9gLS1kMC1zYSMuYWw0MmRjbl9gLS1kMC1zcw%3D%3D&vvpl=1&l=20250316072651B82EACDAD3AFB08B3FE1&btag=600078000',
//   video_id: 'v10033g50000cvb7qffog65p78o3do1g',
//   displayable: true,
//   create_time: '2025-03-16T07:13:21Z',
//   allowed_placements: [Array],
//   width: 1080,
//   material_id: '7480808330682302480',
//   preview_url_expire_time: '2025-03-16 13:26:54',
//   duration: 25.3,
//   allow_download: true,
//   modify_time: '2025-03-16T07:13:20Z',
//   size: 8805363,
//   height: 1920,
//   signature: 'e8e0d679111700d7ae5442d5fb7a48cc',
//   video_cover_url: 'http://p16-sign-sg.tiktokcdn.com/tos-alisg-p-0051c001-sg/og3BnQ09synAG46fGcEwBF1DNBTDdg0QBIfmtw~tplv-noop.image?x-expires=1742131639&x-signature=iYtMjlvPyk0vrX%2BmGs91ftxl5U4%3D',
//   file_name: '202503162025-03-13-中国-平台1-剪辑1-痘泥四件套-话题1-种草-pgc1742109198280.mp4',
//   format: 'mp4'
// }
// {
//   campaign_type: 'REGULAR_CAMPAIGN',
//   objective_type: 'PRODUCT_SALES',
//   roas_bid: 0,
//   rta_product_selection_enabled: false,
//   modify_time: '2025-03-16 07:32:13',
//   budget_mode: 'BUDGET_MODE_DAY',
//   campaign_product_source: 'STORE',
//   create_time: '2025-03-16 07:32:13',
//   advertiser_id: '7321701286737461249',
//   secondary_status: 'CAMPAIGN_STATUS_ENABLE',
//   is_new_structure: true,
//   disable_skan_campaign: null,
//   is_search_campaign: false,
//   campaign_name: '20250316马来西亚TT官号 (TT-official)2025-03-13-中国-平台1-剪辑1-痘泥四件套-话题1-种草-pgc',
//   deep_bid_type: null,
//   budget: 10,
//   is_smart_performance_campaign: false,
//   rta_id: null,
//   is_advanced_dedicated_campaign: false,
//   campaign_app_profile_page_state: 'UNSET',
//   campaign_id: '1826735007005857',
//   objective: 'LANDING_PAGE',
//   operation_status: 'ENABLE'
// }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    let {
      task_id,
      ad_info_id,
      material_id,
      material_name,
      video_url,
      identity_id,
    } = body;
    if (!task_id || !material_id || !video_url || !identity_id || !ad_info_id) {
      return NextResponse.json(
        {
          error:
            'task_id, material_id, video_url, identity_id, ad_info_id is required',
        },
        { status: 400 }
      );
    }
    const videoRes: any = await uploadAdVideo(
      getYYYYMMDDFormat() +
        (material_name || '') +
        Date.now().toString() +
        '.mp4',
      video_url
    );
    console.log('[tt upload video]:', videoRes);
    const { video_id } = videoRes?.data?.[0] || {};
    const supabase = await getServerClient();
    const { error } = await supabase
      .from('material_ad_info')
      .update({ video_id })
      .eq('id', ad_info_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      video_id,
      ad_info_id,
      material_id,
      identity_id,
    });
  } catch (error: any) {
    console.error('[tt] getBusinessCenterAccounts error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
