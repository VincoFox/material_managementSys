import { NextRequest, NextResponse } from 'next/server';
import { startAI } from '@/lib/api/start-process';
import { SEARCH_STORYBOARD_URL } from '@/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { material_id, file_path } = body;
    if (!material_id || !file_path) {
      return NextResponse.json(
        { error: 'material_id and file_path are required' },
        { status: 400 }
      );
    }
    const response = await startAI(material_id, file_path);
    return NextResponse.json(response, { status: response.status });
  } catch (e: unknown) {
    console.error('[startAI]====error:', e);
    return NextResponse.json(
      { error: (e as Error).message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

function getStoryboard(keyword: string) {
  return fetch(`${SEARCH_STORYBOARD_URL}&query_str=${keyword}`, {
    method: 'GET',
  });
}
