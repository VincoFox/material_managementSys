'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import type { Material, FieldConfig } from '@/components/types';
import { queryMaterialById } from '@/lib/api/material';
import VideoPlayer from '@/components/material/video';
import { Pushto } from '@/components/pushto';
import { Download } from '@/components/download';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import MaterialEdit from '@/components/material/edit';
import { Button } from '@/components/ui/button';
import { useAppLayout } from '@/components/app-layout';
import { StatusTag, StatusEnum } from '@/components/material/status';
import Storyboard from '@/components/material/storyboard';
import Report from '@/components/report';

const fields: Partial<keyof Material>[] = [
  'material_id',
  'external_id',
  'target_country',
  'target_platform',
  'main_category',
  'first_level_category',
  'product_name',
  'topic',
  'material_category',
  'video_type',
  'owner_team',
  'director_name',
  'editor_name',
  'status',
  'metadata',
];
/**
 * 自定义字渲染
 * 用于定义特定字段的渲染方式
 */
const customRender = {
  status({ value }) {
    return <StatusTag value={value as StatusEnum} />;
  },
} as Record<Partial<keyof Material>, React.FC<{ value: string }>>;
/**
 * 编辑组件
 * @param defaultValue - 默认值，Material 类型
 * @param onSuccess - 编辑成功后的回调函数
 */
function Editor({
  defaultValue,
  onSuccess,
}: {
  defaultValue: Material;
  onSuccess?(): void;
}) {
  const t = useTranslations('MaterialEdit');
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSuccess = () => {
    onSuccess?.();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' className='text-primary'>
          {t('edit')}
        </Button>
      </DialogTrigger>
      <DialogContent className='max-h-[80vh] w-[700px] max-w-full overflow-auto'>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <MaterialEdit
          defaultValue={defaultValue}
          onSuccess={handleSuccess}
          materialFooter={
            <DialogFooter className='gap-4 sm:justify-end'>
              <DialogClose asChild>
                <Button size='sm' variant='secondary'>
                  {t('cancel')}
                </Button>
              </DialogClose>
              <Button size='sm' type='submit'>
                {t('submit')}
              </Button>
            </DialogFooter>
          }
        />
      </DialogContent>
    </Dialog>
  );
}
/**
 * 元数据渲染组件
 * @param data - 元数据对象
 * @param metadata - 字段配置数组
 */
function MetadataRender({
  data,
  metadata,
}: {
  data: Record<string, any>;
  metadata?: FieldConfig[];
}) {
  const localMetadata = Array.isArray(metadata) ? metadata : [];
  return (
    data &&
    Object.entries(data).map(([key, value]) => {
      return (
        <div
          key={key}
          className='flex items-center gap-0 border-b border-dashed py-2'
        >
          <span className='w-32 text-sm text-muted-foreground'>
            {localMetadata.find(({ field }) => field === key)?.displayName ||
              key}
          </span>
          {Array.isArray(value) ? value.join(',') : value}
        </div>
      );
    })
  );
}
/**
 * 单个字段渲染组件
 * @param field - 字段名称
 * @param name - 显示名称
 * @param data - Material 数据
 * @param metadata - 字段配置数组
 */
function Field({
  field,
  name,
  data,
  metadata,
}: {
  field: keyof Material;
  name: string;
  data: Material;
  metadata?: FieldConfig[];
}) {
  const value = data[field] as string;
  return field === 'metadata' ? (
    <MetadataRender data={data[field] as any} metadata={metadata} />
  ) : (
    <div className='flex items-center gap-0 border-b border-dashed py-2'>
      <span className='w-32 text-sm text-muted-foreground'>{name}</span>
      <div className='flex-1'>
        {customRender[field] ? customRender[field]({ value: value }) : value}
      </div>
    </div>
  );
}
/**
 * 信息展示组件
 * @param info - Material 数据
 * @param playUrl - 当前播放的 URL
 * @param onChangePlayUrl - 播放 URL 改变的回调函数
 */
function Info({
  info,
  playUrl,
  onChangePlayUrl,
}: {
  info: Material;
  playUrl?: string;
  onChangePlayUrl?: (url?: string) => void;
}) {
  const t = useTranslations('material');
  const { metadata } = useAppLayout();

  return (
    <div className='mt-4 flex flex-wrap gap-8'>
      <div className='relative h-[560px] w-[340px]'>
        <VideoPlayer
          controls
          url={info.file_path}
          playUrl={playUrl}
          onChangePlayUrl={onChangePlayUrl}
        />

        {/* 模拟 TikTok 界面元素 */}
        <div className='absolute bottom-0 left-0 right-0'>
          {/* 操作按钮 */}
          <div className='absolute bottom-20 right-4 space-y-4'>
            <button className='rounded-full bg-gray-800 p-2'>
              <svg
                className='h-6 w-6 text-white'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
                ></path>
              </svg>
            </button>
            <button className='rounded-full bg-gray-800 p-2'>
              <svg
                className='h-6 w-6 text-white'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
                ></path>
              </svg>
            </button>
            <button className='rounded-full bg-gray-800 p-2'>
              <svg
                className='h-6 w-6 text-white'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M4 6h16M4 12h16M4 18h16'
                ></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div className='min-w-[40%] flex-1'>
        {fields.map((field) => {
          return (
            <Field
              key={field}
              field={field}
              name={t(field)}
              data={info}
              metadata={metadata}
            />
          );
        })}
      </div>
    </div>
  );
}

/**
 * 主页面组件
 * @param params - 包含物料 ID 的参数对象
 */
function Material({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ad_performance?: string }>;
}) {
  const t = useTranslations('Material');
  const { id } = React.use(params);
  const { ad_performance } = React.use(searchParams);
  const { toast } = useToast();
  const [info, setInfo] = React.useState<Material>({} as Material);
  const [playUrl, setPlayUrl] = React.useState<string | undefined>(undefined);
  const [existing, setExisting] = React.useState<boolean>(true);

  const fetchData = (id: string) => {
    if (id) {
      queryMaterialById(Number(id)).then(({ data, error }) => {
        if (error) {
          if (error.code === 'PGRST116') {
            setExisting(false);
          } else {
            toast({
              title: 'Error',
              variant: 'destructive',
              description: error.message,
            });
          }
        } else {
          const localData = data || ({} as Material);
          setInfo({ ...localData, ...(localData.metadata as any) });
        }
      });
    }
  };

  React.useEffect(() => {
    fetchData(id);
  }, [id]);

  const handleSubmit = () => {
    fetchData(id);
  };

  if (!existing) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='text-center'>
          <h1 className='mb-4 text-2xl font-semibold'>{t('notFound')}</h1>
          <p className='text-muted-foreground'>{t('notFoundDesc')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <Card className='m-auto border-0 bg-white p-4'>
        <div className='flex justify-between'>
          <h1 className='text-base font-medium'>{info.material_name}</h1>
          {info.material_id ? (
            <div className='flex gap-4'>
              <Storyboard
                material_id={info.material_id}
                ai_process_status={info.ai_process_status as any}
                ai_process_msg={info.ai_process_msg as string}
                url={info.file_path}
                playUrl={playUrl}
                onChangePlayUrl={setPlayUrl}
              />
              <Editor defaultValue={info} onSuccess={handleSubmit} />
              <Download file_path={info.file_path} />
              <Pushto ids={[info.material_id]} />
            </div>
          ) : null}
        </div>
        <Info info={info} playUrl={playUrl} onChangePlayUrl={setPlayUrl} />
      </Card>
      <Report
        id={id}
        postId={info.external_id || ''}
        adPerformance={ad_performance}
      />
    </div>
  );
}

export default Material;
