import { type NextRequest, NextResponse } from 'next/server';
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    let { material_id, video_url, identity_id, ad_text } = body;
    console.log('[tt push]===================', body);
    if (!material_id || !identity_id || !video_url) {
      return NextResponse.json(
        { error: 'material_id, identity_id, video_url is required' },
        { status: 400 }
      );
    }
    const materialAdInfo: MaterialAdInfo = {
      material_id,
      platform_account_id: identity_id,
      platform: 'tt',
    };
    const supabase = await getServerClient();
    const { data, error } = await supabase
      .from('material_ad_info')
      .insert(materialAdInfo)
      .select();

    console.log('3333333333333333', error, data);

    if (error) {
      return NextResponse.json(
        {
          error: 'tt create material ad info error:' + error.message,
          data: { material_id, video_url },
        },
        { status: 400 }
      );
    } else {
      // TODO：建任务与子任务
      console.log('[tt push] create material ad info success:', data[0]);
      return NextResponse.json(
        {
          data: { material_id, ad_info_id: (data as any)[0].id },
        },
        { status: 200 }
      );
    }
  } catch (error: any) {
    console.error('[tt push] error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
