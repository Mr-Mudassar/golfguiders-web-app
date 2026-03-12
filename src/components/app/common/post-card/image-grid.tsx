/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Icon, Skeleton } from '@/components/ui';
import type { PostMedias } from '@/lib/definitions';
import { useIntersectionObserver } from 'usehooks-ts';
import dynamic from 'next/dynamic';

const SingleMarkerMap = dynamic(() =>
  import('@/components/maps').then((mod) => mod.SingleMarkerMap)
);

interface PostImageGridProps {
  readonly className?: string;
  media: Pick<PostMedias, 'url' | 'mime_type'>[];
  mapPosition?: { lat: number; lng: number };
  setActive: (image: string) => void;
}

const PostImageGrid: React.FC<PostImageGridProps> = ({
  className,
  media,
  setActive,
  mapPosition,
}) => {
  const collectiveLength = media.length + (mapPosition ? 1 : 0);
  const gridMedia = React.useMemo(
    () =>
      [...media]
        .sort((a) => (a.mime_type?.includes('video') ? -1 : 1))
        .slice(0, !!mapPosition ? 2 : 3),
    [media, mapPosition]
  );
  const containsOnlyVideo =
    collectiveLength === 1 && gridMedia[0]?.mime_type?.includes('video');

  const videoObserver = useIntersectionObserver({
    rootMargin: '-100px',
  });
  const [autoPlay, setAutoPlay] = React.useState(false);
  const [mapLoaded, setMapLoaded] = React.useState(false);

  React.useEffect(() => {
    if (!mapPosition) setMapLoaded(false);
  }, [mapPosition]);

  // console.log(
  //   'contains only video',
  //   containsOnlyVideo,
  //   'intersecting',
  //   videoObserver.isIntersecting,
  //   'autoplay',
  //   autoPlay
  // );

  React.useEffect(() => {
    if (!containsOnlyVideo) {
      return;
    }

    if (videoObserver.isIntersecting) {
      setAutoPlay(true);
    } else {
      setAutoPlay(false);
    }

    return;
  }, [videoObserver.isIntersecting, containsOnlyVideo]);

  return collectiveLength === 0 ? null : collectiveLength === 1 &&
    !!mapPosition ? (
    <div className="relative w-full h-44 rounded-xl overflow-hidden bg-muted/30">
      {!mapLoaded && (
        <Skeleton className="absolute inset-0 h-44 w-full rounded-xl" />
      )}
      <SingleMarkerMap
        className={cn(
          'h-44 w-full rounded-xl overflow-hidden',
          !mapLoaded && 'opacity-0 absolute inset-0'
        )}
        latitude={mapPosition?.lat}
        longitude={mapPosition?.lng}
        onLoad={() => setMapLoaded(true)}
      />
    </div>
  ) : (
    <div
      className={cn(
        'w-full h-full aspect-video relative gap-0.5 rounded-xl overflow-hidden',
        {
          'grid grid-cols-2':
            (!!mapPosition && media.length === 1) ||
            (media.length === 2 && !mapPosition),
          'grid grid-cols-3 grid-rows-2': collectiveLength > 2,
        },
        className
      )}
    >
      {!!mapPosition && (
        <div
          className={cn(
            'relative h-full w-full',
            collectiveLength > 2 && 'col-start-1 col-end-3 row-start-1 row-end-3'
          )}
        >
          {!mapLoaded && (
            <Skeleton className="absolute inset-0 rounded-none" />
          )}
          <SingleMarkerMap
            className={cn(
              'h-full w-full',
              collectiveLength > 2 && 'col-start-1 col-end-3 row-start-1 row-end-3',
              !mapLoaded && 'opacity-0 absolute inset-0'
            )}
            latitude={mapPosition?.lat}
            longitude={mapPosition?.lng}
            onLoad={() => setMapLoaded(true)}
          />
        </div>
      )}

      {gridMedia.map((item, i) => (
        <ImageCard
          className={cn({
            'col-start-1 col-end-3 row-start-1 row-end-3':
              i === 0 && !mapPosition && media.length > 2,
          })}
          setActive={setActive}
          autoPlay={autoPlay}
          ref={containsOnlyVideo ? videoObserver.ref : undefined}
          key={i}
          media={item}
        />
      ))}

      {collectiveLength > 2 && (
        <div className="z-[1] absolute top-1/2 right-0 left-2/3 bottom-0 bg-black/70 flex items-center justify-center">
          <p className="text-white text-2xl">+ {collectiveLength - 2}</p>
        </div>
      )}
    </div>
  );
};

const ImageCard = React.memo(React.forwardRef<
  HTMLDivElement,
  {
    className?: string;
    media: Pick<PostMedias, 'url' | 'mime_type'>;
    setActive?: (image: string) => void;
    autoPlay?: boolean;
  }
>(({ media, setActive, autoPlay = false, className }, ref) => {
  return (
    <div
      onClick={setActive ? () => setActive(media.mime_type || '') : undefined}
      className={cn(
        'relative w-full h-full overflow-hidden bg-background opacity-100 hover:opacity-80 transition-opacity',
        className
      )}
    >
      {media.mime_type?.includes('video') ? (
        <>
          <div ref={ref} />
          <video
            src={media.url}
            preload="metadata"
            autoPlay={autoPlay}
            className="w-full h-full cursor-pointer"
            controls
            muted
          />
          {!autoPlay && (
            <div className="absolute inset-0 flex items-center justify-center  cursor-pointer">
              <Icon
                name="play"
                className="text-white fill-white w-[15%] h-[15%]"
              />
            </div>
          )}
        </>
      ) : (
        <>
          <Image
            src={media.url || '/images/placeholder.svg'}
            alt={media.url}
            width={400}
            height={400}
            className="w-full h-full object-cover cursor-pointer"
            sizes="(max-width: 768px) 100vw, 600px"
          />
        </>
      )}
    </div>
  );
}));
ImageCard.displayName = 'ImageCard';

export { PostImageGrid };
