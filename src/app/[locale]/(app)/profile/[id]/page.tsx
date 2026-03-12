'use client';

import React, { useEffect, useState, useRef, use } from 'react';
import { notFound } from 'next/navigation';
import { useQuery } from '@apollo/client/react';

import { Container } from '@/components/layout';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  Icon,
  Skeleton,
} from '@/components/ui';
import { cn, getInitials, getName } from '@/lib/utils';
import type { User, UserFriend } from '@/lib/definitions';
import { AccountType } from '@/lib/constants';
import { useAppSelector, useAppDispatch, useFriends } from '@/lib';

import { GET_USER } from './_query';
import type {
  GetUserDetailsType,
  GetUserDetailsVariablesType,
} from './_interface';
import { GetUserFriendsCount } from '../../dashboard/friends/_query';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import {
  useFetchAllFriends,
  useFetchPeopleFriends,
} from '@/lib/hooks/use-user';
import { setAllFriendsCount } from '@/lib/redux/slices';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

const FriendButton = dynamic(() =>
  import('@/components/app').then((mod) => mod.FriendButton)
);
const PeopleYouMayKnow = dynamic(() =>
  import('@/components/app').then((mod) => mod.PeopleYouMayKnow)
);
const ProfileFeed = dynamic(() =>
  import('@/components/app').then((mod) => mod.ProfileFeed)
);
const ImagePreviewModal = dynamic(() =>
  import('@/components/common').then((mod) => mod.ImagePreviewModal)
);

const ProfilePage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const myInfo = useAppSelector((state) => state.auth.user);
  const allFriendsCount = useAppSelector((state) => state.user.allFriendsCount);
  const blockedUsers = useAppSelector((state) => state.user.blockedUsers);
  const dispatch = useAppDispatch();
  const friends = useFriends();
  const [postCount, setPostCount] = React.useState<number>();
  const [profileQuery, setProfileQuery] = useState<GetUserDetailsType>();
  const [previewImage, setPreviewImage] = useState<{
    url: string;
    alt: string;
  } | null>(null);
  const [coverLoaded, setCoverLoaded] = React.useState(false);
  const t = useTranslations('profilePage');

  const { data, loading, error, refetch } = useQuery<
    GetUserDetailsType,
    GetUserDetailsVariablesType
  >(GET_USER, {
    variables: { userId: id },
  });

  const { data: friendsCountData, loading: friendsCountLoading } = useQuery<
    { getUserFriendsCount: number }
  >(GetUserFriendsCount, {
    variables: { userId: id },
    fetchPolicy: 'cache-and-network',
  });

  // Keep Redux allFriendsCount in sync for own profile
  useEffect(() => {
    if (id === myInfo?.userid && friendsCountData?.getUserFriendsCount != null) {
      dispatch(setAllFriendsCount(friendsCountData.getUserFriendsCount));
    }
  }, [id, myInfo?.userid, friendsCountData, dispatch]);

  const friendId = id === myInfo?.userid ? '' : id;

  const { mergedList: friendList, infiniteQuery } = useFetchAllFriends();
  const { peopleFriends, friendsQuery } = useFetchPeopleFriends({ friendId });

  const userFriendList = friendId ? peopleFriends : friendList;

  const profile = profileQuery?.getUser?.[0] as User | undefined;
  const isBlockedUser = profile?.userid ? blockedUsers.includes(profile.userid) : false;

  // Filter blocked users from friends list
  const filteredFriendList = React.useMemo(() => {
    if (!userFriendList || !Array.isArray(userFriendList)) return [];
    return userFriendList.filter((friend) => !blockedUsers.includes(friend.friend_user_id));
  }, [userFriendList, blockedUsers]);

  const friendUrl =
    id === myInfo?.userid
      ? `/dashboard/friends/all`
      : `/profile/${id}/friends`;

  useEffect(() => {
    if (data && !loading) {
      if (!data.getUser || data.getUser.length === 0) {
        notFound();
      } else {
        setProfileQuery(data);
      }
    }
  }, [data, loading]);

  if (!id) {
    return notFound();
  }

  if (error) {
    return (
      <Container className="py-8 max-w-6xl">
        <Card>
          <CardContent className="py-16 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <Icon name="info" size={32} className="text-destructive" />
            </div>
            <p className="text-lg font-semibold mb-1">Something went wrong</p>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
              We couldn&apos;t load this profile. Please try again.
            </p>
            <Button onClick={() => refetch({ userId: id })} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (loading || !profileQuery?.getUser) {
    return <ProfileSkeleton />;
  }

  const isOwnProfile = id === myInfo?.userid;
  const isLoadingOtherFriends = !isOwnProfile && (friendsQuery?.isLoading || friendsQuery?.isFetching);
  const friendsCount = friendsCountData?.getUserFriendsCount ?? (isOwnProfile ? allFriendsCount : 0);

  const displayName = getName(
    profile?.username
      ? profile?.username
      : [profile?.first_name, profile?.last_name].join(' ')
  );

  const accountTypeLabel =
    profile?.type === AccountType.Coach
      ? t('type.coach')
      : profile?.type === AccountType.Trainer
        ? t('type.trainer')
        : t('type.golfer');

  return (
    <Container className="py-6 max-w-6xl space-y-5">
      {/* Profile Card */}
      <Card className="relative overflow-hidden">
        {/* Cover Photo */}
        <div
          className={cn(
            'w-full h-48 sm:h-56 md:h-64 overflow-hidden relative',
            profile?.photo_cover && 'cursor-pointer'
          )}
          onClick={() => {
            if (profile?.photo_cover) {
              setPreviewImage({ url: profile.photo_cover, alt: 'Cover photo' });
            }
          }}
        >
          {profile?.photo_cover ? (
            <>
              {!coverLoaded && <Skeleton className="absolute inset-0" />}
              <Image
                className={cn(
                  'object-cover transition-opacity duration-500',
                  coverLoaded ? 'opacity-100' : 'opacity-0'
                )}
                src={profile.photo_cover}
                alt=""
                fill
                sizes="(max-width: 1280px) 100vw, 1280px"
                onLoad={() => setCoverLoaded(true)}
                priority
              />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/5 to-muted" />
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Profile Content */}
        <CardContent className="relative px-4 sm:px-6 pb-6 pt-0">
          {/* Avatar */}
          <div className="relative -mt-16 sm:-mt-20 mb-4">
            <ProfilePicture
              profile={profile!}
              onImageClick={() => {
                if (profile?.photo_profile) {
                  setPreviewImage({
                    url: profile.photo_profile,
                    alt: displayName,
                  });
                }
              }}
            />
          </div>

          {/* Name + Badge */}
          <div className="flex flex-wrap items-center gap-2.5 mb-1">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              {displayName}
            </h2>
            {!isBlockedUser ? (
              <Badge variant="secondary" size="default">
                {accountTypeLabel}
              </Badge>
            ) : (
              <Badge variant="destructive" size="default">
                Blocked
              </Badge>
            )}
          </div>

          {/* Blocked notice */}
          {isBlockedUser && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-destructive/5 border border-destructive/15 rounded-lg px-3 py-2 mb-3">
              <Icon name="lock" size={14} className="text-destructive/60 shrink-0" />
              <span>You have blocked this user. Unblock to interact again.</span>
            </div>
          )}

          {/* Location */}
          {!isBlockedUser && isOwnProfile && (profile?.city || profile?.country) && (
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
              <Icon name="map-pin" size={14} className="text-muted-foreground shrink-0" />
              {[profile?.city, profile?.country]
                .filter((v) => typeof v === 'string')
                .join(', ')}
            </p>
          )}

          {/* Bio */}
          {!isBlockedUser && profile?.bio && (
            <p className="text-sm text-muted-foreground leading-relaxed mb-4 max-w-2xl">
              {profile.bio}
            </p>
          )}

          {/* Stats + Actions Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Stats */}
            {!isBlockedUser && (
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon name="users" size={14} className="text-primary" />
                  </div>
                  <div>
                    {friendsCountLoading ? (
                      <Skeleton className="h-4 w-16 inline-block" />
                    ) : (
                      <>
                        <span className="font-semibold text-foreground">{friendsCount}</span>
                        <span className="text-muted-foreground ml-1">
                          {friendsCount !== 1 ? t('friends.label') : t('friends.shortLabel')}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="w-px h-6 bg-border" />
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon name="flaged-goal" size={14} className="text-primary" />
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">{profile?.handicap || 'No'}</span>
                    <span className="text-muted-foreground ml-1">Handicap</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              {myInfo?.userid !== profile?.userid ? (
                isBlockedUser ? (
                  <Button variant="default" asChild>
                    <Link href="/dashboard/friends/blocked">
                      <Icon name="undo" className="mr-2" size={16} />
                      Unblock User
                    </Link>
                  </Button>
                ) : (
                  <FriendButton userId={profile?.userid ?? ''} friendProfile />
                )
              ) : (
                <UserProfileButton />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Friends Section */}
      {!isBlockedUser && (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-0">
              <Icon name="users" size={18} className="text-primary" />
              <h2 className="text-lg font-semibold">{t('friends.label')}</h2>
            </div>
            <Link
              href={friendUrl}
              prefetch={false}
              className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
            >
              {t('viewAll')}
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            {(() => {
              const isLoadingFriends = friendId
                ? friendsQuery?.isLoading || friendsQuery?.isFetching
                : infiniteQuery?.isLoading || infiniteQuery?.isFetching;
              const hasFriends = filteredFriendList && Array.isArray(filteredFriendList) && filteredFriendList.length > 0;
              // If server says there are friends but list hasn't loaded, treat as loading
              const isCountPending = friendsCountLoading || (friendsCount > 0 && !hasFriends && !isLoadingFriends);
              const shouldShowLoading = isLoadingFriends || isCountPending;

              if (hasFriends || shouldShowLoading) {
                return (
                  <UserFriendList
                    myUserId={myInfo?.userid}
                    peopleFriends={filteredFriendList}
                    loading={!!shouldShowLoading && !hasFriends}
                  />
                );
              }

              return (
                <div className="py-10 text-center">
                  <div className="mx-auto h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                    <Icon name="users" size={24} className="text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">No friends found</p>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Feed + Sidebar */}
      {!isBlockedUser && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="hidden md:flex flex-row md:flex-col lg:hidden gap-4">
            <PeopleYouMayKnow limitTo={6} className="" />
          </div>

          <div className="col-span-1 lg:col-span-3">
            <ProfileFeed setPosts={setPostCount} userId={id} />
          </div>

          <div className="hidden lg:block space-y-4 col-span-2">
            <PeopleYouMayKnow limitTo={6} className="sticky top-20" />
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <ImagePreviewModal
          open={!!previewImage}
          onOpenChange={(open) => {
            if (!open) setPreviewImage(null);
          }}
          imageUrl={previewImage.url}
          alt={previewImage.alt}
        />
      )}
    </Container>
  );
};

export default ProfilePage;

// --- Sub-components ---

const UserProfileButton = () => {
  const t = useTranslations('profilePage');

  return (
    <Link
      href={process.env.NEXT_PUBLIC_AUTH_DOMAIN + '/en/settings/profile'}
      className="w-max"
    >
      <Button className="w-max" variant="outline">
        <Icon className="mr-2" name="write" size={16} />
        {t('editProfile')}
      </Button>
    </Link>
  );
};

const ProfilePicture = ({
  profile,
  onImageClick,
}: {
  profile: User;
  onImageClick?: () => void;
}) => {
  const isActive = profile.status === 'ACTIVE';
  return (
    <div className="relative w-fit">
      <Avatar
        className={cn(
          'h-28 w-28 sm:h-32 sm:w-32 ring-4 ring-background shadow-lg',
          profile.photo_profile &&
          onImageClick &&
          'cursor-pointer hover:opacity-90 transition-opacity'
        )}
        onClick={onImageClick}
      >
        <AvatarImage
          src={profile.photo_profile}
          alt={getName(
            profile.username
              ? profile.username
              : [profile.first_name, profile.last_name].join(' ')
          )}
        />
        <AvatarFallback className="text-4xl sm:text-5xl">
          {getInitials(
            profile.username
              ? profile.username
              : [profile.first_name, profile.last_name].join(' ')
          )}
        </AvatarFallback>
      </Avatar>
    </div>
  );
};

const UserFriendList = ({
  peopleFriends,
  myUserId,
  limit = 6,
  loading,
}: {
  peopleFriends: UserFriend[];
  limit?: number;
  loading: boolean;
  myUserId: string | undefined;
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(false);
  const prevValuesRef = useRef({ showLeft: false, showRight: false });

  const checkScroll = React.useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      const newShowLeft = scrollLeft > 0;
      const newShowRight = scrollLeft < scrollWidth - clientWidth - 1;

      if (prevValuesRef.current.showLeft !== newShowLeft) {
        prevValuesRef.current.showLeft = newShowLeft;
        setShowLeftButton(newShowLeft);
      }
      if (prevValuesRef.current.showRight !== newShowRight) {
        prevValuesRef.current.showRight = newShowRight;
        setShowRightButton(newShowRight);
      }
    }
  }, []);

  const scrollTo = React.useCallback((direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      const currentScroll = scrollContainerRef.current.scrollLeft;
      const newScroll =
        direction === 'left'
          ? currentScroll - scrollAmount
          : currentScroll + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth',
      });
    }
  }, []);

  const peopleFriendsLength = React.useMemo(() => peopleFriends?.length ?? 0, [peopleFriends?.length]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll]);

  useEffect(() => {
    if (!loading && peopleFriendsLength > 0) {
      const rafId = requestAnimationFrame(() => {
        checkScroll();
      });
      return () => cancelAnimationFrame(rafId);
    }
  }, [loading, peopleFriendsLength, checkScroll]);

  return (
    <div className="relative">
      {showLeftButton && (
        <button
          onClick={() => scrollTo('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-md border border-border text-foreground shadow-lg rounded-full p-2 z-10 hover:bg-background transition"
          aria-label="Scroll left"
        >
          <Icon name="chevron-left" size={20} />
        </button>
      )}

      <div
        ref={scrollContainerRef}
        className="flex gap-3 overflow-x-auto flex-nowrap pb-2 scrollbar-hidden"
      >
        {!peopleFriends || !Array.isArray(peopleFriends) || loading
          ? Array.from({ length: 8 }).map((_, i) => (
            <FriendCardSkeleton key={i} />
          ))
          : (peopleFriends.slice(0, limit) || []).map((user) => {
            const isMe = myUserId === user.friend_user_id;
            return (
              <FriendCard
                key={user?.userInfo?.userid}
                user={user}
                isMe={isMe}
              />
            );
          })}
      </div>

      {showRightButton && (
        <button
          onClick={() => scrollTo('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-md border border-border text-foreground shadow-lg rounded-full p-2 z-10 hover:bg-background transition"
          aria-label="Scroll right"
        >
          <Icon name="chevron-right" size={20} />
        </button>
      )}
    </div>
  );
};

const FriendCard = ({
  user,
  isMe,
}: {
  user: UserFriend;
  isMe: boolean;
}) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  return (
    <Card className="w-44 overflow-hidden shrink-0 p-0">
      <Link
        href={`/profile/${user?.userInfo?.userid}`}
        className="block h-36 overflow-hidden relative bg-muted"
      >
        {user?.userInfo.photo_profile ? (
          <>
            {!imgLoaded && <Skeleton className="absolute inset-0" />}
            <Image
              loading="lazy"
              src={user.userInfo.photo_profile}
              className={cn(
                'object-cover transition-opacity duration-300',
                imgLoaded ? 'opacity-100' : 'opacity-0'
              )}
              alt={getName(user.userInfo.first_name, user.userInfo.last_name)}
              fill
              sizes="176px"
              onLoad={() => setImgLoaded(true)}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <span className="text-3xl font-semibold text-muted-foreground">
              {getInitials(user.userInfo.first_name, user.userInfo.last_name)}
            </span>
          </div>
        )}
      </Link>
      <div className="p-2.5 space-y-2.5">
        <Link
          href={`/profile/${user?.userInfo?.userid}`}
          className="block text-sm font-medium line-clamp-1 hover:text-primary transition-colors"
          title={`${user.userInfo.first_name} ${user.userInfo.last_name}`}
        >
          {user.userInfo.first_name} {user.userInfo.last_name}
        </Link>
        {!isMe && <FriendButton userId={user.friend_user_id ?? ''} />}
      </div>
    </Card>
  );
};

const FriendCardSkeleton = () => (
  <Card className="w-44 overflow-hidden shrink-0 p-0 mt-4 border-border">
    <Skeleton className="w-full h-36" />
    <div className="p-2.5 space-y-2.5">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-8 w-full" />
    </div>
  </Card>
);

const ProfileSkeleton = () => (
  <Container className="py-6 max-w-6xl space-y-5">
    <Card className="overflow-hidden">
      <Skeleton className="w-full h-48 sm:h-56 md:h-64" />
      <CardContent className="relative px-4 sm:px-6 pb-6 pt-0">
        <div className="relative -mt-16 sm:-mt-20 mb-4 flex items-end justify-between">
          <Skeleton className="h-28 w-28 sm:h-32 sm:w-32 rounded-full ring-4 ring-background" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
        <div className="flex items-center gap-2.5 mb-3">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-5 w-16 rounded-md" />
        </div>
        <Skeleton className="h-4 w-36 mb-3" />
        <Skeleton className="h-4 w-full max-w-lg mb-2" />
        <Skeleton className="h-4 w-3/4 max-w-md mb-4" />
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="w-px h-6 bg-border" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-16" />
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <FriendCardSkeleton key={i} />
          ))}
        </div>
      </CardContent>
    </Card>
  </Container>
);
