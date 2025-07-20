'use client';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

export interface Menu {
  pathname: string;
  title: string;
  Icon?: React.FC<{ size?: number }>;
}

export function SidebarMenus({ menus }: { menus: Menu[] }) {
  const { id } = useParams();
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {menus.map((menuItem) => (
            <SidebarMenuItem key={menuItem.pathname}>
              <SidebarMenuButton
                asChild
                isActive={menuItem.pathname === pathname}
              >
                <Link
                  href={`${menuItem.pathname}`}
                  className='flex gap-3 hover:bg-sky-50 data-[active=true]:bg-sky-100'
                >
                  {menuItem.Icon ? <menuItem.Icon size={16} /> : null}
                  <span>{menuItem.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
