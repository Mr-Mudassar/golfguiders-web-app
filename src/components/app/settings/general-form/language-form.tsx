'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

import {
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { routing, usePathname, useRouter } from '@/i18n/routing';
import type { Locale } from '@/i18n/config';

interface LanuageFormProps {
  className?: string;
}

const LanguageForm: React.FC<LanuageFormProps> = () => {
  const t = useTranslations('generalSettings');
  const locale = useLocale();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleSelect(locale: Locale) {
    React.startTransition(() => {
      router.replace(
        searchParams ? pathname + '?' + searchParams.toString() : pathname,
        {
          locale,
        }
      );
    });
  }

  return (
    <div className="gap-2 flex flex-col">
      <Label className="col-span-3">{t('language', { locale })}</Label>
      <Select value={locale} onValueChange={handleSelect}>
        <SelectTrigger className="md:max-w-56">
          <SelectValue>{t('locale', { locale })}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {routing.locales.map((l) => (
            <SelectItem key={l} value={l}>
              {t('locale', { locale: l })}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-muted-foreground text-[0.8rem]">
        {t('select', { locale })}
      </p>
    </div>
  );
};

export { LanguageForm };
