// TimePicker.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import Player from './video';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogContent,
} from '../ui/dialog';
import type { VideoStoryboard } from '../types';
import { useToast } from '@/hooks/use-toast';
import {
  querylStoryboardByMateriaId,
  startStoryboard,
} from '@/lib/api/storyboard';
import { Copy } from 'lucide-react';

enum StoryboardStatusEnum {
  NotProcessed = 'NotProcessed',
  Scheduled = 'Scheduled',
  Processing = 'Processing',
  Completed = 'Completed',
  Failed = 'Failed',
}

const contentFields: Partial<keyof VideoStoryboard>[] = [
  'shot_content',
  'subtitle',
  'narration',
];

function ContentItem({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  const t = useTranslations('Storyboard');
  const { toast } = useToast();

  const handleCopy = () => {
    value &&
      navigator.clipboard
        .writeText(value)
        .then(() => {
          toast({
            description: t('message.copy_success'),
            duration: 2000,
          });
        })
        .catch((err) => {
          toast({
            variant: 'destructive',
            description: t('message.copy_failed'),
            duration: 2000,
          });
          console.error('Failed to copy:', err);
        });
  };

  return (
    <div className='flex items-start justify-between'>
      <div>
        <div className='flex items-center text-sm font-medium text-muted-foreground'>
          {label}
          <Button
            variant='ghost'
            size='sm'
            onClick={handleCopy}
            title='copy'
            className='mr-[-10px]'
          >
            <Copy size={16} />
          </Button>
        </div>
        <pre className='whitespace-pre-line break-all text-sm'>{value}</pre>
      </div>
    </div>
  );
}

interface StoryboardProps {
  material_id?: number;
  url?: string | null;
  playUrl?: string | null;
  ai_process_status: StoryboardStatusEnum;
  ai_process_msg?: string;
  onChangePlayUrl?: (url?: string) => void;
  onSubmit?: () => void;
}

const timeLineKey = 'Time Line';

const Storyboard = ({
  material_id,
  url,
  playUrl,
  loading,
  onChangePlayUrl,
  onSubmit,
}: Omit<StoryboardProps, 'ai_process_status' | 'ai_process_msg'> & {
  loading: boolean;
}) => {
  const t = useTranslations('Storyboard');
  const { toast } = useToast();
  const [data, setData] = useState<VideoStoryboard[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 3;
  const abortControllerRef = useRef<AbortController | null>(null);
  const tableRef = useRef<HTMLTableElement | null>(null);

  // copy 到粘贴板，保留HTML格式
  async function copyTableToClipboard() {
    if (!tableRef.current) return;
    const html = tableRef.current.outerHTML;
    const text = tableRef.current.innerText;

    const blob = new Blob([html], { type: 'text/html' });
    navigator.clipboard
      .write([
        new ClipboardItem({
          'text/html': blob,
          'text/plain': new Blob([text], { type: 'text/plain' }),
        }),
      ])
      .then(() => {
        toast({
          description: t('message.copy_success'),
          duration: 2000,
        });
      })
      .catch(() => {
        toast({
          variant: 'destructive',
          description: t('message.copy_failed'),
          duration: 2000,
        });
      });
  }

  // 下载CSV函数
  const handleDownloadCSV = () => {
    const rows = data.map((item) =>
      [
        `${item.start_time}-${item.end_time}s`,
        item.shot_content,
        item.subtitle,
        item.narration,
      ].join(',')
    );

    const csvContent = [
      [timeLineKey, ...contentFields].join(','),
      ...rows,
    ].join('\n');
    // 添加BOM并指定UTF-8编码
    const blob = new Blob(['\uFEFF' + csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `storyboard_${material_id || 'data'}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  useEffect(() => {
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    if (material_id) {
      querylStoryboardByMateriaId(material_id).then(({ data, error }) => {
        if (signal.aborted) return;
        if (error) {
          toast({
            variant: 'destructive',
            description: typeof error === 'string' ? error : error.message,
            duration: 2000,
          });
        } else {
          setData(data);
        }
      });
    }

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [material_id]);

  const totalPages = Math.ceil((data?.length || 0) / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const visibleData = data?.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  return (
    <div className='h-[80vh] overflow-y-auto'>
      <div className='flex gap-4'>
        <Button onClick={onSubmit} disabled={loading}>
          {loading ? <>{t('button.Processing')}...</> : t('button.resubmit')}
        </Button>
        {/* {!data || data.length === 0 ? null : (
          <Button variant='outline' onClick={handleDownloadCSV}>
            {t('download')}
          </Button>
        )} */}
      </div>
      <div className='relative mt-4 w-full px-6'>
        <div className='flex h-[640px] max-h-[80vh] items-start gap-4'>
          {visibleData?.map((item, index) => (
            <Card
              key={item.shot_id}
              className='flex h-full max-w-[34%] flex-1 flex-col p-0'
            >
              <div className='h-[280px] w-full'>
                <Player
                  url={url}
                  playUrl={playUrl}
                  className='rounded-none'
                  startTime={item.start_time}
                  endTime={item.end_time}
                  onChangePlayUrl={onChangePlayUrl}
                />
              </div>
              <div className='flex-1 space-y-2 overflow-auto p-4'>
                <div>{`${item.start_time}-${item.end_time}`} s</div>
                {contentFields.map((field) => {
                  return (
                    <ContentItem
                      key={field}
                      label={t(`${field}`)}
                      value={item[field] as any}
                    />
                  );
                })}
              </div>
            </Card>
          ))}
        </div>

        {currentPage > 0 && (
          <Button
            variant='outline'
            className='absolute left-0 top-1/2 z-10 flex h-10 w-10 transform items-center justify-center rounded-full bg-sky-200 p-0'
            onClick={handlePrevPage}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <path d='m15 18-6-6 6-6' />
            </svg>
          </Button>
        )}
        {currentPage < totalPages - 1 && (
          <Button
            variant='outline'
            className='absolute right-0 top-1/2 z-10 flex h-10 w-10 transform items-center justify-center rounded-full bg-sky-200 p-0'
            onClick={handleNextPage}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <path d='m9 18 6-6-6-6' />
            </svg>
          </Button>
        )}
      </div>
      <div className='mt-4 w-full space-y-4 overflow-auto'>
        <div className='my-1 border-b'></div>
        {!data || data.length === 0 ? null : (
          <Button
            variant='outline'
            onClick={copyTableToClipboard}
            className='text-primary'
          >
            {t('copy_all')}
          </Button>
        )}
        <Table ref={tableRef}>
          <TableHeader>
            <TableRow className='bg-gray-100'>
              <TableHead>{timeLineKey}</TableHead>
              {contentFields.map((field) => (
                <TableHead key={field}>{t(field)}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow className='border-0 hover:bg-accent' key={item.shot_id}>
                <TableCell>
                  <div>{`${item.start_time}-${item.end_time}`} s</div>
                </TableCell>
                {contentFields.map((field) => (
                  <TableCell key={field}>{item[field] as string}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

const StoryboardDialog = ({
  material_id,
  ai_process_status,
  ai_process_msg,
  url,
  playUrl,
  onChangePlayUrl,
}: StoryboardProps) => {
  const t = useTranslations('Storyboard');
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  // 新增状态来控制模态框的显示
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const handleStartProcess = () => {
    setLoading(true);
    setIsOpen(false);
    startStoryboard({
      material_id: material_id!,
      file_path: url!,
    })
      .then(({ data, error }) => {
        if (error) {
          return Promise.reject(error);
        }
        // 显示成功模态框
        setShowSuccessModal(true);
      })
      .catch((e) => {
        toast({
          variant: 'destructive',
          description: e.message || t('message.error'),
          duration: 2000,
        });
        setLoading(false);
      });
  };

  if (!material_id && !url) {
    return null;
  }

  if (
    [StoryboardStatusEnum.NotProcessed].includes(ai_process_status) ||
    loading
  ) {
    return (
      <>
        <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
          <DialogContent className='w-96'>
            <DialogHeader>
              <DialogTitle>{t('message.success')}</DialogTitle>
            </DialogHeader>
            <Button
              variant='outline'
              onClick={() => setShowSuccessModal(false)}
              className='mt-10'
            >
              close
            </Button>
          </DialogContent>
        </Dialog>
        <Button
          variant='outline'
          onClick={handleStartProcess}
          disabled={loading}
          className='text-primary'
        >
          {loading ? (
            <>{t('button.Processing')}...</>
          ) : (
            t('button.NotProcessed')
          )}
        </Button>
      </>
    );
  } else if ([StoryboardStatusEnum.Failed].includes(ai_process_status)) {
    return (
      <Button variant='outline' disabled title={ai_process_msg}>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='16'
          height='16'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='mr-2'
        >
          <circle cx='12' cy='12' r='10'></circle>
          <line x1='12' y1='8' x2='12' y2='12'></line>
          <line x1='12' y1='16' x2='12.01' y2='16'></line>
        </svg>
        {t('button.Failed')}
      </Button>
    );
  } else if (
    [StoryboardStatusEnum.Scheduled, StoryboardStatusEnum.Processing].includes(
      ai_process_status
    )
  ) {
    return (
      <Button variant='outline' disabled>
        {t('button.Processing')}...
      </Button>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={() => setIsOpen(!isOpen)}>
        <DialogTrigger asChild>
          <Button variant='outline' className='text-primary'>
            {t('button.Completed')}
          </Button>
        </DialogTrigger>
        <DialogContent className='w-[90%] max-w-[90%]'>
          <DialogHeader>
            <DialogTitle>{t('title')}</DialogTitle>
          </DialogHeader>
          <Storyboard
            material_id={material_id}
            url={url}
            playUrl={playUrl}
            loading={loading}
            onChangePlayUrl={onChangePlayUrl}
            onSubmit={handleStartProcess}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export { StoryboardStatusEnum };
export default StoryboardDialog;
