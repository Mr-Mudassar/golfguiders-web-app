import React from 'react';
import type { CommentProps } from './comment';
import { cn } from '@/lib/utils';
import { useInfiniteComments } from '@/lib';
import { Loading } from '@/components/common';
import { Button } from '@/components/ui';
import dynamic from 'next/dynamic';

const Comment = dynamic(() => import('./comment').then((mod) => mod.Comment));

interface CommentGroupProps extends CommentProps {
  groupClassName?: string;
}

const CommentGroup: React.FC<CommentGroupProps> = ({
  groupClassName,
  ...commentProps
}) => {
  const [viewReplies, setViewReplies] = React.useState(false);

  const repliesQuery = useInfiniteComments({
    type: 'replies',
    variables: {
      parentId: commentProps.comment?.comment_id ?? '',
    },
    enabled: false,
  });

  const replies = React.useMemo(() => {
    return repliesQuery.data?.pages.reduce((acc, page) => {
      if (!page) return acc;
      if (!acc) return page;

      return [...acc, ...page];
    });
  }, [repliesQuery.data]);

  const toggleLabel = `${viewReplies ? 'Hide replies' : 'View replies'} (${replies?.length ?? commentProps.comment.reply_count})`;

  return (
    <div className={cn('', groupClassName)}>
      <Comment {...commentProps} />
      {!!commentProps.comment?.reply_count && (
        <div className="ml-[52px] flex flex-col gap-2 mb-2">
          {/* Toggle button at the top */}
          {!commentProps?.isReply && (
            <Button
              variant="ghost"
              loading={
                repliesQuery.isLoading ||
                repliesQuery.isRefetching ||
                repliesQuery.isFetching
              }
              className="text-xs font-semibold p-0 size-fit flex items-center gap-2 hover:bg-transparent"
              onClick={async () => {
                if (!viewReplies) {
                  await repliesQuery.refetch();
                  // repliesQuery.fetchNextPage();
                }
                setViewReplies(!viewReplies);
              }}
            >
              {toggleLabel}
            </Button>
          )}

          {/* Replies list, conditionally rendered */}
          {viewReplies && (
            <>
              {replies?.map((reply) => (
                <CommentGroup
                  key={reply.comment_id}
                  comment={reply}
                  isReply={true}
                  postCreated={commentProps.postCreated!}
                  postId={commentProps.postId!}
                  postUserId={commentProps.postUserId!}
                  refetchComments={repliesQuery.refetch}
                />
              ))}

              {/* Pagination button at the bottom */}
              {repliesQuery.hasNextPage && (
                <button
                  className="text-xs font-semibold disabled:opacity-50 flex items-center gap-2"
                  disabled={repliesQuery.isFetching}
                  onClick={() => repliesQuery.fetchNextPage()}
                >
                  View more
                  {repliesQuery.isFetching && <Loading className="w-fit" />}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export { CommentGroup };
