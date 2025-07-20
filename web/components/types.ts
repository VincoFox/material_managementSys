import { Database } from '@/lib/supabase/types';

export type Configuration = Database['public']['Tables']['configuration'];
export type MaterialAdInfo = Database['public']['Tables']['material_ad_info'];
export type VideoStoryboard =
  Database['public']['Tables']['video_storyboard']['Row'];
export type Material = Database['public']['Tables']['material']['Row'];
export type MaterialInsert = Database['public']['Tables']['material']['Insert'];

export interface User {
  id?: string;
  email?: string;
  displayName?: string;
}

export interface FieldConfig {
  field: keyof Material;
  displayType: string;
  displayName?: string;
  required?: boolean;
  defaultValue?: string;
  labelClassName?: string;
  rules?: any;
  options?: {
    label: string;
    value: any;
  }[];
  Component?: React.ReactElement;
  node?: React.ReactNode;
}
