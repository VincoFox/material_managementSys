import { useTranslations } from 'next-intl';
import { Select, SelectItem, SelectContent } from '@/components/ui/select';
import { SelectTrigger, SelectValue } from '@radix-ui/react-select';
import { SortDesc } from 'lucide-react'; // 导入降序图标
import { SortDirection } from './sort-by';

interface SortProps {
  options: { value: string; label: string }[];
  onChange: (field: string, value: SortDirection) => void;
  value?: { [key: string]: SortDirection | undefined };
}

function Sort({ value, options, onChange }: SortProps) {
  const t = useTranslations('Sort');

  const handleSelectChange = (value: string) => {
    console.log('Selected metric option:', value);
    onChange?.(value, SortDirection.DESC);
  };

  return (
    <div className='flex flex-wrap items-center gap-3'>
      {/* 添加 items-center 类使图标垂直居中 */}
      <div>{t('sortBy')}:</div>
      <Select onValueChange={handleSelectChange}>
        <SelectTrigger className='h-8 w-24'>
          <SelectValue placeholder={t('placeholder')} />
        </SelectTrigger>
        <SelectContent>
          {options?.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <SortDesc className='ml-2' size={16} /> {/* 添加降序图标并设置左边距 */}
    </div>
  );
}

export default Sort;
