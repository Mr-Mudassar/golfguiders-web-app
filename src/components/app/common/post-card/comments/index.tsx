import React from 'react';
import { useIntersectionObserver } from 'usehooks-ts';
import { MessageCircle } from 'lucide-react';

import { ScrollArea } from '@/components/ui';
import { useInfiniteComments } from '@/lib';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';

const CommentSkeleton = dynamic(() =>
  import('./comment-skeleton').then((mod) => mod.CommentSkeleton)
);
const CreateCommentForm = dynamic(() =>
  import('./create-comment-form').then((mod) => mod.CreateCommentForm)
);
const CommentGroup = dynamic(() =>
  import('./comment-group').then((mod) => mod.CommentGroup)
);

interface PostCommentsProps {
  className?: string;
  postId?: string;
  postUserId?: string;
  postCreated?: string;
  open?: boolean;
}

const PostComments: React.FC<PostCommentsProps> = ({
  className,
  postId,
  postUserId,
  postCreated,
  open,
}) => {
  const commentsObserver = useIntersectionObserver({
    initialIsIntersecting: true,
  });

  const commentsQuery = useInfiniteComments({
    type: 'comments',
    variables: {
      postId: postId!,
    },
    enabled: !!postId && open,
  });

  const comments = React.useMemo(() => {
    return commentsQuery.data?.pages.reduce((acc, page) => {
      if (!page) return acc;
      if (!acc) return page;

      return [...acc, ...page];
    });
  }, [commentsQuery.data]);

  React.useEffect(() => {
    if (
      commentsObserver.isIntersecting &&
      commentsQuery.hasNextPage &&
      !!postId &&
      open
    ) {
      commentsQuery.fetchNextPage();
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commentsObserver.isIntersecting]);

  return (
    <div
      className={cn(
        'px-3 transition-all duration-300',
        open ? 'h-auto' : 'h-0 overflow-hidden',
        className
      )}
    >
      {!!postId && !!postUserId && (
        <CreateCommentForm
          created={postCreated!}
          postId={postId}
          postUserId={postUserId}
          parentId="PARENT"
          refetchComments={commentsQuery.refetch}
        />
      )}
      <ScrollArea className="h-80 mb-3 border-t py-1 pr-2">
        <div className="flex flex-col gap-4 px-1">
          {!commentsQuery.isFetching && !comments?.length ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2 animate-in fade-in duration-300">
              <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-muted-foreground/50" />
              </div>
              <div className="text-center space-y-0.5">
                <p className="text-sm font-medium text-muted-foreground">
                  No comments yet
                </p>
                <p className="text-xs text-muted-foreground/70">
                  Be the first to share your thoughts
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {comments?.map((comment) => (
                <CommentGroup
                  key={comment.comment_id}
                  comment={comment}
                  postId={postId!}
                  postCreated={postCreated!}
                  postUserId={postUserId!}
                  refetchComments={commentsQuery.refetch}
                />
              ))}
            </div>
          )}

          {commentsQuery.isFetching && <CommentSkeleton count={3} />}
          <div ref={commentsObserver.ref} />
        </div>
      </ScrollArea>
    </div>
  );
};

export { PostComments };
