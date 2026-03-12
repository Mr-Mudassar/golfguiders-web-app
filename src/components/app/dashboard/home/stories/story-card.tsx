'use client';

/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { cn, getInitials, getName } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui';
import type { IStory } from './_interface';
import { useAppSelector } from '@/lib/hooks';
import Image from 'next/image';

/** Fallback image when user has no profile picture (card front and avatar). */
const FALLBACK_AVATAR = '/images/placeholder.svg';

interface StoryCardProps {
  className?: string;
  item: IStory;
  onClick: () => void;
}

const StoryCard: React.FC<StoryCardProps> = ({ className, item, onClick }) => {
  const me = useAppSelector((s) => s.auth?.user);
  const [profileImageError, setProfileImageError] = React.useState(false);
  const viewed = item.stories?.every((story) =>
    story.views?.includes(me?.userid ?? '')
  );
  const profilePic = item?.userInfo?.photo_profile?.trim() || null;
  const showProfilePic = !!profilePic && !profileImageError;
  const initials = getInitials(
    item?.userInfo?.first_name || '',
    item?.userInfo?.last_name || ''
  );

  return (
    <div
      className={cn(
        'group relative w-full h-full rounded-2xl bg-muted overflow-hidden cursor-pointer shadow-lg transition-all hover:scale-[1.02] hover:shadow-primary/20',
        className
      )}
      onClick={onClick}
    >
      <div className="absolute inset-0 z-10 bg-black/20 group-hover:bg-black/10 transition-colors" />

      {/* Front view: user profile picture, or fallback image + initials */}
      {showProfilePic ? (
        <Image
          src={profilePic!}
          alt={getName(item?.userInfo?.first_name, item?.userInfo?.last_name)}
          fill
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
          sizes="200px"
          onError={() => setProfileImageError(true)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-muted transition-transform duration-500 group-hover:scale-110">
          <Image
            src={FALLBACK_AVATAR}
            alt=""
            fill
            className="object-cover w-full h-full"
            sizes="200px"
          />
          <span className="absolute inset-0 flex items-center justify-center text-4xl font-semibold text-muted-foreground select-none">
            {initials}
          </span>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 z-20 p-4 flex flex-col items-center gap-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-12">
        <div
          className={cn(
            'flex items-center justify-center w-10 h-10 rounded-full shadow-lg ring-4 ring-background transition-transform group-hover:scale-110 overflow-hidden',
            viewed ? 'ring-muted-foreground/30' : 'ring-primary/30'
          )}
        >
          <Avatar className="h-full w-full overflow-hidden">
            {profilePic ? (
              <AvatarImage
                src={profilePic}
                alt=""
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : null}
            <AvatarFallback className="!h-full !w-full bg-primary/80 text-primary-foreground text-sm font-semibold flex items-center justify-center rounded-full">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
        <h4 className="font-bold text-sm text-white drop-shadow-md line-clamp-1 text-center">
          {getName(item?.userInfo?.first_name, item?.userInfo?.last_name)}
        </h4>
      </div>
    </div>
  );
};


export { StoryCard };
