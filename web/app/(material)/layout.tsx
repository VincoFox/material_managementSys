import React from 'react';
import Sidebar from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { AppLayoutProvider } from '@/components/app-layout';
import { getUser } from '@/lib/api/user';
import { queryMetadataList } from '@/lib/api/metadata';
/**
 * 应用布局组件
 * @param children - 子组件内容
 * @returns 返回包含侧边栏和内容区域的应用布局
 */
export default async function layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isCollapsed = true;
  const { data } = await getUser();
  const { data: configs, error } = await queryMetadataList();
  if (error) {
    // 当获取配置数据出错时显示错误信息
    return <div>获取 configuration 数据出错！</div>;
  }
  // 检查当前用户是否为管理员
  const isAdmin = data?.user?.email
    ? !!(
        configs?.find((item) => item.config_name === 'managers')
          ?.config_json as Array<string>
      )?.includes?.(data?.user?.email)
    : false;

  return (
    <SidebarProvider defaultOpen={isCollapsed}>
      <AppLayoutProvider configs={configs} user={data?.user} isAdmin={isAdmin}>
        <div className='flex h-screen w-full bg-background'>
          <Sidebar user={data?.user} isAdmin={isAdmin} />
          <SidebarInset className={cn('h-full overflow-auto bg-gray-50 p-4')}>
            {children}
          </SidebarInset>
        </div>
      </AppLayoutProvider>
    </SidebarProvider>
  );
}
