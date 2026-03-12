'use client';

import React from 'react';

import {
  Icon,
  Avatar,
  AvatarImage,
  DropdownMenu,
  AvatarFallback,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Auth } from '@/lib/constants';
import { getInitials, getName } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/lib';
import { apolloClient } from '@/lib/apollo-config';
import { appPersistor } from '@/components/layout/providers/store';
import { browserQueryClient } from '@/components/layout/providers/react-query';

interface ProfileDropdownProps {
  className?: string;
  align?: 'start' | 'end';
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  className,
  align = 'end',
}) => {
  const authState = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    try {
      const userId = authState.user?.userid;

      // 1. Reset ALL Redux slices (auth, user, leagues, notifications)
      dispatch({ type: 'RESET_ALL_STATE' });

      // 2. Purge redux-persist storage (prevents re-persist race condition)
      if (appPersistor) {
        await appPersistor.purge();
      }

      // 3. Clear Apollo Client cache (removes cached queries/user data)
      await apolloClient.clearStore();

      // 4. Clear React Query cache
      if (browserQueryClient) {
        browserQueryClient.clear();
      }

      // 5. Clear auth cookies
      Cookies.remove(Auth.Tokens.AccessToken, { path: '/' });
      Cookies.remove(Auth.Tokens.RefreshToken, { path: '/' });

      // 6. Clear all browser storage
      localStorage.clear();
      sessionStorage.clear();

      const reason = 'manual';
      const logoutUrl = `${process.env.NEXT_PUBLIC_AUTH_LOGOUT_URL}&reason=${reason}&userId=${userId}`;

      window.location.href = logoutUrl;
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout failed');
    }
  };

  const t = useTranslations('settings');

  return (
    <DropdownMenu>
      {authState?.isAuthenticated && (
        <DropdownMenuTrigger className={className} asChild>
          <button className="cursor-pointer flex items-center gap-2 rounded-full p-0.5 pr-2 hover:bg-accent transition-colors outline-none focus-visible:ring-1 focus-visible:ring-ring">
            <Avatar className="h-8 w-8 ring-2 ring-border/50">
              <AvatarImage
                src={authState?.user?.photo_profile}
                alt={getName(
                  authState.user?.first_name,
                  authState.user?.last_name
                )}
              />
              <AvatarFallback className="text-xs font-medium">
                {getInitials(
                  authState.user?.first_name,
                  authState.user?.last_name
                )}
              </AvatarFallback>
            </Avatar>
            <Icon name="chevron-down" size={14} className="text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
      )}
      <DropdownMenuContent
        align={align}
        className="w-64 lg:w-56"
        style={{ zIndex: 990 }}
      >
        <DropdownMenuLabel className="pb-0 font-semibold">
          {getName(authState.user?.first_name, authState.user?.last_name)}
        </DropdownMenuLabel>
        <p className="text-muted-foreground text-xs px-2 pb-1.5 truncate">
          {authState.user?.email}
        </p>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={`/profile/${authState.user?.userid}`}>
              <Icon name="user-circle" size={16} className="mr-2" />
              {t('user-circle')}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={process.env.NEXT_PUBLIC_AUTH_URL + '/dashboard'}>
              <Icon name="grid" size={16} className="mr-2" />
              My Apps
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/friends/all">
              <Icon name="users-round" size={16} className="mr-2" />
              {t('friends')}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={process.env.NEXT_PUBLIC_AUTH_URL + '/settings'}>
              <Icon name="settings" size={16} className="mr-2" />
              {t('label')}
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
          <Icon name="logout" size={16} className="mr-2" />
          {t('logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { ProfileDropdown };
