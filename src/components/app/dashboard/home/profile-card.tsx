'use client';

import React from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  Avatar,
  AvatarFallback,
  AvatarImage,
  CardHeader,
  AnimatedCard,
  Skeleton,
} from '@/components/ui';
import { getInitials, getName, cn, toDirectGcsImageUrl } from '@/lib/utils';
import { useAppSelector } from '@/lib';
// import { useFetchAllFriends } from '@/lib/hooks/use-user';
import Image from 'next/image';

interface ProfileCardProps {
  readonly className?: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ className }) => {
  const user = useAppSelector((state) => state.auth.user);
  // const { mergedList: friendsList } = useFetchAllFriends();
  const allFriendsCount = useAppSelector((state) => state.user.allFriendsCount);
  const isLoading = !user;

  // Use friends count from Redux if available, otherwise use the length of friends list
  // const friendsCount = allFriendsCount ?? friendsList?.length ?? 0;

  if (isLoading) {
    return (
      <Card className={cn("overflow-hidden bg-card/50 backdrop-blur-sm border-0 shadow-[0_1px_2px_rgba(0,0,0,0.04)]", className)}>
        <CardHeader className="p-0 border-0 relative h-32">
          <Skeleton className="w-full h-full" />
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 !z-50">
            <Skeleton className="h-20 w-20 rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="pt-8 px-6 pb-4 text-center">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-32 mx-auto" />
            <Skeleton className="h-4 w-full mt-2" />
            <div className="grid grid-cols-2 gap-2 mt-2 pt-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <AnimatedCard index={0}>
      <Card className={cn("overflow-hidden bg-card/50 backdrop-blur-sm", className)}>
        <CardHeader className="p-0 border-0 relative h-32 ">
          <Link href={`/profile/${user?.userid}`} prefetch className="block w-full h-full group">
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent z-10" />
            {user?.photo_cover ? (
              <Image
                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-x-110"
                src={toDirectGcsImageUrl(user.photo_cover) ?? '/images/placeholder.svg'}
                alt=""
                width={400}
                height={128}
                sizes="(max-width: 768px) 100vw, 300px"
              />
            ) : (
              <div className="w-full h-full bg-primary/10 bg-grid" />
            )}
          </Link>
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 !z-50">
            <Link href={`/profile/${user?.userid}`} prefetch>
              <div className="p-1 rounded-full bg-background border-2 border-primary/20 shadow-lg">
                <Avatar className="h-20 w-20 ring-2 ring-primary/10 overflow-hidden rounded-full">
                  <AvatarImage
                    src={user?.photo_profile}
                    alt={getName(user?.first_name, user?.last_name)}
                    className="object-contain rounded-full bg-background"
                    style={{ objectPosition: 'center' }}
                  />
                  <AvatarFallback className="text-2xl bg-primary/20 text-primary rounded-full">
                    {getInitials(user?.first_name, user?.last_name)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-8 px-6 pb-4 text-center">
          <div className="flex flex-col gap-2">
            <Link href={`/profile/${user?.userid}`} prefetch className="group">
              <h3 className="font-bold text-xl group-hover:text-primary transition-colors">
                {getName(user?.first_name, user?.last_name)}
              </h3>
              {user?.bio && user.bio.trim() ? (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-3 leading-relaxed">
                  {user.bio}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground/60 italic mt-1">No bio added yet</p>
              )}
            </Link>

            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-border">
              <div className="text-center">
                <div className="text-lg font-bold">{allFriendsCount}</div>
                <div className="text-xs text-muted-foreground tracking-wider">Friends</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">{user?.handicap || 'No'}</div>
                <div className="text-xs text-muted-foreground tracking-wider">Handicap</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </AnimatedCard>
  );
};

export { ProfileCard };
