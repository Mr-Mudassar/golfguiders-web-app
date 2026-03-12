import React from 'react';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
// import { ScrollArea } from '@/components/ui';
import { cn } from '@/lib/utils';

import type { ChatResponseMessage } from '..';
import { ScrollBar } from '@/components/ui';
import { Loading } from '@/components/common';
import dynamic from 'next/dynamic';

const AIMessage = dynamic(() =>
  import('./message').then((mod) => mod.AIMessage)
);

interface ChatMessagesProps {
  className?: string;
  messages: ChatResponseMessage[];
  isGenerating: boolean;
  error?: string | null;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
  className,
  messages,
  isGenerating,
  error,
}) => {
  const chatBoxRef = React.useRef<HTMLDivElement>(null);
  const MemoizedAIMessage = React.memo(AIMessage);

  React.useEffect(() => {
    if (chatBoxRef.current) {
      const maxScrollTop =
        chatBoxRef.current.scrollHeight - chatBoxRef.current.clientHeight;
      chatBoxRef.current.scrollTo({
        top: maxScrollTop > 0 ? maxScrollTop : 0,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  return (
    <ScrollAreaPrimitive.Root
      className={cn(
        'relative overflow-hidden h-[calc(100dvh-152px)] pr-3 pb-3',
        className
      )}
    >
      <ScrollAreaPrimitive.Viewport
        ref={chatBoxRef}
        className="h-full w-full rounded-[inherit]"
      >
        <div className="flex flex-col gap-4">
          {messages.map((message) => (
            <MemoizedAIMessage key={message.history_id} message={message} />
          ))}

          {isGenerating ? (
            <div className="text-muted-foreground flex items-center gap-2 ml-3 animate-pulse">
              Thinking
              <Loading className="w-fit" />
            </div>
          ) : (
            error && (
              <p className="text-destructive px-3 py-2 rounded-md border border-destructive bg-destructive/10 w-fit ml-3">
                {error}
              </p>
            )
          )}
        </div>
      </ScrollAreaPrimitive.Viewport>
      <ScrollAreaPrimitive.Corner />
      <ScrollBar />
    </ScrollAreaPrimitive.Root>
  );
};

export { ChatMessages };
