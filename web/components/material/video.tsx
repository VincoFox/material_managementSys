import { useState, useRef, useEffect, createElement, memo } from 'react';
import { Play, Pause } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { getSignedUrl } from '@/lib/api/video';
import { getLocalStorage, setLocalStorage } from '@/lib/cache';

const playurlKey = 'playsurl';

const getPlayUrl = async (filePath: string, nocache?: boolean) => {
  try {
    if (!filePath) throw new Error('文件路径不能为空');
    if (!nocache) {
      const playUrls = getLocalStorage(playurlKey);
      const info = playUrls?.[filePath];
      if (info && info.expires > Date.now()) {
        console.log('使用缓存的播放地址');
        return info.url;
      }
    }
    const { url, expires } = await getSignedUrl(filePath);
    if (!url) throw new Error('无法获取视频播放地址');
    const playUrls = getLocalStorage(playurlKey);
    setLocalStorage(playurlKey, { ...playUrls, [filePath]: { url, expires } });
    return url;
  } catch (err) {
    console.error('获取视频播放地址失败:', err);
    throw new Error('获取视频播放地址失败，请稍后重试');
  }
};

interface PlayerProps {
  url?: string | null;
  playUrl?: string | null;
  startTime?: number;
  endTime?: number;
  className?: string;
  controls?: boolean;
  muted?: boolean; // 新增 muted 属性
  onChangePlayUrl?: (url?: string) => void;
}

const maxRetry = 1;

const VideoPlayer: React.FC<PlayerProps> = memo(
  ({
    url,
    playUrl,
    startTime,
    endTime,
    className,
    controls,
    muted = true,
    onChangePlayUrl,
  }) => {
    const hasFragment = !!(startTime || endTime);
    const { toast } = useToast();
    const videoRef = useRef<HTMLVideoElement>(null);
    const retryCountRef = useRef<number>(0);
    const playFragmentRef = useRef<boolean>(hasFragment);
    const [playFragment, setPlayFragment] = useState<boolean>(hasFragment);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [localPlayUrl, setLocalPlayUrl] = useState<string | null | undefined>(
      playUrl
    );

    useEffect(() => {
      const video = videoRef.current;
      if (video && startTime) {
        const handleTimeUpdate = () => {
          if (
            video &&
            playFragmentRef.current &&
            endTime &&
            video.currentTime >= endTime
          ) {
            video.pause();
            video.currentTime = startTime || 0;
          }
        };

        const handleLoadedMetadata = () => {
          video.currentTime = startTime;
          video.pause();
        };

        // video.onseeked = () => {
        //   console.log('onseeked', startTime, video.currentTime);
        //   // 等待跳转完成
        //   // const canvas = document.createElement('canvas');
        //   // canvas.width = video.videoWidth;
        //   // canvas.height = video.videoHeight;
        //   // const ctx = canvas.getContext('2d');
        //   // ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        //   // const imageData = canvas.toDataURL('image/png');
        //   // console.log('imageData', imageData);
        //   // imageData 可用于显示静态帧
        // };

        // console.log('startTime', startTime, video.currentTime);

        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('timeupdate', handleTimeUpdate);

        return () => {
          video.removeEventListener('loadedmetadata', handleLoadedMetadata);
          video.removeEventListener('timeupdate', handleTimeUpdate);
        };
      }
    }, [startTime, endTime, localPlayUrl]);

    useEffect(() => {
      getNewPlayUrl();
    }, [url]);

    useEffect(() => {
      if (playUrl !== localPlayUrl) {
        setLocalPlayUrl(playUrl);
      }
    }, [playUrl]);

    const getNewPlayUrl = async (nocache?: boolean) => {
      if (!url) return '';
      try {
        const res = await getPlayUrl(url, nocache);

        setLocalPlayUrl(res);
        onChangePlayUrl?.(res);
        return res;
      } catch (err) {
        toast({
          title: 'Error',
          description: (err as Error).message,
          variant: 'destructive',
        });
        throw err;
      }
    };

    const handleError = () => {
      if (retryCountRef.current < maxRetry) {
        retryCountRef.current += 1;
        console.log(`Retrying... Attempt ${retryCountRef.current}/${maxRetry}`);
        getNewPlayUrl(true)
          .then(() => {
            const video = videoRef.current;
            if (video) {
              video.load();
              video.play();
            }
          })
          .catch(() => {
            setIsPlaying(false);
            setIsLoading(false);
          });
      } else {
        toast({
          title: '播放失败',
          description: '请刷新页面后重试',
          variant: 'destructive',
        });
        setIsPlaying(false);
        setIsLoading(false);
      }
    };

    const togglePlayPause = async () => {
      try {
        let curPlayUrl = localPlayUrl;
        if (!curPlayUrl && !isLoading) {
          setIsLoading(true);
          curPlayUrl = await getNewPlayUrl();
          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        const video = videoRef.current;
        if (video) {
          if (isPlaying) {
            video.pause();
          } else {
            await video.play();
          }
        }
      } catch (e) {
        console.error('Error toggling play/pause:', e);
      } finally {
        setIsLoading(false);
      }
    };

    const playBtn = (
      <button
        className='rounded-full bg-black bg-opacity-40 p-4 text-white'
        onClick={() => togglePlayPause()}
      >
        {isPlaying ? (
          <Pause className='h-6 w-6' />
        ) : (
          <Play className='h-6 w-6' />
        )}
      </button>
    );

    const fragmentPlayBtn = controls && hasFragment && (
      <div className='absolute left-[120%] top-0'>
        <button
          className={cn(
            'w-max rounded-full bg-black bg-opacity-40 p-2 text-xs text-white/70',
            playFragment || 'bg-white text-white'
          )}
          onClick={() => [
            (playFragmentRef.current = false),
            setPlayFragment(false),
          ]}
        >
          整片模式
        </button>
        <button
          className={cn(
            'w-max rounded-full bg-black bg-opacity-40 p-2 text-xs text-white/70',
            playFragment && 'bg-white text-white'
          )}
          onClick={() => [
            (playFragmentRef.current = true),
            setPlayFragment(true),
          ]}
        >
          分镜模式
        </button>
      </div>
    );

    return (
      <div
        className={cn(
          'group/video relative h-full w-full overflow-hidden rounded-[24px] bg-black',
          className
        )}
      >
        {localPlayUrl ? (
          <video
            ref={videoRef}
            className='h-full w-full object-contain'
            muted={muted} // 使用传入的 muted 属性
            playsInline
            src={localPlayUrl}
            controls={controls}
            preload='metadata'
            onEnded={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onError={handleError}
          />
        ) : null}
        {!url && !playUrl ? null : (
          <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform opacity-0 group-hover/video:opacity-100'>
            {playBtn}
            {/* {fragmentPlayBtn} */}
          </div>
        )}
      </div>
    );
  }
);

interface VideosPreviewProps {
  urls: Array<string | { url: string }>; // 更精确的类型定义
  className?: string;
  itemClassName?: string;
  footer?: React.ReactNode | React.ElementType;
  toolbar?: React.ReactNode | React.ElementType;
}

const VideosPreview: React.FC<VideosPreviewProps> = memo(
  ({ urls, className, itemClassName, footer, toolbar }) => {
    return (
      <div
        className={cn(
          'flex h-full w-full flex-nowrap items-start gap-4 overflow-auto',
          className
        )}
      >
        {urls.map((item, index) => (
          <div
            key={index}
            className={cn(
              'relative h-full min-w-[150px] flex-1 overflow-hidden',
              itemClassName
            )}
          >
            <div className='h-full w-full overflow-hidden bg-black'>
              <video
                src={typeof item === 'string' ? item : item?.url}
                controls
                className='h-full w-full rounded-lg object-contain shadow-lg'
              />
            </div>
            {toolbar &&
              (typeof toolbar === 'function'
                ? createElement(toolbar, { index, item })
                : toolbar)}
            {footer &&
              (typeof footer === 'function'
                ? createElement(footer, { index, item })
                : footer)}
          </div>
        ))}
      </div>
    );
  }
);

export { getPlayUrl, VideosPreview };
export default VideoPlayer;
