import {
  Form,
  FormControl,
  FormField,
  FormItem,
  Button,
  Icon,
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@/components/ui';
import { usePostComment, useZodForm, useAppSelector } from '@/lib';
import { useQueryClient } from '@tanstack/react-query';
import type { Comment } from '@/lib/definitions';
import type { Control, FieldValues, SubmitHandler } from 'react-hook-form';
import React from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import {
  Popover,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
} from '@radix-ui/react-popover';

import dynamic from 'next/dynamic';

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });
import { TextWrapper } from '../editor';
import { formatMentions, getInitials } from '@/lib/utils';

const commentSchema = z.object({
  comment: z.string().trim().min(1, {
    message: 'Comment cannot be empty',
  }),
});

interface CreateCommentFormProps {
  postUserId: string;
  postId: string;
  pCommentCreated?: string;
  parentId: string;
  created: string;
  refetchComments?: () => void;
}

interface InfiniteCommentsCache {
  pages: Comment[][];
  pageParams: number[];
}

const CreateCommentForm: React.FC<CreateCommentFormProps> = ({
  postUserId,
  postId,
  created,
  pCommentCreated,
  parentId,
  refetchComments,
}) => {
  const form = useZodForm<typeof commentSchema>({
    schema: commentSchema,
    defaultValues: { comment: '' },
  });

  const client = useQueryClient();
  const auth = useAppSelector((s) => s.auth.user);

  const {
    createComment,
    status: { createComment: createCommentState },
  } = usePostComment();

  const handleSubmit = async (
    values: z.infer<typeof commentSchema>,
    e?: React.BaseSyntheticEvent
  ) => {
    e?.preventDefault();

    // Safety check: prevent empty or whitespace-only comments
    const trimmedComment = values.comment.trim();
    if (!trimmedComment) {
      form.setError('comment', {
        type: 'manual',
        message: 'Comment cannot be empty',
      });
      return;
    }


    // Build optimistic comment object
    const optimisticComment: Comment = {
      created: Date.now().toString(),
      comment_id: `temp-${Date.now()}`, // Temporary ID
      comment: formatMentions(values.comment),
      parent_id: parentId!,
      reply_count: 0,
      modified: undefined,
      user_id: auth?.userid ?? '',
      likes: [],
      userInfo: {
        first_name: auth?.first_name ?? '',
        last_name: auth?.last_name ?? '',
        photo_profile: auth?.photo_profile ?? '',
        userid: auth?.userid ?? '',
      },
    };

    // Optimistic: Add to cache immediately
    client.setQueryData<InfiniteCommentsCache>(
      ['commentsByPost', postId],
      (oldData) => {
        if (!oldData) return { pages: [[optimisticComment]], pageParams: [1] };
        const pages = [...oldData.pages];
        if (pages.length > 0) {
          pages[0] = [optimisticComment, ...pages[0]]; // Prepend to first page
        } else {
          pages.push([optimisticComment]);
        }
        return { ...oldData, pages };
      }
    );

    form.reset();

    try {
      const { data } = await createComment({
        variables: {
          postUserId: postUserId!,
          postCreated: created!,
          commentInput: {
            post_id: postId!,
            comment: formatMentions(values.comment),
            parent_comment_created: pCommentCreated!,
            parent_id: parentId!,
          },
        },
      });

      if (data?.createComment) {
        // Replace optimistic comment with real one
        client.setQueryData<InfiniteCommentsCache>(
          ['commentsByPost', postId],
          (oldData) => {
            if (!oldData) return oldData;
            const pages = oldData.pages.map((page) =>
              page.map((c) =>
                c.comment_id === optimisticComment.comment_id
                  ? { ...data.createComment, userInfo: optimisticComment.userInfo }
                  : c
              )
            );
            return { ...oldData, pages };
          }
        );
        toast.success('Comment created successfully!');

        // Optional: Still call refetchComments for comment_count update on post
        refetchComments?.();
      }
    } catch (error) {
      // Rollback: Remove optimistic comment
      client.setQueryData<InfiniteCommentsCache>(
        ['commentsByPost', postId],
        (oldData) => {
          if (!oldData) return oldData;
          const pages = oldData.pages.map((page) =>
            page.filter((c) => c.comment_id !== optimisticComment.comment_id)
          );
          return { ...oldData, pages };
        }
      );
      console.error('Failed to create comment', error);
      toast.error('Failed to create comment');
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit as SubmitHandler<FieldValues>)}
        className="flex items-start gap-2.5 pt-3 pb-3"
      >
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={auth?.photo_profile ?? ''} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {getInitials(auth?.first_name, auth?.last_name) || <Icon name="user" size={14} />}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0 flex items-end gap-1.5 rounded-3xl bg-muted/40 border border-border/50 pr-1.5 overflow-hidden transition-colors focus-within:border-primary/30 focus-within:bg-muted/60">
          <FormField
            control={form.control as unknown as Control<z.infer<typeof commentSchema>>}
            name="comment"
            render={({ field, fieldState }) => (
              <FormItem className="flex-1 min-w-0 overflow-hidden">
                <FormControl>
                  <TextWrapper
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    placeholder={
                      fieldState.error
                        ? fieldState.error.message || 'Comment cannot be empty'
                        : 'Write a comment...'
                    }
                    rows={1}
                    className={`comment-input-editor border-0! bg-transparent! rounded-3xl! shadow-none! ring-0! focus-within:border-0! focus-within:ring-0! max-h-48! overflow-hidden! ${fieldState.error ? '[&_textarea]:placeholder:text-destructive!' : ''}`}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex items-center gap-0.5 shrink-0 mb-1.5">
            {(() => {
              // eslint-disable-next-line react-hooks/rules-of-hooks
              const [open, setOpen] = React.useState(false);

              return (
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary"
                    >
                      <Icon name="smile" size={18} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverPortal>
                    <PopoverContent className="relative z-10">
                      <EmojiPicker
                        onEmojiClick={(emoji) => {
                          form.setValue(
                            'comment',
                            form.getValues('comment') + emoji.emoji
                          );
                          setOpen(false);
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
                  </PopoverPortal>
                </Popover>
              );
            })()}

            <Button
              size="icon"
              loading={createCommentState.loading}
              className="h-7 w-7 rounded-full"
            >
              <Icon name="send" size={14} />
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export { CreateCommentForm };
