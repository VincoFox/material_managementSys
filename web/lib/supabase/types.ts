export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          operationName?: string;
          query?: string;
          variables?: Json;
          extensions?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      bigquery_ads: {
        Row: {
          ad_id: string | null;
          ad_platform: string | null;
          advertiser_name: string | null;
          country_code: string | null;
          director_name: string | null;
          editor_name: string | null;
          first_level_category: string | null;
          impressions: number | null;
          material_category: string | null;
          material_created_at: string | null;
          material_id: string | null;
          material_name: string | null;
          material_type: string | null;
          owner_team: string | null;
          post_date: string | null;
          post_id: string | null;
          second_level_category: string | null;
          source_type: string | null;
          spend: number | null;
          stat_date: string | null;
          topic: string | null;
          total_onsite_shopping_value: number | null;
          video_type: string | null;
        };
        Insert: {
          ad_id?: string | null;
          ad_platform?: string | null;
          advertiser_name?: string | null;
          country_code?: string | null;
          director_name?: string | null;
          editor_name?: string | null;
          first_level_category?: string | null;
          impressions?: number | null;
          material_category?: string | null;
          material_created_at?: string | null;
          material_id?: string | null;
          material_name?: string | null;
          material_type?: string | null;
          owner_team?: string | null;
          post_date?: string | null;
          post_id?: string | null;
          second_level_category?: string | null;
          source_type?: string | null;
          spend?: number | null;
          stat_date?: string | null;
          topic?: string | null;
          total_onsite_shopping_value?: number | null;
          video_type?: string | null;
        };
        Update: {
          ad_id?: string | null;
          ad_platform?: string | null;
          advertiser_name?: string | null;
          country_code?: string | null;
          director_name?: string | null;
          editor_name?: string | null;
          first_level_category?: string | null;
          impressions?: number | null;
          material_category?: string | null;
          material_created_at?: string | null;
          material_id?: string | null;
          material_name?: string | null;
          material_type?: string | null;
          owner_team?: string | null;
          post_date?: string | null;
          post_id?: string | null;
          second_level_category?: string | null;
          source_type?: string | null;
          spend?: number | null;
          stat_date?: string | null;
          topic?: string | null;
          total_onsite_shopping_value?: number | null;
          video_type?: string | null;
        };
        Relationships: [];
      };
      configuration: {
        Row: {
          config_json: Json;
          config_name: string;
          created_at: string | null;
          id: number;
          updated_at: string | null;
        };
        Insert: {
          config_json: Json;
          config_name: string;
          created_at?: string | null;
          id?: number;
          updated_at?: string | null;
        };
        Update: {
          config_json?: Json;
          config_name?: string;
          created_at?: string | null;
          id?: number;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      material: {
        Row: {
          ai_process_msg: string | null;
          ai_process_status: string | null;
          ai_process_task_id: string | null;
          created_at: string | null;
          director_id: number | null;
          director_name: string | null;
          duration: number | null;
          editor_id: number | null;
          editor_name: string | null;
          external_id: string | null;
          file_path: string | null;
          file_size: number | null;
          first_level_category: string | null;
          is_deleted: boolean | null;
          labels: string[] | null;
          main_category: string | null;
          material_category: string | null;
          material_id: number;
          material_name: string;
          material_type: string;
          metadata: Json | null;
          owner_team: string | null;
          product_name: string | null;
          resolution: string | null;
          second_level_category: string | null;
          source_type: string | null;
          status: string | null;
          target_country: string | null;
          target_platform: string | null;
          topic: string | null;
          updated_at: string | null;
          user_id: string;
          video_type: string | null;
        };
        Insert: {
          ai_process_msg?: string | null;
          ai_process_status?: string | null;
          ai_process_task_id?: string | null;
          created_at?: string | null;
          director_id?: number | null;
          director_name?: string | null;
          duration?: number | null;
          editor_id?: number | null;
          editor_name?: string | null;
          external_id?: string | null;
          file_path?: string | null;
          file_size?: number | null;
          first_level_category?: string | null;
          is_deleted?: boolean | null;
          labels?: string[] | null;
          main_category?: string | null;
          material_category?: string | null;
          material_id?: number;
          material_name: string;
          material_type: string;
          metadata?: Json | null;
          owner_team?: string | null;
          product_name?: string | null;
          resolution?: string | null;
          second_level_category?: string | null;
          source_type?: string | null;
          status?: string | null;
          target_country?: string | null;
          target_platform?: string | null;
          topic?: string | null;
          updated_at?: string | null;
          user_id: string;
          video_type?: string | null;
        };
        Update: {
          ai_process_msg?: string | null;
          ai_process_status?: string | null;
          ai_process_task_id?: string | null;
          created_at?: string | null;
          director_id?: number | null;
          director_name?: string | null;
          duration?: number | null;
          editor_id?: number | null;
          editor_name?: string | null;
          external_id?: string | null;
          file_path?: string | null;
          file_size?: number | null;
          first_level_category?: string | null;
          is_deleted?: boolean | null;
          labels?: string[] | null;
          main_category?: string | null;
          material_category?: string | null;
          material_id?: number;
          material_name?: string;
          material_type?: string;
          metadata?: Json | null;
          owner_team?: string | null;
          product_name?: string | null;
          resolution?: string | null;
          second_level_category?: string | null;
          source_type?: string | null;
          status?: string | null;
          target_country?: string | null;
          target_platform?: string | null;
          topic?: string | null;
          updated_at?: string | null;
          user_id?: string;
          video_type?: string | null;
        };
        Relationships: [];
      };
      material_ad_info: {
        Row: {
          ad_id: string | null;
          ad_text: string | null;
          adgroup_id: string | null;
          call_to_action: string | null;
          campaign_id: string | null;
          cover_image: string | null;
          created_at: string | null;
          error: string | null;
          id: number;
          material_id: number;
          platform: string;
          platform_account_id: string | null;
          post_id: string | null;
          status: string | null;
          task_id: string | null;
          updated_at: string | null;
          video_id: string | null;
        };
        Insert: {
          ad_id?: string | null;
          ad_text?: string | null;
          adgroup_id?: string | null;
          call_to_action?: string | null;
          campaign_id?: string | null;
          cover_image?: string | null;
          created_at?: string | null;
          error?: string | null;
          id?: number;
          material_id: number;
          platform: string;
          platform_account_id?: string | null;
          post_id?: string | null;
          status?: string | null;
          task_id?: string | null;
          updated_at?: string | null;
          video_id?: string | null;
        };
        Update: {
          ad_id?: string | null;
          ad_text?: string | null;
          adgroup_id?: string | null;
          call_to_action?: string | null;
          campaign_id?: string | null;
          cover_image?: string | null;
          created_at?: string | null;
          error?: string | null;
          id?: number;
          material_id?: number;
          platform?: string;
          platform_account_id?: string | null;
          post_id?: string | null;
          status?: string | null;
          task_id?: string | null;
          updated_at?: string | null;
          video_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'material_ad_info_material_id_fkey';
            columns: ['material_id'];
            isOneToOne: false;
            referencedRelation: 'material';
            referencedColumns: ['material_id'];
          },
        ];
      };
      stock: {
        Row: {
          close: number | null;
          ts_code: string | null;
        };
        Insert: {
          close?: number | null;
          ts_code?: string | null;
        };
        Update: {
          close?: number | null;
          ts_code?: string | null;
        };
        Relationships: [];
      };
      test: {
        Row: {
          created_at: string;
          id: number;
          script: string | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          script?: string | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          script?: string | null;
        };
        Relationships: [];
      };
      video_storyboard: {
        Row: {
          content_vector: string | null;
          created_at: string | null;
          end_time: number;
          material_id: number;
          narration: string | null;
          shot_content: string | null;
          shot_id: number;
          start_time: number;
          subtitle: string | null;
          tags: Json | null;
        };
        Insert: {
          content_vector?: string | null;
          created_at?: string | null;
          end_time: number;
          material_id: number;
          narration?: string | null;
          shot_content?: string | null;
          shot_id?: number;
          start_time: number;
          subtitle?: string | null;
          tags?: Json | null;
        };
        Update: {
          content_vector?: string | null;
          created_at?: string | null;
          end_time?: number;
          material_id?: number;
          narration?: string | null;
          shot_content?: string | null;
          shot_id?: number;
          start_time?: number;
          subtitle?: string | null;
          tags?: Json | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      binary_quantize:
        | {
            Args: {
              '': string;
            };
            Returns: unknown;
          }
        | {
            Args: {
              '': unknown;
            };
            Returns: unknown;
          };
      fetch_report: {
        Args: {
          p_date_start: string;
          p_date_end: string;
          p_filters: Json;
          p_dimensions: string[];
          p_metric_filters: Json;
          p_group_by_date: boolean;
        };
        Returns: {
          stat_date: string;
          dimensions: Json;
          total_spend: number;
          total_impressions: number;
          total_shopping_value: number;
        }[];
      };
      halfvec_avg: {
        Args: {
          '': number[];
        };
        Returns: unknown;
      };
      halfvec_out: {
        Args: {
          '': unknown;
        };
        Returns: unknown;
      };
      halfvec_send: {
        Args: {
          '': unknown;
        };
        Returns: string;
      };
      halfvec_typmod_in: {
        Args: {
          '': unknown[];
        };
        Returns: number;
      };
      hnsw_bit_support: {
        Args: {
          '': unknown;
        };
        Returns: unknown;
      };
      hnsw_halfvec_support: {
        Args: {
          '': unknown;
        };
        Returns: unknown;
      };
      hnsw_sparsevec_support: {
        Args: {
          '': unknown;
        };
        Returns: unknown;
      };
      hnswhandler: {
        Args: {
          '': unknown;
        };
        Returns: unknown;
      };
      ivfflat_bit_support: {
        Args: {
          '': unknown;
        };
        Returns: unknown;
      };
      ivfflat_halfvec_support: {
        Args: {
          '': unknown;
        };
        Returns: unknown;
      };
      ivfflathandler: {
        Args: {
          '': unknown;
        };
        Returns: unknown;
      };
      l2_norm:
        | {
            Args: {
              '': unknown;
            };
            Returns: number;
          }
        | {
            Args: {
              '': unknown;
            };
            Returns: number;
          };
      l2_normalize:
        | {
            Args: {
              '': string;
            };
            Returns: string;
          }
        | {
            Args: {
              '': unknown;
            };
            Returns: unknown;
          }
        | {
            Args: {
              '': unknown;
            };
            Returns: unknown;
          };
      match_videos: {
        Args: {
          query_embedding: string;
          match_threshold: number;
          match_count: number;
        };
        Returns: {
          shot_id: number;
          material_id: number;
          start_time: number;
          end_time: number;
          shot_content: string;
          subtitle: string;
          narration: string;
          tags: Json;
          created_at: string;
          similarity: number;
        }[];
      };
      sparsevec_out: {
        Args: {
          '': unknown;
        };
        Returns: unknown;
      };
      sparsevec_send: {
        Args: {
          '': unknown;
        };
        Returns: string;
      };
      sparsevec_typmod_in: {
        Args: {
          '': unknown[];
        };
        Returns: number;
      };
      vector_avg: {
        Args: {
          '': number[];
        };
        Returns: string;
      };
      vector_dims:
        | {
            Args: {
              '': string;
            };
            Returns: number;
          }
        | {
            Args: {
              '': unknown;
            };
            Returns: number;
          };
      vector_norm: {
        Args: {
          '': string;
        };
        Returns: number;
      };
      vector_out: {
        Args: {
          '': string;
        };
        Returns: unknown;
      };
      vector_send: {
        Args: {
          '': string;
        };
        Returns: string;
      };
      vector_typmod_in: {
        Args: {
          '': unknown[];
        };
        Returns: number;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] &
        PublicSchema['Views'])
    ? (PublicSchema['Tables'] &
        PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema['Enums']
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema['CompositeTypes']
    ? PublicSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;
