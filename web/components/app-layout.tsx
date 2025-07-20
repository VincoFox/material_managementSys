'use client';
import React, { FC, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Select from './ui-pro/select';
import { Label } from '@/components/ui/label';
import type { Material, FieldConfig, Configuration, User } from './types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { homeUrl } from '@/hooks/use-menu';

const displayTypes: Record<
  string,
  FC<{
    name: string;
    value?: string;
    enums?: { value: string; label: string }[];
    className?: string;
    isClearable?: boolean;
    onChange: (value: string | string[] | number | number[]) => void;
  }>
> = {
  Input: ({ value, className, onChange }) => {
    return (
      <Input
        value={value}
        className={cn('flex-1', className)}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  },
  Select: ({ value, onChange, enums, className, ...otherProps }) => {
    return (
      <Select
        className={cn('flex-1', className)}
        onChange={onChange}
        value={value}
        options={enums}
        isClearable={true}
        {...otherProps}
      />
    );
  },
  MultiSelect: ({ value, onChange, enums, className, ...otherProps }) => {
    return (
      <Select
        className={cn('flex-1', className)}
        onChange={onChange}
        value={value}
        options={enums}
        isMulti
        {...otherProps}
      />
    );
  },
  RadioGroup: ({ name, value, className, onChange, enums }) => {
    return (
      <RadioGroup
        onValueChange={onChange}
        value={value}
        className={cn('flex flex-1 flex-wrap gap-4', className)}
      >
        {enums?.map((item) => {
          let label = item.label;
          let value = item.value;
          if (typeof item === 'string') {
            label = value = item;
          }

          return (
            <div key={value} className='flex items-center space-x-2'>
              <RadioGroupItem value={value} id={label + value} />
              <Label htmlFor={label + value}>{label}</Label>
            </div>
          );
        })}
      </RadioGroup>
    );
  },
  Checkbox: ({ name, value = false, className, onChange }) => {
    const checked = value as boolean;
    const handleChange = (checked: any) => {
      onChange?.(checked);
    };
    return (
      <Checkbox
        className={cn('', className)}
        checked={checked}
        onCheckedChange={handleChange}
      />
    );
  },
};

type AppLayoutContext = {
  // 当前用户是否为管理员
  isAdmin?: boolean;
  // 当前用户信息
  user?: User | null;
  // 配置项数组
  configs?: Array<Configuration['Row']>;
  // 枚举值
  enums?: Record<
    keyof Material,
    {
      values: string[] | Record<string, string[]>;
      // 关联字段
      linked_to?: keyof Material;
    }
  >;
  // 元数据字段配置
  metadata?: Array<FieldConfig>;
  // 表单必填字段
  form_required_fields?: { PGC: string[]; UGC: string[] };
};

const AppLayoutContext = React.createContext<AppLayoutContext | null>(null);

/**
 * 自定义hook，用于获取应用布局上下文
 * @returns {AppLayoutContext} 应用布局上下文
 * @throws 如果不在AppLayoutProvider中使用会抛出错误
 */
function useAppLayout() {
  const context = React.useContext(AppLayoutContext);
  if (!context) {
    throw new Error('useAppLayout must be used within a AppLayoutProvider.');
  }

  return context;
}
/**
 * 应用布局提供者组件
 * @param {Object} props - 组件属性
 * @param {React.ReactNode} props.children - 子组件
 * @param {Array<Configuration['Row']>} [props.configs] - 配置项数组
 * @param {User} [props.user] - 当前用户信息
 * @param {boolean} [props.isAdmin] - 当前用户是否为管理员
 * @returns {JSX.Element} 应用布局提供者组件
 */
const AppLayoutProvider = ({
  children,
  configs,
  user,
  isAdmin,
}: AppLayoutContext & { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const localConfigs =
    configs?.reduce(
      (acc, cur) => {
        const { config_name, config_json } = cur as Configuration['Row'];
        return { ...acc, [config_name]: config_json as any };
      },
      { enums: {}, metadata: [], form_required_fields: {}, user, isAdmin }
    ) || {};

  const isAdminPage = pathname.startsWith('/admin/');

  useEffect(() => {
    if (!isAdmin && isAdminPage) {
      router.replace(homeUrl);
    }
  }, [isAdmin, isAdminPage]);

  return (
    <AppLayoutContext.Provider value={localConfigs}>
      {!isAdmin && isAdminPage ? '' : children}
    </AppLayoutContext.Provider>
  );
};

export { AppLayoutProvider, useAppLayout, displayTypes };
