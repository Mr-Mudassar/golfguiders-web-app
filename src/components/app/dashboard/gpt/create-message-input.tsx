'use client';

import type { SubmitHandler, FieldValues } from 'react-hook-form';
import React from 'react';
import type { z } from 'zod';
import { toast } from 'sonner';
import { chatSchema } from '.';
import { cn } from '@/lib/utils';
import type { RootState } from '@/lib/redux';
import { ChatRoles } from '@/lib/constants';
import type { ChatResponseMessage } from '.';
import { Button, Icon } from '@/components/ui';
import { useAppSelector, useZodForm } from '@/lib';
import { createParser } from 'eventsource-parser';
import AutosizeTextArea from 'react-textarea-autosize';
import type { EventSourceMessage as ParserEventSourceMessage } from 'eventsource-parser';

interface CreateMessageInputProps {
  className?: string;
  chatId: string;
  onMessageCreate: (message: ChatResponseMessage) => void;
  setIsGeneratingResponse: (v: boolean) => void;
  setError: (v: string | null) => void;
}

const CreateMessageInput: React.FC<CreateMessageInputProps> = ({
  className,
  chatId,
  onMessageCreate,
  setIsGeneratingResponse,
  setError,
}) => {
  const form = useZodForm<typeof chatSchema>({
    schema: chatSchema,
    defaultValues: {
      query: '',
    },
  });
  const user = useAppSelector((state: RootState) => state.auth.user);

  const handleCreateChat = React.useCallback(
    async (
      values: z.infer<typeof chatSchema>,
      e?: React.BaseSyntheticEvent
    ) => {
      e?.preventDefault();
      setError(null);
      form.reset();
      setIsGeneratingResponse(true);

      onMessageCreate({
        content: values.query,
        role: ChatRoles.User,
      });

      if (!process.env.GOLFERGPT_X_API_KEY) {
        const errorMsg = 'API key is missing';
        setError(errorMsg);
        toast.error(errorMsg);
        setIsGeneratingResponse(false);
        return;
      }

      const headers = {
        'Content-Type': 'application/json',
        'x-api-key': process.env.GOLFERGPT_X_API_KEY,
      };

      const body = {
        message: values.query,
        user_id: user?.userid,
        chat_id: chatId,
      };

      try {
        console.log(
          'Sending request to:',
          `${process.env.GOLFGUIDERS_GPT_URL}/chat/stream`
        );
        console.log('Request body:', body);

        const response = await fetch(
          `${process.env.GOLFGUIDERS_GPT_URL}/chat/stream`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
          }
        );

        if (!response.ok) {
          const errorMsg = `HTTP error! status: ${response.status} ${response.statusText}`;
          throw new Error(errorMsg);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          const errorMsg = 'Response body is not readable';
          throw new Error(errorMsg);
        }

        let responseText = '';
        onMessageCreate({ content: '', role: ChatRoles.Assistant });

        const parser = createParser({
          onEvent: (event: ParserEventSourceMessage) => {
            if (event.event === 'token') {
              responseText += event.data || '';
              onMessageCreate({
                content: responseText,
                role: ChatRoles.Assistant,
              });
            } else if (event.event === 'done') {
              setIsGeneratingResponse(false);
            }
          },
          onError: () => {
            setError('Failed to process stream');
            toast.error('Failed to process stream');
            setIsGeneratingResponse(false);
          },
        });

        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          try {
            const chunk = decoder.decode(value, { stream: true });
            parser.feed(chunk);
          } catch {
            throw new Error('Failed to process stream chunk');
          }
        }

        form.reset();
      } catch {
        const errorMsg = "Couldn't generate an answer.";
        setError(errorMsg);
        toast.error(errorMsg);
        setIsGeneratingResponse(false);
        form.reset();
      }
    },
    [chatId, form, onMessageCreate, setError, setIsGeneratingResponse, user?.userid]
  );

  return (
    <div className="absolute bottom-0 inset-x-0 drop-shadow-sm focus-within:drop-shadow-xl transition-all md:px-3">
      <form
        onSubmit={form.handleSubmit(handleCreateChat as SubmitHandler<FieldValues>)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            form.handleSubmit(handleCreateChat as SubmitHandler<FieldValues>)();
          }
        }}
        className="relative"
      >
        <AutosizeTextArea
          className={cn(
            'flex items-end justify-between gap-2 rounded-3xl pl-4 md:pl-5 pr-12 py-3 bg-card focus:outline-none focus:ring-ring mt-6 w-full transition-all placeholder:text-muted-foreground focus-visible:outline-none ring-2 ring-muted focus-visible:ring-2 focus-visible:ring-ring/50 border border-transparent focus:border-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none',
            className
          )}
          maxRows={8}
          placeholder="Start your conversation"
          {...form.register('query')}
        />
        <Button
          size="icon"
          type="submit"
          loading={form.formState.isSubmitting}
          className="rounded-full absolute right-0 bottom-0 mb-[7px] mr-1.5"
          disabled={
            form.watch('query')?.length < 2 || form.formState.isSubmitting
          }
        >
          <Icon name="arrow-up" size={24} />
        </Button>
      </form>
    </div>
  );
};

export { CreateMessageInput };
