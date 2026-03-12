'use client';

import React from 'react';
import { Menu, X } from 'lucide-react';

import { Link, usePathname } from '@/i18n/routing';
import {
  Button,
  Icon,
  Input,
  Separator,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui';

import {
  AppsGridDialog,
  Loading,
  LocaleSwitcher,
  Logo,
} from '../../common';
import { ProfileDropdown } from './profile-dropdown';
import { Container } from '../container';
import { NavLinks } from '@/lib/constants';
import NotificationsDropdown from '@/components/app/common/notifications/notification-dropdown';

const Navbar = () => {
  const pathname = usePathname();
  const [opened, setOpen] = React.useState(false);

  return (
    <header
      className="bg-background/40 backdrop-blur-xl border-b border-white/5 h-16 fixed w-screen inset-x-0 transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
      style={{ zIndex: 990 }}
    >
      <div className="absolute inset-x-0 -top-10 h-20 bg-primary/10 blur-[50px] pointer-events-none" />
      <Container className="flex h-full items-center justify-between">
        <div className="flex items-center justify-start gap-8">
          <Link href="/dashboard" prefetch>
            <Logo />
          </Link>

          {/* <Input
            className="bg-muted"
            wrapperClassName="hidden md:flex"
            placeholder="Search anything..."
            icon="search"
            disabled
          /> */}
        </div>

        <div className="hidden md:flex items-center gap-1">
          {/* <LocaleSwitcher /> */}
          <NotificationsDropdown />
          <div className="w-px h-5 bg-border/50 mx-1.5" />
          <ProfileDropdown />
        </div>

        <Sheet open={opened} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="hover:opacity-80 md:hidden">
              {opened ? <X size={20} /> : <Menu size={20} />}
            </button>
          </SheetTrigger>
          <SheetContent className="px-2 sm:px-6">
            <SheetHeader>
              <SheetTitle className="sr-only">Menu</SheetTitle>
            </SheetHeader>
            <div className="flex justify-between flex-col gap-8 pt-8 align-start relative h-full">
              <div className="space-y-8">
                <Input placeholder="Search anything..." icon="search" />
                <div className="flex flex-col gap-1">
                  <AppsGridDialog
                    trigger={
                      <Button
                        className="justify-start gap-3"
                        variant={'ghost'}
                        size="lg"
                      >
                        <Icon name={'grid'} size={16} />
                        Apps
                      </Button>
                    }
                  />
                  {NavLinks.map((section, i) => (
                    <React.Fragment key={section.type}>
                      {section.links.map((link) => (
                        <Button
                          className="justify-start gap-3"
                          variant={
                            pathname === link.href ? 'secondary' : 'ghost'
                          }
                          size="lg"
                          key={link.label}
                          onClick={() => {
                            setOpen(false);
                          }}
                          asChild
                        >
                          <Link href={link.href}>
                            <Icon name={link.icon} size={16} />
                            {link.label}{' '}
                          </Link>
                        </Button>
                      ))}
                      {i !== NavLinks.length - 1 && (
                        <Separator className="my-1" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1 justify-between">
                <ProfileDropdown align="start" />
                {/* <div className="flex items-center gap-1">
                  <LocaleSwitcher />
                </div> */}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </Container>
    </header>
  );
};

export { Navbar };
