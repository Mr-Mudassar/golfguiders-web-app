'use client';

import type { GetUserDetailsType } from '@/app/[locale]/(app)/profile/[id]/_interface';
import { GET_USER } from '@/app/[locale]/(app)/profile/[id]/_query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useQuery } from '@apollo/client/react';
import { Avatar, AvatarFallback, AvatarImage, Icon } from '@/components/ui';
import { getInitials, getName } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { Skeleton } from '@/components/ui';
import { useMemo } from 'react';

// emojis

import ehh from '../../../../../public/images/emojis/ehh.gif';
import lovely from '../../../../../public/images/emojis/lovely.gif';
import laugh from '../../../../../public/images/emojis/laugh.gif';
import heart from '../../../../../public/images/emojis/heart.gif';
import party from '../../../../../public/images/emojis/party.gif';

type OpenState = {
  title: string;
  data: string[]; // array of user IDs to show (views/users/likes list)
};

type StoryLike = {
  user_id: string;
  reaction: string; // e.g. '❤️', '😂', '🔥'
};

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<OpenState>>;
  data: OpenState;
  isBuddyPost?: boolean;
  likes?: StoryLike[];
  noOverlay?: boolean;
}

export function PostDialog({
  open = false,
  setOpen,
  data,
  isBuddyPost = false,
  likes = [],
  noOverlay = false,
}: Props) {
  // Build fast lookup for reactions by userId
  const likesMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const l of likes || []) {
      if (l?.user_id) map[l.user_id] = l.reaction;
    }
    return map;
  }, [likes]);

  const viewerCount = data?.data?.length ?? 0;
  const reactedCount = likes?.length ?? 0;

  return (
    open && (
      <Dialog open={open} onOpenChange={() => setOpen({ title: '', data: [] })} modal={!noOverlay}>
        <DialogContent
          className="max-w-md max-h-[85vh] z-10000 p-0 gap-0 overflow-hidden"
          style={{ zIndex: 10000 }}
          overlayClassName={noOverlay ? 'z-[10000] bg-transparent backdrop-blur-none' : 'z-[10000]'}
        >
          <DialogHeader className="px-5 pt-5 pb-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon name="eye" size={16} className="text-primary" />
              </div>
              <div>
                <DialogTitle className="text-base">{data?.title}</DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {viewerCount} {viewerCount === 1 ? 'viewer' : 'viewers'}
                  {reactedCount > 0 && <> &middot; {reactedCount} {reactedCount === 1 ? 'reaction' : 'reactions'}</>}
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="border-t max-h-[60vh] overflow-y-auto">
            <div className="divide-y divide-border/50">
              {data?.data?.map((id) => (
                <Listings
                  key={id}
                  id={id}
                  isBuddyPost={isBuddyPost}
                  currentReaction={likesMap[id]}
                />
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  );
}

const Listings = ({
  id,
  isBuddyPost,
  currentReaction,
}: {
  id: string;
  isBuddyPost: boolean;
  currentReaction?: string; // optional emoji to display if not buddy flow
}) => {
  const { data, loading } = useQuery<GetUserDetailsType>(GET_USER, {
    variables: { userId: id },
  });
  const user = data?.getUser?.[0];

  if (loading || !user)
    return (
      <div className="flex items-center gap-3 px-5 py-3">
        <Skeleton className="h-10 w-10 rounded-full shrink-0" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-2.5 w-20" />
        </div>
      </div>
    );

  const onAccept = () => {
    console.log('accepted', user.first_name);
  };

  const onReject = () => {
    console.log('rejected', user.first_name);
  };

  const emojis = [
    { r: '❤️', u: heart },
    { r: '😍', u: lovely },
    { r: '😂', u: laugh },
    { r: '🥳', u: party },
    { r: '😣', u: ehh },
  ];

  const d = emojis.find((e) => e.r === currentReaction);

  return (
    <div className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-muted/50">
      <Link href={`/profile/${id}`} className="flex items-center gap-3 min-w-0 flex-1">
        <div className="relative shrink-0">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.photo_profile} />
            <AvatarFallback className="text-xs font-medium">
              {getInitials(user?.first_name, user?.last_name)}
            </AvatarFallback>
          </Avatar>
          {currentReaction && d && (
            <span className="absolute -bottom-1 -right-1 flex items-center justify-center h-5 w-5 rounded-full bg-background shadow-sm ring-1 ring-border/50">
              <Image src={d.u.src} className="size-3.5" alt={d.r} width={14} height={14} />
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">
            {getName(user?.first_name, user?.last_name)}
          </p>
          {currentReaction ? (
            <p className="text-xs text-muted-foreground">Reacted to your story</p>
          ) : (
            <p className="text-xs text-muted-foreground">Viewed your story</p>
          )}
        </div>
      </Link>

      {isBuddyPost ? (
        <div className="flex gap-2 shrink-0">
          <button
            onClick={onAccept}
            className="text-xs px-3 py-1.5 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            Accept
          </button>
          <button
            onClick={onReject}
            className="text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground font-medium hover:bg-destructive hover:text-white transition-colors"
          >
            Reject
          </button>
        </div>
      ) : currentReaction && d ? (
        <div className="shrink-0 h-8 w-8 rounded-full bg-muted/80 flex items-center justify-center">
          <Image src={d.u.src} className="size-5 animate-[dance_2.6s_ease-in-out_infinite]" alt={d.r} width={20} height={20} />
        </div>
      ) : null}
    </div>
  );
};
