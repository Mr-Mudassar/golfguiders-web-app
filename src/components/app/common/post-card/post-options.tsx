import {
  Icon,
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@/components/ui';
import { toast } from 'sonner';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PostType } from '@/lib/constants';
import { useQueryClient } from '@tanstack/react-query';
import { setSavedList } from '@/lib/redux/slices';
import { useAppDispatch, useAppSelector, useSavePostActions, useDeletePostAction, useReportContentAction, useFriends } from '@/lib';
import type { BuddyPost, Post, PostMedias } from '@/lib/definitions';
import { setBlockList } from '@/lib/redux/slices';
import dynamic from 'next/dynamic';

const ConfirmationModal = dynamic(() =>
  import('@/components/common/confirmationDialog').then(
    (mod) => mod.ConfirmationModal
  )
);
const CreatePostDialog = dynamic(() =>
  import('@/components/app/common').then((mod) => mod.CreatePostDialog)
);
const Loading = dynamic(() =>
  import('@/components/common').then((mod) => mod.Loading)
);
const ReportPostDialog = dynamic(() =>
  import('./report-post-dialog').then((mod) => mod.ReportPostDialog)
);
const ViewPostModal = dynamic(() =>
  import('./view-post-modal').then((mod) => mod.ViewPostModal)
);
interface CachedPostsData {
  pageParams: number[];
  pages: Post[][];
}

interface InfinitePostsCache {
  pages: (Post | BuddyPost)[][];
  pageParams?: unknown[];
}

/** 'buddiesListing' = on Buddies page Today/Upcoming: show View Post instead of Edit, open modal. */
type PostOptionsVariant = 'default' | 'buddiesListing';

interface PostOptionsProps {
  trigger: React.ReactNode;
  postData: Post | BuddyPost;
  postUserId?: string;
  setLoad?: React.Dispatch<React.SetStateAction<boolean>>;
  postMedia?: PostMedias[];
  optionsVariant?: PostOptionsVariant;
  /** When true, treat post as saved and show "Unsave" (e.g. on Saved posts page). */
  forceSaved?: boolean;
}

const PostOptions: React.FC<PostOptionsProps> = ({
  trigger,
  setLoad,
  postMedia,
  postUserId,
  postData: postDataSet,
  optionsVariant = 'default',
  forceSaved = false,
}) => {
  const postData = React.useMemo(() => ({
    ...postDataSet,
    post_activity_created: (postDataSet as Post)?.post_activity_created,
    postid:
      (postDataSet as Post)?.postid ?? (postDataSet as BuddyPost)?.post_id,
  }), [postDataSet]);
  const { savePost, unSavePost, status: saveStatuses } = useSavePostActions();
  const { deletePost, status: deletePostStatus } = useDeletePostAction();
  const { reportContent, status: reportContentStatus } = useReportContentAction();
  const friends = useFriends();
  const client = useQueryClient();
  const dispatch = useAppDispatch();
  const t = useTranslations('savedFavPage');
  const auth = useAppSelector((state) => state.auth?.user);
  const savedPosts = useAppSelector((s) => s.user.savedPosts);
  const blockedUsers = useAppSelector((s) => s.user.blockedUsers);
  const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] =
    useState<boolean>(false);
  const [showBlockConfirmationModal, setShowBlockConfirmationModal] =
    useState<boolean>(false);
  const [editPostOpen, setEditPostOpen] = React.useState<boolean>(false);
  const [showReportDialog, setShowReportDialog] = React.useState<boolean>(false);
  const [viewPostOpen, setViewPostOpen] = React.useState<boolean>(false);

  const isBlocked = blockedUsers?.includes(postUserId || '');

  const editPostDetails = React.useMemo(() => ({
    postId: postData?.postid,
    userId: postData?.user_id,
    created: postData?.created,
    postUserTags: postData?.user_tags,
    postGroupTags: postData?.group_tags,
  }), [postData?.postid, postData?.user_id, postData?.created, postData?.user_tags, postData?.group_tags]);

  // -------------------------------
  // 🔥 Utility: Update Cached Posts (saved list page)
  // -------------------------------
  const updateCache = (
    key: string[],
    post: Post,
    action: 'add' | 'remove',
    type: 'save' | 'fav'
  ) => {
    client.setQueryData<CachedPostsData>(key, (oldData) => {
      if (!oldData) return oldData;

      if (type === 'save') {
        dispatch(setSavedList({ action, postId: post?.postid ?? '' }));
      }

      // Favorite functionality removed
      const updatedPages =
        action === 'add'
          ? oldData.pages.map((page, i) => (i === 0 ? [post, ...page] : page))
          : oldData.pages.map((page) =>
              page.filter((p) => p.postid !== post.postid)
            );

      return {
        ...oldData,
        pages: updatedPages,
      };
    });
  };

  // Update only this post's saved state in all posts feeds (no refetch).
  // Cache update first so feed doesn't flash; Redux deferred to avoid first-interaction remount/refetch.
  const updatePostSavedInFeedCache = React.useCallback(
    (postId: string, saved: boolean) => {
      const userId = auth?.userid;
      if (!userId) return;

      client.setQueriesData<InfinitePostsCache>(
        { queryKey: ['posts'] },
        (oldData) => {
          if (!oldData?.pages) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page) =>
              page.map((p) => {
                const id = (p as Post).postid ?? (p as BuddyPost).post_id;
                if (id !== postId) return p;
                const post = p as Post;
                const userSaves = Array.isArray(post.user_saves) ? [...post.user_saves] : [];
                const hasUser = userSaves.includes(userId);
                if (saved && !hasUser) userSaves.push(userId);
                if (!saved && hasUser) {
                  const i = userSaves.indexOf(userId);
                  if (i !== -1) userSaves.splice(i, 1);
                }
                return { ...post, user_saves: userSaves };
              })
            ),
          };
        }
      );
      // Defer Redux so cache update is rendered first; avoids feed remount/refetch on first save
      queueMicrotask(() => {
        dispatch(setSavedList({ action: saved ? 'add' : 'remove', postId }));
      });
    },
    [auth?.userid, client, dispatch]
  );

  // Remove one post from all posts feeds (for delete – no refetch)
  const removePostFromFeedCache = React.useCallback(
    (postId: string) => {
      client.setQueriesData<InfinitePostsCache>(
        { queryKey: ['posts'] },
        (oldData) => {
          if (!oldData?.pages) return oldData;
          return {
            ...oldData,
            pages: oldData.pages
              .map((page) =>
                page.filter(
                  (p) =>
                    (p as Post).postid !== postId &&
                    (p as BuddyPost).post_id !== postId
                )
              )
              .filter((page) => page.length > 0),
          };
        }
      );
    },
    [client]
  );

  const isSaved =
    forceSaved ||
    savedPosts?.includes(postData?.postid ?? '') ||
    (Array.isArray((postData as Post)?.user_saves) &&
      !!auth?.userid &&
      (postData as Post).user_saves!.includes(auth.userid));

  // ✅ Save – optimistic: add to list immediately (no page reload), then mutate
  const handleSavePost = React.useCallback(async () => {
    if (isSaved) return;
    const postId = postData.postid ?? '';
    const postToRestore = postData as Post;

    setLoad?.(true);

    // Optimistic: Update cache first (match unsave pattern)
    updatePostSavedInFeedCache(postId, true);
    updateCache(['getSavedPosts'], postData, 'add', 'save');

    try {
      await savePost({
        variables: {
          postUserId: postData.user_id ?? '',
          createdAt: postData.created ?? '',
          postId: postData.postid ?? '',
        },
      });
      toast.success(t('saved.add.toast'));
    } catch (error) {
      console.error('Save error:', error);
      toast.error(t('err.add'));
      // Rollback: Remove from saved list and feed cache
      updateCache(['getSavedPosts'], postToRestore, 'remove', 'save');
      updatePostSavedInFeedCache(postId, false);
    } finally {
      setLoad?.(false);
      saveStatuses.savePost.reset?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSaved, postData, savePost, saveStatuses, setLoad, t, updateCache, updatePostSavedInFeedCache]);

  // ✅ Unsave – optimistic: remove from list immediately (no page reload), then mutate
  const handleUnSavePost = React.useCallback(async () => {
    if (!isSaved) return;
    const postId = postData.postid ?? '';
    const postToRestore = postData as Post;

    setLoad?.(true);

    // Optimistic: remove from saved list and feed cache immediately so Saved Posts page doesn’t reload
    updateCache(['getSavedPosts'], postToRestore, 'remove', 'save');
    updatePostSavedInFeedCache(postId, false);

    try {
      await unSavePost({
        variables: {
          createdAt: (postData.post_activity_created || postData.created) ?? '',
          postId,
        },
      });
      toast.success(t('saved.remove.toast'));
    } catch (error) {
      console.error('Unsave error:', error);
      toast.error(t('err.remove'));
      // Rollback: re-add post to saved list and feed saved state
      updateCache(['getSavedPosts'], postToRestore, 'add', 'save');
      updatePostSavedInFeedCache(postId, true);
    } finally {
      setLoad?.(false);
      saveStatuses.unSavePost.reset?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSaved, postData, updateCache, updatePostSavedInFeedCache, t, setLoad, unSavePost, saveStatuses]);

  // Favorite functionality removed

  // ✅ Delete Post – optimistic: remove from UI immediately, then mutate (no feed refetch)
  const handleDelete = async () => {
    const postId =
      (postData as Post).postid ?? (postData as BuddyPost).post_id ?? '';
    const postToRestore = postData as Post;

    setLoad?.(true);

    // Optimistic: remove from all feeds and saved list immediately
    removePostFromFeedCache(postId);
    updateCache(['getSavedPosts'], postToRestore, 'remove', 'save');
    setShowDeleteConfirmationModal(false);

    try {
      const { data } = await deletePost(postData);
      if (data?.deletePost) {
        toast.success(t('del.success'));
      } else {
        // Server didn't confirm – rollback: re-add post to feed cache
        client.setQueriesData<InfinitePostsCache>(
          { queryKey: ['posts'] },
          (oldData) => {
            if (!oldData?.pages) return oldData;
            const pages = [...oldData.pages];
            if (pages.length > 0) pages[0] = [postToRestore, ...pages[0]];
            else pages.push([postToRestore]);
            return { ...oldData, pages };
          }
        );
        updateCache(['getSavedPosts'], postToRestore, 'add', 'save');
        toast.error(t('error'));
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(t('error'));
      // Rollback: re-add post to feed cache
      client.setQueriesData<InfinitePostsCache>(
        { queryKey: ['posts'] },
        (oldData) => {
          if (!oldData?.pages) return oldData;
          const pages = [...oldData.pages];
          if (pages.length > 0) pages[0] = [postToRestore, ...pages[0]];
          else pages.push([postToRestore]);
          return { ...oldData, pages };
        }
      );
      updateCache(['getSavedPosts'], postToRestore, 'add', 'save');
    } finally {
      setLoad?.(false);
    }
  };

  const saveLoad = saveStatuses.savePost.loading;
  const remSav = saveStatuses.unSavePost.loading;
  const delLoad = deletePostStatus.loading;
  const blockLoad = friends.status.blockUser.loading;
  const reportLoad = reportContentStatus.loading;

  // Handle Block User
  const handleBlockUser = React.useCallback(async () => {
    if (!postUserId || postUserId === auth?.userid) return;

    try {
      // Optimistic: Update Redux immediately
      dispatch(setBlockList({ action: 'add', userId: postUserId }));

      const result = await friends.blockUser({
        variables: {
          userId: postUserId,
        },
      });

      if (friends.status.blockUser.error) {
        // Rollback
        dispatch(setBlockList({ action: 'remove', userId: postUserId }));
        toast.error('Failed to block user');
        friends.status.blockUser.reset();
        return;
      }

      if (result.data?.blockUser) {
        friends.status.blockUser.reset();
        toast.success('User blocked successfully');
      }
    } catch (error) {
      console.error('Error blocking user:', error);
      // Rollback
      dispatch(setBlockList({ action: 'remove', userId: postUserId }));
      toast.error('Failed to block user');
    }
  }, [postUserId, auth?.userid, friends, dispatch]);

  // Handle Report Post
  const handleReportPost = React.useCallback(async (notes: string) => {
    if (!postData?.postid || !postData?.created || !postUserId) {
      toast.error('Missing post information');
      return;
    }

    try {
      await reportContent({
        variables: {
          reportContentInput: {
            reported_content_id: postData.postid ?? '',
            reported_content_created: postData.created ?? '',
            reported_user_id: postUserId ?? '',
            content_type: 'post',
            notes: notes,
          },
        },
      });

      if (!reportContentStatus.error) {
        toast.success('Post reported successfully. Thank you for your feedback.');
        reportContentStatus.reset();
      } else {
        toast.error('Failed to report post');
      }
    } catch (error) {
      console.error('Error reporting post:', error);
      toast.error('Failed to report post');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postData, postUserId, reportContent, reportContentStatus]);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={isSaved ? handleUnSavePost : handleSavePost}
            disabled={isSaved ? remSav : saveLoad}
          >
            {isSaved ? (
              <>
                {!remSav && <Icon name="bookmark-x" className="mr-2" />}
                {remSav ? t('saved.remove.loading') : t('saved.remove.label')}
              </>
            ) : (
              <>
                {!saveLoad && <Icon name="bookmark" className="mr-2" />}
                {saveLoad ? t('saved.add.loading') : t('saved.add.label')}
              </>
            )}
          </DropdownMenuItem>
          {optionsVariant === 'buddiesListing' && (
            <DropdownMenuItem onClick={() => setViewPostOpen(true)}>
              <Icon name="eye" className="mr-2" /> View Post
            </DropdownMenuItem>
          )}
          {auth?.userid === postUserId &&
            !(postData as Post)?.shared_of_user_id &&
            optionsVariant !== 'buddiesListing' &&
            ((postData?.type === PostType.GolfBuddy &&
              postData?.date_from &&
              new Date().getTime() <
                (typeof postData.date_from === 'string' &&
                /^\d+$/.test(postData.date_from)
                  ? parseInt(postData.date_from)
                  : new Date(postData.date_from).getTime()) -
                  15 * 60 * 1000) ||
              postData?.type !== PostType.GolfBuddy) && (
              <DropdownMenuItem
                onClick={() => {
                  setEditPostOpen(true);
                }}
              >
                <Icon name="edit" className="mr-2" /> {t('option.edit')}
              </DropdownMenuItem>
            )}
          {auth?.userid === postUserId && (
            <DropdownMenuItem
              onClick={() => setShowDeleteConfirmationModal(true)}
              disabled={delLoad}
            >
              {delLoad ? (
                <Loading className="w-full mx-auto" />
              ) : (
                <>
                  <Icon name="bin" className="mr-2" /> {t('del.title')}
                </>
              )}
            </DropdownMenuItem>
          )}
          {auth?.userid !== postUserId && (
            <>
              <DropdownMenuItem
                onClick={() => setShowBlockConfirmationModal(true)}
                disabled={blockLoad || isBlocked}
              >
                {blockLoad ? (
                  <Loading className="w-full mx-auto" />
                ) : (
                  <>
                    <Icon name="lock" className="mr-2" />
                    {isBlocked ? 'User Blocked' : 'Block User'}
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowReportDialog(true)}
                disabled={reportLoad}
              >
                <Icon name="shield-check" className="mr-2" /> Report Post
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmationModal
        title={'Delete Post?'}
        description={
          'Are you sure you want to delete this post? This action cannot be undo.'
        }
        confirmText={'Delete'}
        cancelText={'No'}
        isLoading={delLoad}
        variant="destructive"
        onConfirm={() => {
          handleDelete();
          setShowDeleteConfirmationModal(false);
        }}
        open={showDeleteConfirmationModal}
        onOpenChange={setShowDeleteConfirmationModal}
      />

      <ConfirmationModal
        title={'Block User?'}
        description={
          'Are you sure you want to block this user? You will no longer see their posts and they won\'t be able to interact with yours.'
        }
        confirmText={'Block'}
        cancelText={'Cancel'}
        isLoading={blockLoad}
        variant="destructive"
        onConfirm={() => {
          handleBlockUser();
          setShowBlockConfirmationModal(false);
        }}
        open={showBlockConfirmationModal}
        onOpenChange={setShowBlockConfirmationModal}
      />

      <CreatePostDialog
        postCase={'edit'}
        postMedia={postMedia}
        open={editPostOpen}
        postDetails={editPostDetails}
        postData={postData}
        postType={postData?.type ?? 'Post'}
        onOpenChange={setEditPostOpen}
      />

      <ReportPostDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        onReport={handleReportPost}
        isLoading={reportLoad}
      />

      {optionsVariant === 'buddiesListing' && (
        <ViewPostModal
          open={viewPostOpen}
          onOpenChange={setViewPostOpen}
          post={postData as BuddyPost}
        />
      )}
    </>
  );
};

export { PostOptions };
