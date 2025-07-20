'use client';

import { useRouter, usePathname } from 'next/navigation';
import { SidebarUserNav } from '@/components/sidebar-user-nav';
import { useMenu, homeUrl } from '@/hooks/use-menu';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { useTranslations } from 'next-intl';
import { SidebarMenus } from '@/components/sidebar-menu';
import { User } from './types';

export interface FileInfo {
  id: string;
  name: string;
  type: string;
  content?: Base64URLString;
  date?: string;
}

export default function AppSidebar({
  user,
  isAdmin,
  ...props
}: {
  user?: User | null;
  isAdmin?: boolean;
}) {
  const t = useTranslations('siderbar');
  const pathname = usePathname();
  const router = useRouter();
  const menus = useMenu(pathname.startsWith('/admin/') ? 'admin' : '', isAdmin);

  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader className={`text-sidebar-header-foreground`}>
        <div className='flex flex-col items-center gap-6 group-data-[state=expanded]:hidden'>
          <h2
            className='cursor-pointer py-2 text-lg'
            onClick={() => router.push(homeUrl)}
          >
            {t('appName')?.slice(0, 1)}
          </h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <SidebarTrigger className='text-gray-400 hover:text-primary' />
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('triggerOpen')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className='px-2 pt-2 group-data-[state=collapsed]:hidden'>
          <div className='flex justify-between'>
            <h2
              className='cursor-pointer overflow-hidden whitespace-nowrap text-lg'
              onClick={() => router.push(homeUrl)}
            >
              {t('appName')}
            </h2>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarTrigger className='mr-[-10px] text-gray-400 hover:text-sky-400' />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('triggerClose')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className='pt-4'>
        <SidebarMenus menus={menus} />
      </SidebarContent>
      <SidebarFooter>{user && <SidebarUserNav user={user} />}</SidebarFooter>
    </Sidebar>
  );
}
