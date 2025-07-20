'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { getServerClient } from '@/lib/supabase/server';

export async function login(data: { email: string; password: string }) {
  const supabase = await getServerClient();

  const { error } = await supabase.auth.signInWithPassword(data);
  console.log('login', error?.message);

  if (error) {
    return { error };
  }

  revalidatePath('/', 'layout');
  redirect('/search');
}

export async function signup(data: { email: string; password: string }) {
  const supabase = await getServerClient();

  const { error } = await supabase.auth.signUp(data);

  console.log('signup', error?.message);
  if (error) {
    redirect('/error');
  }

  revalidatePath('/', 'layout');
  redirect('/search');
}
