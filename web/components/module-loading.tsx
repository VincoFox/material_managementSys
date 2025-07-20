import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModuleLoadingProps {
  loading?: boolean;
  text?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function ModuleLoading({
  loading = false,
  text,
  className,
  style,
}: ModuleLoadingProps) {
  return loading ? (
    <div
      className={cn(
        'fixed inset-0 flex items-center justify-center bg-background/50 text-primary backdrop-blur-[1px]',
        className
      )}
      style={style}
    >
      <Loader2 className='h-10 w-10 animate-spin text-primary' />
      {text}
    </div>
  ) : null;
}
