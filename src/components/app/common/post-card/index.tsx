'use client';

import Image from 'next/image';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Icon,
  Skeleton,
} from '@/components/ui';
import {
  cn,
  getName,
  isColorDark,
  getInitials,
  formatNumber,
  useFormattedDate,
  getYouTubeThumbnail,
} from '@/lib/utils';
import type {
  GetBuddyRequestsByPostType,
  GetBuddyRequestsByPostVariablesType,
} from './buddy-requests-dialog/_interface';
import React from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { format, parseISO, differenceInDays, isToday, isTomorrow, isYesterday } from 'date-fns';

/** Parse date_from from API: numeric timestamp (string/number) or ISO string. Returns formatted "d MMM, yyyy" or empty string. */
function formatBuddyDate(value: string | number | undefined): string {
  if (value === undefined || value === null || value === '') return '';
  const num = typeof value === 'number' ? value : Number(value);
  if (Number.isFinite(num)) {
    const d = new Date(num);
    if (Number.isFinite(d.getTime())) return format(d, 'd MMM, yyyy');
  }
  if (typeof value === 'string' && value.length > 0) {
    try {
      const d = parseISO(value);
      if (Number.isFinite(d.getTime())) return format(d, 'd MMM, yyyy');
    } catch {
      const d = new Date(value);
      if (Number.isFinite(d.getTime())) return format(d, 'd MMM, yyyy');
    }
  }
  return '';
}

/** Parse date_from and return a Date object or null */
function parseBuddyDate(value: string | number | undefined): Date | null {
  if (value === undefined || value === null || value === '') return null;
  const num = typeof value === 'number' ? value : Number(value);
  if (Number.isFinite(num)) {
    const d = new Date(num);
    if (Number.isFinite(d.getTime())) return d;
  }
  if (typeof value === 'string' && value.length > 0) {
    try {
      const d = parseISO(value);
      if (Number.isFinite(d.getTime())) return d;
    } catch {
      const d = new Date(value);
      if (Number.isFinite(d.getTime())) return d;
    }
  }
  return null;
}

/** Get relative time string for event date (e.g., "Today", "Tomorrow", "In 5 days") */
function getRelativeEventTime(eventDate: Date | null): string {
  if (!eventDate) return '';

  if (isToday(eventDate)) return 'Today';
  if (isTomorrow(eventDate)) return 'Tomorrow';
  if (isYesterday(eventDate)) return 'Yesterday';

  const days = differenceInDays(eventDate, new Date());

  if (days < 0) {
    return `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} ago`;
  }

  if (days < 7) {
    return `In ${days} day${days === 1 ? '' : 's'}`;
  }

  if (days < 14) {
    return 'Next week';
  }

  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `In ${weeks} week${weeks === 1 ? '' : 's'}`;
  }

  return format(eventDate, 'd MMM, yyyy');
}
import { useAppSelector, useLikePost, usePostMedia, useSendJoinRequest } from '@/lib';
import { useLikePostOptimistic } from '@/lib/hooks/posts/use-like-post-optimistic';
import { PostMediaCarousel } from './media-carousel';
import { useTranslations } from 'next-intl';
import { useQuery } from '@apollo/client/react';
import { GetBuddyRequestsByPost } from './buddy-requests-dialog/_query';
import type { ActivityTypePost, BuddyPost, Post } from '@/lib/definitions';
import { BuddyRequestStatus, PostType, PostVisibility } from '@/lib/constants';
import dynamic from 'next/dynamic';

const PostDialog = dynamic(() =>
  import('./post-modal').then((mod) => mod.PostDialog)
);
const Loading = dynamic(() =>
  import('@/components/common').then((mod) => mod.Loading)
);
const ShareDialog = dynamic(() =>
  import('@/components/common').then((mod) => mod.ShareDialog)
);
const PostCardSkeleton = dynamic(() =>
  import('./post-card-skeleton').then((mod) => mod.PostCardSkeleton)
);
function CommentsSectionSkeleton() {
  return (
    <div className="px-3 transition-all duration-300 overflow-hidden h-100">
      <div className="h-80 mb-3 border-t py-1 pr-2">
        <div className="flex flex-col gap-4 px-1">
          <div className="flex gap-2 items-center">
            <Skeleton className="aspect-square w-10 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="w-20 h-4" />
              <Skeleton className="w-40 h-3" />
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <Skeleton className="aspect-square w-10 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="w-20 h-4" />
              <Skeleton className="w-40 h-3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const PostComments = dynamic(
  () => import('./comments').then((mod) => mod.PostComments),
  {
    loading: () => <CommentsSectionSkeleton />,
  }
);
const PostOptions = dynamic(() =>
  import('./post-options').then((mod) => mod.PostOptions)
);
const BuddyRequestsDialog = dynamic(() =>
  import('./buddy-requests-dialog').then((mod) => mod.BuddyRequestsDialog)
);
const LinkPreview = dynamic(() =>
  import('./link-preview').then((mod) => mod.LinkPreview)
);
const TagsDisplay = dynamic(() =>
  import('./tags-display').then((mod) => ({ default: mod.TagsDisplay }))
);

interface PostCardProps {
  post: Post | ActivityTypePost;
  type?: 'default' | 'circle';
  /** When true, show "Unsave" in options (e.g. on Saved posts page). */
  forceSaved?: boolean;
}

interface BuddyPostCardProps {
  post: BuddyPost;
  type?: 'default' | 'circle';
  /** When true, hide the map in the card (e.g. on Buddies page Today/Upcoming listing). */
  hideMap?: boolean;
  /** When true, show "View Post" in options menu instead of "Edit" (e.g. on Buddies page). */
  showViewPostInMenu?: boolean;
}

type OpenState = {
  title: string | '';
  data: string[] | [];
};

const PostCard = React.forwardRef<HTMLDivElement, PostCardProps>(
  ({ post: postData, type = 'default', forceSaved = false }, ref) => {
    const { likePost, status: likePostStatus } = useLikePost();
    const { updateLikeInCache } = useLikePostOptimistic();
    const { getPostMedia, status: postMediaStatus } = usePostMedia();
    const { sendJoinRequest, status: sendJoinRequestStatus } = useSendJoinRequest();
    const [buddyRequestsOpen, setBuddyRequestsOpen] =
      React.useState<boolean>(false);
    const myInfo = useAppSelector((state) => state.auth.user);
    const [modal, setModal] = React.useState<OpenState>({
      title: '',
      data: [],
    });

    const [commentsOpen, setCommentsOpen] = React.useState<boolean>(false);
    const [read, setRead] = React.useState<boolean>(false);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [likes, setLikes] = React.useState<number>(
      postData.user_likes?.length as number
    );
    const [likeByMe, setLikeByMe] = React.useState<boolean>(
      (myInfo?.userid && postData?.user_likes?.includes(myInfo.userid)) || false
    );

    const t = useTranslations('profilePage.posts');
    const formattedDate = useFormattedDate();

    const postUserId =
      type === 'circle' ? postData?.friend_id : postData?.user_id;

    const isGolfBuddyPost = postData?.type === PostType.GolfBuddy;
    const { data: buddyRequestsData, refetch: refetchBuddyRequests } =
      useQuery<
        GetBuddyRequestsByPostType,
        GetBuddyRequestsByPostVariablesType
      >(GetBuddyRequestsByPost, {
        fetchPolicy: 'cache-first',
        skip: !isGolfBuddyPost || !postData?.postid || !postUserId,
        variables: {
          postId: postData?.postid ?? '',
          post_user_id: postUserId ?? '',
          page: 1,
        },
      });

    const hasCurrentUserRequested = React.useMemo(() => {
      if (!myInfo?.userid || !buddyRequestsData?.getBuddyPostRequestByUser)
        return false;
      return buddyRequestsData.getBuddyPostRequestByUser.some(
        (req) =>
          req.user_id === myInfo.userid ||
          req.userInfo?.userid === myInfo.userid
      );
    }, [myInfo?.userid, buddyRequestsData?.getBuddyPostRequestByUser]);

    const golfCourse = React.useMemo(() => {
      if (!postData.golfcourse_json) return;
      const [id, name, lat, lng] = postData.golfcourse_json?.split(',');
      return {
        id,
        name,
        lat: Number(lat),
        lng: Number(lng),
      };
    }, [postData.golfcourse_json]);

    const descriptionContent = React.useMemo(
      () => parseMentions(postData.description || ''),
      [postData.description]
    );

    const firstUrl = React.useMemo(
      () => postData.description ? extractFirstUrl(postData.description) : null,
      [postData.description]
    );

    // Only fetch media if the post has media (has_media flag)
    React.useEffect(() => {
      if (
        postData.postid &&
        (postData.friend_id || postData.user_id) &&
        postData.has_media === true
      ) {
        const postId = postData.shared_of_user_id ? postData.shared_by_postid! : postData.postid;
        getPostMedia({
          variables: { postId: postId },
        });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [postData.postid, postData.friend_id, postData.user_id, postData.has_media]);

    if (!postData) return <PostCardSkeleton />;

    return (
      <Card
        className={cn(
          "bg-card/50 overflow-hidden",
          "transition-shadow duration-300 ease-out",
          "hover:shadow-lg hover:shadow-primary/5",
          {
            "ring-1 ring-primary/20": postData.type === PostType.GolfBuddy
          }
        )}
        style={{
          backgroundColor: postData.background_color && postData.background_color !== 'transparent' ? postData.background_color : undefined,
        }}
        ref={ref}
      >
        {isLoading && (
          <div className="absolute inset-0 bg-background/80 z-50 flex items-center justify-center">
            <Loading iconSize={25} iconColor="primary" />
          </div>
        )}

        <CardHeader
          className={cn(
            'flex flex-row space-y-0 items-center justify-between p-4 pb-2',
            {
              'bg-primary/5': postData.type === PostType.GolfBuddy,
            }
          )}
        >
          <div className="flex gap-3 items-center">
            {postData?.type === PostType.News ? (
              <Avatar className="w-10 h-10 border border-primary/10">
                <AvatarImage
                  src={'https://golf-app-asserts.b-cdn.net/users/9086f7a9-2322-4c85-963b-24e76023621b/profile/7620aeb2-6a15-4df8-98f0-4f4fb3981a72.jpg'}
                  alt="Youtube"
                />
                <AvatarFallback>{getInitials(postData?.youtube_channel_name)}</AvatarFallback>
              </Avatar>
            ) : (
              <Link href={`/profile/${postData?.userInfo?.userid}`} prefetch={false}>
                <Avatar className="w-10 h-10 border border-primary/10 ring-2 ring-primary/5 transition-transform hover:scale-105">
                  <AvatarImage src={postData.userInfo?.photo_profile} alt="" />
                  <AvatarFallback className="bg-primary/20 text-primary">
                    {getInitials(postData.userInfo?.first_name, postData.userInfo?.last_name)}
                  </AvatarFallback>
                </Avatar>
              </Link>
            )}


            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm tracking-tight">
                  {postData.type === PostType.News ? (
                    <span className="text-foreground">{postData?.youtube_channel_name}</span>
                  ) : (
                    <Link href={`/profile/${postData?.userInfo?.userid}`} prefetch={false} className="text-foreground hover:text-primary transition-colors">
                      {getName(postData.userInfo?.first_name, postData.userInfo?.last_name)}
                    </Link>
                  )}
                </h4>
                {
                  postData?.feeling_emoji && <>{renderEmojis(postData.feeling_emoji, 'feeling')}</>
                }
                {postData.shared_of_user_id && postData.sharedOfUserInfo && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Icon name="share" size={12} className="rotate-12" />
                    <span>shared post of</span>
                    <Link href={`/profile/${postData.shared_of_user_id}`} className="font-semibold text-primary hover:underline">
                      {getName(postData.sharedOfUserInfo.first_name, postData.sharedOfUserInfo.last_name)}
                    </Link>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground tracking-widest font-medium">
                {formattedDate(postData.created!)?.toLowerCase()}
              </p>
            </div >
          </div >

          <div className="flex items-center gap-1">
            {postData?.type !== PostType.News && (
              <PostOptions
                trigger={
                  <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary">
                    <Icon name="more" size={18} />
                  </Button>
                }
                postData={postData}
                setLoad={setIsLoading}
                postUserId={postUserId}
                postMedia={postMediaStatus.data?.getPostMediaByPostId}
                forceSaved={forceSaved}
              />
            )}
          </div>
        </CardHeader >

        <CardContent className="px-0 pb-0 pt-2">
          <div className="px-4 mb-4">
            <p className={cn("text-sm leading-relaxed text-foreground/90 break-words", read ? '' : 'line-clamp-6')}>
              {descriptionContent}
            </p>
            {(postData?.description?.length ?? 0) > 400 && (
              <button
                className="text-primary text-xs font-bold mt-2 hover:underline tracking-tight"
                onClick={() => setRead(!read)}
              >
                {read ? 'Show less' : 'Read more...'}
              </button>
            )}
          </div>

          {firstUrl && (
            <div className="px-4 mb-4">
              <LinkPreview url={firstUrl} />
            </div>
          )}

          {((postData.user_tags?.length ?? 0) > 0 || (postData.group_tags?.length ?? 0) > 0) && (
            <TagsDisplay userTags={postData.user_tags} groupTags={postData.group_tags} />
          )}

          {postData?.type === PostType.GolfBuddy && (
            <div className="mx-4 mb-4 p-4 rounded-xl bg-primary/5 border border-primary/10 flex justify-between items-center group transition-all hover:bg-primary/10">
              <div className="space-y-1">
                <div className="text-xs flex items-center gap-2">
                  <span className="text-muted-foreground uppercase tracking-wider font-bold text-[10px]">Spots:</span>
                  <span className="font-bold text-foreground">{postData.tee_time}</span>
                </div>
                <div className="text-xs flex items-center gap-2">
                  <span className="text-muted-foreground uppercase tracking-wider font-bold text-[10px]">Date:</span>
                  <span className="font-bold text-foreground">
                    {postData?.date_from && format(new Date(Number(postData.date_from)), 'd MMM, yyyy')}
                  </span>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setBuddyRequestsOpen(true)}
                className="text-xs font-semibold text-primary border-transparent rounded-lg px-4 hover:bg-primary/10 hover:border-primary/30 transition-all duration-200"
              >
                View Buddies
              </Button>
            </div>
          )}

          {postData?.type === PostType.News && (
            <Link
              href={postData?.youtube_url ?? ''}
              target="youtubePlayer"
              className="block mx-4 mb-4 aspect-video rounded-xl overflow-hidden relative group"
            >
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all z-10 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-2xl scale-90 group-hover:scale-100 transition-transform">
                  <div className="w-0 h-0 border-y-[10px] border-y-transparent border-l-[18px] border-l-white ml-1" />
                </div>
              </div>
              {getYouTubeThumbnail(postData?.youtube_url as string) ? (
                <Image
                  src={getYouTubeThumbnail(postData?.youtube_url as string)}
                  alt="youtube"
                  fill
                  sizes="(max-width: 768px) 100vw, 600px"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="absolute inset-0 bg-muted" />
              )}
              <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center gap-2">
                <span className="px-3 py-1.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider rounded-lg flex gap-2 items-center">
                  Watch on YouTube <Icon name="link-arrow" size={10} />
                </span>
              </div>
            </Link>
          )}

          {!!golfCourse && (
            <Link
              href={`https://www.google.com/maps?q=${golfCourse?.lat},${golfCourse?.lng}`}
              target="_blank"
              className="mx-4 mb-3 p-3 flex items-center gap-3 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-all"
            >
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Icon name="location" size={18} />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Golf Course</p>
                <p className="text-sm font-bold text-foreground">{golfCourse.name}</p>
              </div>
            </Link>
          )}

          {(postData.has_media || !!golfCourse) &&
            (postMediaStatus.loading ||
              !!postMediaStatus.data?.getPostMediaByPostId?.length ||
              !!golfCourse) && (
              <div className={cn(
                'px-4 mb-4 w-full',
                postData.has_media && postMediaStatus.loading && 'min-h-[240px]'
              )}>
                {postData.has_media && postMediaStatus.loading ? (
                  <Skeleton className="w-full aspect-video min-h-[240px] rounded-xl" />
                ) : (
                  <PostMediaCarousel
                    media={postMediaStatus.data?.getPostMediaByPostId || []}
                    mapPosition={golfCourse}
                  />
                )}
              </div>
            )}
        </CardContent>

        {
          postData.type !== PostType.News && postData.type !== PostType.GolfBuddy && (
            <CardFooter
              className="flex flex-col p-2 gap-2 border-t border-border/50"
            >
              <div className="grid grid-cols-3 gap-2 w-full px-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-9 px-3 gap-2 rounded-xl transition-all",
                      likeByMe ? "text-primary bg-primary/5" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    onClick={async () => {
                      const currentLikes = likes || 0;
                      const newLikes = likeByMe ? Math.max(0, currentLikes - 1) : currentLikes + 1;
                      const nextLikeByMe = !likeByMe;
                      const postId = postData.postid ?? '';

                      // Optimistic: Update local state + cache immediately
                      setLikes(newLikes);
                      setLikeByMe(nextLikeByMe);
                      updateLikeInCache(postId, nextLikeByMe);

                      try {
                        await likePost({
                          variables: {
                            postCreatorId: type === 'circle' ? postData.friend_id! : postData.user_id!,
                            createdAt: postData.created!,
                          },
                        });
                      } catch (error) {
                        // Rollback: Restore local state + cache
                        setLikes(currentLikes);
                        setLikeByMe(likeByMe);
                        updateLikeInCache(postId, likeByMe);
                        console.error(error);
                        toast.error('Failed to like post');
                      } finally {
                        likePostStatus.reset();
                      }
                    }}
                  >
                    <Icon
                      name="heart"
                      size={18}
                      className={cn(likeByMe ? "fill-current" : "")}
                    />
                    <span className="text-sm font-bold">{formatNumber(likes)}</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 px-3 gap-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                    onClick={() => setCommentsOpen(!commentsOpen)}
                  >
                    <Icon name="message" size={18} />
                    <span className="text-sm font-bold">{formatNumber(postData?.comment_count ?? 0)}</span>
                  </Button>

                  <ShareDialog
                    shareUrl="https://golfguiders.com/"
                    sharePost
                    postProps={{
                      postUserId: postUserId!,
                      createdAt: postData.created!,
                      lat: myInfo?.latitude ?? postData.latitude ?? 0,
                      lng: myInfo?.longitude ?? postData.longitude ?? 0,
                      visibility: PostVisibility.Circle,
                    }}
                    trigger={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-full rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all col-span-1"
                      >
                        <Icon name="share" size={18} />
                      </Button>
                    }
                  />
                </div>
            </CardFooter>
          )
        }

        {
          postData.type === PostType.GolfBuddy &&
                postUserId !== myInfo?.userid &&
                Date.now() < Number(postData.date_from) && (
                  <div className="px-2 pb-2 w-full">
                    <Button
                      className="w-full h-11 rounded-xl text-sm font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all"
                      onClick={async () => {
                        try {
                          const { data } = await sendJoinRequest({
                            variables: {
                              requestInput: {
                                post_id: postData.postid!,
                                post_user_id: postUserId!,
                                post_created: postData.created!,
                              },
                            },
                          });
                          if (data) {
                            toast.success("Request to join buddy event has been sent");
                            refetchBuddyRequests().catch(() => { });
                          }
                        } catch (error: any) {
                          const message =
                            error?.graphQLErrors?.[0]?.message ||
                            error?.message ||
                            'Failed to send request';
                          toast.error(message);
                        }
                      }}
                      loading={sendJoinRequestStatus.loading}
                      disabled={hasCurrentUserRequested || !!sendJoinRequestStatus.data}
                    >
                      {hasCurrentUserRequested || !!sendJoinRequestStatus.data ? 'Requested' : 'Join as Buddy'}
                    </Button>
                  </div>
                )}
        <PostDialog
          open={Boolean((modal?.data?.length ?? 0) > 0)}
          setOpen={setModal}
          data={modal}
        />

        <PostComments
          open={commentsOpen}
          postCreated={postData?.created ?? ''}
          postId={postData.postid ?? ''}
          postUserId={postUserId ?? ''}
        />

        <BuddyRequestsDialog
          open={buddyRequestsOpen}
          onOpenChange={setBuddyRequestsOpen}
          postData={postData}
          postUserId={postUserId!}
        />
      </Card >
    );
  }
);

const BuddyPostCard = React.forwardRef<HTMLDivElement, BuddyPostCardProps>(
  ({ post: postData, hideMap = false, showViewPostInMenu = false }, ref) => {
    const { getPostMedia, status: postMediaStatus } = usePostMedia();
    const t = useTranslations('profilePage.posts');
    const formattedDate = useFormattedDate();
    const [read, setRead] = React.useState<boolean>(false);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [buddyRequestsOpen, setBuddyRequestsOpen] =
      React.useState<boolean>(false);

    const { data, loading } = useQuery<
      GetBuddyRequestsByPostType,
      GetBuddyRequestsByPostVariablesType
    >(GetBuddyRequestsByPost, {
      fetchPolicy: 'cache-first',
      skip: showViewPostInMenu || !postData.post_id,
      variables: {
        postId: postData.post_id,
        post_user_id: postData?.user_id,
        page: 1,
      },
    });

    // Fetch media for buddy posts (BuddyPost doesn't have has_media field consistently from API)
    React.useEffect(() => {
      if (postData.post_id) {
        getPostMedia({
          variables: { postId: postData.post_id! },
        });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [postData.post_id]);

    const golfCourse = React.useMemo(() => {
      if (!postData.golfcourse_json) return;
      const [id, name, lat, lng] = postData.golfcourse_json?.split(',');
      return {
        id,
        name,
        lat: Number(lat),
        lng: Number(lng),
      };
    }, [postData.golfcourse_json]);

    const descriptionContent = React.useMemo(
      () => parseMentions(postData?.description || ''),
      [postData?.description]
    );

    const firstUrl = React.useMemo(
      () => postData?.description ? extractFirstUrl(postData.description) : null,
      [postData?.description]
    );

    const eventDate = React.useMemo(
      () => parseBuddyDate(postData?.date_from),
      [postData?.date_from]
    );

    const relativeTime = React.useMemo(
      () => getRelativeEventTime(eventDate),
      [eventDate]
    );

    if (!postData) return <PostCardSkeleton />;

    const user = postData.userInfo;
    const isDark = isColorDark('');
    const textColor = isDark ? 'text-white' : 'text-black';
    const headColor = isDark ? 'text-primary' : 'text-primary';

    return (
      <Card
        className={cn(
          "bg-card overflow-hidden rounded-2xl",
          "border border-border/60",
          "shadow-sm",
          "transition-all duration-300 ease-out",
          "hover:shadow-lg hover:-translate-y-0.5",
          "hover:border-primary/25"
        )}
        style={{
          color: textColor,
          position: 'relative',
        }}
        ref={ref}
      >
        {isLoading && (
          <div className="absolute inset-0 bg-background/80 z-50 flex items-center justify-center rounded-2xl">
            <Loading iconSize={25} iconColor="primary" />
          </div>
        )}
        <CardHeader
          className={cn(
            'flex flex-row space-y-0 items-center justify-between p-4 pb-2',
          )}
        >
          <div className="flex gap-3 items-center">
            <Link href={`/profile/${postData?.user_id}`} prefetch={false}>
              <Avatar className="w-10 h-10 border border-primary/10 ring-2 ring-primary/5 transition-transform hover:scale-105">
                <AvatarImage src={user?.photo_profile} alt="" />
                <AvatarFallback className="bg-primary/20 text-primary">
                  {getInitials(user?.first_name, user?.last_name)}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <Link href={`/profile/${postData?.user_id}`} prefetch={false}>
                <h4 className="font-bold text-sm tracking-tight text-foreground hover:text-primary transition-colors">
                  {getName(user?.first_name, user?.last_name)}
                </h4>
              </Link>
              <p className="text-[10px] text-muted-foreground tracking-widest font-medium">
                {formattedDate(postData.created!)?.toLowerCase()}
              </p>
            </div>
          </div>

          <PostOptions
            trigger={
              <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary">
                <Icon name="more" size={18} />
              </Button>
            }
            postData={postData}
            postUserId={postData?.post_user_id ?? postData?.user_id}
            setLoad={setIsLoading}
            optionsVariant={showViewPostInMenu ? 'buddiesListing' : 'default'}
          />
        </CardHeader>
        <CardContent className="px-0 pb-0 pt-2">
          {!!postData?.description && (
            <div className="px-4 mb-2">
              <p className={cn("text-sm leading-relaxed text-foreground/90 break-words", read ? '' : 'line-clamp-6')}>
                {descriptionContent}
              </p>
              {(postData?.description?.length ?? 0) > 400 && (
                <button
                  className="text-primary text-xs font-bold mt-2 hover:underline tracking-tight"
                  onClick={() => setRead(!read)}
                >
                  {read ? 'Show less' : 'Read more...'}
                </button>
              )}
            </div>
          )}

          {firstUrl && (
            <div className="px-4 mb-4">
              <LinkPreview url={firstUrl} />
            </div>
          )}

          {((postData.user_tags?.length ?? 0) > 0 || (postData.group_tags?.length ?? 0) > 0) && (
            <TagsDisplay userTags={postData.user_tags} groupTags={postData.group_tags} />
          )}

          {!showViewPostInMenu && (
            <div className="flex items-center justify-between text-sm px-4 mb-2">
              <div className="flex items-center gap-2">
                {loading ? (
                  <div className="flex -space-x-2 overflow-hidden">
                    <Skeleton className="size-8 inline-block aspect-square rounded-full" />
                    <Skeleton className="size-8 inline-block aspect-square rounded-full" />
                    <Skeleton className="size-8 inline-block aspect-square rounded-full" />
                  </div>
                ) : (
                  <div className="flex -space-x-2">
                    {data?.getBuddyPostRequestByUser
                      ?.filter((v) => v?.status === BuddyRequestStatus.Accepted)
                      ?.slice(0, 10)
                      ?.map((v) => (
                        <Link
                          href={`/profile/${postData?.user_id}`}
                          prefetch={false}
                          key={v?.created}
                        >
                          <Image
                            src={v?.userInfo?.photo_profile || ''}
                            alt=""
                            width={32}
                            height={32}
                            className="size-8 inline-block rounded-full ring-2 ring-white object-cover"
                          />
                        </Link>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mx-4 mb-4 p-4 rounded-xl bg-muted/30 border border-border/40">
            {/* Top row: Date + Info */}
            <div className="flex items-start gap-3 mb-3">
              {/* Date badge */}
              {eventDate && (
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex flex-col items-center justify-center border border-primary/15">
                    <span className="text-xl font-bold leading-none text-primary">
                      {format(eventDate, 'd')}
                    </span>
                    <span className="text-[9px] font-semibold uppercase tracking-wide text-primary/70 mt-0.5">
                      {format(eventDate, 'MMM')}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex-1 min-w-0">
                {/* Relative time indicator */}
                {relativeTime && (
                  <div className="flex items-center gap-1.5 mb-2 mt-2">
                    <Icon name="calendar" size={13} className="text-muted-foreground" />
                    <span className="text-xs font-semibold text-muted-foreground">
                      {relativeTime}
                    </span>
                  </div>
                )}

                {/* Spots info */}
                <div className="flex items-center gap-1.5">
                  <Icon name="users" size={13} className="text-muted-foreground" />
                  <span className="text-xs font-medium text-foreground">
                    {(() => {
                      const spots = postData.tee_time;
                      if (!spots || spots === '' || spots === 'undefined' || spots === 'null') {
                        return 'No spots available';
                      }
                      const count = Number(spots);
                      if (!Number.isFinite(count) || count < 0) {
                        return 'No spots available';
                      }
                      return `${spots} ${count === 1 ? 'spot' : 'spots'} available`;
                    })()}
                  </span>
                </div>
              </div>
            </div>

            {/* Golf Course - integrated */}
            {!!golfCourse && (
              <Link
                href={`https://www.google.com/maps?q=${golfCourse?.lat},${golfCourse?.lng}`}
                target="_blank"
                className="flex items-center gap-2.5 p-2.5 rounded-lg bg-background hover:bg-muted/60 border border-border/40 transition-all duration-200 mb-3 group"
              >
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/15">
                  <Icon name="location" size={14} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">
                    Golf Course
                  </p>
                  <p className="text-xs font-semibold text-foreground truncate">
                    {golfCourse.name}
                  </p>
                </div>
                <Icon name="link-arrow" size={12} className="text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </Link>
            )}

            {/* View Buddies button */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setBuddyRequestsOpen(true)}
              className="h-8 text-xs font-medium rounded-lg border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/30 transition-all duration-200"
            >
              <Icon name="users" size={13} className="mr-1.5" />
              View Buddies
            </Button>
          </div>

          {((!!golfCourse && !hideMap) || postData.post_id) &&
            (postMediaStatus.loading ||
              !!postMediaStatus.data?.getPostMediaByPostId?.length ||
              (!!golfCourse && !hideMap)) && (
              <div className={cn(
                'px-4 mb-4 w-full',
                postMediaStatus.loading && (!!golfCourse && !hideMap ? 'h-44' : 'min-h-[240px]')
              )}>
                {postMediaStatus.loading ? (
                  (!!golfCourse && !hideMap) ? (
                    <Skeleton className="w-full h-44 rounded-xl" />
                  ) : (
                    <Skeleton className="w-full aspect-video min-h-[240px] rounded-xl" />
                  )
                ) : (
                  <PostMediaCarousel
                    media={postMediaStatus.data?.getPostMediaByPostId || []}
                    mapPosition={hideMap ? undefined : golfCourse}
                  />
                )}
              </div>
            )}
        </CardContent>
        {/* {postData?.type === PostType.GolfBuddy && ( */}
        <BuddyRequestsDialog
          open={buddyRequestsOpen}
          onOpenChange={setBuddyRequestsOpen}
          postData={postData}
          postUserId={postData?.user_id}
        />
        {/* )} */}
      </Card>
    );
  }
);

PostCard.displayName = 'PostCard';
BuddyPostCard.displayName = 'BuddyPostCard';

const MemoizedPostCard = React.memo(PostCard);
const MemoizedBuddyPostCard = React.memo(BuddyPostCard);
MemoizedPostCard.displayName = 'PostCard';
MemoizedBuddyPostCard.displayName = 'BuddyPostCard';

export { MemoizedPostCard as PostCard, MemoizedBuddyPostCard as BuddyPostCard };

export * from './post-card-skeleton';

// Helper function to extract the first URL from text
const extractFirstUrl = (text: string): string | null => {
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*)/i;
  const match = text.match(urlRegex);
  if (match) {
    let url = match[0];
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    return url;
  }
  return null;
};

// Regex that matches emoji sequences (including ZWJ sequences, skin tones, flags, keycaps, etc.)
const emojiRegex = /(?:\p{RI}\p{RI}|\p{Emoji_Presentation}(?:\u200D\p{Emoji_Presentation}|\uFE0F?\u20E3|\p{Emoji_Modifier})*(?:\u200D(?:\p{Emoji_Presentation}|\p{Extended_Pictographic})(?:\p{Emoji_Modifier})?)*|\p{Extended_Pictographic}\uFE0F?(?:\u200D(?:\p{Emoji_Presentation}|\p{Extended_Pictographic})\uFE0F?)*)/gu;

const emojiToUnified = (emoji: string): string =>
  [...emoji].map((c) => c.codePointAt(0)!.toString(16).padStart(4, '0')).join('-');

const renderEmojis = (text: string, keyPrefix: string): React.ReactNode[] => {
  const parts: React.ReactNode[] = [];
  let lastIdx = 0;
  let m;
  let i = 0;
  emojiRegex.lastIndex = 0;
  while ((m = emojiRegex.exec(text)) !== null) {
    if (m.index > lastIdx) {
      parts.push(text.slice(lastIdx, m.index));
    }
    const unified = emojiToUnified(m[0]);
    parts.push(
      <img
        key={`${keyPrefix}-em-${i++}`}
        src={`https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/${unified}.png`}
        alt={m[0]}
        width={18}
        height={18}
        className="inline-block align-text-bottom mx-px"
        loading="lazy"
        onError={(e) => {
          // Fallback to native character if image not found
          const span = document.createElement('span');
          span.textContent = m![0];
          (e.target as HTMLElement).replaceWith(span);
        }}
      />
    );
    lastIdx = m.index + m[0].length;
  }
  if (lastIdx < text.length) {
    parts.push(text.slice(lastIdx));
  }
  return parts.length > 0 ? parts : [text];
};

// Helper function to parse URLs in text and convert them to clickable links
const parseUrls = (text: string, keyPrefix: string): React.ReactNode[] => {
  if (text == null || typeof text !== 'string') return [''];
  // URL regex pattern that matches http, https, www, and common URL formats
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*)/gi;

  const result: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let keyCounter = 0;

  while ((match = urlRegex.exec(text)) !== null) {
    const [fullMatch] = match;
    const matchIndex = match.index;

    // Add text before the URL (with emoji rendering)
    if (matchIndex > lastIndex) {
      result.push(...renderEmojis(text.slice(lastIndex, matchIndex), `${keyPrefix}-txt-${keyCounter}`));
    }

    // Normalize URL (add https:// if missing)
    let url = fullMatch;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }

    result.push(
      <a
        key={`${keyPrefix}-url-${keyCounter++}`}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline hover:text-primary/80 break-all"
      >
        {fullMatch}
      </a>
    );

    lastIndex = matchIndex + fullMatch.length;
  }

  // Add remaining text (with emoji rendering)
  if (lastIndex < text.length) {
    result.push(...renderEmojis(text.slice(lastIndex), `${keyPrefix}-end`));
  }

  return result.length > 0 ? result : renderEmojis(text, `${keyPrefix}-full`);
};

export const parseMentions = (text: string): React.ReactNode[] => {
  if (text == null || typeof text !== 'string') return [''];
  const regex = /(?:\{@\}|\@|\#|\&)\[([^\]]+)\]\(([^)]+)\)/g;

  const result: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let keyCounter = 0;

  while ((match = regex.exec(text)) !== null) {
    const [fullMatch, label, id] = match;
    const matchIndex = match.index;

    // Parse URLs in text before the mention
    if (matchIndex > lastIndex) {
      const textBefore = text.slice(lastIndex, matchIndex);
      const parsedUrls = parseUrls(textBefore, `mention-${keyCounter}`);
      result.push(...parsedUrls);
    }

    const symbol = fullMatch.startsWith('{@}') ? '@' : fullMatch[0];

    const baseHref =
      symbol === '@'
        ? `/profile/${id}`
        : symbol === '#'
          ? `/tag/${id}`
          : `/group/${id}`;

    result.push(
      <Link
        key={`mention-${id}-${keyCounter++}`}
        href={baseHref}
        className="text-primary font-semibold"
      >
        {symbol}
        {label}
      </Link>
    );

    lastIndex = matchIndex + fullMatch.length;
  }

  // Parse URLs in remaining text after all mentions
  if (lastIndex < text.length) {
    const textAfter = text.slice(lastIndex);
    const parsedUrls = parseUrls(textAfter, `mention-final`);
    result.push(...parsedUrls);
  }

  // If no mentions found, just parse URLs in the entire text
  if (result.length === 0) {
    return parseUrls(text, 'no-mentions');
  }

  return result;
};
