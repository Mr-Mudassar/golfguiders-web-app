'use client';

import React from 'react';

import { Label } from '@/components/ui';
import { useLocale, useTranslations } from 'next-intl';

const AppearanceForm = () => {
  const t = useTranslations('generalSettings');
  const locale = useLocale();
  return (
    <div>
      <Label>{t('theme', { locale })}</Label>
      <p className="text-[0.8rem] text-muted-foreground">
        {t('selectTheme', { locale })}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 mt-4">
        <Label className="[&:has([data-state=checked])>div]:border-primary">
          <div className="items-center rounded-md border-2 border-primary p-1">
            <div className="space-y-2 rounded-sm bg-[#ecedef] p-2">
              <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
                <div className="h-2 w-[80px] rounded-lg bg-[#ecedef]" />
                <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
              </div>
              <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
              </div>
              <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
              </div>
            </div>
          </div>
          <span className="block w-full p-2 text-center font-normal">
            Light
          </span>
        </Label>
      </div>
    </div>
  );
};

export { AppearanceForm };
