'use client';
import React, { useEffect, useState, useMemo, FormEvent } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { UploadBtn } from '@/components/upload/upload-btn';
import { useTranslations } from 'next-intl';
import type { Material, FieldConfig } from '@/components/types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getLocalStorage, setLocalStorage } from '@/lib/cache';
import { getYYYYMMDDFormat } from '@/lib/datetime';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAppLayout, displayTypes } from '@/components/app-layout';
import { useToast } from '@/hooks/use-toast';
import { MaterialSourceTypeEnum, useFormField } from './use-form-field';

// 本地存储模板的key
const templateKey = 'material-templates';

/**
 * 素材字段组件，用于渲染一组可配置的素材字段
 * @param fields - 字段配置数组
 * @param data - 素材数据
 * @param className - 外层容器类名
 * @param labelClassName - 标签类名
 * @param valueClassName - 值容器类名
 * @param hasMetadata - 是否包含元数据
 * @param onChange - 字段值变化回调函数
 * @returns 渲染的字段组件数组
 */
export function MaterialFields({
  fields,
  data,
  className,
  labelClassName,
  valueClassName,
  hasMetadata = true,
  onChange,
}: {
  fields: Array<FieldConfig>;
  data: Partial<Material>;
  onChange: (values: Partial<Material>) => void;
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
  hasMetadata?: boolean;
}) {
  const t = useTranslations('');
  const { enums, metadata } = useAppLayout();

  // 处理字段值变化
  const handleChange = (key: keyof Material, value: string | string[]) => {
    console.log('handleChange', value);
    onChange({ ...data, [key]: value });
  };

  // 合并字段和元数据
  const localFields =
    hasMetadata && metadata ? [...fields, ...metadata] : fields;

  return localFields.map(
    ({ field: fieldName, displayName, displayType, options, node }) => {
      const { values, linked_to } = enums?.[fieldName] || {};
      const FieldComponent = displayTypes[displayType] || Input;
      let localOptions = values as string[];
      // 有联动
      if (linked_to) {
        localOptions = values ? Object.values(values).flat() : [];
      }

      return (
        <div
          key={fieldName}
          className={cn('flex items-center gap-2 space-y-0', className)}
        >
          <Label className={cn('w-32 min-w-fit', labelClassName)}>
            {displayName || t(`material.${fieldName}`)}
          </Label>
          {node ? (
            node
          ) : (
            <FieldComponent
              className={valueClassName}
              name={fieldName}
              value={data?.[fieldName] as string}
              onChange={(value) => handleChange(fieldName, value as string)}
              enums={
                options ||
                localOptions?.map((item) => ({
                  value: item,
                  label: item,
                }))
              }
              isClearable
            />
          )}
        </div>
      );
    }
  );
}

/**
 * 素材表单字段组件
 * @param data - 素材数据
 * @param form - react-hook-form 表单实例
 * @param fields - 字段配置数组
 * @returns 渲染的表单字段组件数组
 */
export function MaterialFormFields({
  data,
  form,
  fields,
}: {
  form: any;
  data: Partial<Material>;
  fields: Array<FieldConfig>;
}) {
  const t = useTranslations('');
  const { enums } = useAppLayout();

  // 生成表单字段项
  const formItems = useMemo(() => {
    const localFormData = form.getValues();

    return fields.map(
      ({
        field: fieldName,
        displayType,
        displayName,
        labelClassName,
        required,
      }) => {
        const { values, linked_to } = enums?.[fieldName] || {};
        const FieldComponent = displayTypes[displayType] || Input;
        const localOptions = linked_to
          ? (values as Record<string, string[]>)?.[localFormData[linked_to]]
          : (values as string[]);
        // TODO: 解耦 处理分类字段联动
        const handleChange = () => {
          if (fieldName === 'main_category') {
            form.setValue('first_level_category', '');
            form.setValue('second_level_category', '');
          } else if (fieldName === 'first_level_category') {
            form.setValue('second_level_category', '');
          }
        };

        return (
          <FormField
            key={fieldName}
            control={form.control}
            name={fieldName}
            render={({ field }) => (
              <FormItem className='flex items-center gap-2 space-y-0'>
                <FormLabel className={cn('w-32 py-0.5', labelClassName)}>
                  {displayName || t(`material.${fieldName}`)}{' '}
                  {required && <span className='text-red-500'>*</span>}
                </FormLabel>
                <FormControl>
                  <FieldComponent
                    className='flex-1'
                    {...field}
                    onChange={(value) => [
                      field.onChange(value),
                      handleChange(),
                    ]}
                    enums={localOptions?.map((item) => ({
                      value: item,
                      label: item,
                    }))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      }
    );
  }, [
    enums,
    fields,
    data.main_category,
    data.first_level_category,
    data.second_level_category,
  ]);

  return <>{formItems}</>;
}

/**
 * 素材表单组件，包含视频上传、模板选择等完整功能
 * @param defaultValue - 表单默认值
 * @param showVideo - 是否显示视频上传
 * @param showName - 是否显示素材名称
 * @param showAI - 是否显示AI选项
 * @param fields - 字段配置数组
 * @param materialFooter - 自定义底部内容
 * @param onSubmit - 表单提交回调函数
 * @returns 渲染的完整素材表单组件
 */
export function MaterialForm({
  defaultValue,
  showVideo,
  showName,
  showAI,
  hasMetadata = true,
  fields,
  materialFooter,
  onSubmit,
}: {
  defaultValue?: Partial<Material>;
  showVideo?: boolean;
  showName?: boolean;
  showAI?: boolean;
  hasMetadata?: boolean;
  fields?: Array<FieldConfig>;
  materialFooter?: React.ReactNode;
  onSubmit?: (
    data: Material,
    fileInfo: { name: string; size: number; url: string }[]
  ) => void;
}) {
  const { toast } = useToast();
  const [curTemplate, setCurTemplate] = useState<string>('');
  const [templateList, setTemplateList] = useState<
    Array<Material & { id: string }> | undefined
  >(undefined);
  const [sourceType, setSourceType] = useState<Material['source_type']>(
    defaultValue?.source_type || MaterialSourceTypeEnum.PGC
  );
  const [filePath, setFilePath] = useState<string[]>([]);
  const [fileInfo, setFileInfo] = useState<
    { name: string; size: number; url: string }[]
  >([]);
  const [formDefaultValue, setFormDefaultValue] = useState<
    Partial<Material> | undefined
  >(defaultValue || {});

  const { formFields } = useFormField({
    fields: fields,
    sourceType: sourceType as MaterialSourceTypeEnum,
    hasMetadata,
  });

  useEffect(() => {
    setTemplateList(getLocalStorage(templateKey));
  }, []);

  const handleChangeTemplate = (value: string) => {
    const template = templateList?.find((item) => item.id === value);
    if (template) {
      const { id, ...formData } = template;
      setFormDefaultValue(formData);
      setCurTemplate(value);
    }
  };

  const handleChangeSourceType = (value: Material['source_type']) => {
    setSourceType(value);
    setCurTemplate('');
    setFormDefaultValue(defaultValue);
  };

  const handleAddTemplate = async (newList: any[]) => {
    setTemplateList(newList);
  };

  const handleChangeVideo = (
    url: string[],
    fileInfo: { name: string; size: number; url: string }[]
  ) => {
    setFilePath(url);
    setFileInfo(fileInfo);
  };

  const handleSubmit = (values: any) => {
    if (showVideo && (!fileInfo || fileInfo.length === 0)) {
      toast({
        title: 'please upload video',
        description: '',
        variant: 'destructive',
      });
      return;
    }

    if (showName && !values.material_name) {
      toast({
        title: 'placee enter material name',
        description: '',
        variant: 'destructive',
      });
      return;
    }

    onSubmit?.(
      {
        ...values,
        material_type: 'video',
        file_path: filePath,
        source_type: sourceType,
        second_level_category: values.product_name,
        external_id: values.external_id || undefined,
      } as Material,
      fileInfo
    );
  };

  return (
    <div className='flex flex-col gap-4'>
      {showVideo ? (
        <MaterialVideo
          sourceType={sourceType}
          templateList={templateList}
          template={curTemplate}
          onChangeTemplate={handleChangeTemplate}
          onChangeVideo={handleChangeVideo}
          setSourceType={handleChangeSourceType}
        />
      ) : null}
      <LocalMaterialForm
        key={sourceType + curTemplate}
        showName={showName}
        showAI={showAI}
        defaultValue={formDefaultValue}
        fields={formFields}
        templateList={templateList}
        materialFooter={materialFooter}
        onSubmit={handleSubmit}
        onAddTemplate={handleAddTemplate}
      />
    </div>
  );
}

/**
 * 本地素材表单组件，处理表单逻辑和模板保存
 * @param defaultValue - 表单默认值
 * @param showName - 是否显示素材名称
 * @param showAI - 是否显示AI选项
 * @param fields - 字段配置数组
 * @param templateList - 模板列表
 * @param materialFooter - 自定义底部内容
 * @param onAddTemplate - 添加模板回调函数
 * @param onSubmit - 表单提交回调函数
 * @returns 渲染的本地素材表单组件
 */
function LocalMaterialForm({
  defaultValue,
  showName,
  showAI,
  fields,
  templateList,
  materialFooter,
  onAddTemplate,
  onSubmit,
}: {
  defaultValue?: Partial<Material>;
  showVideo?: boolean;
  showName?: boolean;
  showAI?: boolean;
  hasMetadata?: boolean;
  fields: Array<FieldConfig>;
  templateList?: Array<Material & { id: string }>;
  materialFooter?: React.ReactNode;
  onAddTemplate?: (newList: Array<Material & { id: string }>) => void;
  onSubmit?: (data: Material) => void;
}) {
  const { toast } = useToast();
  const { enums, metadata } = useAppLayout();
  const [materialName, setMaterialName] = useState<string>('');
  const [isAI, setIsAI] = useState<boolean>(false);

  const { zObj, localDefaultValue } = useMemo(() => {
    const zObj = {} as Record<Partial<keyof Material>, z.ZodTypeAny>;
    const localDefaultValue = {} as Record<Partial<keyof Material>, string>;
    fields.forEach(({ field, required, rules, defaultValue }) => {
      zObj[field] = rules
        ? rules
        : required
          ? z.string().min(1, {
              message: 'Please enter value.',
            })
          : z.any();

      localDefaultValue[field] = defaultValue || '';
    });
    return { zObj, localDefaultValue: localDefaultValue };
  }, [fields]);
  const formDefaultValue = useMemo(() => {
    return {
      ...localDefaultValue,
      ...defaultValue,
    };
  }, [localDefaultValue, defaultValue]);

  const formSchema = z.object(zObj as any);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: formDefaultValue,
  });

  const allValues = form.watch();

  useEffect(() => {
    if (showName) {
      const localName = [
        getYYYYMMDDFormat(),
        allValues.target_country,
        allValues.target_platform,
        allValues.editor_name,
        allValues.product_name,
        allValues.topic,
        allValues.material_category,
        allValues.video_type,
      ]
        .filter(Boolean)
        .join('-');
      setMaterialName(localName);
    }
  }, [
    allValues.target_country,
    allValues.target_platform,
    allValues.editor_name,
    allValues.product_name,
    allValues.topic,
    allValues.material_category,
    allValues.video_type,
  ]);
  const handleAddTemplate = async (e: FormEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const template = form.getValues(); // 禁用验证
    const { url, external_id, ...otherTemplate } = template;
    const item = {
      ...otherTemplate,
      id: (materialName || '') + Date.now().toString(),
    } as Material & { id: string };
    const newList = templateList?.length ? [item, ...templateList] : [item];
    setLocalStorage(templateKey, newList);
    toast({
      title: 'save success',
      duration: 2000,
      className: 'bg-green-500 text-white', // 添加自定义类名实现绿色背景
    });
    onAddTemplate?.(newList);
  };

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const localValues = { ...values };
    if (showName) {
      localValues.material_name = materialName;
    }
    if (showAI) {
      localValues.isAI = isAI;
    }
    if (metadata?.length) {
      localValues.metadata = {} as any;
      metadata.forEach(({ field }) => {
        localValues.metadata[field] = localValues[field];
        delete localValues[field];
      });
    }

    onSubmit?.({
      ...localValues,
      material_type: 'video',
    } as Material);
  };

  return (
    <Form {...form}>
      <form
        id='materialForm'
        onSubmit={form.handleSubmit(handleSubmit)}
        className='space-y-6'
      >
        <MaterialFormFields form={form} fields={fields} data={allValues} />
        {showName ? (
          <MaterialName value={materialName} onChange={setMaterialName} />
        ) : null}
        {showAI ? <MaterialAI value={isAI} onChange={setIsAI} /> : null}
        {materialFooter || <MaterialFooter onAddTemplate={handleAddTemplate} />}
      </form>
    </Form>
  );
}

/**
 * 视频上传组件，包含源类型选择和模板选择
 * @param sourceType - 素材来源类型
 * @param template - 当前选中的模板
 * @param templateList - 模板列表
 * @param onChangeTemplate - 模板选择回调函数
 * @param onChangeVideo - 视频上传回调函数
 * @param setSourceType - 设置来源类型回调函数
 * @returns 渲染的视频上传组件
 */
export function MaterialVideo({
  sourceType,
  template,
  templateList,
  onChangeTemplate,
  onChangeVideo,
  setSourceType,
}: {
  sourceType: Material['source_type'];
  template?: string;
  templateList?: Array<Material & { id: string }>;
  onChangeTemplate: (value: string) => void;
  onChangeVideo: (
    url: string[],
    fileInfo: { name: string; size: number; url: string }[]
  ) => void;
  setSourceType: (value: Material['source_type']) => void;
}) {
  const t = useTranslations('');

  return (
    <div className='ml-[136px] space-y-4'>
      <UploadBtn onFileChange={onChangeVideo} />
      <div className='space-y-4'>
        <Tabs
          value={sourceType!}
          onValueChange={(val) => setSourceType(val as Material['source_type'])}
        >
          <TabsList className=''>
            <TabsTrigger
              value={MaterialSourceTypeEnum.PGC}
              className='w-36 data-[state=active]:bg-primary/70 data-[state=active]:text-primary-foreground'
            >
              {t('upload.pgc')}
            </TabsTrigger>
            <TabsTrigger
              value={MaterialSourceTypeEnum.UGC}
              className='w-36 data-[state=active]:bg-primary/70 data-[state=active]:text-primary-foreground'
            >
              {t('upload.ugc')}
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Select value={template} onValueChange={onChangeTemplate}>
          <SelectTrigger className='w-full'>
            <SelectValue placeholder={t('upload.templateplaceholder')} />
          </SelectTrigger>
          <SelectContent>
            {templateList?.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

/**
 * 素材名称组件
 * @param value - 素材名称值
 * @param onChange - 素材名称变化回调函数
 * @returns 渲染的素材名称组件
 */
export function MaterialName({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const t = useTranslations('');
  const fieldName = 'material_name';

  return (
    <FormItem className='flex items-center gap-2 space-y-0'>
      <FormLabel className={cn('w-32 py-0.5')}>
        {t(`material.${fieldName}`)} <span className='text-red-500'>*</span>
      </FormLabel>
      <FormControl>
        <displayTypes.Input
          name={fieldName}
          value={value}
          onChange={onChange as any}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}

/**
 * AI选项组件
 * @param value - AI选项值
 * @param onChange - AI选项变化回调函数
 * @returns 渲染的AI选项组件
 */
export function MaterialAI({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  const t = useTranslations('');
  const fieldName = 'isAI';
  return (
    <FormItem className='flex items-center gap-2 space-y-0'>
      <FormLabel className={cn('py-0.5')}>
        {t(`material.${fieldName}`)}
      </FormLabel>
      <FormControl>
        <displayTypes.Checkbox
          name={fieldName}
          value={value as any}
          onChange={onChange as any}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}

/**
 * 表单底部组件，包含提交和保存模板按钮
 * @param onAddTemplate - 添加模板回调函数
 * @returns 渲染的表单底部组件
 */
export function MaterialFooter({
  onAddTemplate,
}: {
  onAddTemplate: (e: FormEvent) => void;
}) {
  const t = useTranslations('');

  return (
    <div className='flex gap-10'>
      <Button type='submit'>{t('upload.submit')}</Button>
      <Button onClick={onAddTemplate} variant='outline'>
        {t('upload.saveTemplate')}
      </Button>
    </div>
  );
}
