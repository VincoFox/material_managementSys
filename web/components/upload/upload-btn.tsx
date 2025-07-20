'use client';

import { useRef, useState, useEffect } from 'react';
import { Upload as UploadLocal, CheckCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { VideosPreview } from '@/components/material/video';
import { getUploadUrl } from '@/lib/api/video';

enum VideoStatusEnum {
  UPLOADING = 'uploading',
  SUCCESS = 'success',
  ERROR = 'error',
}

interface UploadProps {
  onFileChange: (
    urls: string[],
    fileInfo: { name: string; size: number; url: string }[]
  ) => void;
  className?: string;
}

export function UploadBtn({ className, onFileChange }: UploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [videoInfos, setVideoInfos] = useState(
    [] as {
      url: string;
      status: VideoStatusEnum;
      cloudUrl?: string;
    }[]
  );
  const [uploading, setUploading] = useState(false);
  const t = useTranslations('upload');

  // 存储上传请求的 AbortController
  const uploadRequests = useRef<AbortController[] | null[]>([]);

  // 清除预览 URL
  // useEffect(() => {
  //   return () => {
  //     setVideoInfos?.forEach((preview) => URL.revokeObjectURL(preview.url));
  //   };
  // }, [setVideoInfos]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('e=========', e.target.files);
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    if (selectedFiles.length > 0) {
      setUploading(true);
      setVideoInfos(
        selectedFiles.map((file) => ({
          url: URL.createObjectURL(file),
          status: VideoStatusEnum.UPLOADING,
          cloudUrl: '',
          file,
        }))
      );
      handleUpload(selectedFiles[0], 0);
      // 清空 input 的值，以便可以重新选择相同的文件
      e.target.value = '';
    } else {
      setVideoInfos([]);
      toast({
        title: t('error'),
        description: '请选择一个或多个视频文件',
      });
    }
  };

  const handleUpload = async (file: File, index: number) => {
    const controller = new AbortController();
    uploadRequests.current[index] = controller;

    try {
      const fileType = file.type;
      const { uploadUrl, filePath } = await getUploadUrl(file.name);

      const xhr = new XMLHttpRequest();

      // 监听上传进度
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setVideoInfos((prev) =>
            prev.map((info, i) =>
              i === index
                ? {
                    ...info,
                    progress: percent, // 添加进度信息
                  }
                : info
            )
          );
        }
      };

      xhr.open('PUT', uploadUrl, true);
      xhr.setRequestHeader('Content-Type', fileType);
      xhr.send(file);

      await new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(xhr.response);
          } else {
            reject(new Error('Upload failed'));
          }
        };
        xhr.onerror = () => reject(new Error('Upload failed'));
        xhr.onabort = () => reject(new Error('Upload cancelled'));
      });

      setVideoInfos((prev) =>
        prev.map((info, i) =>
          i === index
            ? {
                ...info,
                status: VideoStatusEnum.SUCCESS,
                cloudUrl: filePath,
                progress: 100, // 上传完成时设置进度为100%
              }
            : info
        )
      );
      onFileChange?.(
        [filePath],
        [{ name: file.name, size: file.size, url: filePath }]
      );
      console.log('文件上传成功:', filePath);
    } catch (error: any) {
      if (error.message === 'Upload cancelled') {
        console.log('Upload cancelled');
      } else {
        console.error('上传失败:', error);
        setVideoInfos((prev) =>
          prev.map((info) => ({
            ...info,
            status: VideoStatusEnum.ERROR,
          }))
        );
      }
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = (index: number) => {
    // 取消对应的上传请求
    if (uploadRequests.current[index]) {
      uploadRequests.current[index]?.abort();
      uploadRequests.current[index] = null;
    }
    // 从文件列表和预览中移除该文件
    const updatedPreviews = videoInfos.filter((_, i) => i !== index);

    setVideoInfos(updatedPreviews);
    onFileChange?.([], []);

    // 清理预览 URL
    URL.revokeObjectURL(videoInfos[index]?.url);
  };

  const isPreview = !!videoInfos?.length;

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 1) {
      toast({
        title: t('error'),
        description: '每次只能上传一个视频文件',
        variant: 'destructive',
      });
      return;
    }
    handleCancel(0);
    if (files.length === 1) {
      setUploading(true);
      setVideoInfos([
        {
          url: URL.createObjectURL(files[0]),
          status: VideoStatusEnum.UPLOADING,
          cloudUrl: '',
        },
      ]);
      handleUpload(files[0], 0);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div
      className={cn(
        'relative h-[260px] rounded-lg border-2 border-dashed',
        className
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div
        className={cn(
          'flex h-full w-full flex-col items-center justify-center gap-3',
          isPreview ? 'hidden' : ''
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        <UploadLocal className='mx-auto h-12 w-12 text-muted-foreground' />
        <p>{t('uploadText')}</p>
        <input
          type='file'
          ref={fileInputRef}
          onChange={handleFileChange}
          className='hidden'
          accept='video/*'
          disabled={uploading}
          // multiple
        />
      </div>
      {isPreview && (
        <VideosPreview
          urls={videoInfos}
          className='absolute'
          toolbar={({ index, item }) => {
            if (item.status === VideoStatusEnum.SUCCESS) {
              return (
                <div className='absolute bottom-16 left-0 right-0 top-0 flex items-center justify-center gap-4 bg-black/20 text-white'>
                  <CheckCircle className='h-5 w-5 text-green-500' />
                  <span>{t('success')}</span>&emsp;
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className='cursor-pointer'
                    title={t('resumit')}
                  >
                    <UploadLocal className='mx-auto h-6 w-6' />
                  </div>
                </div>
              );
            } else {
              return (
                <div className='absolute bottom-16 left-0 right-0 top-0 flex flex-col items-center justify-center gap-4 bg-black/20 text-white'>
                  {item.status === VideoStatusEnum.UPLOADING ? (
                    <div className='w-full max-w-[300px] space-y-3 px-4'>
                      <div className='flex justify-between text-sm'>
                        <span>{t('uploading')}...</span>
                        <span>{item.progress}%</span>
                      </div>
                      <div className='h-2 w-full overflow-hidden rounded-full bg-gray-200'>
                        <div
                          className='h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300'
                          style={{ width: `${item.progress}%` }}
                        ></div>
                      </div>
                      <div
                        className='cursor-pointer text-center text-sm text-sky-300 hover:text-sky-400'
                        onClick={() => handleCancel(index)}
                      >
                        {t('cancel')}
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className='cursor-pointer text-sky-300'
                    >
                      {t('uploadError')}
                    </div>
                  )}
                </div>
              );
            }
          }}
        />
      )}
    </div>
  );
}
