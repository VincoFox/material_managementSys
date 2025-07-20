'use client';
import { useState } from 'react';
import { MaterialForm } from '@/components/material/material-field';
import { fieldsMap } from './use-form-field';
import { Material } from '@/components/types';
import { updateMaterial } from '@/lib/api/material';
import { useToast } from '@/hooks/use-toast';
// 定义表单字段数组
const fields = [
  fieldsMap.external_id,
  fieldsMap.material_name,
  fieldsMap.target_country,
  fieldsMap.target_platform,
  fieldsMap.main_category,
  fieldsMap.first_level_category,
  fieldsMap.product_name,
  fieldsMap.topic,
  fieldsMap.material_category,
  fieldsMap.video_type,
  fieldsMap.owner_team,
  fieldsMap.director_name,
  fieldsMap.editor_name,
];
/**
 * 素材编辑组件
 * @param {Object} props - 组件属性
 * @param {Material} props.defaultValue - 素材的默认值
 * @param {React.ReactNode} [props.materialFooter] - 素材表单底部内容
 * @param {Function} [props.onSuccess] - 编辑成功后的回调函数
 */
const MaterialEdit = ({
  defaultValue,
  materialFooter,
  onSuccess,
}: {
  defaultValue: Material;
  materialFooter?: React.ReactNode;
  onSuccess?: () => void;
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(false);

  if (!defaultValue) {
    return <div>No material found</div>;
  }
  /**
   * 处理表单提交
   * @param {Material} values - 表单提交的值
   */
  const handleSubmit = async (values: Material) => {
    const updateValues: any = {
      metadata: values.metadata || {},
      second_level_category: values.product_name,
    };
    fields.forEach((item) => {
      updateValues[item.field] = values[item.field];
    });

    setLoading(true);
    updateMaterial(defaultValue.material_id, updateValues).then(
      ({ data, error }) => {
        console.log('data00000000000', data, error);
        setLoading(false);
        if (error) {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          onSuccess?.();
        }
      }
    );
  };

  return (
    <MaterialForm
      defaultValue={defaultValue}
      fields={fields}
      onSubmit={handleSubmit}
      materialFooter={materialFooter}
    />
  );
};

export default MaterialEdit;
