'use client';

import React from 'react';

import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  Button,
  Icon,
  Card,
  CardContent,
  Separator,
} from '@/components/ui';
import { useAppSelector } from '@/lib';
import { getInitials, getName } from '@/lib/utils';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { PostType } from '@/lib/constants';
import dynamic from 'next/dynamic';

const CreatePostDialog = dynamic(
  () => import('@/components/app').then((mod) => mod.CreatePostDialog),
  { ssr: false }
);

const prefetchDialog = () => import('@/components/app');

const CreatePost = () => {
  const user = useAppSelector((state) => state.auth.user);
  const [open, setOpen] = React.useState<boolean>(false);

  const t = useTranslations('homePage.createPost');

  return (
    <div>
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <div
            onClick={() => setOpen(true)}
            onMouseEnter={prefetchDialog}
            className="flex items-center gap-3 cursor-pointer"
          >
            <Link
              href={`/profile/${user?.userid}`}
              prefetch
              className="shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <Avatar className="h-9 w-9 ring-2 ring-primary/10 transition-transform hover:scale-105">
                <AvatarImage
                  src={user?.photo_profile}
                  alt={getName(user?.first_name, user?.last_name)}
                />
                <AvatarFallback className='bg-primary/10 text-primary'>
                  {getInitials(user?.first_name, user?.last_name)}
                </AvatarFallback>
              </Avatar>
            </Link>

            <div className="flex-1 h-10 px-4 flex items-center rounded-full bg-muted/50 border border-border/50 text-muted-foreground text-sm hover:bg-muted transition-colors">
              {t('inputFelid')}
            </div>
          </div>

          <Separator className="my-3" />

          <div className="flex items-center justify-around">
            <Button
              variant="ghost"
              className="flex-1 gap-2 h-9 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
              onClick={() => setOpen(true)}
              onMouseEnter={prefetchDialog}
            >
              <Icon name="image" size={18} className="text-emerald-500" />
              <span className="text-sm font-medium">
                {t('photoVideo', { defaultMessage: 'Photo/Video' })}
              </span>
            </Button>

            <Button
              variant="ghost"
              className="flex-1 gap-2 h-9 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
              onClick={() => setOpen(true)}
              onMouseEnter={prefetchDialog}
            >
              <Icon name="smile" size={18} className="text-amber-500" />
              <span className="text-sm font-medium">
                {t('feeling', { defaultMessage: 'Feeling' })}
              </span>
            </Button>

            <Button
              variant="ghost"
              className="flex-1 gap-2 h-9 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
              onClick={() => setOpen(true)}
              onMouseEnter={prefetchDialog}
            >
              <Icon name="location" size={18} className="text-rose-500" />
              <span className="text-sm font-medium">
                {t('location', { defaultMessage: 'Location' })}
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <CreatePostDialog
        postType={PostType.Friends}
        open={open}
        onOpenChange={setOpen}
      />
    </div>
  );
};

export { CreatePost };
