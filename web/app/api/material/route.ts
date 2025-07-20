import { type NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { startAI } from '@/lib/api/start-process';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    console.log('[create matetial]====', formData);
    const { isAI, ...otherData } = formData;
    const supabase = await getServerClient();
    const { data, error } = await supabase
      .from('material')
      .insert(otherData)
      .select();

    if (error) {
      throw new Error(error.message);
    } else {
      console.log('[create matetial]====data====', data);
      if (isAI) {
        // TODO: 支持批量上传
        await startAI(data[0]?.material_id, otherData.file_path);
      }
      return NextResponse.json({ data });
    }
  } catch (e: unknown) {
    console.error('[create matetial]===error=', e);
    return NextResponse.json(
      { error: (e as Error).message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
