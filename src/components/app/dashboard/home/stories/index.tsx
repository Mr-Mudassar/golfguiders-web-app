'use client';

import React from 'react';

import useEmblaCarousel from 'embla-carousel-react';
import { useCarouselButtons, useAppSelector, useSharedLocation } from '@/lib';
import { Button, Icon, Skeleton } from '@/components/ui';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLazyQuery } from '@apollo/client/react';
import { GetStoryByDistance } from './_query';
import type {
  IStory,
  ISubStory,
  GetStoryByDistanceType,
  GetStoryByDistanceVariablesType,
} from './_interface';
import dynamic from 'next/dynamic';
import { CreateStory } from './create-story';
import { StoryCard } from './story-card';

const ViewStory = dynamic(() =>
  import('./view-story').then((mod) => mod.ViewStory)
);

const Stories = () => {
  const { location, hasLocation } = useSharedLocation();
  const user = useAppSelector((state) => state.auth.user);
  const client = useQueryClient();

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    slidesToScroll: 1,
  });
  const carousel = useCarouselButtons(emblaApi);

  const [page] = React.useState<number>(1);
  const [, setIsHasNextPage] = React.useState<boolean>(false);
  const [selection, setSelection] = React.useState<IStory | undefined>(
    undefined
  );
  const [isCreateOpen, setIsCreateOpen] = React.useState<boolean>(false);
  const [navigateToStoryCreated, setNavigateToStoryCreated] = React.useState<string | undefined>(undefined);

  const [getStoriesByDistance] = useLazyQuery<
    GetStoryByDistanceType,
    GetStoryByDistanceVariablesType
  >(GetStoryByDistance, {
    fetchPolicy: 'cache-and-network',
  });

  // Stable cache key derived from shared location
  const cacheKey = React.useMemo(
    () => ['stories', page, location?.lat, location?.lng],
    [page, location?.lat, location?.lng]
  );

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: cacheKey,
    enabled: hasLocation,
    queryFn: fetchStories,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 60_000, // 1 minute — avoid excessive refetches
    initialData: [],
    networkMode: 'always',
  });

  async function fetchStories(): Promise<IStory[]> {
    if (!location) return [];

    const { data, error } = await getStoriesByDistance({
      variables: {
        latitude: location.lat,
        longitude: location.lng,
        page
      },
    });

    if (error) {
      console.error('Stories fetch error:', error);
      return [];
    }

    setIsHasNextPage(!!data?.getStoryByDistance?.next_page);
    return data?.getStoryByDistance?.story ?? [];
  }

  return (
    <section className="col-span-1 lg:col-span-6 w-full h-[280px] md:h-[320px] overflow-hidden rounded-2xl relative group">
      <div className="h-full" ref={emblaRef}>
        <div className="flex h-full gap-3">
          <div className="shrink-0 grow-0 basis-1/3 lg:basis-[160px] h-full">
            <CreateStory
              latLng={location ? [location.lat, location.lng] : []}
              open={isCreateOpen}
              setOpen={setIsCreateOpen}
              onRefetchStories={(newStory: ISubStory) => {
                // Add new story to current selection if viewing own stories
                if (selection && selection.userInfo.userid === user?.userid) {
                  const updatedStories = [...selection.stories, newStory].sort((a, b) => {
                    const timeA = new Date(a.created).getTime();
                    const timeB = new Date(b.created).getTime();
                    return timeA - timeB; // Oldest first, newest last
                  });
                  const newSelection = {
                    ...selection,
                    stories: updatedStories,
                  };
                  setSelection(newSelection);
                  // Navigate to the new story
                  setNavigateToStoryCreated(newStory.created);
                  // Clear after a short delay
                  setTimeout(() => setNavigateToStoryCreated(undefined), 100);
                }
                // Refetch to update the main stories list
                refetch();
              }}
            />
          </div>
          {(isLoading || isFetching) && (!data || data.length === 0) ? (
            <>
              {[0, 1, 2].map((i) => (
                <Skeleton
                  key={i}
                  className="shrink-0 grow-0 basis-1/3 lg:basis-[160px] h-full rounded-2xl animate-in fade-in duration-200 ease-out"
                  style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
                />
              ))}
            </>
          ) : (
            data?.map((story, index) => (
              <div
                className="shrink-0 grow-0 basis-1/3 lg:basis-[160px] h-full animate-in fade-in duration-300 ease-out"
                key={index}
                style={{ animationDelay: `${Math.min(index * 50, 150)}ms`, animationFillMode: 'both' }}
              >
                <StoryCard item={story} onClick={() => {
                  // Sort stories by created timestamp (oldest first, newest last)
                  const sortedStory = {
                    ...story,
                    stories: [...story.stories].sort((a, b) => {
                      const timeA = new Date(a.created).getTime();
                      const timeB = new Date(b.created).getTime();
                      return timeA - timeB;
                    }),
                  };
                  setSelection(sortedStory);
                }} />
              </div>
            ))
          )}
        </div>
      </div>

      {!carousel.prevBtnDisabled && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 z-30 opacity-0 group-hover:opacity-100 transition-all">
          <Button
            size="icon"
            className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-md border-border text-foreground hover:bg-background shadow-lg"
            onClick={carousel.onPrevButtonClick}
          >
            <Icon name="chevron-left" size={20} />
          </Button>
        </div>
      )}

      {!carousel.nextBtnDisabled && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 z-30 opacity-0 group-hover:opacity-100 transition-all">
          <Button
            size="icon"
            className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-md border-border text-foreground hover:bg-background shadow-lg"
            onClick={carousel.onNextButtonClick}
          >
            <Icon name="chevron-right" size={20} />
          </Button>
        </div>
      )}

      <ViewStory
        stories={data}
        shouldPause={isCreateOpen}
        navigateToStoryCreated={navigateToStoryCreated}
        onPerform={(action: number, created: string, story?: ISubStory) => {
          if (action === 1) {
            setIsCreateOpen(true);
          } else if (action === 2) {
            client.setQueryData(
              cacheKey,
              (oldData: IStory[]) =>
                oldData.map((s) => {
                  return {
                    userInfo: s.userInfo,
                    stories: s.stories.find((f) => f.created === created)
                      ? s.stories.filter((f) => f.created !== created)
                      : s.stories,
                  };
                })
            );
            const filteredStories = (selection as IStory)?.stories?.filter(
              (f) => f.created !== created
            ) || [];
            const sortedStories = filteredStories.sort((a, b) => {
              const timeA = new Date(a.created).getTime();
              const timeB = new Date(b.created).getTime();
              return timeA - timeB;
            });
            setSelection({
              userInfo: (selection as IStory)?.userInfo,
              stories: sortedStories,
            });
            refetch();
          } else if (action === 3) {
            client.setQueryData(
              cacheKey,
              (oldData: IStory[]) =>
                oldData.map((s) => {
                  return {
                    userInfo: s.userInfo,
                    stories: s.stories.map((s) => {
                      return s.story_id === story?.story_id
                        ? { ...story }
                        : { ...s };
                    }),
                  };
                })
            );
            const updatedStories = (selection as IStory)?.stories?.map((s) => {
              return s.story_id === story?.story_id ? { ...story } : { ...s };
            }) || [];
            const sortedStories = updatedStories.sort((a, b) => {
              const timeA = new Date(a.created).getTime();
              const timeB = new Date(b.created).getTime();
              return timeA - timeB;
            });
            setSelection({
              userInfo: (selection as IStory)?.userInfo,
              stories: sortedStories,
            });
          }
        }}
        selection={selection}
        setSelection={setSelection}
      />
    </section>
  );
};

export { Stories };
