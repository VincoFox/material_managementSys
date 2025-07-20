import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

export interface OptionProps {
  label: string;
  value: string;
}

export const metricsList = [
  'roas',
  'spend',
  'impressions',
  'total_onsite_shopping_value',
  'gmv',
  'roi',
  'video_views',
  'clicks',
  'retain',
  'drop_off',
  'ctr',
  'conversions',
  'cvr',
  'cpc',
  'cpm',
  'average_video_play',
];

export const useCardMetricsOptions = (): OptionProps[] => {
  const t = useTranslations('Metrics');
  return useMemo(
    () => [
      {
        label: t('gmv'),
        value: 'gmv',
      },
      {
        label: t('spend'),
        value: 'spend',
      },
      {
        label: t('roi'),
        value: 'roi',
      },
    ],
    [t]
  );
};

export const useSortOptions = (): OptionProps[] => {
  const t = useTranslations('Metrics');
  return useMemo(
    () => [
      {
        label: t('gmv'),
        value: 'gmv',
      },
      {
        label: t('spend'),
        value: 'spend',
      },
      {
        label: t('impressions'),
        value: 'impressions',
      },
      {
        label: t('roi'),
        value: 'roi',
      },
    ],
    [t]
  );
};

export const useFilterOptions = (): OptionProps[] => {
  const t = useTranslations('Metrics');
  return useMemo(
    () => [
      {
        label: t('gmv'),
        value: 'gmv',
      },
      {
        label: t('spend'),
        value: 'spend',
      },
      {
        label: t('impressions'),
        value: 'impressions',
      },
      {
        label: t('roi'),
        value: 'roi',
      },
    ],
    [t]
  );
};

export const useAllMetricsOptions = (): OptionProps[] => {
  const t = useTranslations('Metrics');
  return useMemo(
    () => [
      {
        label: t('gmv'),
        value: 'gmv',
      },
      {
        label: t('spend'),
        value: 'spend',
      },
      {
        label: t('impressions'),
        value: 'impressions',
      },
      {
        label: t('roi'),
        value: 'roi',
      },
      {
        label: t('video_views'),
        value: 'video_views',
      },
      {
        label: t('clicks'),
        value: 'clicks',
      },
      {
        label: t('retain'),
        value: 'retain',
      },
      {
        label: t('drop_off'),
        value: 'drop_off',
      },
      {
        label: t('ctr'),
        value: 'ctr',
      },
      {
        label: t('conversions'),
        value: 'conversions',
      },
      {
        label: t('cvr'),
        value: 'cvr',
      },
      {
        label: t('cpc'),
        value: 'cpc',
      },
      {
        label: t('cpm'),
        value: 'cpm',
      },
      {
        label: t('average_video_play'),
        value: 'average_video_play',
      },
    ],
    [t]
  );
};
