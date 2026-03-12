'use client';

import { cn } from '@/lib/utils';
import { NavLinks } from '@/lib/constants';
import { AppsGridDialog } from '../common';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { Button, Icon, Separator } from '@/components/ui';

const Sidebar = () => {
  const pathname = usePathname();
  const t = useTranslations('settings');

  return (
    <>
      <aside
        className="fixed left-0 z-[1000] top-24 h-fit max-h-[calc(100vh-120px)] w-16 hover:w-64 bg-background border-y border-r border-white/5 group-hover/sidebar:border-primary/30 group-hover/sidebar:shadow-[0_8px_32px_rgba(34,197,94,0.15)] hidden md:flex flex-col items-start py-4 gap-4 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] transition-all duration-150 ease-out group/sidebar overflow-hidden rounded-r-2xl"
      >
        <div className="absolute inset-y-0 -left-10 w-20 bg-primary/10 blur-[50px] pointer-events-none" />
        {/* My Apps - commented out for now */}
        {/* <div className="w-full px-2">
          <AppsGridDialog
            trigger={
              <Button
                className={cn(
                  "w-12 group-hover/sidebar:w-full h-12 rounded-xl transition-all duration-150 ease-out flex items-center justify-start overflow-hidden",
                  "border border-transparent hover:border-primary/30 hover:bg-primary/5 hover:text-primary hover:shadow-[0_0_15px_rgba(34,197,94,0.1)] text-muted-foreground",
                  "px-0 group-hover/sidebar:px-4"
                )}
                variant={'ghost'}
              >
                <div className="flex items-center w-full">
                  <div className="w-12 flex-shrink-0 flex justify-center">
                    <Icon name={'grid'} size={20} />
                  </div>
                  <span className="ml-2 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-150 ease-out whitespace-nowrap font-medium">
                    {t('myApps')}
                  </span>
                </div>
              </Button>
            }
          />
        </div>

        <div className="px-4 w-full">
          <Separator className="w-full" />
        </div> */}

        <div className="flex flex-col gap-2 w-full px-2">
          {NavLinks.flatMap((section) => section.links).map((link) => {
            const isActive = pathname === link.href;
            const label = t(link.icon);
            return (
              <Button
                key={link.label}
                className={cn(
                  "w-12 group-hover/sidebar:w-full h-12 rounded-xl transition-all duration-150 ease-out flex items-center justify-start overflow-hidden",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90"
                    : "border border-transparent hover:border-primary/30 hover:bg-primary/5 hover:text-primary hover:shadow-[0_0_15px_rgba(34,197,94,0.1)] text-muted-foreground",
                  "px-0 group-hover/sidebar:px-4"
                )}
                variant={isActive ? 'default' : 'ghost'}
                asChild
              >
                <Link href={link.href} title={label} prefetch>
                  <div className="flex items-center w-full">
                    <div className="w-12 flex-shrink-0 flex justify-center">
                      <Icon name={link.icon} size={20} />
                    </div>
                    <span className="ml-2 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-150 ease-out whitespace-nowrap font-medium">
                      {label}
                    </span>
                  </div>
                </Link>
              </Button>
            );
          })}
        </div>
      </aside>
    </>
  );
};

export { Sidebar };
