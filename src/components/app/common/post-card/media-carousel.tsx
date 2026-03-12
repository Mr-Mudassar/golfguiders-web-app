/* eslint-disable @next/next/no-img-element */
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@radix-ui/react-dialog';
import React from 'react';
import { PostImageGrid } from './image-grid';
import useEmblaCarousel from 'embla-carousel-react';
import { useCarouselButtons } from '@/lib';
import { Icon, Skeleton } from '@/components/ui';
import type { PostMedias } from '@/lib/definitions';
import Image from 'next/image';

interface PostMediaCarouselProps {
  media: PostMedias[];
  mapPosition?: { lat: number; lng: number };
}

const PostMediaCarousel: React.FC<PostMediaCarouselProps> = ({
  media,
  mapPosition,
}) => {
  const [activeImage, setActiveImage] = React.useState<string | null>(null);
  const [loadedImages, setLoadedImages] = React.useState<Set<string>>(new Set());

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'center',
    slidesToScroll: 1,
    startIndex: activeImage
      ? media.findIndex((i) => i.file_id === activeImage)
      : 0,
  });
  const carousel = useCarouselButtons(emblaApi);

  return (
    <>
      <PostImageGrid
        setActive={setActiveImage}
        media={media}
        mapPosition={mapPosition}
      />
      <Dialog open={!!activeImage} onOpenChange={() => setActiveImage(null)}>
        <DialogPortal>
          <DialogOverlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

          <DialogContent className="fixed left-1/2 top-1/2 z-50 max-h-[80vh] max-w-[80vw] w-auto h-auto -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-md bg-white/70 p-2 shadow-xl">
            <DialogTitle className="sr-only">Post Media Carousel</DialogTitle>
            <DialogDescription className="sr-only">
              Post Media Carousel
            </DialogDescription>

            <div ref={emblaRef} className="overflow-hidden">
              <div className="flex">
                {media.map((item) => {
                  const itemId = item.postmediaid || item.file_id || '';
                  const isLoaded = loadedImages.has(itemId);
                  return (
                    <div
                      key={item.postmediaid}
                      className="min-w-0 shrink-0 grow-0 basis-full flex items-center justify-center relative"
                    >
                      {item.mime_type?.includes('video') ? (
                        <video
                          src={item.url}
                          preload="metadata"
                          className="max-w-full max-h-[75vh] rounded"
                          muted
                          controls
                          autoPlay
                        />
                      ) : (
                        <>
                          {!isLoaded && (
                            <Skeleton className="absolute inset-0 max-w-full max-h-[75vh] w-full h-full rounded" />
                          )}
                          <Image
                            width={800}
                            height={800}
                            alt={item?.url}
                            src={item?.url || '/images/placeholder.svg'}
                            className={!isLoaded ? 'opacity-0' : 'opacity-100 transition-opacity duration-200 max-w-full max-h-[75vh] rounded object-contain'}
                            sizes="(max-width: 768px) 100vw, 80vw"
                            onLoad={() => {
                              setLoadedImages((prev) => new Set(prev).add(itemId));
                            }}
                            onError={() => {
                              setLoadedImages((prev) => new Set(prev).add(itemId));
                            }}
                          />
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {!carousel.prevBtnDisabled && (
              <button
                onClick={carousel.onPrevButtonClick}
                type="button"
                title="Previous"
                className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-700 hover:text-gray-900"
              >
                <Icon name="chevron-left" size={40} />
              </button>
            )}

            {!carousel.nextBtnDisabled && (
              <button
                onClick={carousel.onNextButtonClick}
                type="button"
                title="Next"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-700 hover:text-gray-900"
              >
                <Icon name="chevron-right" size={40} />
              </button>
            )}
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </>
  );
};

export { PostMediaCarousel };
