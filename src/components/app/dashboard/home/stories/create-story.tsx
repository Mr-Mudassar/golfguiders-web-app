import React from 'react';

import {
  Button,
  Icon,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  FileUploader,
  DialogDescription,
  Slider,
} from '@/components/ui';
import { cn, toDirectGcsImageUrl } from '@/lib/utils';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import type { FileWithPath } from 'react-dropzone';
import {
  CreateStory as CreateStoryMutation,
  GenerateSignedUrl,
} from './_query';
import type {
  GenerateSignedUrlMutationType,
  GenerateSignedUrlMutationVariablesType,
  CreateStoryMutationType,
  CreateStoryMutationVariablesType,
  ISubStory,
} from './_interface';
import { useMutation } from '@apollo/client/react';
import { toast } from 'sonner';
import { useAppSelector } from '@/lib';

interface CreateStoryProps {
  className?: string;
  onRefetchStories: (arg: ISubStory) => void;
  latLng: number[];
  open: boolean;
  setOpen: (f: boolean) => void;
}

const CreateStory: React.FC<CreateStoryProps> = ({
  className,
  onRefetchStories,
  latLng,
  open,
  setOpen,
}) => {
  const t = useTranslations('homePage');
  const user = useAppSelector((state) => state.auth.user);

  return (
    <div
      className={cn(
        'border border-primary/30 shadow-lg shadow-primary/5 w-full h-full rounded-xl bg-foreground/10 relative overflow-hidden transition-all duration-300 hover:border-primary/50 hover:shadow-primary/20',
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <Image
        src={toDirectGcsImageUrl(user?.photo_profile) || "https://plus.unsplash.com/premium_photo-1679505066527-58530a9e4a0d?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"}
        alt=""
        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110 "
        fill
        sizes="200px"
        priority
        onClick={() => setOpen(true)}
      />
      <div className="absolute inset-x-0 bottom-0 z-20 p-4 flex flex-col items-center gap-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-12"
        onClick={() => setOpen(true)}
      >
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-lg ring-4 ring-background group-hover:scale-110 transition-transform">
          <Icon name="plus" size={20} />
        </div>
        <h4 className="font-bold text-sm text-white drop-shadow-md">
          {t('createStory')}
        </h4>
      </div>

      {open && (
        <DialogDetail
          t={t}
          open={open}
          setOpen={setOpen}
          latLng={latLng}
          onSuccessfull={(arg: ISubStory) => {
            setOpen(false);
            onRefetchStories(arg);
          }}
        />
      )}
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DialogDetail({ t, open, setOpen, onSuccessfull, latLng }: any) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const user = useAppSelector((state) => state.auth.user);
  const [mediaFiles, setMediaFiles] = React.useState<FileWithPath[]>([]);
  const [videoUrl, setVideoUrl] = React.useState<string>('');
  const [duration, setDuration] = React.useState<number | null>(null);
  const [isError, setIsError] = React.useState<string>('');
  const [isTrim, setIsTrim] = React.useState<[number, number]>([0, 0]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const [generateSignedUrl] = useMutation<
    GenerateSignedUrlMutationType,
    GenerateSignedUrlMutationVariablesType
  >(GenerateSignedUrl);

  const [createStory] = useMutation<
    CreateStoryMutationType,
    CreateStoryMutationVariablesType
  >(CreateStoryMutation);

  React.useEffect(() => {
    if (mediaFiles[0] && mediaFiles[0]?.type.includes('video/')) {
      const url = URL.createObjectURL(mediaFiles[0]);
      setVideoUrl(url);

      // Clean up when component unmounts or file changes
      return () => URL.revokeObjectURL(url);
    }
  }, [mediaFiles]);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const d = videoRef.current.duration;
      setDuration(d);
      // Default trim: full video if ≤30s, otherwise first 30s (so trimmed duration is valid 5–30s when possible)
      const end = Math.min(30, Math.floor(d));
      const start = 0;
      setIsTrim([start, end >= 5 ? end : Math.floor(d)]);
    }
  };

  const handleMediaChange = React.useCallback((files: File[]) => {
    setMediaFiles(files);
  }, []);

  async function uploadMedia(url: string, file: File) {
    try {
      console.log("url", url);
      console.log("file", file.type, file.size, file.name, file.lastModified, file);
      // Use native fetch API for binary upload to ensure proper binary transmission
      // The file is sent as binary data without any transformations
      const response = await fetch(url, {
        method: 'PUT',
        body: file, // File/Blob objects are sent as binary by default
        headers: {
          'Content-Type': file.type || 'application/octet-stream', // Exact Content-Type match required for signed URLs
          'Content-Length': file.size.toString(),
        },
      });

      console.log("Response from upload meida api", response);

      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      throw error; // Re-throw to handle in calling function
    }
  }

  async function onSubmit(): Promise<void> {
    if (mediaFiles.length === 0) {
      setIsError('Please select an image or video file.');
      return;
    }
    if (videoUrl && duration != null) {
      const trimmedDuration = isTrim[1] - isTrim[0];
      if (trimmedDuration < 5) {
        setIsError('Selected clip must be at least 5 seconds. Adjust the trim range.');
        return;
      }
      if (trimmedDuration > 30) {
        setIsError('Selected clip must be 30 seconds or less. Adjust the trim range.');
        return;
      }
    }

    setIsError('');
    setIsLoading(true);

    try {
      const { data: dataSigned } = await generateSignedUrl({
        variables: {
          input: {
            fileName: mediaFiles[0].name,
            contentType: mediaFiles[0].type,
          },
        },
      });
      try {
        await uploadMedia(
          dataSigned?.generateSignedUrl?.signedUrl as string,
          mediaFiles[0]
        );
      } catch (uploadError) {
        console.error('Media upload failed:', uploadError);
        toast.error('Failed to upload media. Please try again.');
        setIsLoading(false);
        return;
      }

      const latitude = latLng.length > 0 ? latLng[0] : (user?.latitude ?? 0);
      const longitude = latLng.length > 0 ? latLng[1] : (user?.longitude ?? 0);

      const variables: CreateStoryMutationVariablesType = {
        latitude,
        longitude,
        url: dataSigned?.generateSignedUrl?.filePath as string,
        extension: mediaFiles[0].type,
      };
      if (isTrim[0] !== 0 || isTrim[1] !== 0) {
        variables['trim_start'] = isTrim[0];
        variables['trim_end'] = isTrim[1];
      }

      const { data, error } = await createStory({ variables });
      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success('Story uploaded successfully');
      setMediaFiles([]);
      setVideoUrl('');
      setIsTrim([0, 0]);
      setDuration(null);
      onSuccessfull(data?.createStory);
    } catch (err) {
      // no-op
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          count={mediaFiles.length ? mediaFiles.length : undefined}
          tooltip={t('createPost.media')}
        >
          <Icon name="image" size={24} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('createPost.media')}</DialogTitle>
        </DialogHeader>
        {mediaFiles.length > 0 ? (
          <div className="relative space-y-4">
            <Icon
              name="close"
              size={24}
              onClick={() => {
                if (!isLoading) {
                  setVideoUrl('');
                  setMediaFiles([]);
                  setIsError('');
                }
              }}
              className={`${videoUrl ? 'float-right mb-1' : 'absolute top-0 right-0'} cursor-pointer bg-gray-300 rounded-full p-0.5`}
            />

            {videoUrl ? (
              <video
                controls
                muted
                ref={videoRef}
                preload="metadata"
                onLoadedMetadata={handleLoadedMetadata}
                className="object-contain w-full h-[362px]"
              >
                <source src={videoUrl} type={mediaFiles[0].type} />
                Your browser does not support the video tag.
              </video>
            ) : (
              <Image
                src={
                  URL.createObjectURL(mediaFiles[0]) ||
                  '/images/placeholder.svg'
                }
                alt={mediaFiles[0].name}
                className="object-cover w-full rounded-md h-full"
                sizes="100"
                height={380}
                width={100}
              />
            )}
            {videoUrl && duration != null && duration > 0 && (
              <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                <p className="text-sm font-medium text-foreground mb-1">
                  Select clip (5–30 seconds)
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  Start {formatTime(isTrim[0])} · End {formatTime(isTrim[1])} · Duration {isTrim[1] - isTrim[0]}s
                </p>
                <Slider
                  disabled={false}
                  className="w-full"
                  max={Math.floor(duration)}
                  value={isTrim}
                  onChange={(arg) =>
                    setIsTrim([Math.round(arg[0]), Math.round(arg[1])])
                  }
                />
                {(isTrim[1] - isTrim[0] < 5 || isTrim[1] - isTrim[0] > 30) && (
                  <p className="text-destructive text-xs mt-2">
                    {isTrim[1] - isTrim[0] < 5
                      ? 'Select at least 5 seconds.'
                      : 'Select 30 seconds or less.'}
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          <FileUploader
            value={mediaFiles}
            disabled={isLoading}
            onValueChange={handleMediaChange}
            maxFileCount={1}
            accept={{
              'image/*': ['jpg', 'jpeg', 'png'],
              'video/*': ['mp4'],
            }}
          />
        )}

        <DialogFooter className="flex-row flex-wrap items-center gap-2 sm:justify-between pt-4 mt-4 border-t border-border/50">
          {isError ? (
            <p className="text-destructive text-sm flex items-center gap-1.5 order-first w-full sm:w-auto">
              <Icon name="triangle-alert" size={14} className="shrink-0" />
              {isError}
            </p>
          ) : (
            <span className="w-full sm:w-auto sm:contents" />
          )}
          <div className="flex gap-2 ml-auto ">
            <DialogClose
              asChild
              disabled={isLoading}
              onClick={() => {
                setMediaFiles([]);
              }}
            >
              <Button variant="ghost">{t('createPost.gc.cancel')}</Button>
            </DialogClose>
            <Button type="button" disabled={isLoading} onClick={() => onSubmit()} loading={isLoading}>
              Upload
              {!isLoading && (
                <Icon name="send" size={14} className="ml-2" />
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { CreateStory };
