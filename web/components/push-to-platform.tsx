'use client';
import { useState, useEffect } from 'react';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { useTranslations } from 'next-intl';
import Select from './ui-pro/select';
import { useToast } from '@/hooks/use-toast';
import Pushtt from './push/tt';
import { Card } from './ui/card';
import type { Material } from './types';

interface Option {
  value: string;
  label: string;
}

interface PushInfo {
  material: string[];
  tt: string;
}

interface PushToPlatformProps {
  className?: string;
  value?: number[] | string[];
  onChange?: (val: number[]) => void;
  onClose?: () => void;
}

function PushToPlatform({ value, onChange, onClose }: PushToPlatformProps) {
  const { toast } = useToast();
  const [materialIds, setMaterialIds] = useState(value as number[]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [list, setList] = useState<Option[]>([]);
  const [countList, setCountList] = useState<Option[]>([]);
  const t = useTranslations('PushPlatform');

  useEffect(() => {
    // TODO:所有素材
    // supabase
    //   .from('material')
    //   .select('material_id,material_name,file_path')
    //   .eq('status', 'not_used')
    //   .order('created_at', { ascending: false })
    //   .then(({ data, error }) => {
    //     if (error) {
    //       toast({
    //         title: '获取素材失败',
    //         description: error.message,
    //       });
    //     } else {
    //       setList(
    //         data?.map((item) => ({
    //           value: item.material_id.toString(),
    //           label: item.material_name,
    //           file_path: item.file_path,
    //           material_id: item.material_id,
    //           material_name: item.material_name,
    //         }))
    //       );
    //     }
    //   });
    // setCountList([{ value: '1', label: 'tt账号' }]);
  }, []);

  console.log('material===', materials);

  return (
    <Card className='space-y-4 p-4'>
      <div className='flex items-center gap-4'>
        <Label className='w-24'>{t('material')}</Label>
        <Select
          isMulti
          options={list}
          value={materialIds}
          className='flex-1'
          onChange={(val, option) => {
            setMaterialIds(val as number[]);
            setMaterials(option as any);
          }}
        />
      </div>

      <Pushtt
        className='flex items-center gap-4'
        materials={materials}
        onClose={onClose}
      />
    </Card>
  );
}

export default PushToPlatform;
