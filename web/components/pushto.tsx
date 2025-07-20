import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button, ButtonProps } from '@/components/ui/button';

interface PushtoProps extends ButtonProps {
  ids?: number[];
}

function Pushto({ ids, ...props }: PushtoProps) {
  const t = useTranslations('Pushto');
  const router = useRouter();
  return (
    <Button
      onClick={() =>
        router.push('/pushto/platform?ids=' + (ids?.join(',') || ''))
      }
      {...props}
    >
      {t('push')}
    </Button>
  );
}

export { Pushto };
