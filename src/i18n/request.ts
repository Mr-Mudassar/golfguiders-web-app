import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import type { Locale } from './config';

export default getRequestConfig(async ({ requestLocale }) => {
  // Await the locale promise
  const locale = await requestLocale;
  
  // Validate that the incoming `locale` parameter is valid
  if (!locale || !routing.locales.includes(locale as Locale)) {
    notFound();
  }

  return {
    locale,
    messages: (await import(`../../locales/${locale}.json`)).default,
  };
});
