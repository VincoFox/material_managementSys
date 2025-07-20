import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';

export default getRequestConfig(async ({}) => {
  // 从请求头中获取Accept-Language
  const headerList = await headers();
  const acceptLanguage = headerList.get('accept-language');
  console.log('acceptLanguage', acceptLanguage);
  let locale = 'en';
  // let locale = acceptLanguage?.split(',')[0] || 'en';
  // if (locale.includes('zh')) {
  //   locale = 'zh';
  // }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
