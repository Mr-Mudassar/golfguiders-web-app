/* eslint-disable @next/next/no-img-element */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { IStory, ISubStory } from './_interface';

import {
  Button,
  Icon,
  Avatar,
  AvatarImage,
} from '@/components/ui';

import { useMutation } from '@apollo/client/react';
import {
  DeleteStory,
  LikeStory,
  ViewStory as ViewStoryMutation,
} from './_query';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { AvatarFallback } from '@radix-ui/react-avatar';
import { getInitials, getName, isFormattedDateViaString } from '@/lib/utils';
import { useAppSelector } from '@/lib';
import { StoryBottomBar } from './bottom-bar';
import type { UserInfo } from '@/lib/definitions';
import { StorySidebar } from './sidebar';
import { Link } from '@/i18n/routing';
import dynamic from 'next/dynamic';

const ConfirmationModal = dynamic(() =>
  import('@/components/common/confirmationDialog').then((mod) => mod.ConfirmationModal)
);

interface ViewStoryProps {
  stories: IStory[];
  selection: IStory | undefined;
  onPerform: (action: number, created: string, story?: ISubStory) => void;
  setSelection: (arg: IStory | undefined) => void;
  shouldPause?: boolean;
  navigateToStoryCreated?: string; // Optional: navigate to a specific story by created timestamp
}

const DURATION_MS = 5000;

const ViewStory: React.FC<ViewStoryProps> = ({
  selection,
  setSelection,
  stories,
  onPerform,
  shouldPause = false,
  navigateToStoryCreated,
}) => {
  const t = useTranslations('homePage');
  const user = useAppSelector((s) => s.auth?.user);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleteStory, setIsDeleteStory] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [deleteStory, deleteStoryState] = useMutation(DeleteStory);
  const [viewStory] = useMutation(ViewStoryMutation);
  const [likeStory] = useMutation(LikeStory);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // progress
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [durationMs, setDurationMs] = useState(DURATION_MS); // default 5s
  const [isLoading, setIsLoading] = useState(false);
  const progressRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedTimeRef = useRef<number>(0); // Track elapsed time when paused
  const holdStartTimeRef = useRef<number>(0); // Track when hold started
  const pausedBeforeModalRef = useRef<boolean | null>(null); // Track pause state before modal pause

  // ---- helpers ----
  const goToUser = (direction: 'prev' | 'next') => {
    if (!selection) return;
    const curUserIdx = stories.findIndex(
      (s) => s?.userInfo?.userid === selection?.userInfo?.userid
    );
    const newUser =
      stories[direction === 'next' ? curUserIdx + 1 : curUserIdx - 1];
    if (newUser) {
      // Sort stories by created timestamp (oldest first, newest last)
      const sortedUser = {
        ...newUser,
        stories: [...newUser.stories].sort((a, b) => {
          const timeA = new Date(a.created).getTime();
          const timeB = new Date(b.created).getTime();
          return timeA - timeB;
        }),
      };
      setSelection(sortedUser);
      setCurrentIndex(0);
    } else {
      setSelection(undefined);
      setCurrentIndex(0);
    }
  };

  // ---- mark as viewed ----
  const onViewStory = useCallback(async () => {
    if (!selection) return;
    const story = selection.stories[currentIndex];
    if (!story) return;

    const views = Array.isArray(story.views) ? story.views : [];
    if (
      user?.userid !== story.user_id && // skip owner
      !views.includes(user?.userid as string)
    ) {
      await viewStory({
        variables: { story_user_id: story?.user_id, created: story?.created },
      });
      onPerform(3, story?.created, {
        ...story,
        views: [...views, user?.userid as string],
      });
    }
  }, [selection, currentIndex, user?.userid, onPerform, viewStory]);

  // ---- effects ----

  // track view
  useEffect(() => {
    onViewStory();
  }, [onViewStory]);

  // pause / play video
  useEffect(() => {
    if (!videoRef.current) return;
    if (paused) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
  }, [paused, currentIndex, selection]);

  // pause when shouldPause is true (e.g., when create story modal is open)
  useEffect(() => {
    if (shouldPause) {
      // Store the current pause state before forcing pause
      if (pausedBeforeModalRef.current === null) {
        pausedBeforeModalRef.current = paused;
      }
      setPaused(true);
    } else {
      // Restore the previous pause state when modal closes
      if (pausedBeforeModalRef.current !== null) {
        setPaused(pausedBeforeModalRef.current);
        pausedBeforeModalRef.current = null;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldPause]);

  // Sort stories by created timestamp (oldest first, newest last - like WhatsApp)
  const sortedStories = React.useMemo(() => {
    if (!selection?.stories) return [];
    return [...selection.stories].sort((a, b) => {
      const timeA = new Date(a.created).getTime();
      const timeB = new Date(b.created).getTime();
      return timeA - timeB; // Ascending order: oldest first
    });
  }, [selection?.stories]);

  // Find the current index in sorted array based on the active story
  const sortedCurrentIndex = React.useMemo(() => {
    if (!selection?.stories || currentIndex < 0 || currentIndex >= selection.stories.length) return 0;
    const currentStory = selection.stories[currentIndex];
    const foundIndex = sortedStories.findIndex((s) => s.created === currentStory.created);
    return foundIndex >= 0 ? foundIndex : 0;
  }, [currentIndex, selection?.stories, sortedStories]);

  // Use sorted stories for display
  const displayStories = sortedStories;
  const displayCurrentIndex = sortedCurrentIndex;
  
  // update duration (5s for image, real length for video without 30s cap)
  const active = displayStories[displayCurrentIndex];
  const isVideo = active?.mime_type?.includes('video/');
  useEffect(() => {
    if (isVideo && videoRef.current) {
      const handleLoadedMetadata = () => {
        const videoDuration = videoRef.current?.duration || 5;
        setDurationMs(videoDuration * 1000);
      };

      const el = videoRef.current;
      el.addEventListener('loadedmetadata', handleLoadedMetadata);

      return () => {
        el.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    } else {
      setDurationMs(5000); // image
    }
  }, [isVideo, currentIndex]);

  useEffect(() => {
    setIsLoading(true);
    setProgress(0);
    progressRef.current = 0;
    elapsedTimeRef.current = 0; // Reset elapsed time when story changes
  }, [currentIndex, selection]);

  // Navigate to a specific story when navigateToStoryCreated is provided
  useEffect(() => {
    if (navigateToStoryCreated && selection?.stories) {
      const storyIndex = selection.stories.findIndex((s) => s.created === navigateToStoryCreated);
      if (storyIndex >= 0) {
        setCurrentIndex(storyIndex);
        setPaused(false);
      }
    }
  }, [navigateToStoryCreated, selection?.stories]);

  // progress loop
  useEffect(() => {
    if (!selection || isLoading) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    if (paused) {
      // When paused, store the current elapsed time
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      return;
    }

    // Calculate start time accounting for already elapsed time
    const elapsedMs = (elapsedTimeRef.current / 100) * durationMs;
    const startAt = Date.now() - elapsedMs;

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startAt;
      const pct = Math.min((elapsed / durationMs) * 100, 100);
      progressRef.current = pct;
      elapsedTimeRef.current = pct; // Store current progress
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(timerRef.current!);
        elapsedTimeRef.current = 0; // Reset for next story
        if (displayCurrentIndex < displayStories.length - 1) {
          // Move to next story in sorted order
          const nextStory = displayStories[displayCurrentIndex + 1];
          const originalIndex = selection.stories.findIndex((s) => s.created === nextStory.created);
          if (originalIndex >= 0) {
            setCurrentIndex(originalIndex);
          } else {
            setCurrentIndex(displayCurrentIndex + 1);
          }
        } else {
          goToUser('next');
        }
      }
    }, 50);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection, currentIndex, paused, durationMs, isLoading, displayCurrentIndex, displayStories]);

  // lock / unlock body scroll
  useEffect(() => {
    if (selection) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [selection]);

  // ---- actions ----
  const onDelete = async () => {
    try {
      await deleteStory({ variables: { created: isDeleteStory } });
      toast.success('Story deleted successfully');
      onPerform(2, isDeleteStory);

      if (selection) {
        const remaining = selection.stories.filter(
          (s) => s.created !== isDeleteStory
        );

        if (remaining.length > 0) {
          const newIndex = currentIndex > 0 ? currentIndex - 1 : 0;
          selection.stories = remaining as ISubStory[];
          setCurrentIndex(newIndex);
        } else {
          setSelection(undefined);
          setCurrentIndex(0);
        }
      }

      setIsDeleteStory('');
    } catch {
      toast.error('Failed to delete story');
    }
  };

  const onLikeStory = async (emoji: string) => {
    if (!selection) return;
    const story = selection.stories[currentIndex];
    if (!story) return;

    await likeStory({
      variables: {
        story_user_id: story.user_id,
        created: story.created,
        reaction: emoji,
      },
    });
  };

  if (!active || !selection || !mounted) return null;

  return createPortal(
    <div style={{ zIndex: 9999 }} className="fixed inset-0 bg-black/90 flex">
      <Button
        onClick={() => {
          setSelection(undefined);
          setCurrentIndex(0);
        }}
        style={{ zIndex: 10000 }}
        className="absolute cursor-pointer right-4 top-4 rounded-full bg-primary size-10"
        size="icon"
      >
        <Icon name="close" size={22} />
      </Button>
      {/* Sidebar */}

      <StorySidebar
        currentIndex={currentIndex}
        onPerform={onPerform}
        selection={selection}
        setCurrentIndex={setCurrentIndex}
        setPaused={setPaused}
        setSelection={setSelection}
        stories={stories}
        t={t}
        userId={user?.userid as string}
      />

      {/* Main Content */}
      <div className="flex-1 flex items-center bg-foreground/20 justify-center relative">
        {/* user nav arrows */}
        <div className="absolute inset-y-0 left-20 flex items-center z-50">
          <Button
            size="icon"
            className="rounded-full w-10 h-10 bg-white/20 hover:bg-white/30"
            onClick={() => goToUser('prev')}
          >
            <Icon name="chevron-left" color="#fff" size={22} />
          </Button>
        </div>
        <div className="absolute inset-y-0 right-20 flex items-center z-50">
          <Button
            size="icon"
            className="rounded-full w-10 h-10 bg-white/20 hover:bg-white/30"
            onClick={() => goToUser('next')}
          >
            <Icon name="chevron-right" color="#fff" size={22} />
          </Button>
        </div>

        {/* content box */}
        <div className="relative w-1/3 h-full bg-black rounded-2xl overflow-hidden border border-white/10">
          {/* progress bars */}
          <div className="absolute top-3 left-3 right-3 z-40 flex gap-1">
            {displayStories.map((_, i) => (
              <div key={i} className="flex-1 bg-white/30 h-1 rounded">
                <div
                  className="h-1 bg-white rounded transition-all duration-100 ease-linear"
                  style={{
                    width:
                      i < displayCurrentIndex
                        ? '100%'
                        : i === displayCurrentIndex
                          ? `${progress}%`
                          : '0%',
                  }}
                />
              </div>
            ))}
          </div>

          {/* header */}
          <div className="absolute top-10 left-3 right-3 z-40 flex items-center gap-3">
            <Link
              href={`/profile/${selection?.userInfo?.userid}`}
              onClick={(e) => {
                // Stop event propagation to prevent story navigation
                e.stopPropagation();
              }}
              className="cursor-pointer"
            >
              <Avatar className="size-12 hover:opacity-80 transition-opacity overflow-hidden">
                <AvatarImage 
                  src={selection?.userInfo?.photo_profile || ''} 
                  alt="" 
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <AvatarFallback className="!h-full !w-full bg-primary/20 text-primary text-sm font-semibold flex items-center justify-center rounded-full absolute inset-0">
                  {getInitials(
                    selection?.userInfo?.first_name || '',
                    selection?.userInfo?.last_name || ''
                  )}
                </AvatarFallback>
              </Avatar>
            </Link>
            <Link
              href={`/profile/${selection?.userInfo?.userid}`}
              onClick={(e) => {
                // Stop event propagation to prevent story navigation
                e.stopPropagation();
              }}
              className="flex-1 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center gap-2">
                <span className="text-white text-sm font-medium truncate">
                  {getName(
                    selection?.userInfo?.first_name,
                    selection?.userInfo?.last_name
                  )}
                </span>
              </div>
              <span className="text-white/70 text-xs truncate">
                {isFormattedDateViaString(active?.created)?.replace(
                  'about',
                  ''
                )}
              </span>
            </Link>

            {/* delete button */}
            {user?.userid === active?.user_id && (
              <button
                onClick={() => {
                  setIsDeleteStory(active?.created);
                  setPaused(true);
                }}
                className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
                title="Delete story"
              >
                <Icon name="delete" color="#fff" size={20} />
              </button>
            )}
          </div>

          {/* tap areas - invisible but still clickable for left/right navigation */}
          <button
            className="absolute inset-y-0 -left-20 w-1/3 z-30 flex items-center justify-center opacity-0"
            onClick={() => {
              if (displayCurrentIndex > 0) {
                const prevStory = displayStories[displayCurrentIndex - 1];
                const originalIndex = selection?.stories.findIndex((s) => s.created === prevStory.created);
                if (originalIndex >= 0) {
                  setCurrentIndex(originalIndex);
                } else {
                  setCurrentIndex(displayCurrentIndex - 1);
                }
              }
            }}
            aria-label="Prev"
            disabled={displayCurrentIndex === 0}
          >
          </button>
          <button
            className="absolute inset-y-0 -right-20 w-1/3 z-30 flex items-center justify-center opacity-0"
            onClick={() => {
              if (displayCurrentIndex < displayStories.length - 1) {
                const nextStory = displayStories[displayCurrentIndex + 1];
                const originalIndex = selection?.stories.findIndex((s) => s.created === nextStory.created);
                if (originalIndex >= 0) {
                  setCurrentIndex(originalIndex);
                } else {
                  setCurrentIndex(displayCurrentIndex + 1);
                }
              }
            }}
            aria-label="Next"
            disabled={displayCurrentIndex >= displayStories.length - 1}
          >
          </button>

          {/* main media */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            onMouseDown={() => {
              holdStartTimeRef.current = Date.now();
              setPaused(true);
            }}
            onMouseUp={() => {
              const holdDuration = Date.now() - holdStartTimeRef.current;
              // If held for more than 200ms, it's a hold - resume on release
              // Otherwise, it's a click - let onClick handle the toggle
              if (holdDuration > 200) {
                setPaused(false);
              }
            }}
            onTouchStart={() => {
              holdStartTimeRef.current = Date.now();
              setPaused(true);
            }}
            onTouchEnd={(e) => {
              const holdDuration = Date.now() - holdStartTimeRef.current;
              // If held for more than 200ms, it's a hold - resume on release
              // Otherwise, it's a tap - let onClick handle the toggle
              if (holdDuration > 200) {
                setPaused(false);
                // Prevent click event from firing
                e.preventDefault();
              }
            }}
            onClick={(e) => {
              const holdDuration = Date.now() - holdStartTimeRef.current;
              // Only toggle if it was a quick tap (not a hold)
              if (holdDuration <= 200) {
                setPaused(!paused);
              }
            }}
          >
            {isVideo ? (
              <video
                key={active?.created}
                ref={videoRef}
                className="w-full object-cover"
                playsInline
                onCanPlayThrough={() => setIsLoading(false)}
              >
                <source src={active?.story_url} type={active?.mime_type} />
              </video>
            ) : (
              <img
                key={active?.created}
                alt={active?.created}
                src={active?.story_url}
                className="w-full object-cover"
                onLoad={() => setIsLoading(false)}
              />
            )}

            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent" />
              </div>
            )}
          </div>

          {/* Bottom Bar */}
          <StoryBottomBar
            onLikeStory={onLikeStory}
            currentStoryViews={active.views || []}
            likes={JSON.parse(active?.likes) || []}
            setPause={setPaused}
            me={active.user_id === user?.userid}
            storyUserId={active?.user_id}
            userInfo={
              {
                first_name: user?.first_name,
                last_name: user?.last_name,
                photo_profile: user?.photo_profile,
                fcm_token: user?.fcm_token,
                type: user?.type,
                userid: user?.userid,
              } as UserInfo
            }
          />
        </div>
      </div>

      {/* delete dialog */}
      <ConfirmationModal
        title="Delete Story?"
        description="Are you sure you want to delete this story? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={deleteStoryState.loading}
        open={!!isDeleteStory}
        onOpenChange={(open) => { if (!open) setIsDeleteStory(''); }}
        onConfirm={onDelete}
        className="z-[10000]"
      />
    </div>,
    document.body
  );
};

export { ViewStory };
