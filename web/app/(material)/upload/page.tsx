'use client';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { MaterialForm } from '@/components/material/material-field';
import { Material } from '@/components/types';
import { Card } from '@/components/ui/card';
import { getUser } from '@/lib/api/user';
import { useToast } from '@/hooks/use-toast';
import { VideosPreview } from '@/components/material/video';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoaderIcon } from '@/components/icons';
import request from '@/lib/request';
import { Loader2 } from 'lucide-react';

/**
 * 多文件上传组件
 * @param material - 素材基本信息
 * @param urls - 文件URL数组
 * @param open - 是否打开对话框
 * @param onChangeOpen - 对话框状态改变回调
 * @param onSubmit - 提交成功回调，返回上传成功的素材ID数组
 */
const MultiUpload = ({
  material,
  urls,
  open,
  onChangeOpen,
  onSubmit,
}: {
  material: Material;
  urls: string[];
  open: boolean;
  onChangeOpen: (open: boolean) => void;
  onSubmit: (ids: number[]) => void;
}) => {
  const t = useTranslations('upload');
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [list, setList] =
    useState<Array<{ file_path: string; material_name: string }>>();

  useEffect(() => {
    setList(
      urls?.map((url, index) => ({
        file_path: url,
        material_name: material.material_name + '_' + (index + 1),
      }))
    );
  }, [material, urls]);

  /**
   * 处理提交操作
   * 将多个文件信息与素材信息合并后提交到服务器
   */
  const handleSubmit = async () => {
    if (!list) {
      toast({
        title: 'Error',
        description: '请上传素材',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);
    const { data, error } = await getUser();
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }
    const datas = list.map((item) => ({
      ...material,
      ...item,
      user_id: data.user.id,
    }));
    request
      .post('/api/material', datas)
      .then((res: Material[]) => {
        console.log('submit success========', res);
        onSubmit(res.map((item) => item.material_id));
      })
      .catch((e: Error) => {
        toast({
          title: 'Error',
          description: e.message || '上传错误',
          variant: 'destructive',
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Dialog open={open} onOpenChange={onChangeOpen}>
      <DialogContent className='h-full max-h-[90%] w-full max-w-max'>
        <DialogHeader>
          <DialogTitle>{t('multiUpload')}</DialogTitle>
        </DialogHeader>
        <VideosPreview
          urls={urls}
          className='max-h-[100%] flex-wrap overflow-auto'
          itemClassName='h-[350px] min-w-[300px] max-w-md pb-16'
          footer={({ index }) =>
            list?.[index] ? (
              <div className='mt-4'>
                <Input
                  defaultValue={list[index].material_name}
                  onChange={(e) => (list[index].material_name = e.target.value)}
                />
              </div>
            ) : null
          }
        />
        <DialogFooter>
          <Button
            onClick={handleSubmit}
            className='disabled:cursor-not-allowed disabled:opacity-50'
            disabled={loading}
          >
            {loading ? <LoaderIcon size={16} /> : null}
            {t('submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
/**
 * 默认值对象，用于表单初始化
 */
const defaultValues: any = { isAI: false };
/**
 * 上传页面主组件
 * 包含表单提交、多文件上传处理等功能
 */
const Upload = () => {
  const t = useTranslations('upload');
  const router = useRouter();
  const { toast } = useToast();
  const formIdRef = useRef(Date.now().toString());
  const [uploadIds, setUploadIds] = useState<number[]>([]);
  const [info, setInfo] = useState<
    { material: Material; urls: string[] } | undefined
  >();
  const [loading, setLoading] = useState(false);
  /**
   * 重置表单状态
   */
  const handleReset = () => {
    setUploadIds([]);
    formIdRef.current = Date.now().toString();
  };

  /**
   * 处理表单提交
   * @param values - 表单提交的素材信息
   * @param fileInfo - 文件信息数组，包含文件名、大小和URL
   */
  const handleSubmit = async (
    values: Material,
    fileInfo: { name: string; size: number; url: string }[]
  ) => {
    const { file_path } = values;
    if (!fileInfo || fileInfo.length === 0) {
      toast({
        title: 'Error',
        description: '请上传素材',
        variant: 'destructive',
      });
      return;
    }
    console.log('handleSubmit=====upload:', values);
    // if (Array.isArray(fileInfo) && fileInfo.length > 1) {
    //   setInfo({ material: rest as Material, urls: file_path as any });
    //   return;
    // }
    setLoading(true);
    getUser().then(({ data, error }) => {
      if (error) {
        console.error(error);
        setLoading(false);
      } else {
        const { size, url } = fileInfo[0];
        request
          .post('/api/material', {
            ...values,
            user_id: data.user?.id,
            file_path: url,
            file_size: size,
          })
          .then(({ data }: { data: Material[] }) => {
            console.log('submit success========', data);
            setUploadIds(data.map((item) => item.material_id));
          })
          .catch((e: Error) => {
            toast({
              title: 'Error',
              description: e.message || '上传错误',
              variant: 'destructive',
            });
          })
          .finally(() => {
            setLoading(false);
          });
      }
    });
  };
  return (
    <div>
      {loading && (
        <div className='fixed inset-0 z-10 flex items-center justify-center bg-background/50 text-primary backdrop-blur-[1px]'>
          <Loader2 className='h-10 w-10 animate-spin text-primary' />
        </div>
      )}
      <Card className='mx-auto max-w-[1000px] border-0 bg-white p-8'>
        <MaterialForm
          key={formIdRef.current}
          defaultValue={defaultValues}
          showVideo
          showName
          showAI
          onSubmit={handleSubmit}
        />
      </Card>
      {info && (
        <MultiUpload
          material={info?.material}
          urls={info?.urls}
          open={info.urls?.length > 1}
          onChangeOpen={() => setInfo(undefined)}
          onSubmit={(ids) => [setInfo(undefined), setUploadIds(ids)]}
        />
      )}

      <Dialog open={!!uploadIds?.length} onOpenChange={() => setUploadIds([])}>
        <DialogContent className='w-[300px]'>
          <DialogHeader>
            <DialogTitle>{t('success')}</DialogTitle>
          </DialogHeader>
          <div className='mt-6 flex justify-end gap-4'>
            <Button size='sm' variant='outline' onClick={handleReset}>
              {t('next')}
            </Button>
            <Button
              size='sm'
              onClick={() =>
                router.push('/pushto/platform?ids=' + uploadIds?.join(','))
              }
            >
              {t('pushto')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Upload;
