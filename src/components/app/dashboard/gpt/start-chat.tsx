'use client';

import type { SubmitHandler, FieldValues } from 'react-hook-form';
import { chatSchema } from '.';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import remarkGfm from 'remark-gfm';
import Markdown from 'react-markdown';
import type { RootState } from '@/lib/redux';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Icon } from '@/components/ui';
import { createParser } from 'eventsource-parser';
import { useAppSelector, useZodForm } from '@/lib';
import AutosizeTextArea from 'react-textarea-autosize';
import type { EventSourceMessage as ParserEventSourceMessage } from 'eventsource-parser';

const QuickStartQuestions = [
  'Where is bellveue golf course? ⛳',
  'Teach me some tips to improve my swing 🏌️‍♂',
];

interface StartChatProps {
  className?: string;
}

const StartChat: React.FC<StartChatProps> = ({ className }) => {
  const router = useRouter();
  const form = useZodForm<typeof chatSchema>({
    schema: chatSchema,
  });
  const [displayedText, setDisplayedText] = useState('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const user = useAppSelector((state: RootState) => state.auth.user);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [displayedText]);

  const startNewChat = async (data: { query: string }) => {
    setLoading(true);
    setError(null);
    setDisplayedText('');

    if (!process.env.GOLFERGPT_X_API_KEY) {
      const errorMsg = 'API key is missing';
      console.error(errorMsg);
      setError(errorMsg);
      toast.error(errorMsg);
      setLoading(false);
      return;
    }

    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': process.env.GOLFERGPT_X_API_KEY,
    };

    const body = {
      message: data?.query,
      user_id: user?.userid,
    };

    try {
      const response = await fetch(
        `${process.env.GOLFGUIDERS_GPT_URL}/chat/stream`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
          cache: 'no-store',
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

      const parser = createParser({
        onEvent: (event: ParserEventSourceMessage) => {
          if (event.event === 'token') {
            setDisplayedText((prev) => prev + (event.data || ''));
          } else if (event.event === 'metadata') {
            try {
              const metadata = JSON.parse(event.data);
              const chatId = metadata.chat_id;
              if (chatId) {
                router.push(`/dashboard/ai/chat/${chatId}`);
              } else {
                setError('No chat ID received in metadata');
                toast.error('No chat ID received in metadata');
              }
            } catch {
              setError('Failed to parse metadata');
              toast.error('Failed to parse metadata');
            }
          } else if (event.event === 'done') {
            setLoading(false);
          }
        },
        onError: () => {
          setError('Failed to process stream');
          toast.error('Failed to process stream');
          setLoading(false);
        },
      });

      // Read the stream
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
    } catch {
      const errorMsg = 'Failed to start new chat';

      setError(errorMsg);
      toast.error(errorMsg);
      setLoading(false);
    }
  };

  return (
    <section
      className={cn(
        'flex items-center justify-center flex-col h-[80dvh]',
        className
      )}
    >
      <h1 className="text-center font-bold text-4xl">
        <span className="text-primary">Guiders</span>AI
      </h1>
      <p className="text-sm mx-auto max-w-xs text-center mt-2">
        You can start chat with your Guiders AI and begin this new Golfing
        Experience.
      </p>

      <div className="flex items-center justify-center flex-wrap gap-2 mb-3 mt-6">
        {QuickStartQuestions.map((q) => (
          <Button
            key={q}
            size="sm"
            variant="outline"
            className="bg-card"
            onClick={() => {
              form.setValue('query', q);
              form.handleSubmit(startNewChat as SubmitHandler<FieldValues>)();
            }}
            disabled={loading}
          >
            {q}
          </Button>
        ))}
      </div>
      {!loading && error && (
        <p className="text-center text-destructive text-xs my-2">
          {error ||
            'An error occurred while starting your chat with Golfer GPT.'}
        </p>
      )}
      <form
        onSubmit={form.handleSubmit(startNewChat as SubmitHandler<FieldValues>)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            form.handleSubmit(startNewChat as SubmitHandler<FieldValues>)();
          }
        }}
        className="relative w-[75%]"
      >
        <AutosizeTextArea
          className={cn(
            'flex items-end justify-between gap-2 w-full rounded-3xl pl-5 pr-12 py-3 bg-card focus:outline-none focus:ring-ring transition-all placeholder:text-muted-foreground focus-visible:outline-none ring-2 ring-muted focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pretty-scrollbar resize-none',
            className
          )}
          maxRows={8}
          placeholder="Start your conversation"
          {...form.register('query')}
        />
        <Button
          size="icon"
          type="submit"
          loading={loading}
          className="rounded-full absolute right-0 bottom-0 mb-1.5 mr-1.5"
          disabled={loading}
        >
          <Icon name="arrow-up" size={24} />
        </Button>
      </form>

      {/* Display streamed response */}
      {displayedText && (
        <div
          ref={containerRef}
          className="mt-4 p-4 bg-card rounded-lg w-full max-h-80 overflow-y-auto"
        >
          <div className="prose flex flex-col items-start gap-3">
            <Markdown remarkPlugins={[remarkGfm]}>{displayedText}</Markdown>
          </div>
        </div>
      )}

      {form.formState.errors.query && (
        <p className="text-xs text-destructive text-center mt-2">
          {form.formState.errors.query.message}
        </p>
      )}
    </section>
  );
};

export { StartChat };
