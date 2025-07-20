'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import request from '@/lib/request';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Material, FieldConfig, MaterialAdInfo } from '@/components/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import PushToPlatform from '@/components/push-to-platform';
import { MaterialFields } from '@/components/material/material-field';
import { Card } from '@/components/ui/card';
import {
  DatePickerWithRange,
  type DateRange,
} from '@/components/ui-pro/date-picker';
import Pagination, { PaginationProps } from '@/components/ui-pro/pagination';

const defaultPageSize = 20;
const tableFields: Partial<keyof Material>[] = [
  'material_id',
  'material_name',
  // 'push_status',
  // 'fail_reason',
  // 'post_date',
];

function PushTo() {
  const t = useTranslations();
  const router = useRouter();
  const [filterData, setFilterData] = useState({});
  const [listData, setListData] = useState<Partial<Material>[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [pushIds, setPushIds] = useState<number[]>([]);
  const [keyword, setKeyword] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    {} as DateRange
  );
  const [pagination, setPagination] = useState<
    Omit<PaginationProps, 'onChange'>
  >({ pageIndex: 1, total: 1, pageSize: defaultPageSize });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // if (isLoading) return;
    // setIsLoading(true);
    // console.log('fileterdata====', keyword, filterData, dateRange);
    // let query = supabase.from('material').select('*', { count: 'exact' });
    // const filters: any = {};
    // filterData &&
    //   Object.entries(filterData).forEach(([key, value]) => {
    //     if (key === 'material_name') {
    //       const name = (value as string)?.trim();
    //       if (name) {
    //         query.ilike('material_name', `%${name}%`);
    //       }
    //     } else if (value) {
    //       filters[key] = value;
    //     }
    //   });
    // query.match(filters);
    // if (dateRange?.from) {
    //   query = query.gte('created_at', dateRange.from.toISOString()); // gte: 大于等于
    // }
    // if (dateRange?.to) {
    //   query = query.lte('created_at', dateRange.to.toISOString()); // lte: 小于等于
    // }
    // if (keyword) {
    //   query = query.ilike('material_name', `%${keyword}%`);
    // }
    // const { pageIndex, pageSize = defaultPageSize } = pagination;
    // const offset = (pageIndex - 1) * pageSize;
    // query
    //   .order('created_at', { ascending: false })
    //   .limit(pageSize)
    //   .range(offset, offset + pageSize - 1)
    //   .then(({ data, count, error }) => {
    //     if (error) {
    //       console.error(error);
    //     } else {
    //       setListData(data);
    //       setPagination((prev) => ({
    //         ...prev,
    //         total: count || 0,
    //       }));
    //     }
    //     setIsLoading(false);
    //   });
  }, [
    keyword,
    filterData,
    dateRange,
    pagination.pageIndex,
    pagination.pageSize,
  ]);

  const handleChangePagination = (current: number) => {
    setPagination((prev) => ({
      ...prev,
      pageIndex: current,
    }));
  };

  const handlePush = (id?: number) => {
    if (id) {
      setIsOpen(true);
      setPushIds([id]);
    }
  };

  const filterFields = [
    {
      field: 'created_at',
      node: (
        <DatePickerWithRange
          className='w-full'
          value={dateRange}
          onChange={setDateRange}
        />
      ),
    },
    {
      field: 'status',
      displayType: 'Select',
      // options: Object.values(statusInfo).map((item) => ({
      //   value: item.value,
      //   label: item.value,
      // })),
    },
    {
      field: 'target_country',
      displayType: 'Select',
    },
    {
      field: 'target_platform',
      displayType: 'Select',
    },
    {
      field: 'editor_name',
      displayType: 'Select',
    },
    {
      field: 'director_name',
      displayType: 'Select',
    },
    {
      field: 'material_name',
      displayType: 'Input',
    },
  ] as Array<FieldConfig>;

  // TODO: 暂未开放
  return (
    <div className='p-10 text-center text-lg text-muted-foreground'>
      暂未开放
    </div>
  );

  return (
    <div className='space-y-4'>
      <Card className='flex flex-wrap gap-x-6 gap-y-4 border-0 p-3'>
        <MaterialFields
          data={filterData}
          fields={filterFields}
          className='inline-flex'
          valueClassName='w-[200px]'
          onChange={setFilterData}
        />
      </Card>
      <Button onClick={() => request.get('/api/tt/ad?adId=1826828043516065')}>
        获取广告状态
      </Button>
      <div className='bg-white'>
        <Table>
          <TableHeader>
            <TableRow>
              {tableFields.map((field) => (
                <TableHead key={field}>{t(`material.${field}`)}</TableHead>
              ))}
              <TableHead>{t('table.operation')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listData.map((item) => (
              <TableRow
                className='border-0 hover:bg-accent'
                key={item.material_id}
              >
                {tableFields.map((field) => (
                  <TableCell key={field}>{item[field] as string}</TableCell>
                ))}
                <TableCell className='space-x-3'>
                  <Button
                    size='sm'
                    onClick={() => router.push(`/material/${item.material_id}`)}
                  >
                    {t('table.detail')}
                  </Button>
                  <Button
                    size='sm'
                    onClick={() => handlePush(item.material_id)}
                  >
                    {t('table.push')}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Pagination {...pagination} onChange={handleChangePagination} />
      </div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className='sm:max-w-[525px]'>
          <DialogHeader>
            <DialogTitle>{t('table.push')}</DialogTitle>
          </DialogHeader>
          <PushToPlatform
            value={pushIds}
            onChange={setPushIds}
            onClose={() => setIsOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PushTo;
