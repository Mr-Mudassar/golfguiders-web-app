'use client';

import React from 'react';

import {
  Button,
  Icon,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui';
import { cn } from '@/lib/utils';
import { Link, usePathname } from '@/i18n/routing';
import { SettingsNavLinks } from '@/lib/constants';
import { useLocale, useTranslations } from 'next-intl';

interface SettingsSideBarProps {
  className?: string;
}

const SettingsSideBar: React.FC<SettingsSideBarProps> = ({ className }) => {
  const [open, setOpen] = React.useState(false);
  const t = useTranslations('settings');
  const locale = useLocale();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild className={className}>
        <Button variant="outline" size="icon">
          <Icon name="sheet-left-open" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader className="text-left mb-4">
          <SheetTitle>{t('label', { locale })}</SheetTitle>
          <SheetDescription>{t('description', { locale })}</SheetDescription>
        </SheetHeader>
        <SettingsSideBarContent closeSheet={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
};

export const SettingsSideBarContent = ({
  className,
  closeSheet,
}: {
  className?: string;
  closeSheet?: () => void;
}) => {
  const pathname = usePathname();
  const t = useTranslations('settings');
  const locale = useLocale();

  return (
    <nav className={cn('flex flex-col gap-0.5', className)}>
      {SettingsNavLinks.map((link) => (
        <Button
          key={link.href}
          variant="ghost"
          className={cn('w-full justify-start', {
            'bg-accent': pathname === link.href,
          })}
          onClick={closeSheet}
          asChild
        >
          <Link href={link.href}>{t(link.icon, { locale }) || link.label}</Link>
        </Button>
      ))}
    </nav>
  );
};

export { SettingsSideBar };
