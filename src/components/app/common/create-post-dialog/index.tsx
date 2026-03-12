'use client';

import {
  Icon,
  Form,
  Input,
  Avatar,
  Dialog,
  Button,
  FormItem,
  FormField,
  AvatarImage,
  DialogClose,
  FormControl,
  DialogTitle,
  DialogHeader,
  FormMessage,
  FileUploader,
  DialogFooter,
  DialogContent,
  DialogTrigger,
  AvatarFallback,
  Separator,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui';
import {
  useZodForm,
  useUploadMedia,
  useAppSelector,
  useCurrentPosition,
  useDeletePostMediaAction,
} from '@/lib';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@radix-ui/react-popover';
import type {
  CreatePostMutationType,
  CreatePostMutationVariablesType,
  EditPostResponse,
  UpdatePostMutationVariablesType,
} from './_interface';
import {
  PostType,
  PostStatus,
  PostVisibility,
  MAX_TOTAL_SIZE_BYTES,
} from '@/lib/constants';
import type {
  Media,
  BuddyPost,
  PostMedias,
  PaginatedPosts,
} from '@/lib/definitions';
import { z } from 'zod';
import { toast } from 'sonner';
import { parse } from 'date-fns';
import { useTranslations } from 'next-intl';
import type { RootState } from '@/lib/redux';
import { GolfCourseCombobox } from './golf-course-combobox';
import { TextWrapper } from '../post-card/editor';
import type { Control } from 'react-hook-form';
import type { FileWithPath } from 'react-dropzone';
import React, { useEffect, useState } from 'react';
import { CreatePost, EditPost } from './_mutation';
import { useQueryClient } from '@tanstack/react-query';
import { DateTimeRangePicker } from './date-range-picker';
import { useMutation, useApolloClient } from '@apollo/client/react';
const SWATCH_COLORS = [
  '#FF6900', '#FCB900', '#7BDCB5', '#00D084', '#8ED1FC',
  '#0693E3', '#ABB8C3', '#EB144C', '#F78DA7', '#9900EF',
];
const ColorPicker = ({ onChange }: { onChange: (color: { hex: string }) => void }) => (
  <div className="grid grid-cols-5 gap-1.5 p-2 w-[11.5rem] bg-white rounded-md shadow-md">
    <button
      type="button"
      onClick={() => onChange({ hex: '' })}
      className="w-7 h-7 rounded-md cursor-pointer border border-border/40 hover:scale-110 transition-transform shrink-0 bg-white flex items-center justify-center"
    >
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="9" stroke="#9ca3af" strokeWidth="1.5" />
        <line x1="5" y1="17" x2="17" y2="5" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </button>
    {SWATCH_COLORS.map((hex) => (
      <button
        key={hex}
        type="button"
        onClick={() => onChange({ hex })}
        className="w-7 h-7 rounded-md cursor-pointer border border-border/40 hover:scale-110 transition-transform shrink-0"
        style={{ backgroundColor: hex }}
      />
    ))}
  </div>
);
import { isDateToday, timestampToISO } from '@/lib/utils/globalfunc';
import { cn, getName, getInitials, formatMentions } from '@/lib/utils';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import type { Post } from '@/lib/definitions';

const TagGroups = dynamic(() =>
  import('./tag-groups').then((mod) => mod.TagGroups)
);

const TagUsers = dynamic(() =>
  import('./tag-users').then((mod) => mod.TagUsers)
);

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

interface CreatePostDialogProps {
  open: boolean;
  postDetails?: {
    postId: string;
    created: string;
    postUserTags: string[] | undefined;
    postGroupTags: string[] | undefined;
    userId: string | undefined;
  };
  postData?: Post; // Full post data from getPostsByDistance
  postCase?: string;
  setIsRefresh?: (n: number) => void;
  onOpenChange: (open: boolean) => void;
  postType: string;
  postMedia?: PostMedias[];
}

const postSchema = z.object({
  postal_code: z.number(),
  visibility: z
    .enum(Object.values(PostVisibility) as [string, ...string[]])
    .default(PostVisibility.Public)
    .optional(),
  type: z.string(),
  title: z.string().optional(),
  description: z
    .string()
    .trim()
    .optional(),
  background_color: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  location: z.string().optional(),
  golfcourse_json: z.string().optional(),
  feeling_emoji: z.string().optional(),
  has_buddy_accepted: z.boolean().optional(),
  tee_time: z
    .string()
    .min(1, { message: 'Required!' })
    .regex(/^\d+$/, { message: 'Invalid input' })
    .optional()
    .refine(
      (val) =>
        val
          ? Number.isInteger(parseInt(val, 10)) && parseInt(val, 10) > 0
          : true,
      {
        message: 'Invalid input',
      }
    ),
  thumbnail_preview: z.string().optional(),
  user_tags: z.array(z.string()).optional(),
  group_tags: z.array(z.string()).optional(),
  is_draft: z.boolean().optional(),
  status: z.enum(Object.values(PostStatus) as [string, ...string[]]).optional(),
});

export type PostInputType = z.infer<typeof postSchema>;

export function CreatePostDialog({
  open,
  postType,
  postMedia,
  postDetails,
  postData,
  onOpenChange,
  setIsRefresh,
  postCase = 'create',
}: CreatePostDialogProps) {
  const { deletePostMediaFunc } = useDeletePostMediaAction();
  const queryClient = useQueryClient();
  const apolloClient = useApolloClient();
  const uploadMedia = useUploadMedia();
  const t = useTranslations('homePage.createPost');
  const { fetchCurrentLatLng } = useCurrentPosition();
  const user = useAppSelector((state: RootState) => state.auth.user);

  // ***************  Emoji and Color picker modal toggle states *********************

  const [openColor, setOpenColor] = React.useState(false);
  const [openEmjoi, setOpenEmoji] = React.useState<boolean>(false);
  const [emojiUnified, setEmojiUnified] = React.useState<string>('');
  const [existingMedia, setExistingMedia] = useState<PostMedias[]>([]);
  const [removedMediaIds, setRemovedMediaIds] = React.useState<Media[]>([]);
  const [mediaFiles, setMediaFiles] = React.useState<FileWithPath[]>([]);
  const [updatePost, { loading: updatePostLoading }] = useMutation<
    EditPostResponse,
    UpdatePostMutationVariablesType
  >(EditPost);

  const isRefresh = useAppSelector(
    (state: RootState) => state.user.isRefreshPost
  );

  // ***************  API CALL   *********************

  const [createPost, createPostState] = useMutation<
    CreatePostMutationType,
    CreatePostMutationVariablesType
  >(CreatePost);

  // Use the passed postData directly instead of making an API call
  const userPostDetails = postCase === 'edit' ? postData : undefined;

  // Preload existing media in edit mode
  useEffect(() => {
    if (postCase === 'edit' && postMedia && postMedia.length > 0) {
      setExistingMedia(postMedia);
    }
  }, [postCase, postMedia]);

  const form = useZodForm({
    schema: postSchema.superRefine((data, ctx) => {
      if (postType === PostType.GolfBuddy) {
        if (!data.tee_time)
          ctx.addIssue({
            path: ['tee_time'],
            message: t('zod.spots'),
            code: 'custom',
          });
        if (!data.golfcourse_json)
          ctx.addIssue({
            path: ['golfcourse_json'],
            message: t('zod.gc'),
            code: 'custom',
          });
        if (!data.date_from)
          ctx.addIssue({
            path: ['date_from'],
            message: t('dateFrom'),
            code: 'custom',
          });
        if (!data.date_to)
          ctx.addIssue({
            path: ['date_to'],
            message: t('dateTo'),
            code: 'custom',
          });
      }
    }),
    defaultValues: {
      description: '',
      visibility: PostVisibility.Public,
      user_tags: [],
      group_tags: [],
      is_draft: false,
      background_color: '',
      type: postType,
    },
  });

  // Prefill form with post data when editing
  useEffect(() => {
    if (postCase === 'edit' && userPostDetails) {
      form.reset({
        postal_code: userPostDetails.postal_code || 32332,
        visibility: (userPostDetails.visibility as string) || PostVisibility.Public,
        type: postType,
        title: userPostDetails.title || '',
        description: formatMentions(userPostDetails.description || '') || '',
        background_color: userPostDetails.background_color || '',
        date_from: userPostDetails.date_from || '',
        date_to: userPostDetails.date_to || '',
        latitude: userPostDetails.latitude || undefined,
        longitude: userPostDetails.longitude || undefined,
        location: userPostDetails.location || '',
        golfcourse_json: userPostDetails.golfcourse_json || '',
        feeling_emoji: userPostDetails.feeling_emoji || '',
        has_buddy_accepted: userPostDetails.has_buddy_accepted || false,
        tee_time: userPostDetails.tee_time?.toString() || '',
        thumbnail_preview: userPostDetails.thumbnail_preview || '',
        user_tags: userPostDetails.user_tags || [],
        group_tags: userPostDetails.group_tags || [],
        is_draft: userPostDetails.is_draft || false,
        status: (userPostDetails.status as string) || undefined,
      });
      // Set unified code for emoji display when editing
      if (userPostDetails.feeling_emoji) {
        const unified = [...userPostDetails.feeling_emoji]
          .map((c) => c.codePointAt(0)!.toString(16).padStart(4, '0'))
          .join('-');
        setEmojiUnified(unified);
      }
    }
  }, [userPostDetails, postCase, postType, form]);

  // Set current location for create case
  useEffect(() => {
    async function getCurrentLocation() {
      const latlng = await fetchCurrentLatLng();
      if (!latlng) {
        return;
      }
      form.setValue('latitude', latlng.lat);
      form.setValue('longitude', latlng.lng);
    }
    if (postCase !== 'edit') {
      getCurrentLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, postCase]);

  const handleMediaChange = React.useCallback(
    (files: FileWithPath[]) => {
      setMediaFiles(files);
    },
    []
  );

  const handleRemoveExistingMedia = (file: Media) => {
    setRemovedMediaIds((prev) => [...prev, file]);
    setExistingMedia((prev) => prev.filter((m) => m.file_id !== file?.file_id));
  };

  const totalSize = mediaFiles.reduce((acc, file) => acc + file.size, 0);
  const isOverLimit = totalSize > MAX_TOTAL_SIZE_BYTES;

  const handleCreatePost = React.useCallback(
    async (
      values: z.infer<typeof postSchema>,
      e?: React.BaseSyntheticEvent
    ) => {
      e?.preventDefault();

      // Check if media is selected (either new files or existing media in edit mode)
      const hasMedia = mediaFiles.length > 0 || existingMedia.length > 0;

      // Additional validation: ensure description is not empty after trimming only if no media is selected
      const trimmedDescription = values?.description?.trim();
      if (!hasMedia && (!trimmedDescription || trimmedDescription.length === 0)) {
        form.setError('description', {
          type: 'manual',
          message: 'Description is required!',
        });
        toast.error('Description is required!');
        return;
      }

      // Validate date and time for GolfBuddy posts
      if (values.type === PostType.GolfBuddy) {
        if (!values.date_from || !values.date_to) {
          toast.error('Date and time are required!');
          form.setError('date_from', {
            type: 'manual',
            message: 'Date and time are required',
          });
          return;
        }
      }

      const args = {
        ...values,
        has_media: mediaFiles.length > 0 ? true : false,
        description: trimmedDescription ? formatMentions(trimmedDescription) : '',
        postal_code: user?.postalcode ?? 32332,
        latitude: user?.latitude,
        longitude: user?.longitude,
        // Strip GolfBuddy-specific fields for non-buddy posts to avoid sending invalid values
        ...(values.type !== PostType.GolfBuddy && {
          date_from: undefined,
          date_to: undefined,
          tee_time: undefined,
          golfcourse_json: undefined,
          has_buddy_accepted: undefined,
        }),
      };

      if (
        args.type === PostType.GolfBuddy &&
        args.date_from &&
        parse(
          args.date_from as string,
          'd MMM, yyyy hh:mm:ss a',
          new Date()
        ).getTime() <
        parse(
          new Date().toDateString(),
          'd MMM, yyyy hh:mm:ss a',
          new Date()
        ).getTime()
      ) {
        toast.error(t('zod.dateFromVal'));
        return;
      } else if (
        args.type === PostType.GolfBuddy &&
        Number(args.tee_time) > 500
      ) {
        toast.error(t('zod.spotsVal'));
        return;
      } else if (
        args.type === PostType.GolfBuddy &&
        (Number(args.tee_time) < 1 || !args.tee_time)
      ) {
        toast.error('Spots must be between 1 and 500');
        return;
      } else if (args.type === PostType.GolfBuddy && !args.golfcourse_json) {
        toast.error('Please select a golf course');
        return;
      }

      const { data, error } = await createPost({
        variables: {
          createPost: args,
        },
      });

      if (error) {
        toast.error(error.message || t('toasts.failPost'));
        return;
      }

      if (data?.createPost) {
        const postId = data.createPost.postid!;
        const created = data.createPost.created!;
        const mediaToUpload = mediaFiles.length > 0 ? [...mediaFiles] : [];
        const hasMediaToUpload = mediaToUpload.length > 0;

        const newPost = {
          ...data.createPost,
          has_media: hasMediaToUpload ? false : data.createPost.has_media,
          userInfo: {
            userid: user?.userid,
            first_name: user?.first_name,
            last_name: user?.last_name,
            photo_profile: user?.photo_profile,
          },
        };

        onOpenChange(false);
        form.reset();
        setMediaFiles([]);
        setExistingMedia([]);
        setRemovedMediaIds([]);

        setTimeout(() => {
          const prependToFirstPage = (
            oldData: { pages: (Post | BuddyPost)[][]; pageParams?: unknown[] } | undefined,
            post: Post | BuddyPost
          ) => {
            if (!oldData?.pages) {
              return { pages: [[post]], pageParams: [1] as unknown[] };
            }
            const first = oldData.pages[0] ?? [];
            const seen = new Set(first.map((p) => (p as Post).postid ?? (p as BuddyPost).post_id));
            const id = (post as Post).postid ?? (post as BuddyPost).post_id;
            if (id && seen.has(id)) return oldData;
            return {
              ...oldData,
              pages: [[post, ...first], ...oldData.pages.slice(1)],
              pageParams: oldData.pageParams,
            };
          };

          const updatePostInCache = (postId: string, updates: Partial<Post | BuddyPost>) => {
            queryClient.setQueriesData(
              { queryKey: ['posts'] },
              (oldData: unknown) => {
                if (!oldData || typeof oldData !== 'object' || !('pages' in oldData)) return oldData;
                const d = oldData as { pages: (Post | BuddyPost)[][]; pageParams?: unknown[] };
                return {
                  ...d,
                  pages: d.pages.map((page) =>
                    page.map((p) => {
                      const id = (p as Post).postid ?? (p as BuddyPost).post_id;
                      return id === postId ? { ...p, ...updates } : p;
                    })
                  ),
                };
              }
            );
          };

          if (args.type === PostType.GolfBuddy) {
            const tabKey = isDateToday(newPost?.date_from) ? 'today' : 'upcoming';
            const buddyPost: BuddyPost = {
              ...newPost,
              post_id: newPost.postid!,
              post_user_id: newPost.user_id!,
            } as BuddyPost;
            queryClient.setQueriesData(
              { queryKey: ['posts', tabKey] },
              (oldData: unknown) => prependToFirstPage(oldData as { pages: BuddyPost[][]; pageParams?: unknown[] }, buddyPost)
            );
          }

          if (newPost.visibility === 'PUBLIC') {
            const postForFeed = newPost as Post;
            queryClient.setQueriesData(
              { queryKey: ['posts', 'distance'] },
              (oldData: unknown) => prependToFirstPage(oldData as PaginatedPosts, postForFeed)
            );
            queryClient.setQueriesData(
              { queryKey: ['posts', 'circle'] },
              (oldData: unknown) => prependToFirstPage(oldData as PaginatedPosts, postForFeed)
            );
            if (user?.userid) {
              queryClient.setQueriesData(
                { queryKey: ['posts', 'user', user.userid] },
                (oldData: unknown) => prependToFirstPage(oldData as PaginatedPosts, postForFeed)
              );
            }
          }

          if (newPost.visibility === 'CIRCLE') {
            const postForCircle = newPost as Post;
            queryClient.setQueriesData(
              { queryKey: ['posts', 'circle'] },
              (oldData: unknown) => prependToFirstPage(oldData as PaginatedPosts, postForCircle)
            );
            if (user?.userid) {
              queryClient.setQueriesData(
                { queryKey: ['posts', 'user', user.userid] },
                (oldData: unknown) => prependToFirstPage(oldData as PaginatedPosts, postForCircle)
              );
            }
          }

          if (hasMediaToUpload) {
            toast.promise(
              uploadMedia.uploadPostMedia({
                postId,
                createdAt: created,
                media: mediaToUpload,
              }).then(() => {
                updatePostInCache(postId, { has_media: true });
                // Invalidate queries to refetch posts with actual media data from server
                queryClient.invalidateQueries({ queryKey: ['posts'] });
              }),
              {
                loading: t('toasts.mediaLoading'),
                success: t('toasts.successMedia'),
                error: t('toasts.mediaFail'),
              }
            );
          }
        }, 0);
      }

      if (setIsRefresh) {
        setIsRefresh(Math.random());
      }
    },
    [
      mediaFiles,
      existingMedia,
      uploadMedia,
      setIsRefresh,
      user,
      createPost,
      t,
      queryClient,
      apolloClient,
      onOpenChange,
      form,
      isRefresh,
    ]
  );

  const handleUpdatePost = async (
    values: z.infer<typeof postSchema>,
    e?: React.BaseSyntheticEvent
  ) => {
    e?.preventDefault();

    // Check if media is selected (either new files or existing media that hasn't been removed)
    const hasMedia = mediaFiles.length > 0 || existingMedia.length > 0;

    // Additional validation: ensure description is not empty after trimming only if no media is selected
    const trimmedDescription = values?.description?.trim();
    if (!hasMedia && (!trimmedDescription || trimmedDescription.length === 0)) {
      form.setError('description', {
        type: 'manual',
        message: 'Description is required!',
      });
      toast.error('Description is required!');
      return;
    }

    // Validate date and time for GolfBuddy posts
    if (values.type === PostType.GolfBuddy) {
      if (!values.date_from || !values.date_to) {
        toast.error('Date and time are required!');
        form.setError('date_from', {
          type: 'manual',
          message: 'Date and time are required',
        });
        return;
      }
    }

    const args = {
      ...values,
      description: trimmedDescription ? formatMentions(trimmedDescription) : '',
      geohash: userPostDetails?.geohash,
      created: userPostDetails?.created || postDetails?.created,
      user_id: postDetails?.userId || userPostDetails?.user_id,
      has_media:
        mediaFiles.length > 0 || existingMedia.length > 0 ? true : false,
      postal_code: userPostDetails?.postal_code || user?.postalcode || 32332,
      latitude: userPostDetails?.latitude || user?.latitude,
      longitude: userPostDetails?.longitude || user?.longitude,
      postid: postDetails?.postId || userPostDetails?.postid,
      // Strip GolfBuddy-specific fields for non-buddy posts to avoid sending invalid values
      ...(values.type !== PostType.GolfBuddy && {
        date_from: undefined,
        date_to: undefined,
        tee_time: undefined,
        golfcourse_json: undefined,
        has_buddy_accepted: undefined,
      }),
    };

    if (
      args.type === PostType.GolfBuddy &&
      args.date_from &&
      parse(
        args.date_from as string,
        'd MMM, yyyy hh:mm:ss a',
        new Date()
      ).getTime() <
      parse(
        new Date().toDateString(),
        'd MMM, yyyy hh:mm:ss a',
        new Date()
      ).getTime()
    ) {
      toast.error(t('zod.dateFromVal'));
      return;
    } else if (
      args.type === PostType.GolfBuddy &&
      Number(args.tee_time) > 500
    ) {
      toast.error(t('zod.spotsVal'));
      return;
    } else if (
      args.type === PostType.GolfBuddy &&
      (Number(args.tee_time) < 1 || !args.tee_time)
    ) {
      toast.error('Spots must be between 1 and 500');
      return;
    } else if (args.type === PostType.GolfBuddy && !args.golfcourse_json) {
      toast.error('Please select a golf course');
      return;
    }

    // Step 1: Call updatePost mutation first
    const { data, error } = await updatePost({
      variables: {
        postInput: args,
        postUserTags: postDetails?.postUserTags ?? [],
        postGroupTags: postDetails?.postGroupTags ?? [],
      },
    });

    if (error) {
      toast.error(error.message || t('toasts.failPost'));
      return;
    }

    toast.success('Post updated successfully');

    // Step 2: Capture media files before resetting state
    const mediaToUpload = mediaFiles.length > 0 ? [...mediaFiles] : [];
    const mediaToRemove = removedMediaIds.length > 0 ? [...removedMediaIds] : [];
    const hasMediaToUpload = mediaToUpload.length > 0;
    const hasMediaToRemove = mediaToRemove.length > 0;
    const postCreatedAt = userPostDetails?.created || postDetails?.created || '';

    // Step 3: Close modal immediately
    onOpenChange(false);
    form.reset();
    setMediaFiles([]);
    setExistingMedia([]);
    setRemovedMediaIds([]);

    // Step 4: Update cache with post data
    if (data?.editPost) {
      const updatedPost = {
        ...data?.editPost,
        userInfo: {
          first_name: user?.first_name,
          last_name: user?.last_name,
          photo_profile: user?.photo_profile,
        },
      };
      const postId = postDetails?.postId ?? updatedPost?.postid;

      const replacement = {
        ...updatedPost,
        // If new media is being uploaded, temporarily set has_media to false
        // so the flip to true after upload triggers a re-render
        has_media: hasMediaToUpload ? false : updatedPost.has_media,
        post_id: updatedPost?.postid,
      };

      const updatePostInCache = (updates: Partial<Post | BuddyPost>) => {
        queryClient.setQueriesData(
          { queryKey: ['posts'] },
          (oldData: unknown) => {
            if (
              !oldData ||
              typeof oldData !== 'object' ||
              !('pages' in oldData)
            )
              return oldData;
            const d = oldData as {
              pages: (Post | BuddyPost)[][];
              pageParams?: unknown[];
            };
            return {
              ...d,
              pages: d.pages.map((page) =>
                page.map((p) => {
                  const id = (p as Post).postid ?? (p as BuddyPost).post_id;
                  return id === postId ? { ...p, ...updates } : p;
                })
              ),
            };
          }
        );
      };

      // Update all posts feeds
      queryClient.setQueriesData(
        { queryKey: ['posts'] },
        (oldData: unknown) => {
          if (
            !oldData ||
            typeof oldData !== 'object' ||
            !('pages' in oldData)
          )
            return oldData;
          const d = oldData as {
            pages: (Post | BuddyPost)[][];
            pageParams?: unknown[];
          };
          return {
            ...d,
            pages: d.pages.map((page) =>
              page.map((p) =>
                (p as Post).postid === postId ||
                  (p as BuddyPost).post_id === postId
                  ? replacement
                  : p
              )
            ),
          };
        }
      );

      // Update saved posts list
      queryClient.setQueryData<{ pageParams: number[]; pages: Post[][] }>(
        ['getSavedPosts'],
        (oldData) => {
          if (!oldData?.pages) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page) =>
              page.map((p) => (p.postid === postId ? updatedPost : p))
            ),
          };
        }
      );

      // Step 5: Handle media operations in background (after modal is closed)
      setTimeout(() => {
        if (hasMediaToRemove && postDetails?.postId) {
          const deletePayload = mediaToRemove.map((postMedia) => ({
            url: postMedia?.url ?? '',
            file_id: postMedia?.file_id ?? '',
            created: postMedia?.created ?? '',
          }));

          toast.promise(
            deletePostMediaFunc({
              postId: postDetails.postId,
              DeletePostMediaInput: deletePayload,
            }),
            {
              loading: 'Removing old media...',
              error: t('toasts.mediaFail'),
              success: 'Media removed successfully',
            }
          );
        }

        if (hasMediaToUpload && postDetails?.postId) {
          toast.promise(
            uploadMedia.uploadPostMedia({
              postId: postDetails.postId,
              createdAt: postCreatedAt,
              media: mediaToUpload,
            }).then(() => {
              updatePostInCache({ has_media: true });
              // Invalidate queries to refetch posts with actual media data from server
              queryClient.invalidateQueries({ queryKey: ['posts'] });
            }),
            {
              loading: t('toasts.mediaLoading'),
              success: t('toasts.successMedia'),
              error: t('toasts.mediaFail'),
            }
          );
        }
      }, 0);
    }

    if (setIsRefresh) {
      setIsRefresh(Math.random());
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-3xl p-0"
        aria-describedby={undefined}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <Form {...form}>
          <form>
            {/* Hidden title for accessibility */}
            <DialogHeader className="sr-only">
              <DialogTitle>
                {postCase === 'edit' ? t('editLabel') : t('label')}
              </DialogTitle>
            </DialogHeader>

            {/* User info + visibility dropdown */}
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={user?.photo_profile}
                    alt={getName(user?.first_name, user?.last_name)}
                  />
                  <AvatarFallback className='bg-primary/10 text-primary'>
                    {getInitials(user?.first_name, user?.last_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold text-sm leading-tight">
                    {getName(user?.first_name, user?.last_name)}
                  </h4>
                  <FormField
                    control={form.control as unknown as Control<PostInputType>}
                    name="visibility"
                    render={({ field }) => {
                      const options = [
                        { value: PostVisibility.Public, label: t('visibility.public'), icon: 'globe' as const },
                        { value: PostVisibility.Circle, label: t('visibility.circle'), icon: 'users' as const },
                        { value: PostVisibility.Private, label: t('visibility.private'), icon: 'lock' as const },
                      ];
                      const selected = options.find((o) => o.value === (field.value || PostVisibility.Public)) || options[0];
                      return (
                        <FormItem className="mt-0.5">
                          <FormControl>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  <Icon name={selected.icon} size={12} />
                                  {selected.label}
                                  <Icon name="chevron-down" size={12} />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start" sideOffset={4}>
                                {options.map((opt) => (
                                  <DropdownMenuItem
                                    key={opt.value}
                                    onClick={() => field.onChange(opt.value)}
                                    className="gap-2 text-xs cursor-pointer"
                                  >
                                    <Icon name={opt.icon} size={14} />
                                    {opt.label}
                                    {(field.value || PostVisibility.Public) === opt.value && (
                                      <Icon name="check" size={14} className="ml-auto text-primary" />
                                    )}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </FormControl>
                        </FormItem>
                      );
                    }}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Text area */}
            <div className="px-6 mt-1 relative overflow-hidden!">
              <FormField
                control={form.control as unknown as Control<PostInputType>}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <TextWrapper
                        isEdit={postCase === 'edit'}
                        placeholder="What's on your mind?"
                        onChange={field.onChange}
                        value={field.value ?? ''}
                        rows={7}
                        className='overflow-auto!'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* GolfBuddy-specific fields */}
            {postType === PostType.GolfBuddy && (
              <div className="px-6 pt-3 space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Event Details
                </h3>
                <div className="flex flex-wrap gap-3">
                  <DateTimeRangePicker postCase={postCase} />
                  <GolfCourseCombobox />
                  <FormField
                    control={form.control as unknown as Control<PostInputType>}
                    name="tee_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            min={1}
                            max={500}
                            step="1"
                            type="number"
                            placeholder={t('spots')}
                            icon="user"
                            iconSize={16}
                            className="pl-10 pr-4 h-9"
                            wrapperClassName="max-w-32"
                            iconClassName="left-3 right-auto mt-1 text-black"
                            isErrored={!!form.formState.errors.tee_time}
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '' || /^\d+$/.test(value)) {
                                if (value === '') {
                                  field.onChange(value);
                                  return;
                                }
                                const numValue = parseInt(value, 10);
                                if (numValue >= 1 && numValue <= 500) {
                                  field.onChange(value);
                                } else if (numValue > 500) {
                                  field.onChange('500');
                                } else if (numValue < 1) {
                                  field.onChange('1');
                                }
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <TagUsers />
                  <TagGroups />
                </div>
              </div>
            )}

            <Separator className="mt-3" />

            {/* Toolbar */}
            <div className="flex items-center gap-1 px-6 py-2 mb-3">
              {postType !== PostType.GolfBuddy && (
                <FormField
                  control={form.control as unknown as Control<PostInputType>}
                  name="feeling_emoji"
                  render={({ field }) => (
                    <Popover open={openEmjoi} onOpenChange={setOpenEmoji}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            'h-9 w-9 rounded-lg hover:bg-muted',
                            { 'p-0': !!field.value }
                          )}
                          tooltip={t('emoji')}
                        >
                          {field.value && emojiUnified ? (
                            <img
                              src={`https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/${emojiUnified}.png`}
                              alt={field.value}
                              width={24}
                              height={24}
                              className="pointer-events-none"
                            />
                          ) : field.value ? (
                            <span className="text-xl leading-none">{field.value}</span>
                          ) : (
                            <Icon name="smile" size={20} className="text-amber-500" />
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent sideOffset={8} style={{ zIndex: 10002 }}>
                        <EmojiPicker
                          onEmojiClick={(emoji) => {
                            field.onChange(emoji.emoji);
                            setEmojiUnified(emoji.unified);
                            setOpenEmoji(false);
                          }}
                          theme={'light' as any}
                          emojiStyle={'apple' as any}
                          skinTonesDisabled
                          previewConfig={{
                            showPreview: false,
                          }}
                          lazyLoadEmojis
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
              )}

              {postType !== PostType.GolfBuddy && (
                <FormField
                  control={form.control as unknown as Control<PostInputType>}
                  name="background_color"
                  render={({ field }) => (
                    <Popover open={openColor} onOpenChange={setOpenColor}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-lg hover:bg-muted"
                          style={{
                            backgroundColor: field.value || undefined,
                          }}
                          tooltip={t('bgColor')}
                        >
                          {field.value ? null : (
                            <Icon name="paint-roller" size={20} className="text-violet-500" />
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent sideOffset={8} className="w-auto p-0">
                        <ColorPicker
                          onChange={(color) => {
                            field.onChange(color.hex);
                            setOpenColor(false);
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
              )}

              {postType !== PostType.GolfBuddy && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-lg hover:bg-muted"
                      count={
                        mediaFiles.length || existingMedia.length
                          ? mediaFiles.length + existingMedia.length
                          : undefined
                      }
                      tooltip={t('media')}
                    >
                      <Icon name="image" size={20} className="text-emerald-500" />
                    </Button>
                  </DialogTrigger>

                  <DialogContent aria-describedby={undefined}>
                    <DialogHeader>
                      <DialogTitle>{t('media')}</DialogTitle>
                    </DialogHeader>

                    {postCase === 'edit' && existingMedia.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold">
                          Existing Media
                        </h4>
                        <div className="flex gap-2 flex-wrap max-h-28 overflow-y-auto mt-2">
                          {existingMedia.map((media) => (
                            <div key={media.file_id} className="relative">
                              {media.mime_type.startsWith('image/') ? (
                                <Image
                                  src={media.url}
                                  alt="Existing media"
                                  width={40}
                                  height={40}
                                  className="w-10 h-10 object-cover rounded"
                                />
                              ) : media.mime_type.startsWith('video/') ? (
                                <video
                                  src={media.url}
                                  preload="metadata"
                                  className="w-10 h-10 object-cover rounded"
                                  controls
                                />
                              ) : null}
                              <Icon
                                size={12}
                                name="close"
                                onClick={() => handleRemoveExistingMedia(media)}
                                className="absolute top-0 right-0 text-black bg-white rounded-full hover:bg-red-600 hover:text-white cursor-pointer"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <FileUploader
                      value={mediaFiles}
                      maxFileCount={100}
                      onValueChange={handleMediaChange}
                      maxSize={MAX_TOTAL_SIZE_BYTES}
                      accept={{
                        'image/*': ['.jpg', '.jpeg', '.png'],
                        'video/*': ['.mp4'],
                      }}
                    />

                    {isOverLimit && (
                      <p className="text-sm text-red-600 mt-2">
                        Total file size must be 200 MB or less. Current:{' '}
                        {(totalSize / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    )}

                    <DialogFooter>
                      <DialogClose
                        asChild
                        onClick={() => {
                          setMediaFiles([]);
                        }}
                      >
                        <Button
                          variant="ghost"
                          className="h-9 rounded-lg px-4 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                        >
                          {t('gc.cancel')}
                        </Button>
                      </DialogClose>

                      <DialogClose asChild>
                        <Button
                          type="button"
                          disabled={isOverLimit}
                          className="h-9 rounded-lg px-6 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                        >
                          {t('attach')}
                          <Icon name="send" size={14} className="ml-1.5" />
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

              {/* Spacer pushes footer buttons to the right */}
              <div className="flex-1" />

              <DialogClose asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-9 rounded-lg px-4 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  onClick={() => {
                    form.reset();
                    setMediaFiles([]);
                    setExistingMedia(postMedia || []);
                    setRemovedMediaIds([]);
                  }}
                >
                  {t('gc.cancel')}
                </Button>
              </DialogClose>
              <Button
                type="submit"
                loading={createPostState.loading || updatePostLoading}
                onClick={(e) => {
                  if (postCase === 'create') {
                    handleCreatePost(form.getValues(), e);
                  } else {
                    handleUpdatePost(form.getValues(), e);
                  }
                }}
                className="h-9 rounded-lg px-6 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
              >
                <div className="flex items-center">
                  {postCase === 'edit' ? 'Update' : t('btn')}
                  {!(createPostState.loading || updatePostLoading) && (
                    <Icon name="send" size={14} className="ml-2" />
                  )}
                </div>
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
