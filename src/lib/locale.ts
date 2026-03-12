'use server';

import { cookies } from 'next/headers';
import { Locales } from './constants';
import type { Locale } from '@/i18n/config';

// This name is used by next-intl and it should stay as is.
const COOKIE_NAME = 'NEXT_LOCALE';

export async function getUserLocale() {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value || Locales.Default.Locale;
}

export async function setUserLocale(locale: Locale) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, locale);
}
