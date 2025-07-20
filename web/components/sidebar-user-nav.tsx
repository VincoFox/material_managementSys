'use client';
import { ChevronUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { logout } from '@/lib/api/user';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

export function SidebarUserNav({ user }: { user: any }) {
  const t = useTranslations('userNav');
  const router = useRouter();
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className='h-10 bg-background hover:bg-sky-50 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'>
              <div className='h-6 w-6 rounded-full bg-sky-100 text-center text-base text-primary group-data-[collapsible=icon]:ml-[-0.2em] group-data-[collapsible=icon]:min-w-6'>
                {user?.email?.slice(0, 1) || ''}
              </div>
              <span className='truncate group-data-[collapsible=icon]:hidden'>
                {user?.email}
              </span>
              <ChevronUp className='ml-auto group-data-[collapsible=icon]:hidden' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side='top'
            className='w-[--radix-popper-anchor-width]'
          >
            <DropdownMenuItem asChild>
              <button
                type='button'
                className='w-full cursor-pointer'
                onClick={async () => {
                  logout().then(({ error }) =>
                    error ? console.error(error) : router.push('/login')
                  );
                }}
              >
                {t('logout')}
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
