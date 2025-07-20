import { useMemo } from 'react';
import type { Material, FieldConfig } from '@/components/types';
import { useAppLayout } from '@/components/app-layout';

// 素材来源类型枚举
export enum MaterialSourceTypeEnum {
  PGC = 'PGC',
  UGC = 'UGC',
}

// 字段配置映射表
export const fieldsMap = {
  main_category: {
    field: 'main_category',
    displayType: 'RadioGroup',
  },
  first_level_category: {
    field: 'first_level_category',
    displayType: 'RadioGroup',
  },
  second_level_category: {
    field: 'second_level_category',
    displayType: 'RadioGroup',
  },
  product_name: {
    field: 'product_name',
    displayType: 'RadioGroup',
  },
  video_type: {
    field: 'video_type',
    displayType: 'RadioGroup',
  },
  material_category: {
    field: 'material_category',
    displayType: 'RadioGroup',
  },
  topic: {
    field: 'topic',
    displayType: 'Select',
  },
  target_country: {
    field: 'target_country',
    displayType: 'RadioGroup',
  },
  target_platform: {
    field: 'target_platform',
    displayType: 'RadioGroup',
  },
  owner_team: {
    field: 'owner_team',
    displayType: 'Select',
  },
  material_name: {
    field: 'material_name',
    displayType: 'Input',
  },
  source_type: {
    field: 'source_type',
    displayType: 'RadioGroup',
  },
  editor_name: {
    field: 'editor_name',
    displayType: 'Select',
  },
  director_name: {
    field: 'director_name',
    displayType: 'Select',
  },
  external_id: {
    field: 'external_id',
    displayType: 'Input',
  },
} as Record<Partial<keyof Material>, FieldConfig>;

// 所有字段配置
export const allFields: Array<FieldConfig> = [
  fieldsMap.external_id,
  fieldsMap.target_country,
  fieldsMap.target_platform,
  fieldsMap.main_category,
  fieldsMap.first_level_category,
  fieldsMap.product_name,
  fieldsMap.topic,
  fieldsMap.material_category,
  fieldsMap.video_type,
  fieldsMap.owner_team,
  fieldsMap.editor_name,
  fieldsMap.director_name,
];

export const useFormField = ({
  sourceType,
  fields,
  hasMetadata,
}: {
  sourceType?: MaterialSourceTypeEnum;
  fields?: Array<FieldConfig>;
  hasMetadata?: boolean;
}) => {
  const { metadata, form_required_fields } = useAppLayout();

  const localFields = useMemo(() => {
    let f = allFields;
    if (fields) {
      f = fields;
    }
    // UGC 或 PGC 字段配置，标记必填字段
    f = f.map((field) => ({
      ...field,
      required: sourceType
        ? form_required_fields?.[sourceType]?.includes(field.field)
        : false,
    }));
    if (!hasMetadata) return f;
    return metadata ? [...f, ...metadata] : f;
  }, [fields, sourceType, metadata, hasMetadata]);

  return {
    formFields: localFields,
  };
};
