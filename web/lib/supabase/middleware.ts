import { createClient } from './server';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const noLoginUrlPrefix = ['/login'];
  if (
    noLoginUrlPrefix.find((prefix) =>
      request.nextUrl.pathname.startsWith(prefix)
    )
  ) {
    return supabaseResponse;
  }

  const supabase = createClient({ request, response: supabaseResponse });
  const { data, error } = await supabase.auth.getSession();
  // 处理会话错误或未登录情况
  if (error || !data.session) {
    if (error) {
      console.error('Middleware session error:', error.message);
    }
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
