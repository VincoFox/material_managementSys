'use server';

import { getServerClient } from '@/lib/supabase/server';

export async function getUser() {
  const supabase = await getServerClient();
  return supabase.auth.getUser();
}

export async function logout() {
  const supabase = await getServerClient();
  return supabase.auth.signOut();
}
export async function getSession() {
  const supabase = await getServerClient();
  return supabase.auth.getSession();
}
