import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button, ButtonProps } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader } from 'lucide-react';
import { getPlayUrl } from './material/video';

interface DownloadProps extends ButtonProps {
  file_path?: string | null | string[];
  user?: any;
  delayBetweenDownloads?: number;
}

async function triggerFileDownload(filePath: string, filename: string) {
  return getPlayUrl(filePath).then((url) => {
    if (!url) {
      throw new Error('No URL found');
    }

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
  });
}

function Download({
  file_path,
  children,
  delayBetweenDownloads = 1500,
  ...props
}: DownloadProps) {
  const t = useTranslations('Download');
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  const showToast = (success: boolean, filename: string) => {
    toast({
      title: success ? t('downloading') : t('downloadFailed'),
      description: filename,
      duration: 1000,
      variant: success ? 'default' : 'destructive',
    });
  };

  const handleSingleDownload = async (filePath: string) => {
    try {
      const filename = filePath.split('/').pop() || 'video.mp4';
      await triggerFileDownload(filePath, filename);
    } catch (error) {
      showToast(false, filePath);
    }
  };

  const handleMultipleDownloads = async (paths: string[]) => {
    for (let i = 0; i < paths.length; i++) {
      await handleSingleDownload(paths[i]);
      await new Promise((resolve) =>
        setTimeout(resolve, delayBetweenDownloads)
      );
    }
  };

  const handleDownload = async () => {
    if (!file_path || isDownloading) return;

    setIsDownloading(true);
    try {
      if (Array.isArray(file_path)) {
        if (file_path.length === 0) return;
        await handleMultipleDownloads(file_path);
      } else {
        await handleSingleDownload(file_path);
      }
    } finally {
      setIsDownloading(false);
    }
  };

  if (!file_path || (Array.isArray(file_path) && file_path.length === 0)) {
    return null;
  }

  return (
    <>
      <Button onClick={handleDownload} disabled={isDownloading} {...props}>
        {isDownloading ? (
          <Loader className='h-4 w-4 animate-spin' />
        ) : (
          children || t('download')
        )}
      </Button>
    </>
  );
}

export { Download };
