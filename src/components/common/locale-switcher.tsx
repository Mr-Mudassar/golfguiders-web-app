'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon,
} from '../ui';
import { routing, usePathname, useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import type { Locale } from '@/i18n/config';

interface LocaleSwitcherProps {
  readonly triggerClassName?: string;
  color?: string;
  iconSize?: number;
}

const LocaleSwitcher: React.FC<LocaleSwitcherProps> = ({
  triggerClassName,
  color = 'black',
  iconSize = 15,
}) => {
  const t = useTranslations('generalSettings');
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
    <DropdownMenu>
      <DropdownMenuTrigger className={triggerClassName} asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
        >
          <Icon name="globe" size={17} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" style={{ zIndex: 9990 }}>
        {routing.locales.map((locale) => (
          <DropdownMenuItem onClick={() => handleSelect(locale)} key={locale}>
            {t('locale', { locale })}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { LocaleSwitcher };
