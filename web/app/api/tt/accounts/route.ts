import { type NextRequest, NextResponse } from 'next/server';
import { getBusinessCenterAccounts } from '@/lib/tt';
import fs from 'fs';
import path from 'path';
import { IS_DEBIG } from '@/config';

export async function GET() {
  try {
    if (IS_DEBIG) {
      // 获取 data.json 文件的绝对路径
      const filePath = path.join(
        process.cwd(),
        'app',
        'api',
        'tt/accounts',
        'data.json'
      );

      // 读取文件内容
      const content = fs.readFileSync(filePath, 'utf8');
      return NextResponse.json({
        data: { identity_list: JSON.parse(content) },
      });
    } else {
      console.log('getBusinessCenterAccounts ====');
      const response = await getBusinessCenterAccounts();
      // 将外部 API 的响应返回给客户端
      return NextResponse.json(response);
    }
  } catch (error: any) {
    console.error('[tt] getBusinessCenterAccounts error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
