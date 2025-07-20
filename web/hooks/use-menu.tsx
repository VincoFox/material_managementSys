import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { BadgePlus, Search, BookUp, Bolt } from 'lucide-react';

export const homeUrl = '/search';

export const useMenu = (namespace: string, isAdmin?: boolean) => {
  const t = useTranslations('siderbar');
  const [menus, setMenus] = useState<any>([]);

  useEffect(() => {
    const appMenus = [
      {
        pathname: '/search',
        title: t('menus.search'),
        Icon: Search,
      },
      {
        pathname: '/ai-search',
        title: t('menus.ai_search'),
        Icon: Search,
      },
      {
        pathname: '/upload',
        title: t('menus.upload'),
        Icon: BadgePlus,
      },
      {
        pathname: '/pushto',
        title: t('menus.pushto'),
        Icon: BookUp,
      },
    ];
    if (isAdmin) {
      appMenus.push({
        pathname: '/admin/metadata',
        title: t('adminMenus.metadata'),
        Icon: Bolt,
      });
    }

    setMenus(appMenus);
  }, [namespace, isAdmin]);
  return menus;
};
