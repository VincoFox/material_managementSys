import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/config';
import type { Database } from '@/lib/supabase/types';
import type { NextRequest, NextResponse } from 'next/server';

// 创建服务器端 Supabase 客户端的通用函数
export function createClient({
  cookieStore,
  request,
  response,
}: {
  cookieStore?: any;
  request?: NextRequest;
  response?: NextResponse;
} = {}) {
  return createServerClient<Database>(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        if (cookieStore) {
          return cookieStore.getAll();
        }
        if (request) {
          return request.cookies.getAll();
        }
        throw new Error('Either cookieStore or request must be provided');
      },
      setAll(cookiesToSet) {
        try {
          if (cookieStore) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } else if (request && response) {
            cookiesToSet.forEach(({ name, value, options }) =>
              request.cookies.set(name, value)
            );
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          } else {
            throw new Error('Missing cookieStore or request/response pair');
          }
        } catch (error) {
          // Ignore errors in Server Components if middleware handles session refresh
          console.warn('Cookie setAll error:', error);
        }
      },
    },
  });
}

// 用于 Server Components 的客户端创建
export async function getServerClient() {
  const cookieStore = await cookies();
  return createClient({ cookieStore });
}
