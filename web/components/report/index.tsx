'use client';
import { useState, useEffect } from 'react';
import { subDays } from 'date-fns';
import { useTranslations } from 'next-intl';
import { useToast } from '@/hooks/use-toast';
import { queryAdvertisersByPost } from '@/lib/api/material';
import { queryTTMaterialInfo } from '@/lib/tt/report';
import { getFormattedDate } from '@/lib/datetime';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ModuleLoading } from '@/components/module-loading';
import { DatePickerWithRange, DateRange } from '../ui-pro/date-picker';
import Basic from './basic';
import Basictt from './basic-tt';
import HighlightFrame from './highlight-frame';
import { Title } from './title';
import AccountTotal from './account-total';
/**
 * 报表展示组件
 * @param {Object} props - 组件属性
 * @param {string} props.id - 唯一标识符
 * @param {string} [props.postId] - 帖子ID，可选参数
 * @returns {JSX.Element} 返回报表展示的React组件
 */
function Report({
  id,
  postId,
  adPerformance,
}: {
  id: string;
  postId?: string;
  adPerformance?: string;
}) {
  const { toast } = useToast();
  const t = useTranslations('Report');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 365),
    to: subDays(new Date(), 1),
  });
  const [accounts, setAccounts] = useState<any[]>([]);
  const [curAccount, setCurAccount] = useState<string>('');
  const [ttMaterial, setTtMaterial] = useState<any>({ info: {}, metrics: {} });
  const [loading, setLoading] = useState(false);

  const accountData =
    accounts?.find((item: any) => item.advertiser_id === curAccount) || {};

  useEffect(() => {
    postId &&
      queryAdvertisersByPost(postId)
        .then(({ status, data }) => {
          console.log('queryAdvertisersByPost', status, data);
          if (status === 'success') {
            setAccounts(data?.advertisers || []);
            setCurAccount(data?.advertisers?.[0]?.advertiser_id || '');
          } else {
            console.error('queryAdvertisersByPost', status, data);
          }
        })
        .catch((err) => {
          console.error('queryAdvertisersByPost', err);
        });
  }, [postId]);

  useEffect(() => {
    if (!postId || !curAccount) {
      return;
    }

    if (!dateRange?.from || !dateRange?.to) {
      toast({
        title: 'Error',
        variant: 'destructive',
        description: t('message.account_time_empty'),
      });
      return;
    }
    setLoading(true);
    const params = {
      advertiser_id: curAccount,
      post_id: postId,
      start_date: getFormattedDate(dateRange.from),
      end_date: getFormattedDate(dateRange.to),
    };

    // 1. 查询tt素材id
    queryTTMaterialInfo(params)
      .then(({ code, data, message }) => {
        if (code !== 0) {
          toast({
            title: 'Error',
            variant: 'destructive',
            description: message,
          });
        } else {
          const { info, metrics } = data?.list?.[0] || {};
          console.log('queryTTMaterialInfo', data);
          if (info?.material_id) {
            setTtMaterial({ info, metrics });
          } else {
            setTtMaterial((prev: any) => ({ ...prev, metrics }));
          }
        }
      })
      .finally(() => setLoading(false));
  }, [postId, dateRange, curAccount]);

  if (!postId) return null;

  return (
    <div className='space-y-4'>
      <Title>{t('highlights_data')}</Title>
      <Card className='border-0 bg-white p-4'>
        <div className='flex items-center gap-4'>
          {t('account')}
          <Select value={curAccount} onValueChange={setCurAccount}>
            <SelectTrigger className='w-[280px]'>
              <SelectValue placeholder={t('account')} />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((item: any) => (
                <SelectItem key={item.advertiser_id} value={item.advertiser_id}>
                  {item.advertiser_id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='mt-4'>
          <AccountTotal data={accountData} />
        </div>
        <HighlightFrame
          advertiserId={curAccount}
          materialId={ttMaterial.info?.material_id}
        />

        <div className='relative space-y-4'>
          <ModuleLoading loading={loading} className='absolute z-10' />

          {/* <div className='flex items-center gap-4'>
            {t('account_data_time')}

            <div className='flex items-center gap-4'>
              <DatePickerWithRange
                className='flex-1'
                value={dateRange}
                onChange={setDateRange}
              />
            </div>
          </div> */}
          <Basictt data={ttMaterial.metrics} />
        </div>
      </Card>
      <Title>{t('use_data')}</Title>
      <Card className='border-0 bg-white p-4'>
        <Basic postId={postId} adPerformance={adPerformance} />
      </Card>
    </div>
  );
}

export default Report;
