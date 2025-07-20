'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  queryMetadataList,
  updateMetadataById,
  addMetadataById,
} from '@/lib/api/metadata';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import JsonEditor from '@/components/ui-pro/json-editor';
import { Database, Json } from '@/lib/supabase/types';
import { useToast } from '@/hooks/use-toast';

type Configuration = Database['public']['Tables']['configuration'];
/**
 * 元数据管理组件，用于配置和管理系统的元数据
 */
function Metadata() {
  const t = useTranslations('admin.metadata');
  const { toast } = useToast();
  const [metadataList, setMetadataList] = useState<Array<Configuration['Row']>>(
    []
  );
  const [selectedMetadataIndex, setSelectedMetadataIndex] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);
  const [newMetadataName, setNewMetadataName] = useState('');
  const [curJson, setCurJson] = useState<Json>({});
  const [parseError, setParseError] = useState<string | null>(null);

  const curMetadata = metadataList[selectedMetadataIndex];

  useEffect(() => {
    queryMetadataList().then(({ data, error }) => {
      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        setMetadataList(data);
      }
    });
  }, []);
  /**
   * 添加新的元数据项
   * 如果新元数据名称不为空，则将其添加到元数据列表中
   */
  const handleAddMetadata = () => {
    if (newMetadataName.trim()) {
      setMetadataList([
        ...metadataList,
        {
          config_name: newMetadataName,
          config_json: {},
        } as Configuration['Row'],
      ]);
      setNewMetadataName('');
      setIsOpen(false);
    }
  };
  /**
   * 处理JSON编辑器内容变化
   * @param json - 当前编辑的JSON对象
   * @param error - 解析错误信息（如果有）
   */
  const handleJsonChange = (json: object, error?: any) => {
    if (error) {
      setParseError(error);
    } else {
      setParseError(null);
      setCurJson(json as Json);
    }
  };
  /**
   * 保存当前元数据
   * 根据元数据是否存在ID决定是更新还是新增操作
   * 保存成功后刷新页面或显示提示信息
   */
  const handleSave = async () => {
    try {
      if (!curMetadata || parseError) {
        return;
      }
      curMetadata.config_json = curJson;

      if (curMetadata.id) {
        console.log('curMetadata.id', curMetadata);
        await updateMetadataById(curMetadata.id, curJson).then(
          ({ error, data }) => {
            if (error) {
              console.error('Error updating metadata:', error);
            } else {
              window.location.reload();
            }
          }
        );
      } else {
        addMetadataById({
          ...curMetadata,
          config_json: curJson,
        }).then(({ error, data }) => {
          if (error) {
            console.error('Error updating metadata1:', error);
            toast({
              title: 'Error',
              description: error.message,
            });
          } else {
            toast({
              title: 'Success',
              description: 'Success',
            });
          }
        });
      }
      setMetadataList([...metadataList]);
    } catch (e) {
      setParseError((e as Error).message);
    }
  };

  return (
    <div className='p-4'>
      <h1 className='mb-4 text-2xl font-bold'>Metadata Management</h1>
      <Button onClick={() => setIsOpen(true)}>{t('addMetadata')}</Button>

      <Tabs
        value={selectedMetadataIndex.toString()}
        onValueChange={(val) => setSelectedMetadataIndex(+val)}
      >
        <TabsList className='flex w-full justify-around'>
          {metadataList?.map((item, index) => (
            <TabsTrigger key={index} value={index.toString()}>
              {item.config_name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {!!curMetadata && (
        <Card key={curMetadata.id}>
          <CardHeader>
            <CardTitle>{curMetadata.config_name}</CardTitle>
          </CardHeader>
          <CardContent className='h-[500px] space-y-2'>
            <JsonEditor
              defaultValue={curMetadata?.config_json}
              onChange={handleJsonChange}
            />
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleSave}
              className={parseError ? 'cursor-not-allowed opacity-50' : ''}
            >
              保存
            </Button>
            <span className='text-red-500'>{parseError}</span>
          </CardFooter>
        </Card>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className='sm:max-w-[525px]'>
          <DialogHeader>
            <DialogTitle>{t('addMetadata')}</DialogTitle>
          </DialogHeader>

          <Input
            value={newMetadataName}
            onChange={(e) => setNewMetadataName(e.target.value)}
            placeholder='Metadata Name'
          />
          <Button onClick={handleAddMetadata}>Add</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Metadata;
