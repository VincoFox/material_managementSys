import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import request from '@/lib/request';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import Select from '../ui-pro/select';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Material } from '../types';
import { getPlayUrl } from '../material/video';

const getPostId = (ad_info_id: string, identity_id: string) => {
  return request.post('/api/tt/post-id', {
    task_id: 1,
    ad_info_id,
    identity_id,
    signature: 'e8e0d679111700d7ae5442d5fb7a48cc',
  });
};

const pullAd = (
  ad_info_id: string,
  identity_id: string,
  post_id: string,
  material_id: string
) => {
  request
    .post('/api/tt/pull', {
      task_id: 2,
      ad_info_id,
      post_id,
      material_id,
      identity_id,
    })
    .then((res) => console.log('res===end=====', res))
    .catch((err) => {
      console.error('app tt adgroup:', err);
    });
};

const startTask = ({
  video_url,
  material_id,
  material_name,
  identity_id,
  ad_info_id,
  video_id = 'v10033g50000cvbsvjfog65st23eia2g',
  image_id = 'tos-alisg-p-0051c001-sg/fcf1a01e34e7e950ccfbcaa7795a86ec',
}: any) => {
  // request
  //   .post('/api/tt/upload-video', {
  //     task_id: 1,
  //     video_url,
  //     material_id,
  //     material_name,
  //     identity_id,
  //     ad_info_id,
  //   })
  //   .then(({ ad_info_id, video_id, material_id, identity_id }) => {
  // request
  //   .post('/api/tt/cover-image', {
  //     task_id: 2,
  //     ad_info_id,
  //     video_id,
  //     material_id,
  //     identity_id,
  //   })
  //   .then(({ ad_info_id, video_id, material_id, identity_id, image_id }) => {
  request
    .post('/api/tt/adgroup', {
      task_id: 2,
      ad_info_id,
      video_id,
      image_id,
      material_id,
      identity_id,
    })
    .then((res) => console.log('res===end=====', res))
    .catch((err) => {
      console.error('app tt adgroup:', err);
    });
  // })
  // .catch((e) => {
  //   console.error('app tt cover image:', e);
  // });
  // })
  // .catch((e) => {
  //   console.error('app tt upload video:', e);
  // });
};

const PushTT: React.FC<{
  materials?: Material[];
  className?: string;
  onClose?: () => void;
}> = ({ materials, className, onClose }) => {
  const t = useTranslations('PushPlatform');
  const { toast } = useToast();
  const [formData, setFormData] = useState(
    {} as { identity_id: string; ad_text: string }
  );
  const [countList, setCountList] = useState<
    Array<{ value: string; label: string }>
  >([]);

  const getAccounts = () => {
    console.log('getAccounts');
    request.get('/api/tt/accounts').then(({ data }) => {
      console.log('getAccounts res=======', data);
      setCountList(
        data.identity_list
          ?.filter((item: any) => item.can_push_video)
          .map((item: any) => ({
            value: item.identity_id,
            label: item.display_name,
          }))
      );
    });
  };

  useEffect(() => {
    getAccounts();
  }, []);

  const handleSubmit = async () => {
    // TODO: 仅支持一个
    if (!materials || materials.length > 1) {
      toast({
        title: 'Error',
        description: '仅支持一个素材！',
        variant: 'destructive',
      });
      return;
    }
    const matetial = materials?.[0];
    const { material_id, material_name, file_path } = matetial || {};
    if (!file_path) {
      return;
    }
    // getPostId(1, formData.identity_id).then((res) => {
    //   console.log('getPostId res========', res);
    // });
    // startTask({
    //   video_url:
    //     'https://storage.googleapis.com/shorts_analysis/test/2025-03-13/1741837553548-%E9%A3%9E%E4%B9%A620250312-143344.mp4?GoogleAccessId=vertexai%40gen-lang-client-0786739350.iam.gserviceaccount.com&Expires=1742282454&Signature=Lgd4%2F8B6HUNW8qDZEZmNJOftbovJtM2%2FlnYyhsltNxzzN%2FVaNn3h6s6JJ19HhE8V%2FMoMwBMqOnchrY8jlceUMQRbkvtBfsPIyygmo1lw4mHWgU%2FP5tBeLqZJevUjx3Vg6vt2I%2BHbL5B%2Bu6PnyyTt%2BYlMGROCxFe%2F5NspCcFC2ihjvSLisN3ecDuIrxbmpLnRGcP4%2FYOKnjnKXQvpwhui89XfenbAfDneBFw3dUOd1cPB6ROy1v7%2Bc%2F1vVjSEG7zofOOrWVwvaF2AJQABt5KcxbUaEjIRJbVbfNNfgspPolerXxwxuhAdHyOUw1h7KT%2FdtYRwRvUDxnHTKWLq%2FN7FJg%3D%3D',
    //   material_id,
    //   material_name,
    //   identity_id: formData.identity_id,
    //   ad_info_id: 2,
    // });
    // return;
    getPlayUrl(file_path)
      .then((video_url) => {
        request
          .post('/api/tt/push', {
            ...formData,
            material_id,
            material_name,
            video_url,
          })
          .then((res) => {
            console.log('res========', res);
            toast({
              title: 'Success',
              description: '广告搭建中！',
              variant: 'default',
            });
          })
          .catch((err) => {
            console.log('err========', err);
            toast({
              title: 'Error',
              description: '广告搭建失败！',
              variant: 'destructive',
            });
          });
      })
      .catch((e) => {
        console.log('getPlayUrl err======', e);
        toast({
          title: 'Error',
          description: '获取素材视频失败，请重试！',
          variant: 'destructive',
        });
      });
  };
  console.log('formData======', formData, materials);
  return (
    <div className='space-y-4'>
      <div className={cn('flex items-center gap-4', className)}>
        <Label className='w-24'>{t('identity_id')}</Label>
        <Select
          className='flex-1'
          options={countList}
          value={formData.identity_id}
          onChange={(val) =>
            setFormData((prev) => ({ ...prev, identity_id: val as string }))
          }
        />
      </div>
      <div className={cn('flex items-center gap-4', className)}>
        <Label className='w-24'>{t('ad_text')}</Label>
        <Textarea
          placeholder={t('ad_text')}
          className='flex-1'
          value={formData.ad_text}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, ad_text: e.target.value }))
          }
        />
      </div>
      <div className='flex justify-end gap-4'>
        <Button variant='secondary' onClick={onClose}>
          {t('cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!formData?.identity_id || !materials?.length}
        >
          {t('submit')}
        </Button>
      </div>
    </div>
  );
};

export default PushTT;
