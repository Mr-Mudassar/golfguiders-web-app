'use client';
import {
  Icon,
  Card,
  CardTitle,
  CardContent,
} from '@/components/ui';
import { Link, usePathname } from '@/i18n/routing';
import React, { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Container } from '@/components/layout';
import type { IconProps } from '@/components/ui';
import { useAppDispatch, useAppSelector } from '@/lib';
import { cn } from '@/lib/utils';
import { useLazyQuery } from '@apollo/client/react';
import { setSentFriendRequestCount } from '@/lib/redux/slices';
import type {
  GetSentFriendRequestsType,
  GetSentFriendRequestsVariablesType,
} from '@/app/[locale]/(app)/dashboard/friends';
import { GetSentFriendRequests } from '@/app/[locale]/(app)/dashboard/friends';
import dynamic from 'next/dynamic';

const InviteFriends = dynamic(() =>
  import('@/components/common').then((mod) => mod.InviteFriends)
);

interface FriendsLayoutProps {
  readonly children?: React.ReactNode;
}

const FriendsLayoutComponent: React.FC<FriendsLayoutProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const t = useTranslations('profilePage.friends.manage');
  const myInfo = useAppSelector((state) => state.auth.user);
  const sentFriendRequestCount: number = useAppSelector(
    (state) => state.user.sentFriendRequestCount
  );
  const allFriendsCount: number = useAppSelector(
    (state) => state.user.allFriendsCount
  );

  const [fetchSentReqCount, { loading: fetchSentCountLoading }] = useLazyQuery<
    GetSentFriendRequestsType,
    GetSentFriendRequestsVariablesType
  >(GetSentFriendRequests);

  // Only call GetSentFriendRequests on /dashboard/friends/requests page
  useEffect(() => {
    const isRequestsPage = pathname?.includes('/dashboard/friends/requests');
    if (!isRequestsPage || !myInfo?.userid) return;

    const fetchSentCount = async () => {
      try {
        const { data } = await fetchSentReqCount({ variables: { page: 1 } });
        dispatch(
          setSentFriendRequestCount(data?.getUserFriendReqSent?.count ?? 0)
        );
      } catch (error) {
        console.error('Error fetching sent request count:', error);
      }
    };

    fetchSentCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myInfo?.userid, pathname]);

  const Navigation = [
    {
      title: 'Friend Requests',
      href: '/dashboard/friends',
      icon: 'bell' satisfies IconProps['name'],
      count: null,
    },
    {
      count: allFriendsCount > 0 ? allFriendsCount : null,
      title: 'All Friends',
      href: '/dashboard/friends/all',
      icon: 'users' satisfies IconProps['name'],
    },
    {
      count: pathname === '/dashboard/friends/requests' && !fetchSentCountLoading && sentFriendRequestCount > 0
        ? sentFriendRequestCount
        : null,
      title: 'Request Sent',
      href: '/dashboard/friends/requests',
      icon: 'user-check' satisfies IconProps['name'],
    },
    {
      title: 'Blocked Users',
      href: '/dashboard/friends/blocked',
      icon: 'user-minus' satisfies IconProps['name'],
      count: null,
    },
  ];

  return (
    <Container className="py-4 grid grid-cols-1 lg:grid-cols-3 max-w-5xl gap-4">
      <div className="flex flex-col gap-4 h-fit lg:sticky lg:top-20">
        <Card className="overflow-hidden border border-border/60 shadow-sm">
          {/* Card header */}
          <div className="px-5 pt-5 pb-4 border-b border-border/50">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70 mb-1">
              Network
            </p>
            <CardTitle className="text-base font-semibold text-foreground">
              {t('label')}
            </CardTitle>
          </div>

          {/* Nav items */}
          <CardContent className="p-2">
            <nav className="flex flex-col gap-0.5">
              {Navigation.map((nav) => {
                let isActive = false;
                if (nav.href === '/dashboard/friends') {
                  isActive =
                    pathname === nav.href ||
                    (pathname?.startsWith('/en') && pathname === `/en${nav.href}`) ||
                    (pathname?.startsWith('/ar') && pathname === `/ar${nav.href}`);
                } else {
                  isActive = pathname?.includes(nav.href) ?? false;
                }

                return (
                  <Link
                    key={nav.title}
                    href={nav.href}
                    prefetch
                    className={cn(
                      'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    {/* Active left-bar accent */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-primary-foreground/60" />
                    )}

                    <Icon
                      name={nav.icon as IconProps['name']}
                      size={16}
                      className={cn(
                        'shrink-0 transition-colors',
                        isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                      )}
                    />

                    <span className="flex-1 truncate">{nav.title}</span>

                    {nav.count != null && (
                      <span
                        className={cn(
                          'ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums',
                          isActive
                            ? 'bg-primary-foreground/20 text-primary-foreground'
                            : 'bg-primary/10 text-primary'
                        )}
                      >
                        {nav.count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </CardContent>
        </Card>
        <InviteFriends />
      </div>
      <div className="flex flex-col gap-4 col-span-1 lg:col-span-2">
        {children}
      </div>
    </Container>
  );
};

export default FriendsLayoutComponent;
