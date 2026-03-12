import React from 'react';
import { toast } from 'sonner';

import { Loading } from '@/components/common';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon,
} from '@/components/ui';
import { useAppSelector, usePostComment } from '@/lib';
import type { Comment } from '@/lib/definitions';
import {
  cn,
  formatMentions,
  formatNumber,
  getInitials,
  getName,
  useFormattedDate,
} from '@/lib/utils';
import { parseMentions } from '..';
import { TextWrapper } from '../editor';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const CreateCommentForm = dynamic(() =>
  import('./create-comment-form').then((mod) => mod.CreateCommentForm)
);
const ConfirmationModal = dynamic(() =>
  import('@/components/common/confirmationDialog').then((mod) => mod.ConfirmationModal)
);

export interface CommentProps {
  readonly className?: string;
  comment: Comment;
  postId: string;
  isReply?: boolean;
  postUserId: string;
  postCreated: string;
  refetchComments?: () => void;
}

const Comment: React.FC<CommentProps> = ({
  className,
  comment,
  postCreated,
  isReply,
  postId,
  postUserId,
  refetchComments,
}) => {
  const user = useAppSelector((state) => state.auth.user);
  const postComments = usePostComment();

  const [isReplying, setIsReplying] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [editedText, setEditedText] = React.useState(comment.comment ?? ''); // holds updated text
  const [likes, setLikes] = React.useState<number>(comment.likes?.length ?? 0);
  const [isLiked, setIsLiked] = React.useState(comment.likes?.includes(user?.userid as string) ?? false);
  const formattedDate = useFormattedDate();

  const handleDeleteComment = async () => {
    const { data } = await postComments.deleteComment({
      variables: {
        postId,
        createdAt: comment.created!,
        postCreated,
        postUid: postUserId!,
        commentId: comment.comment_id!,
      },
    });
    if (data?.deleteComment) {
      toast.success('Comment deleted successfully');
      refetchComments?.();
    }
  };

  const handleEditSave = async () => {
    const { data } = await postComments.updateComment({
      variables: {
        updateCommentInput: {
          comment_id: comment.comment_id,
          comment: formatMentions(editedText ?? '') || comment.comment,
          post_id: postId,
          created: comment.created!,
        },
      },
    });

    if (data?.updateComment) {
      toast.success('Comment updated successfully');
      setIsEditing(false);
      refetchComments?.();
    }
  };

  return (
    <>
      <div className={cn('w-full p-1 flex gap-2', className)}>
        <Link href={`/profile/${comment.userInfo?.userid}`}>
          <Avatar className="mt-1 h-8 w-8">
            <AvatarImage src={comment.userInfo?.photo_profile} />
            <AvatarFallback>
              {comment.userInfo?.first_name && comment.userInfo?.last_name ? (
                getInitials(
                  comment.userInfo.first_name,
                  comment.userInfo.last_name
                )
              ) : (
                <Icon name="user" />
              )}{' '}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex flex-col w-full">

          <div className="flex gap-4 items-center justify-between">
            <div className="bg-[#f0f2f5] rounded-lg p-3 w-full">
              <h4 className="leading-none font-semibold text-xs flex justify-between gap-2 text-foreground">
                <Link href={`/profile/${comment.userInfo?.userid}`}>
                  {getName(
                    comment.userInfo?.first_name,
                    comment.userInfo?.last_name
                  )}
                </Link>

                <span className="text-muted-foreground font-[500]">
                  {comment.modified ? 'Edited' : ''}
                </span>
              </h4>
              {isEditing ? (
                <TextWrapper
                  value={editedText ?? ''}
                  placeholder="Update your comment..."
                  onChange={(v) => setEditedText(v ?? '')}
                  isEdit={isEditing}
                  rows={3}
                />
              ) : (
                <p className="mt-1 text-sm text-foreground">
                  {parseMentions(comment.comment ?? '')}
                </p>
              )}
              {isEditing && (
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    onClick={handleEditSave}
                    disabled={postComments.status.updateComment.loading}
                  >
                    {postComments.status.updateComment?.loading ? (
                      <Loading />
                    ) : (
                      'Save'
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            {user?.userid === comment.user_id && (
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary">
                    <Icon name="more" size={18} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent sideOffset={8}>
                  <DropdownMenuItem
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={
                      postComments.status.deleteComment.loading ||
                      !!postComments.status.deleteComment.data
                    }
                  >
                    Delete
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    Edit
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="w-fit text-xs text-muted-foreground font-semibold">
              {formattedDate(comment.created!)}
            </span>
            <div className="w-fit text-xs text-muted-foreground font-semibold">
              <Button
                className={cn(
                  "hover:bg-transparent",
                  isLiked ? "text-primary" : "text-muted-foreground"
                )}
                size="sm"
                variant="ghost"
                onClick={() => {
                  // Optimistic update
                  const wasLiked = isLiked;
                  setIsLiked(!wasLiked);
                  setLikes((prev) => wasLiked ? Math.max(0, prev - 1) : prev + 1);

                  postComments.likeComment({
                    variables: {
                      postId,
                      postCreated,
                      postUid: postUserId!,
                      commentCreatedAt: comment.created!,
                    },
                  }).then(({ data }) => {
                    if (data) {
                      setLikes(data.likeComment);
                      if (!wasLiked) {
                        comment.likes = [...(comment.likes || []), user?.userid as string];
                        setIsLiked(true);
                      } else {
                        comment.likes = (comment.likes || []).filter((id) => id !== user?.userid);
                        setIsLiked(false);
                      }
                    }
                  }).catch(() => {
                    // Revert on error
                    setIsLiked(wasLiked);
                    setLikes((prev) => wasLiked ? prev + 1 : Math.max(0, prev - 1));
                  });
                }}
              >
                <span className="mr-2">
                  {likes == 0 ? '' : formatNumber(likes)}
                </span>
                Like
              </Button>
            </div>
            {!isReply && (
              <button
                className="w-fit text-xs text-muted-foreground font-semibold"
                onClick={() => setIsReplying(!isReplying)}
              >
                <span className="mr-2">
                  {comment?.reply_count == 0
                    ? ''
                    : formatNumber(comment?.reply_count ?? 0)}
                </span>
                Reply
              </button>
            )}
          </div>
        </div>

      </div>

      {isReplying && (
        <div className="ml-12">
          <CreateCommentForm
            postId={postId!}
            postUserId={postUserId!}
            created={postCreated!}
            pCommentCreated={comment.created!}
            parentId={comment.comment_id!}
            refetchComments={() => {
              refetchComments?.();
              setIsReplying(false);
            }}
          />
        </div>
      )}

      <ConfirmationModal
        title="Delete Comment?"
        description="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={postComments.status.deleteComment.loading}
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleDeleteComment}
      />
    </>
  );
};

export { Comment };
