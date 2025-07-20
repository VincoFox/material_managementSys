import { type NextRequest, NextResponse } from 'next/server';
import { getVideoImage } from '@/lib/tt';
import { getServerClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    let { task_id, ad_info_id, material_id, video_id, identity_id } = body;
    if (!task_id || !material_id || !video_id || !identity_id || !ad_info_id) {
      return NextResponse.json(
        {
          error:
            'task_id, material_id, video_id, identity_id, ad_info_id is required',
          data: body,
        },
        { status: 400 }
      );
    }

    const imageRes = await getVideoImage(video_id);
    console.log('[tt] cover image:', imageRes?.data?.list?.[0]);
    const image_id = imageRes?.data?.list?.[0]?.id;

    if (!image_id) {
      return NextResponse.json(
        {
          error: '[tt] cover image error',
          data: { task_id, video_id, material_id },
        },
        { status: 500 }
      );
    }

    const supabase = await getServerClient();
    const { error } = await supabase
      .from('material_ad_info')
      .update({ cover_image: image_id })
      .eq('id', ad_info_id);

    if (error) {
      console.log('[tt] cover image error:', error);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({
      image_id,
      ad_info_id,
      task_id,
      material_id,
      video_id,
      identity_id,
    });
  } catch (error: any) {
    console.error('[tt] cover image error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
