import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

export enum StatusEnum {
  notUsed = 'NotUsed',
  used = 'Used',
  useFailed = 'Failed',
}

export function useStatus() {
  const t = useTranslations('StatusTag');
  return [
    {
      value: StatusEnum.notUsed,
      label: t('NotUsed'),
    },
    {
      value: StatusEnum.used,
      label: t('Used'),
    },
    {
      value: StatusEnum.useFailed,
      label: t('Failed'),
    },
  ];
}

export const statusInfo = {
  [StatusEnum.notUsed]: {
    color: 'bg-blue-400',
    value: StatusEnum.notUsed,
  },
  [StatusEnum.used]: {
    color: 'bg-green-400',
    value: StatusEnum.used,
  },
  [StatusEnum.useFailed]: {
    color: 'bg-green-400',
    value: StatusEnum.useFailed,
  },
};

export function StatusTag({
  value,
  className,
}: {
  value: StatusEnum;
  className?: string;
}) {
  const t = useTranslations('StatusTag');
  const { color } = statusInfo[value] || {};

  return value ? (
    <div
      className={cn(
        'bg-grey-400 inline-block rounded px-2 py-1 text-xs text-white',
        className,
        `${color}`
      )}
    >
      {t(value)}
    </div>
  ) : null;
}
