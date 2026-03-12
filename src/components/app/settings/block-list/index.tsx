'use client';

import React from 'react';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Card,
  CardContent,
} from '@/components/ui';
import { getInitials, getName } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useFetchBlockList } from '@/lib/hooks/use-user';
import type { BlockUser } from '@/lib/definitions';
import { useRouter } from '@/i18n/routing';
import dynamic from 'next/dynamic';

const AccountSkeleton = dynamic(() =>
  import('@/components/app/common').then((mod) => mod.AccountSkeleton)
);

interface FriendRequestProps {
  className?: string;
}

const BlockListTable: React.FC<FriendRequestProps> = ({ className }) => {
  const router = useRouter();
  const t = useTranslations('blockedUserSettings');
  const { mergedList: blockList, loading } = useFetchBlockList();

  return (
    <Card className={className}>
      <CardContent className="space-y-4">
        {!loading && !blockList?.length ? (
          <div className="w-full flex text-foreground/60 items-center justify-center h-60">
            {t('noUsers')}
          </div>
        ) : (
          blockList?.map((user) => {
            const name = getName(
              user?.userInfo?.first_name,
              user?.userInfo?.last_name
            );
            return (
              <div
                className="flex items-center justify-between gap-2"
                key={user?.block_user_id}
              >
                <div className="flex items-center gap-3 text-foreground/70">
                  <Avatar className="opacity-70">
                    <AvatarImage src={user?.userInfo?.photo_profile} />
                    <AvatarFallback>
                      {getInitials(
                        user?.userInfo?.first_name,
                        user?.userInfo?.last_name
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <p>{name}</p>
                </div>
                <Button
                  onClick={() => router.push('/dashboard/friends/blocked')}
                  variant="outline"
                >
                  {t('btn')}
                </Button>
              </div>
            );
          })
        )}

        {loading &&
          Array.from({ length: 6 }).map((_, i) => <AccountSkeleton key={i} />)}

        {/* Observer elements, will allow us to call next fetch when its intersecting the view
        <div ref={observer.ref} /> */}
      </CardContent>
    </Card>
  );
};

export { BlockListTable };
