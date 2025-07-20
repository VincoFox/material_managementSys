import { type NextRequest, NextResponse } from 'next/server';
import { getIdentityVideoList } from '@/lib/tt';
import { getServerClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    let { task_id, ad_info_id, identity_id, signature } = body;
    if (!task_id || !identity_id || !ad_info_id) {
      return NextResponse.json(
        {
          error: 'task_id, identity_id, ad_info_id is required',
          data: body,
        },
        { status: 400 }
      );
    }

    const videoList = await getIdentityVideoList(identity_id);
    console.log('[tt] post id:', videoList?.data?.video_list);
    const adInfo = videoList?.data?.video_list?.find(
      (item: any) => item.video_info.signature === signature
    );
    if (adInfo) {
      const supabase = await getServerClient();
      await supabase
        .from('material_ad_info')
        .update({ post_id: adInfo.item_id })
        .eq('id', ad_info_id);
      return NextResponse.json({
        data: {
          post_id: adInfo.item_id,
        },
      });
    } else {
      return NextResponse.json({
        data: {
          post_id: '',
          list: videoList?.data?.video_list,
        },
      });
    }
  } catch (error: any) {
    console.error('[tt] cover image error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
