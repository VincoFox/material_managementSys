import React from 'react';
import { cn } from '@/lib/utils';
import { getFormattedDate } from '@/lib/datetime';
import Link from 'next/link';
import VideoPlayer from './video';
import type { Material, VideoStoryboard } from '../types';
import { Download } from '../download';
import { useTranslations } from 'next-intl';
import { useCardMetricsOptions } from '../metrics/metrics';
import { formatValue } from '@/lib/value-format';
import { Badge } from '../ui/badge';
import { Button } from '@/components/ui/button';

interface MaterialCardProps {
  // 素材信息
  material: Material;
  // 分镜信息
  storyBoard?: VideoStoryboard;
  // 自定义样式类名（可选）
  className?: string;
  // 是否显示指标信息（可选）
  showMetrics?: boolean;
  // 广告表现日期，开始时间和结束时间以逗号分隔（可选）
  adPerformance?: string;
}
/**
 * 指标显示组件
 * @param {Object} props - 组件属性
 * @param {Material} props.data - 素材对象
 */
const Metrics = ({ data }: { data: Material }) => {
  const metricsOptions = useCardMetricsOptions();
  return (
    <div className='flex flex-wrap justify-around gap-2 text-xs'>
      {metricsOptions.map((item) => {
        return (
          <div key={item.value} className='text-center'>
            <div className='text-muted-foreground'>{item.label}</div>
            <div className=''>{formatValue((data as any)?.[item.value])}</div>
          </div>
        );
      })}
    </div>
  );
};
/**
 * 材料字段显示组件
 * @param {Object} props - 组件属性
 * @param {string} [props.field] - 字段名称（可选）
 * @param {string} [props.value] - 字段值（可选）
 */
const MaterialField = ({
  field,
  value,
}: {
  field?: string;
  value?: string;
}) => {
  const t = useTranslations('material');
  return (
    <span>
      {field ? `${t(field)}:` : ''}
      {value}
    </span>
  );
};
/**
 * 材料卡片组件
 * @param {MaterialCardProps} props - 组件属性
 * @param {VideoStoryboard} [props.storyBoard] - 分镜信息
 * @param {Material} props.material - 素材信息
 * @param {string} [props.className] - 自定义样式类名
 * @param {boolean} [props.showMetrics] - 是否显示指标信息，默认为true
 */
const MaterialCard: React.FC<MaterialCardProps> = ({
  storyBoard,
  material,
  className,
  showMetrics = true,
  adPerformance,
}) => {
  const t = useTranslations('Storyboard');

  const {
    material_name,
    material_id,
    file_path,
    owner_team,
    editor_name,
    source_type,
    created_at,
  } = material || {};
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-lg',
        'max-w-md flex-1 border border-border bg-background',
        'hover:shadow-md',
        'hover:border-primary/20',
        className
      )}
    >
      <div className='h-56 w-full'>
        <VideoPlayer
          url={file_path}
          className='rounded-none'
          startTime={storyBoard?.start_time}
          endTime={storyBoard?.end_time}
          controls
        />
      </div>
      <div className='flex-1 space-y-2 p-3 text-xs text-muted-foreground'>
        <div className='flex items-start justify-between gap-2'>
          <Link
            href={`/material/${material_id}?ad_performance=${adPerformance}`}
            className=''
            target='_blank'
          >
            <h3 className='line-clamp-2 break-all text-xs font-medium leading-5 text-black'>
              {material_name || material_id}
            </h3>
          </Link>
        </div>
        <div className='flex items-center gap-2'>
          <Link
            href={`/material/${material_id}?ad_performance=${adPerformance}`}
            className=''
            target='_blank'
          >
            <Button
              title='view details'
              variant='outline'
              className='h-6 rounded-full bg-primary/10 text-primary'
              size='sm'
            >
              {t('details')}
            </Button>
          </Link>
          <Download
            file_path={file_path}
            title='download video'
            variant='outline'
            className='h-6 rounded-full bg-primary/10 text-primary'
            size='sm'
          />
        </div>
        {storyBoard ? (
          <div className='space-y-2'>
            <div className='flex justify-between'>
              <div>
                <span className='rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground'>
                  {formatValue(storyBoard.start_time?.toString())}-
                  {formatValue(storyBoard.end_time?.toString())}s
                </span>
              </div>
              <span className='text-xs text-muted-foreground'>
                {t('similarity')}：{(storyBoard as any).similarity?.toFixed(2)}
              </span>
            </div>
            <p className='line-clamp-2 h-8 text-xs text-muted-foreground'>
              {storyBoard.shot_content}
            </p>
          </div>
        ) : null}

        <div className='flex flex-wrap items-center justify-between'>
          {/* {(material as any)?.post_date ? (
            <MaterialField field='post_date' value={(material as any)?.post_date} />
          ) : ( */}
          <div className='flex flex-wrap gap-1'>
            <Badge variant='secondary' className='font-normal'>
              {source_type}
            </Badge>
            <Badge variant='secondary' className='font-normal'>
              {owner_team}
            </Badge>
            <Badge variant='secondary' className='font-normal'>
              {editor_name}
            </Badge>
          </div>
          <span className='flex-1 text-nowrap text-right'>
            {created_at ? (
              <MaterialField value={getFormattedDate(new Date(created_at))} />
            ) : (
              ''
            )}
          </span>
          {/* )} */}
        </div>

        {showMetrics ? (
          <div>
            <div className='col-span-3 my-2 border-b'></div>
            <Metrics data={material} />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default MaterialCard;
