import React from 'react';
import { Button, Icon, Avatar, AvatarImage } from '@/components/ui';
import { AvatarFallback } from '@radix-ui/react-avatar';
import { getInitials, getName } from '@/lib/utils';
import type { IStory, ISubStory } from './_interface';

interface StorySidebarProps {
  stories: IStory[];
  selection: IStory;
  setSelection: (story: IStory | undefined) => void;
  currentIndex: number;
  setCurrentIndex: (i: number) => void;
  setPaused: (v: boolean) => void;
  t: (key: string) => string;
  onPerform: (action: number, created: string, story?: ISubStory) => void;
  userId: string;
}

export const StorySidebar: React.FC<StorySidebarProps> = ({
  stories,
  selection,
  setSelection,
  currentIndex,
  setCurrentIndex,
  setPaused,
  t,
  onPerform,
  userId,
}) => {
  return (
    <div className="bg-background w-1/4 h-full lg:flex hidden flex-col p-4">
      <h4 className="text-lg">Your Story</h4>
      <div
        className="flex items-center gap-x-3 my-5 cursor-pointer"
        onClick={() => onPerform(1, '')}
      >
        <Button className="rounded-full bg-primary w-14 h-14" size="icon">
          <Icon name="plus" color="white" size={22} />
        </Button>
        <div>
          <h4 className="font-semibold text-sm">{t('createStory')}</h4>
          <span className="text-xs opacity-75">
            Share a photo or write something
          </span>
        </div>
      </div>

      <h4 className="text-lg mb-5">All Stories</h4>
      <div className="overflow-y-auto flex-1 pr-2">
        {stories.map((str: IStory, ind: number) => (
          <div
            key={ind}
            onClick={() => {
              // Sort stories by created timestamp (oldest first, newest last)
              const sortedStory = {
                ...str,
                stories: [...str.stories].sort((a, b) => {
                  const timeA = new Date(a.created).getTime();
                  const timeB = new Date(b.created).getTime();
                  return timeA - timeB;
                }),
              };
              setSelection(sortedStory);
              setCurrentIndex(0);
              setPaused(false);
            }}
            className={`flex gap-x-3 items-center p-2 mb-3 cursor-pointer rounded-md ${
              selection?.stories[0]?.created === str?.stories[0]?.created
                ? 'bg-white/30'
                : 'hover:bg-white/10'
            }`}
          >
            <Avatar
              className={`size-12 ring-2 ${
                selection?.stories[currentIndex]?.views?.includes(
                  userId as string
                )
                  ? 'ring-gray-600'
                  : 'ring-primary'
              } ring-offset-2 overflow-hidden`}
            >
              <AvatarImage 
                src={str?.userInfo?.photo_profile || ''} 
                alt="" 
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <AvatarFallback className="!h-full !w-full bg-primary/20 text-primary text-sm font-semibold flex items-center justify-center rounded-full absolute inset-0">
                {getInitials(
                  str?.userInfo?.first_name || '',
                  str?.userInfo?.last_name || ''
                )}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium text-base line-clamp-1">
                {getName(str?.userInfo?.first_name, str?.userInfo?.last_name)}
              </h4>
              <span className="text-sm text-primary">
                {str?.stories?.length} stories
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
