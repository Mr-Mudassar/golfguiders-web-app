export const locales = ['en', 'nl'] as const;
export const defaultLocale = 'en';
export type Locale = (typeof locales)[number];
