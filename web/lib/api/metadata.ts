'use server';
import { getServerClient } from '@/lib/supabase/server';
import { Json } from '@/lib/supabase/types';

export const queryMetadataList = async () => {
  const supabase = await getServerClient();
  return supabase
    .from('configuration')
    .select('*')
    .order('id', { ascending: true });
};
export const updateMetadataById = async (id: number, json: Json) => {
  const supabase = await getServerClient();
  return supabase
    .from('configuration')
    .update({ config_json: json })
    .eq('id', id);
};

export const addMetadataById = async (data: any) => {
  const supabase = await getServerClient();
  return supabase.from('configuration').insert(data);
};
